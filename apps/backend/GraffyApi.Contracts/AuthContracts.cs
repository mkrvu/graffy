namespace GraffyApi.Contracts;

public record RegisterRequest(string Email, string Password, string Nickname);

public record LoginRequest(string Email, string Password);

public record RefreshRequest(string RefreshToken);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    UserDto User
);

public record UserDto(
    Guid Id,
    string Email,
    string Nickname,
    string? AvatarUrl,
    string? Bio,
    string? City,
    string GraphColor,
    int Xp,
    string Role,
    int Level,
    int XpInLevel,
    int XpForLevel,
    int ProgressPercent
);
