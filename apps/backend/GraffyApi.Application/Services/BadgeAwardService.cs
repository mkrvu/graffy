using GraffyApi.Data;
using GraffyApi.Domain;
using Microsoft.EntityFrameworkCore;

namespace GraffyApi.Services;

public interface IBadgeAwardService
{
    // Пересчитать метрики пользователя и выдать недостающие бейджи с автовыдачей.
    // Идемпотентно — повторный вызов не выдаст бейдж второй раз.
    Task EvaluateAsync(Guid userId);
}

public class BadgeAwardService : IBadgeAwardService
{
    private readonly AppDbContext _db;
    private readonly INotificationService _notifications;

    public BadgeAwardService(AppDbContext db, INotificationService notifications)
    {
        _db = db;
        _notifications = notifications;
    }

    public async Task EvaluateAsync(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return;

        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        // Метрики
        var taskCount = await _db.Tasks.CountAsync(t => t.UserId == userId && t.IsCompleted);
        var totalXp = user.Xp;
        var level = LevelCalculator.GetLevel(totalXp);

        var monthlyTaskXp = await _db.Tasks
            .Where(t => t.UserId == userId && t.IsCompleted && t.CompletedAt >= monthStart)
            .SumAsync(t => (int?)t.XpReward) ?? 0;
        var monthlyHabitXp = await _db.HabitCompletions
            .Where(h => h.UserId == userId && h.CompletedAt >= monthStart)
            .SumAsync(h => (int?)h.XpReward) ?? 0;
        var monthlyXp = monthlyTaskXp + monthlyHabitXp;

        var streak = await StatsCalculator.ComputeActivityStreakAsync(_db, userId, now);

        // Бейджи с автовыдачей (manual = false). Pioneer / Social — только админом.
        var ownedBadgeIds = await _db.UserBadges
            .Where(ub => ub.UserId == userId)
            .Select(ub => ub.BadgeId)
            .ToListAsync();
        var owned = ownedBadgeIds.ToHashSet();

        var autoBadges = await _db.Badges.Where(b => !b.ManualOnly).ToListAsync();

        // Сначала добавляем все недостающие в контекст, тосты копим отдельно.
        var awarded = new List<Badge>();
        foreach (var badge in autoBadges)
        {
            if (owned.Contains(badge.Id)) continue;

            var metric = badge.Category switch
            {
                BadgeCategory.TaskMaster   => taskCount,
                BadgeCategory.XpHunter     => totalXp,
                BadgeCategory.Unstoppable  => level,
                BadgeCategory.Discipline   => streak,
                BadgeCategory.Terminator   => monthlyXp,
                _ => -1
            };

            if (metric >= badge.Requirement)
            {
                _db.UserBadges.Add(new UserBadge
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    BadgeId = badge.Id,
                    IssuedAt = now,
                    IssuedByAdminId = null
                });
                awarded.Add(badge);
            }
        }

        await _db.SaveChangesAsync();

        // Тосты — только после успешного коммита. Если SaveChanges упадёт, юзер не увидит
        // уведомления о бейдже, которого нет в БД.
        foreach (var badge in awarded)
        {
            await _notifications.PushBadgeAwardedAsync(
                userId, badge.Id, badge.Title, badge.IconUrl, badge.Tier, badge.Category.ToString());
        }
    }

}
