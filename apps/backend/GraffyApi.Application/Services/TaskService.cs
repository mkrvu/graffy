using GraffyApi.Common;
using GraffyApi.Contracts;
using GraffyApi.Data;
using GraffyApi.Domain;
using GraffyApi.Validation;
using Microsoft.EntityFrameworkCore;

namespace GraffyApi.Services;

public interface ITaskService
{
    Task<List<TaskDto>> GetTasksAsync(Guid userId, int skip, int take);
    Task<TaskDto?> GetByIdAsync(Guid id, Guid userId);
    Task<ServiceResult<TaskDto>> CreateAsync(CreateTaskRequest request, Guid userId);
    Task<ServiceResult<TaskDto>> UpdateAsync(Guid id, UpdateTaskRequest request, Guid userId);
    Task<ServiceResult<TaskDto>> CompleteAsync(Guid id, Guid userId);
    Task<ServiceResult<TaskDto>> UncompleteAsync(Guid id, Guid userId);
    Task<bool> DeleteAsync(Guid id, Guid userId);
}

public class TaskService : ITaskService
{
    private readonly AppDbContext _db;
    private readonly IBadgeAwardService _badges;
    private readonly INotificationService _notifications;

    public TaskService(AppDbContext db, IBadgeAwardService badges, INotificationService notifications)
    {
        _db = db;
        _badges = badges;
        _notifications = notifications;
    }

    public async Task<List<TaskDto>> GetTasksAsync(Guid userId, int skip, int take) =>
        await _db.Tasks
            .AsNoTracking()
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .Skip(skip)
            .Take(take)
            .Select(t => MapToDto(t))
            .ToListAsync();

    public async Task<TaskDto?> GetByIdAsync(Guid id, Guid userId)
    {
        var task = await _db.Tasks
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        return task == null ? null : MapToDto(task);
    }

    public async Task<ServiceResult<TaskDto>> CreateAsync(CreateTaskRequest request, Guid userId)
    {
        var diffError = DifficultyValidator.Validate(request.Difficulty, out var difficulty);
        if (diffError != null) return ServiceResult<TaskDto>.Failure(diffError);

        if (request.SectionId.HasValue)
        {
            var sectionExists = await _db.TaskSections.AnyAsync(s => s.Id == request.SectionId && s.UserId == userId);
            if (!sectionExists) return ServiceResult<TaskDto>.Failure("Раздел не найден");
        }

        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = request.Title,
            Description = request.Description,
            Difficulty = difficulty,
            XpReward = XpCalculator.GetXpReward(difficulty),
            DueDate = DateTimeHelper.ToUtc(request.DueDate),
            SphereId = request.SphereId,
            SectionId = request.SectionId,
            CreatedAt = DateTime.UtcNow
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();
        return ServiceResult<TaskDto>.Success(MapToDto(task));
    }

    public async Task<ServiceResult<TaskDto>> UpdateAsync(Guid id, UpdateTaskRequest request, Guid userId)
    {
        var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (task == null) return ServiceResult<TaskDto>.NotFound();
        if (task.IsCompleted) return ServiceResult<TaskDto>.Failure("Нельзя редактировать выполненную задачу");

        var diffError = DifficultyValidator.Validate(request.Difficulty, out var difficulty);
        if (diffError != null) return ServiceResult<TaskDto>.Failure(diffError);

        if (request.SectionId.HasValue)
        {
            var sectionExists = await _db.TaskSections.AnyAsync(s => s.Id == request.SectionId && s.UserId == userId);
            if (!sectionExists) return ServiceResult<TaskDto>.Failure("Раздел не найден");
        }

        task.Title = request.Title;
        task.Description = request.Description;
        task.Difficulty = difficulty;
        task.XpReward = XpCalculator.GetXpReward(difficulty);
        task.DueDate = DateTimeHelper.ToUtc(request.DueDate);
        task.SphereId = request.SphereId;
        task.SectionId = request.SectionId;

        await _db.SaveChangesAsync();
        return ServiceResult<TaskDto>.Success(MapToDto(task));
    }

    public async Task<ServiceResult<TaskDto>> CompleteAsync(Guid id, Guid userId)
    {
        var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (task == null) return ServiceResult<TaskDto>.NotFound();
        if (task.IsCompleted) return ServiceResult<TaskDto>.Failure("Задача уже выполнена");

        var user = await _db.Users.FindAsync(userId);
        var oldXp = user?.Xp ?? 0;
        var oldStreak = await StatsCalculator.ComputeActivityStreakAsync(_db, userId, DateTime.UtcNow);

        task.IsCompleted = true;
        task.CompletedAt = DateTime.UtcNow;
        if (user != null) user.Xp += task.XpReward;

        await _db.SaveChangesAsync();
        await _badges.EvaluateAsync(userId);

        var newStreak = await StatsCalculator.ComputeActivityStreakAsync(_db, userId, DateTime.UtcNow);
        await _notifications.EmitProgressAsync(userId, oldXp, user?.Xp ?? oldXp, oldStreak, newStreak);

        return ServiceResult<TaskDto>.Success(MapToDto(task));
    }

    public async Task<ServiceResult<TaskDto>> UncompleteAsync(Guid id, Guid userId)
    {
        var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (task == null) return ServiceResult<TaskDto>.NotFound();
        if (!task.IsCompleted) return ServiceResult<TaskDto>.Failure("Задача не выполнена");

        task.IsCompleted = false;
        task.CompletedAt = null;

        var user = await _db.Users.FindAsync(userId);
        if (user != null) user.Xp = Math.Max(0, user.Xp - task.XpReward);

        await _db.SaveChangesAsync();
        return ServiceResult<TaskDto>.Success(MapToDto(task));
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (task == null) return false;

        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();
        return true;
    }

    private static TaskDto MapToDto(TaskItem t) =>
        new(t.Id, t.UserId, t.Title, t.Description, t.Difficulty.ToString(),
            t.XpReward, t.IsCompleted, t.CompletedAt, t.DueDate, t.SphereId, t.SectionId, t.CreatedAt);
}
