namespace GraffyApi.Domain;

public enum UserRole { User, Admin }

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Nickname { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public string? City { get; set; }
    public string GraphColor { get; set; } = "#6366f1";
    public int Xp { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool EmailConfirmed { get; set; }
    public UserRole Role { get; set; } = UserRole.User;
    public Guid? ReferredByUserId { get; set; }

    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    public ICollection<TaskSection> TaskSections { get; set; } = new List<TaskSection>();
    public ICollection<Habit> Habits { get; set; } = new List<Habit>();
    public ICollection<Sphere> Spheres { get; set; } = new List<Sphere>();
    public ICollection<UserBadge> UserBadges { get; set; } = new List<UserBadge>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
