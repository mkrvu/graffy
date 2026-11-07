namespace GraffyApi.Domain;

public enum BadgeCategory
{
    TaskMaster,
    Terminator,
    XpHunter,
    Discipline,
    Unstoppable,
    Pioneer,
    Social
}

public class Badge
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconUrl { get; set; }

    public BadgeCategory Category { get; set; }
    public int Tier { get; set; } = 1;
    public int Requirement { get; set; }

    // Если true — автовыдача не работает, бейдж выдаётся только админом (например, «Первооткрыватель»).
    public bool ManualOnly { get; set; }
}
