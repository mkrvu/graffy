namespace GraffyApi.Domain;

public class Clan
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Nickname { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public Guid LeaderId { get; set; }
    public string InviteToken { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public User Leader { get; set; } = null!;
    public ICollection<ClanMember> Members { get; set; } = new List<ClanMember>();
}
