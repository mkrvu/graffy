namespace GraffyApi.Contracts;

public record CreateHabitRequest(
    string Title,
    string? Description,
    string Difficulty,
    Guid? SphereId = null,
    string? Emoji = null,
    string? Frequency = "Daily",
    int? GoalAmount = null,
    string? GoalUnit = null,
    DateTime? StartDate = null,
    DateTime? EndDate = null
);

public record UpdateHabitRequest(
    string Title,
    string? Description,
    string Difficulty,
    Guid? SphereId = null,
    string? Emoji = null,
    string? Frequency = "Daily",
    int? GoalAmount = null,
    string? GoalUnit = null,
    DateTime? StartDate = null,
    DateTime? EndDate = null
);

public record HabitDto(
    Guid Id,
    Guid UserId,
    Guid? SphereId,
    string Title,
    string? Description,
    string Difficulty,
    int XpReward,
    bool IsActive,
    bool CompletedToday,
    DateTime CreatedAt,
    string? Emoji,
    string Frequency,
    int? GoalAmount,
    string? GoalUnit,
    DateTime? StartDate,
    DateTime? EndDate
);
