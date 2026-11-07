namespace GraffyApi.Contracts;

public record CreateTaskRequest(
    string Title,
    string? Description,
    string Difficulty,
    DateTime? DueDate,
    Guid? SphereId,
    Guid? SectionId
);

public record UpdateTaskRequest(
    string Title,
    string? Description,
    string Difficulty,
    DateTime? DueDate,
    Guid? SphereId,
    Guid? SectionId
);

public record TaskDto(
    Guid Id,
    Guid UserId,
    string Title,
    string? Description,
    string Difficulty,
    int XpReward,
    bool IsCompleted,
    DateTime? CompletedAt,
    DateTime? DueDate,
    Guid? SphereId,
    Guid? SectionId,
    DateTime CreatedAt
);

public record TaskSectionDto(
    Guid Id,
    Guid UserId,
    string Name,
    DateTime CreatedAt
);

public record CreateSectionRequest(string Name);

public record UpdateSectionRequest(string Name);
