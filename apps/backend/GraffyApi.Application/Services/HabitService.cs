using GraffyApi.Common;
using GraffyApi.Contracts;
using GraffyApi.Data;
using GraffyApi.Domain;
using GraffyApi.Validation;
using Microsoft.EntityFrameworkCore;

namespace GraffyApi.Services;

public interface IHabitService
{
    Task<List<HabitDto>> GetHabitsAsync(Guid userId);
    Task<HabitDto?> GetByIdAsync(Guid id, Guid userId);
    Task<ServiceResult<HabitDto>> CreateAsync(CreateHabitRequest request, Guid userId);
    Task<ServiceResult<HabitDto>> UpdateAsync(Guid id, UpdateHabitRequest request, Guid userId);
    Task<ServiceResult<HabitDto>> CompleteAsync(Guid id, Guid userId);
    Task<ServiceResult<HabitDto>> UncompleteAsync(Guid id, Guid userId);
    Task<bool> DeleteAsync(Guid id, Guid userId);
}

public class HabitService : IHabitService
{
    private readonly AppDbContext _db;
    private readonly IBadgeAwardService _badges;
    private readonly INotificationService _notifications;

    public HabitService(AppDbContext db, IBadgeAwardService badges, INotificationService notifications)
    {
        _db = db;
        _badges = badges;
        _notifications = notifications;
    }

    private static HabitFrequency ParseFrequency(string? value) =>
        Enum.TryParse<HabitFrequency>(value, ignoreCase: true, out var f) ? f : HabitFrequency.Daily;

    private static int PeriodDays(HabitFrequency f) => f switch
    {
        HabitFrequency.Weekly => 7,
        HabitFrequency.Monthly => 30,
        _ => 1
    };

    // Можно ли засчитать привычку в указанный день: не раньше начала
    // и на «шаге» расписания от даты начала (ежедневно +1, еженедельно +7n, ежемесячно +30n).
    private static bool IsScheduledDay(Habit h, DateTime date)
    {
        var start = (h.StartDate ?? h.CreatedAt).Date;
        var d = date.Date;
        if (d < start) return false;
        return (d - start).Days % PeriodDays(h.Frequency) == 0;
    }

    private static HabitDto ToDto(Habit h, bool completedToday) => new(
        h.Id, h.UserId, h.SphereId, h.Title, h.Description, h.Difficulty.ToString(),
        h.XpReward, h.IsActive, completedToday, h.CreatedAt,
        h.Emoji, h.Frequency.ToString(), h.GoalAmount, h.GoalUnit,
        h.StartDate, h.EndDate);

    public async Task<List<HabitDto>> GetHabitsAsync(Guid userId)
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var rows = await _db.Habits
            .AsNoTracking()
            .Where(h => h.UserId == userId)
            .OrderByDescending(h => h.CreatedAt)
            .Select(h => new
            {
                Habit = h,
                CompletedToday = h.Completions.Any(c => c.CompletedAt >= today && c.CompletedAt < tomorrow)
            })
            .ToListAsync();

        return rows.Select(r => ToDto(r.Habit, r.CompletedToday)).ToList();
    }

    public async Task<HabitDto?> GetByIdAsync(Guid id, Guid userId)
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var row = await _db.Habits
            .AsNoTracking()
            .Where(h => h.Id == id && h.UserId == userId)
            .Select(h => new
            {
                Habit = h,
                CompletedToday = h.Completions.Any(c => c.CompletedAt >= today && c.CompletedAt < tomorrow)
            })
            .FirstOrDefaultAsync();

        return row == null ? null : ToDto(row.Habit, row.CompletedToday);
    }

    public async Task<ServiceResult<HabitDto>> CreateAsync(CreateHabitRequest request, Guid userId)
    {
        var diffError = DifficultyValidator.Validate(request.Difficulty, out var difficulty);
        if (diffError != null) return ServiceResult<HabitDto>.Failure(diffError);

        if (request.StartDate.HasValue && request.EndDate.HasValue &&
            request.EndDate.Value.Date < request.StartDate.Value.Date)
            return ServiceResult<HabitDto>.Failure("Дата окончания не может быть раньше даты начала");

        if (request.SphereId.HasValue)
        {
            var sphereExists = await _db.Spheres.AnyAsync(s =>
                s.Id == request.SphereId.Value && s.UserId == userId && s.DeletedAt == null);
            if (!sphereExists) return ServiceResult<HabitDto>.Failure("Сфера не найдена");
        }

        var habit = new Habit
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            SphereId = request.SphereId,
            Title = request.Title,
            Description = request.Description,
            Difficulty = difficulty,
            XpReward = XpCalculator.GetXpReward(difficulty),
            Emoji = request.Emoji,
            Frequency = ParseFrequency(request.Frequency),
            GoalAmount = request.GoalAmount,
            GoalUnit = request.GoalUnit,
            StartDate = DateTimeHelper.ToUtc(request.StartDate),
            EndDate = DateTimeHelper.ToUtc(request.EndDate),
            CreatedAt = DateTime.UtcNow
        };

        _db.Habits.Add(habit);
        await _db.SaveChangesAsync();

        return ServiceResult<HabitDto>.Success(ToDto(habit, false));
    }

    public async Task<ServiceResult<HabitDto>> UpdateAsync(Guid id, UpdateHabitRequest request, Guid userId)
    {
        var habit = await _db.Habits.FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);
        if (habit == null) return ServiceResult<HabitDto>.NotFound();

        var diffError = DifficultyValidator.Validate(request.Difficulty, out var difficulty);
        if (diffError != null) return ServiceResult<HabitDto>.Failure(diffError);

        if (request.StartDate.HasValue && request.EndDate.HasValue &&
            request.EndDate.Value.Date < request.StartDate.Value.Date)
            return ServiceResult<HabitDto>.Failure("Дата окончания не может быть раньше даты начала");

        // Если сфера меняется на новую — она должна существовать и быть активной.
        // Если sphereId остаётся прежним (в т.ч. ссылающимся на soft-deleted сферу) — пропускаем.
        if (request.SphereId.HasValue && request.SphereId != habit.SphereId)
        {
            var sphereExists = await _db.Spheres.AnyAsync(s =>
                s.Id == request.SphereId.Value && s.UserId == userId && s.DeletedAt == null);
            if (!sphereExists) return ServiceResult<HabitDto>.Failure("Сфера не найдена");
        }

        habit.SphereId = request.SphereId;
        habit.Title = request.Title;
        habit.Description = request.Description;
        habit.Difficulty = difficulty;
        habit.XpReward = XpCalculator.GetXpReward(difficulty);
        habit.Emoji = request.Emoji;
        habit.Frequency = ParseFrequency(request.Frequency);
        habit.GoalAmount = request.GoalAmount;
        habit.GoalUnit = request.GoalUnit;
        habit.StartDate = DateTimeHelper.ToUtc(request.StartDate);
        habit.EndDate = DateTimeHelper.ToUtc(request.EndDate);

        await _db.SaveChangesAsync();

        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);
        var completedToday = await _db.HabitCompletions
            .AnyAsync(c => c.HabitId == id && c.CompletedAt >= today && c.CompletedAt < tomorrow);

        return ServiceResult<HabitDto>.Success(ToDto(habit, completedToday));
    }

    public async Task<ServiceResult<HabitDto>> CompleteAsync(Guid id, Guid userId)
    {
        var habit = await _db.Habits.FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);
        if (habit == null) return ServiceResult<HabitDto>.NotFound();
        if (!habit.IsActive) return ServiceResult<HabitDto>.Failure("Привычка неактивна");

        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        if (!IsScheduledDay(habit, today))
            return ServiceResult<HabitDto>.Failure("Сегодня привычку нельзя отметить по расписанию");

        var alreadyDone = await _db.HabitCompletions
            .AnyAsync(c => c.HabitId == id && c.CompletedAt >= today && c.CompletedAt < tomorrow);
        if (alreadyDone) return ServiceResult<HabitDto>.Failure("Привычка уже выполнена сегодня");

        var user = await _db.Users.FindAsync(userId);
        var oldXp = user?.Xp ?? 0;
        var oldStreak = await StatsCalculator.ComputeActivityStreakAsync(_db, userId, DateTime.UtcNow);

        _db.HabitCompletions.Add(new HabitCompletion
        {
            Id = Guid.NewGuid(),
            HabitId = habit.Id,
            UserId = userId,
            CompletedAt = DateTime.UtcNow,
            XpReward = habit.XpReward
        });

        if (user != null) user.Xp += habit.XpReward;

        await _db.SaveChangesAsync();
        await _badges.EvaluateAsync(userId);

        var newStreak = await StatsCalculator.ComputeActivityStreakAsync(_db, userId, DateTime.UtcNow);
        await _notifications.EmitProgressAsync(userId, oldXp, user?.Xp ?? oldXp, oldStreak, newStreak);

        return ServiceResult<HabitDto>.Success(ToDto(habit, true));
    }

    public async Task<ServiceResult<HabitDto>> UncompleteAsync(Guid id, Guid userId)
    {
        var habit = await _db.Habits.FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);
        if (habit == null) return ServiceResult<HabitDto>.NotFound();

        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var completion = await _db.HabitCompletions
            .FirstOrDefaultAsync(c => c.HabitId == id && c.CompletedAt >= today && c.CompletedAt < tomorrow);

        if (completion != null)
        {
            _db.HabitCompletions.Remove(completion);

            var user = await _db.Users.FindAsync(userId);
            if (user != null) user.Xp = Math.Max(0, user.Xp - completion.XpReward);

            await _db.SaveChangesAsync();
        }

        return ServiceResult<HabitDto>.Success(ToDto(habit, false));
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        var habit = await _db.Habits.FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);
        if (habit == null) return false;

        _db.Habits.Remove(habit);
        await _db.SaveChangesAsync();
        return true;
    }
}
