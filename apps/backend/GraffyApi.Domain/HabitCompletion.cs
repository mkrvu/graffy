namespace GraffyApi.Domain;

public class HabitCompletion
{
    public Guid Id { get; set; }
    public Guid HabitId { get; set; }
    public Guid UserId { get; set; }
    public DateTime CompletedAt { get; set; }
    public int XpReward { get; set; }

    public Habit Habit { get; set; } = null!;
}
