using GraffyApi.Contracts;
using GraffyApi.Data;
using Microsoft.EntityFrameworkCore;

namespace GraffyApi.Services;

public interface IGraphService
{
    Task<GraphResponse> GetPersonalGraphAsync(Guid userId);
    Task<object> GetUsersGraphAsync();
}

public class GraphService : IGraphService
{
    private readonly AppDbContext _db;

    public GraphService(AppDbContext db) => _db = db;

    public async Task<GraphResponse> GetPersonalGraphAsync(Guid userId)
    {
        var user = await _db.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new { u.Id, u.Nickname, u.GraphColor, u.Xp })
            .FirstOrDefaultAsync();
        if (user == null) return new GraphResponse([], []);

        var completedTasks = await _db.Tasks
            .AsNoTracking()
            .Where(t => t.UserId == userId && t.IsCompleted && t.CompletedAt.HasValue)
            .Select(t => new { t.Id, t.Title, t.XpReward, t.CompletedAt })
            .ToListAsync();

        var habitCompletions = await _db.HabitCompletions
            .AsNoTracking()
            .Where(hc => hc.UserId == userId)
            .Select(hc => new { hc.Id, hc.CompletedAt, hc.XpReward, HabitTitle = hc.Habit.Title })
            .ToListAsync();

        var tasksByDay = completedTasks
            .GroupBy(t => t.CompletedAt!.Value.Date)
            .ToDictionary(g => g.Key, g => g.ToList());

        var habitsByDay = habitCompletions
            .GroupBy(hc => hc.CompletedAt.Date)
            .ToDictionary(g => g.Key, g => g.ToList());

        var activityDays = new HashSet<DateTime>(tasksByDay.Keys.Concat(habitsByDay.Keys));
        if (activityDays.Count == 0) return new GraphResponse([], []);

        var minDate = activityDays.Min();
        minDate = minDate.AddDays(-(minDate.Day - 1));
        var maxDate = new DateTime(activityDays.Max().Year, activityDays.Max().Month,
            DateTime.DaysInMonth(activityDays.Max().Year, activityDays.Max().Month));

        var nodes = new List<GraphNodeDto>();
        var links = new List<GraphLinkDto>();
        var userNodeId = $"user-{user.Id}";
        nodes.Add(new GraphNodeDto(userNodeId, "user", user.Nickname, user.GraphColor, user.Xp, "circle"));

        for (var m = new DateTime(minDate.Year, minDate.Month, 1); m <= maxDate; m = m.AddMonths(1))
        {
            var monthKey = $"month-{m.Year}-{m.Month:D2}";
            nodes.Add(new GraphNodeDto(monthKey, "month", m.ToString("MMM yyyy"), user.GraphColor, 0, "rounded-rect"));
            links.Add(new GraphLinkDto(userNodeId, monthKey));

            var daysInMonth = DateTime.DaysInMonth(m.Year, m.Month);
            for (var day = 1; day <= daysInMonth; day++)
            {
                var date = new DateTime(m.Year, m.Month, day);
                var dayKey = $"day-{date:yyyy-MM-dd}";

                var dayTasks = tasksByDay.GetValueOrDefault(date, []);
                var dayHabits = habitsByDay.GetValueOrDefault(date, []);
                var dayXp = dayTasks.Sum(t => t.XpReward) + dayHabits.Sum(hc => hc.XpReward);

                var dayColor = dayXp > 0 ? InterpolateColor(user.GraphColor, dayXp) : "#1e293b";
                nodes.Add(new GraphNodeDto(dayKey, "day", date.ToString("dd"), dayColor, dayXp, "square"));
                links.Add(new GraphLinkDto(monthKey, dayKey));

                foreach (var task in dayTasks)
                {
                    nodes.Add(new GraphNodeDto($"task-{task.Id}", "task", task.Title, "#22c55e", task.XpReward, "rounded-rect"));
                    links.Add(new GraphLinkDto(dayKey, $"task-{task.Id}"));
                }

                foreach (var hc in dayHabits)
                {
                    nodes.Add(new GraphNodeDto($"habit-{hc.Id}", "habit", hc.HabitTitle ?? "Привычка", "#3b82f6", hc.XpReward, "diamond"));
                    links.Add(new GraphLinkDto(dayKey, $"habit-{hc.Id}"));
                }
            }
        }

        return new GraphResponse(nodes, links);
    }

    public async Task<object> GetUsersGraphAsync()
    {
        var nodes = await _db.Users
            .AsNoTracking()
            .Select(u => new GraphNodeDto(
                $"user-{u.Id}", "user", u.Nickname, u.GraphColor, u.Xp, "circle"))
            .ToListAsync();

        return new { nodes };
    }

    private static string InterpolateColor(string hexColor, int xp)
    {
        var intensity = Math.Clamp(0.2 + (xp / 200.0) * 0.8, 0.2, 1.0);

        if (!TryParseHex(hexColor, out var r, out var g, out var b))
            return hexColor;

        return $"#{(int)(r * intensity):X2}{(int)(g * intensity):X2}{(int)(b * intensity):X2}";
    }

    private static bool TryParseHex(string hex, out int r, out int g, out int b)
    {
        r = g = b = 0;
        hex = hex.TrimStart('#');
        if (hex.Length != 6) return false;
        try
        {
            r = Convert.ToInt32(hex[..2], 16);
            g = Convert.ToInt32(hex[2..4], 16);
            b = Convert.ToInt32(hex[4..6], 16);
            return true;
        }
        catch { return false; }
    }
}
