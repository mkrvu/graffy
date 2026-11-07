namespace GraffyApi.Domain;

public enum HabitFrequency { Daily, Weekly, Monthly }

public class Habit
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? SphereId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Difficulty Difficulty { get; set; }
    public int XpReward { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }

    public string? Emoji { get; set; }
    public HabitFrequency Frequency { get; set; } = HabitFrequency.Daily;

    // Цель — поля-пустышки (UI задаёт, логики начисления по ним пока нет).
    public int? GoalAmount { get; set; }
    public string? GoalUnit { get; set; }

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public User User { get; set; } = null!;
    public Sphere? Sphere { get; set; }
    public ICollection<HabitCompletion> Completions { get; set; } = new List<HabitCompletion>();
}
