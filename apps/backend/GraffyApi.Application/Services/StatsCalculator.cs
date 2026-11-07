using GraffyApi.Data;
using Microsoft.EntityFrameworkCore;

namespace GraffyApi.Services;

public static class StatsCalculator
{
    // Стрик активности: количество подряд идущих дней (заканчиваясь сегодня или вчера),
    // в каждый из которых пользователь выполнил минимум 1 задачу ИЛИ 1 привычку.
    public static async Task<int> ComputeActivityStreakAsync(AppDbContext db, Guid userId, DateTime now)
    {
        var taskDays = await db.Tasks.AsNoTracking()
            .Where(t => t.UserId == userId && t.IsCompleted && t.CompletedAt.HasValue)
            .Select(t => t.CompletedAt!.Value.Date)
            .ToListAsync();

        var habitDays = await db.HabitCompletions.AsNoTracking()
            .Where(h => h.UserId == userId)
            .Select(h => h.CompletedAt.Date)
            .ToListAsync();

        var dates = taskDays.Concat(habitDays).Distinct().OrderByDescending(d => d).ToList();
        if (dates.Count == 0) return 0;

        var today = now.Date;
        var yesterday = today.AddDays(-1);
        if (dates[0] != today && dates[0] != yesterday) return 0;

        var streak = 0;
        var cursor = dates[0];
        foreach (var d in dates)
        {
            if (d == cursor) { streak++; cursor = cursor.AddDays(-1); }
            else break;
        }
        return streak;
    }
}
