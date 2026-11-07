namespace GraffyApi.Contracts;

public record CreateClanRequest(string Name, string Nickname, string Color);

public record RenameClanRequest(string Name);

public record UpdateClanRequest(string? Name, string? Nickname, string? Color);

public record ClanMemberDto(
    Guid UserId,
    string Nickname,
    string? AvatarUrl,
    string? City,
    int Xp,
    int Level,
    bool IsLeader,
    DateTime JoinedAt
);

public record ClanDto(
    Guid Id,
    string Name,
    string Nickname,
    string Color,
    Guid LeaderId,
    DateTime CreatedAt,
    int MemberCount
);

public record ClanStatsDto(
    int TotalXp,
    int TotalCompletedTasks,
    int TotalCompletedHabits,
    int ActiveMembers
);

public record ClanDetailsDto(
    Guid Id,
    string Name,
    string Nickname,
    string Color,
    Guid LeaderId,
    DateTime CreatedAt,
    List<ClanMemberDto> Members,
    ClanStatsDto Stats
);

public record InviteDto(string Token);

public record InvitePreviewDto(
    Guid ClanId,
    string Name,
    string Nickname,
    string Color,
    int MemberCount,
    int MemberLimit
);

public record AdminClanDto(
    Guid Id,
    string Name,
    string Nickname,
    string Color,
    Guid LeaderId,
    string LeaderNickname,
    int MemberCount,
    DateTime CreatedAt
);
