namespace GraffyApi.Contracts;

public record AdminStatsDto(
    int TotalUsers,
    double AverageUserActivity,
    int TotalCompletedTasks,
    int TotalXpEarned
);

public record AdminUserDto(
    Guid Id,
    string Email,
    string Nickname,
    string? City,
    int Xp,
    string Role,
    DateTime CreatedAt,
    int TaskCount,
    int HabitCount
);

public record UpdateNicknameRequest(string Nickname);

public record IssueBadgeRequest(Guid BadgeId);

public record CreateBadgeRequest(
    string Code,
    string Title,
    string? Description,
    string? IconUrl,
    string Category,
    int Tier,
    int Requirement,
    bool ManualOnly
);
