namespace GraffyApi.Domain;

public enum Difficulty { Trivial, Easy, Medium, Hard }

public class TaskItem
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Difficulty Difficulty { get; set; }
    public int XpReward { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public Guid? SphereId { get; set; }
    public Guid? SectionId { get; set; }
    public DateTime CreatedAt { get; set; }

    public User User { get; set; } = null!;
    public TaskSection? Section { get; set; }
}
