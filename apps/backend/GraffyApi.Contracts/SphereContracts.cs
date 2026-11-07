namespace GraffyApi.Contracts;

public record CreateSphereRequest(string Name, string Emoji);

public record SphereDto(
    Guid Id,
    string Name,
    string Emoji,
    int HabitCount,
    DateTime CreatedAt
);
