using GraffyApi.Auth;
using GraffyApi.Common;
using GraffyApi.Contracts;
using GraffyApi.Data;
using GraffyApi.Domain;
using GraffyApi.Validation;
using Microsoft.EntityFrameworkCore;

namespace GraffyApi.Services;

public interface IAuthService
{
    Task<ServiceResult<AuthResponse>> RegisterAsync(RegisterRequest request);
    Task<ServiceResult<AuthResponse>> LoginAsync(LoginRequest request);
    Task<ServiceResult<AuthResponse>> RefreshAsync(string refreshToken);
    Task<bool> LogoutAsync(string refreshToken);
    Task<UserDto?> GetCurrentUserAsync(Guid userId);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IJwtService _jwt;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext db, IJwtService jwt, IConfiguration config)
    {
        _db = db;
        _jwt = jwt;
        _config = config;
    }

    public async Task<ServiceResult<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        var nicknameError = NicknameValidator.Validate(request.Nickname);
        if (nicknameError != null) return ServiceResult<AuthResponse>.Failure(nicknameError);

        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            return ServiceResult<AuthResponse>.Failure("Email уже зарегистрирован");

        if (await _db.Users.AnyAsync(u => u.Nickname == request.Nickname))
            return ServiceResult<AuthResponse>.Failure("Никнейм уже занят");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email.ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Nickname = request.Nickname,
            GraphColor = "#6366f1",
            CreatedAt = DateTime.UtcNow,
            EmailConfirmed = false
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return ServiceResult<AuthResponse>.Success(await BuildAuthResponseAsync(user));
    }

    public async Task<ServiceResult<AuthResponse>> LoginAsync(LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email.ToLowerInvariant());
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return ServiceResult<AuthResponse>.Failure("Неверный email или пароль");

        return ServiceResult<AuthResponse>.Success(await BuildAuthResponseAsync(user));
    }

    public async Task<ServiceResult<AuthResponse>> RefreshAsync(string refreshToken)
    {
        var token = await _db.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

        if (token == null || !token.IsActive)
            return ServiceResult<AuthResponse>.Failure("Недействительный или истёкший refresh-токен");

        token.RevokedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return ServiceResult<AuthResponse>.Success(await BuildAuthResponseAsync(token.User));
    }

    public async Task<bool> LogoutAsync(string refreshToken)
    {
        var token = await _db.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == refreshToken);
        if (token == null) return false;

        token.RevokedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<UserDto?> GetCurrentUserAsync(Guid userId)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
        return user == null ? null : MapToDto(user);
    }

    private async Task<AuthResponse> BuildAuthResponseAsync(User user)
    {
        var accessToken = _jwt.GenerateAccessToken(user);
        var refreshToken = _jwt.GenerateRefreshToken();
        var days = int.Parse(_config["JWT_REFRESH_TOKEN_DAYS"] ?? "30");

        _db.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshToken,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(days)
        });
        await _db.SaveChangesAsync();

        return new AuthResponse(accessToken, refreshToken, MapToDto(user));
    }

    private static UserDto MapToDto(User u)
    {
        var (level, xpInLevel, xpForLevel, progress) = LevelCalculator.GetProgress(u.Xp);
        return new(u.Id, u.Email, u.Nickname, u.AvatarUrl, u.Bio, u.City, u.GraphColor, u.Xp, u.Role.ToString(),
            level, xpInLevel, xpForLevel, progress);
    }
}
