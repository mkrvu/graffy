using System.Collections.Concurrent;
using System.Text.Json;
using GraffyApi.Contracts;

namespace GraffyApi.Services;

public interface INotificationService
{
    Task PushBadgeAwardedAsync(Guid userId, Guid badgeId, string title, string? iconUrl, int tier, string category);
    Task PushLeveledUpAsync(Guid userId, int level);
    Task PushStreakMilestoneAsync(Guid userId, int days);
    Task EmitProgressAsync(Guid userId, int oldXp, int newXp, int oldStreak, int newStreak);
    Task<List<NotificationDto>> ConsumePendingAsync(Guid userId);
}

/// <summary>
/// In-memory шина уведомлений. Очередь на пользователя живёт в памяти процесса.
/// При рестарте сервера непрочитанные уведомления теряются — это сознательно: они эфемерны
/// (toast'ы UI), и копить их в БД смысла нет.
/// </summary>
public class NotificationService : INotificationService
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static readonly HashSet<int> StreakMilestones = new() { 3, 7, 14, 30, 60, 100 };

    // Уведомления живут только 60 секунд — если фронт не забрал, считаем неактуальным.
    private static readonly TimeSpan Ttl = TimeSpan.FromMinutes(1);

    private readonly ConcurrentDictionary<Guid, ConcurrentQueue<NotificationDto>> _queues = new();

    public Task PushBadgeAwardedAsync(Guid userId, Guid badgeId, string title, string? iconUrl, int tier, string category)
    {
        var payload = JsonSerializer.Serialize(new { badgeId, title, iconUrl, tier, category }, Json);
        Push(userId, "BadgeAwarded", payload);
        return Task.CompletedTask;
    }

    public Task PushLeveledUpAsync(Guid userId, int level)
    {
        var payload = JsonSerializer.Serialize(new { level }, Json);
        Push(userId, "LeveledUp", payload);
        return Task.CompletedTask;
    }

    public Task PushStreakMilestoneAsync(Guid userId, int days)
    {
        var payload = JsonSerializer.Serialize(new { days }, Json);
        Push(userId, "StreakMilestone", payload);
        return Task.CompletedTask;
    }

    public async Task EmitProgressAsync(Guid userId, int oldXp, int newXp, int oldStreak, int newStreak)
    {
        var oldLevel = LevelCalculator.GetLevel(oldXp);
        var newLevel = LevelCalculator.GetLevel(newXp);
        if (newLevel > oldLevel) await PushLeveledUpAsync(userId, newLevel);
        if (newStreak > oldStreak && StreakMilestones.Contains(newStreak))
            await PushStreakMilestoneAsync(userId, newStreak);
    }

    public Task<List<NotificationDto>> ConsumePendingAsync(Guid userId)
    {
        var result = new List<NotificationDto>();
        if (_queues.TryGetValue(userId, out var queue))
        {
            PruneExpired(queue);
            while (queue.TryDequeue(out var item)) result.Add(item);
        }
        return Task.FromResult(result);
    }

    private void Push(Guid userId, string type, string payload)
    {
        var dto = new NotificationDto(Guid.NewGuid(), type, payload, DateTime.UtcNow);
        var queue = _queues.GetOrAdd(userId, _ => new ConcurrentQueue<NotificationDto>());
        PruneExpired(queue);
        queue.Enqueue(dto);
    }

    // Очередь FIFO, голова — самые старые. Срезаем протухшие с головы.
    private static void PruneExpired(ConcurrentQueue<NotificationDto> queue)
    {
        var cutoff = DateTime.UtcNow - Ttl;
        while (queue.TryPeek(out var head) && head.CreatedAt < cutoff)
        {
            queue.TryDequeue(out _);
        }
    }
}
