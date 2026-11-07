namespace GraffyApi.Domain;

public class UserBadge
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid BadgeId { get; set; }
    public DateTime IssuedAt { get; set; }
    public Guid? IssuedByAdminId { get; set; }

    public User User { get; set; } = null!;
    public Badge Badge { get; set; } = null!;
}
