using GraffyApi.Common;
using GraffyApi.Contracts;
using GraffyApi.Data;
using GraffyApi.Domain;
using GraffyApi.Validation;
using Microsoft.EntityFrameworkCore;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace GraffyApi.Services;

public interface IProfileService
{
    Task<ProfileDto?> GetMyProfileAsync(Guid userId);
    Task<ProfileStatsDto> GetStatsAsync(Guid userId);
    Task<ServiceResult<ProfileDto>> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
    Task<ServiceResult<string>> UploadAvatarAsync(Guid userId, Stream stream, long fileSize);
    Task<PublicProfileDto?> GetPublicProfileAsync(Guid targetId);
}

public class ProfileService : IProfileService
{
    private readonly AppDbContext _db;
    private readonly IAvatarStorage _avatarStorage;
    private readonly string _staticBaseUrl;

    public ProfileService(AppDbContext db, IAvatarStorage avatarStorage, IConfiguration config)
    {
        _db = db;
        _avatarStorage = avatarStorage;
        _staticBaseUrl = config["STATIC_BASE_URL"] ?? string.Empty;
    }

    public async Task<ProfileStatsDto> GetStatsAsync(Guid userId)
    {
        var tasksDone = await _db.Tasks.AsNoTracking().CountAsync(t => t.UserId == userId && t.IsCompleted);
        var habitsDone = await _db.HabitCompletions.AsNoTracking().CountAsync(h => h.UserId == userId);
        var badges = await _db.UserBadges.AsNoTracking().CountAsync(ub => ub.UserId == userId);
        var streak = await StatsCalculator.ComputeActivityStreakAsync(_db, userId, DateTime.UtcNow);
        return new ProfileStatsDto(tasksDone, habitsDone, streak, badges);
    }

    public async Task<ProfileDto?> GetMyProfileAsync(Guid userId)
    {
        var user = await _db.Users
            .AsNoTracking()
            .Include(u => u.UserBadges).ThenInclude(ub => ub.Badge)
            .FirstOrDefaultAsync(u => u.Id == userId);
        return user == null ? null : MapToProfile(user);
    }

    public async Task<ServiceResult<ProfileDto>> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
    {
        var user = await _db.Users
            .Include(u => u.UserBadges).ThenInclude(ub => ub.Badge)
            .FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return ServiceResult<ProfileDto>.NotFound();

        if (!string.IsNullOrWhiteSpace(request.Nickname))
        {
            var nicknameError = NicknameValidator.Validate(request.Nickname);
            if (nicknameError != null) return ServiceResult<ProfileDto>.Failure(nicknameError);

            var taken = await _db.Users.AnyAsync(u => u.Nickname == request.Nickname && u.Id != userId);
            if (taken) return ServiceResult<ProfileDto>.Failure("Никнейм уже занят");

            user.Nickname = request.Nickname;
        }

        if (request.AvatarUrl != null) user.AvatarUrl = request.AvatarUrl;
        if (request.Bio != null) user.Bio = request.Bio;
        if (request.City != null) user.City = request.City;
        if (!string.IsNullOrWhiteSpace(request.GraphColor)) user.GraphColor = request.GraphColor;

        await _db.SaveChangesAsync();
        return ServiceResult<ProfileDto>.Success(MapToProfile(user));
    }

    public async Task<ServiceResult<string>> UploadAvatarAsync(Guid userId, Stream stream, long fileSize)
    {
        var sizeError = AvatarValidator.Validate(fileSize);
        if (sizeError != null) return ServiceResult<string>.Failure(sizeError);

        var user = await _db.Users.FindAsync(userId);
        if (user == null) return ServiceResult<string>.NotFound();

        MemoryStream output;
        try
        {
            using var image = await Image.LoadAsync(stream);
            image.Mutate(x => x.Resize(new ResizeOptions
            {
                Size = new Size(512, 512),
                Mode = ResizeMode.Crop
            }));
            output = new MemoryStream();
            await image.SaveAsWebpAsync(output);
        }
        catch
        {
            return ServiceResult<string>.Failure("Неверный формат изображения");
        }

        output.Position = 0;
        var key = $"avatars/{userId}/{Guid.NewGuid():N}_512.webp";
        await _avatarStorage.UploadAsync(key, output, "image/webp");

        user.AvatarUrl = $"{_staticBaseUrl}/{key}";
        await _db.SaveChangesAsync();

        return ServiceResult<string>.Success(user.AvatarUrl);
    }

    public async Task<PublicProfileDto?> GetPublicProfileAsync(Guid targetId)
    {
        var user = await _db.Users
            .AsNoTracking()
            .Include(u => u.UserBadges).ThenInclude(ub => ub.Badge)
            .FirstOrDefaultAsync(u => u.Id == targetId);
        if (user == null) return null;

        var badges = user.UserBadges.Select(ub => new BadgeDto(
            ub.Badge.Id, ub.Badge.Code, ub.Badge.Title, ub.Badge.Description, ub.Badge.IconUrl,
            ub.Badge.Category.ToString(), ub.Badge.Tier, ub.Badge.Requirement, ub.Badge.ManualOnly, ub.IssuedAt
        )).ToList();

        return new PublicProfileDto(user.Id, user.Nickname, user.AvatarUrl, user.Bio, user.City, user.Xp, user.GraphColor, badges);
    }

    private static ProfileDto MapToProfile(User user)
    {
        var badges = user.UserBadges.Select(ub => new BadgeDto(
            ub.Badge.Id, ub.Badge.Code, ub.Badge.Title, ub.Badge.Description, ub.Badge.IconUrl,
            ub.Badge.Category.ToString(), ub.Badge.Tier, ub.Badge.Requirement, ub.Badge.ManualOnly, ub.IssuedAt
        )).ToList();

        return new ProfileDto(user.Id, user.Email, user.Nickname, user.AvatarUrl, user.Bio,
            user.City, user.GraphColor, user.Xp, user.Role.ToString(), badges);
    }
}
