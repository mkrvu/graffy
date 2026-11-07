namespace GraffyApi.Contracts;

public record NotificationDto(
    Guid Id,
    string Type,
    string Payload,
    DateTime CreatedAt
);
