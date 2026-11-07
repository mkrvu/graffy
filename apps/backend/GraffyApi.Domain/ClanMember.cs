namespace GraffyApi.Domain;

public class ClanMember
{
    public Guid ClanId { get; set; }
    public Guid UserId { get; set; }
    public DateTime JoinedAt { get; set; }

    public Clan Clan { get; set; } = null!;
    public User User { get; set; } = null!;
}
