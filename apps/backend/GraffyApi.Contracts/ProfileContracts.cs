namespace GraffyApi.Contracts;

public record ErrorResponse(string Error);

public record AvatarUploadResponse(string AvatarUrl);

public record UpdateProfileRequest(
    string? Nickname,
    string? AvatarUrl,
    string? Bio,
    string? City,
    string? GraphColor
);

public record BadgeDto(
    Guid Id,
    string Code,
    string Title,
    string? Description,
    string? IconUrl,
    string Category,
    int Tier,
    int Requirement,
    bool ManualOnly,
    DateTime? IssuedAt
);

public record ProfileDto(
    Guid Id,
    string Email,
    string Nickname,
    string? AvatarUrl,
    string? Bio,
    string? City,
    string GraphColor,
    int Xp,
    string Role,
    List<BadgeDto> Badges
);

public record ProfileStatsDto(
    int TotalTasksCompleted,
    int TotalHabitsCompleted,
    int CurrentStreak,
    int TotalBadges
);

public record PublicProfileDto(
    Guid Id,
    string Nickname,
    string? AvatarUrl,
    string? Bio,
    string? City,
    int Xp,
    string GraphColor,
    List<BadgeDto> Badges
);
