using GraffyApi.Common;
using GraffyApi.Contracts;
using GraffyApi.Data;
using GraffyApi.Domain;
using GraffyApi.Validation;
using Microsoft.EntityFrameworkCore;

namespace GraffyApi.Services;

public interface IAdminService
{
    Task<AdminStatsDto> GetStatsAsync();
    Task<List<AdminUserDto>> GetUsersAsync();
    Task<ServiceResult> UpdateNicknameAsync(Guid userId, string nickname);
    Task<ServiceResult> IssueBadgeAsync(Guid userId, Guid badgeId, Guid adminId);
    Task<List<BadgeDto>> GetBadgesAsync();
    Task<ServiceResult<BadgeDto>> CreateBadgeAsync(CreateBadgeRequest request);
}

public class AdminService : IAdminService
{
    private readonly AppDbContext _db;

    public AdminService(AppDbContext db) => _db = db;

    public async Task<AdminStatsDto> GetStatsAsync()
    {
        var userAggs = await _db.Users
            .AsNoTracking()
            .GroupBy(_ => 1)
            .Select(g => new { Count = g.Count(), XpSum = g.Sum(u => u.Xp) })
            .FirstOrDefaultAsync();

        var totalCompletedTasks = await _db.Tasks.AsNoTracking().CountAsync(t => t.IsCompleted);

        double avgActivity = 0;
        if (userAggs?.Count > 0)
        {
            avgActivity = await _db.Users
                .AsNoTracking()
                .Select(u => u.Tasks.Count(t => t.IsCompleted) + u.Habits.Count)
                .AverageAsync();
        }

        return new AdminStatsDto(
            userAggs?.Count ?? 0,
            avgActivity,
            totalCompletedTasks,
            userAggs?.XpSum ?? 0);
    }

    public async Task<List<AdminUserDto>> GetUsersAsync() =>
        await _db.Users
            .AsNoTracking()
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new AdminUserDto(
                u.Id, u.Email, u.Nickname, u.City, u.Xp, u.Role.ToString(), u.CreatedAt,
                u.Tasks.Count, u.Habits.Count
            ))
            .ToListAsync();

    public async Task<ServiceResult> UpdateNicknameAsync(Guid userId, string nickname)
    {
        var nicknameError = NicknameValidator.Validate(nickname);
        if (nicknameError != null) return ServiceResult.Failure(nicknameError);

        var user = await _db.Users.FindAsync(userId);
        if (user == null) return ServiceResult.NotFound();

        var taken = await _db.Users.AnyAsync(u => u.Nickname == nickname && u.Id != userId);
        if (taken) return ServiceResult.Failure("Никнейм уже занят");

        user.Nickname = nickname;
        await _db.SaveChangesAsync();
        return ServiceResult.Success();
    }

    public async Task<ServiceResult> IssueBadgeAsync(Guid userId, Guid badgeId, Guid adminId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return ServiceResult.NotFound();

        var badge = await _db.Badges.FindAsync(badgeId);
        if (badge == null) return ServiceResult.Failure("Бейдж не найден");

        var alreadyHas = await _db.UserBadges.AnyAsync(ub => ub.UserId == userId && ub.BadgeId == badgeId);
        if (alreadyHas) return ServiceResult.Failure("У пользователя уже есть этот бейдж");

        _db.UserBadges.Add(new UserBadge
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            BadgeId = badgeId,
            IssuedAt = DateTime.UtcNow,
            IssuedByAdminId = adminId
        });

        await _db.SaveChangesAsync();
        return ServiceResult.Success();
    }

    public async Task<List<BadgeDto>> GetBadgesAsync() =>
        await _db.Badges
            .AsNoTracking()
            .OrderBy(b => b.Category).ThenBy(b => b.Tier)
            .Select(b => new BadgeDto(
                b.Id, b.Code, b.Title, b.Description, b.IconUrl,
                b.Category.ToString(), b.Tier, b.Requirement, b.ManualOnly, null))
            .ToListAsync();

    public async Task<ServiceResult<BadgeDto>> CreateBadgeAsync(CreateBadgeRequest request)
    {
        if (!Enum.TryParse<BadgeCategory>(request.Category, ignoreCase: true, out var category))
            return ServiceResult<BadgeDto>.Failure("Неизвестная категория бейджа");

        var exists = await _db.Badges.AnyAsync(b => b.Code == request.Code);
        if (exists) return ServiceResult<BadgeDto>.Failure("Бейдж с таким кодом уже существует");

        var badge = new Badge
        {
            Id = Guid.NewGuid(),
            Code = request.Code,
            Title = request.Title,
            Description = request.Description,
            IconUrl = request.IconUrl,
            Category = category,
            Tier = request.Tier,
            Requirement = request.Requirement,
            ManualOnly = request.ManualOnly
        };
        _db.Badges.Add(badge);
        await _db.SaveChangesAsync();

        return ServiceResult<BadgeDto>.Success(
            new BadgeDto(badge.Id, badge.Code, badge.Title, badge.Description, badge.IconUrl,
                badge.Category.ToString(), badge.Tier, badge.Requirement, badge.ManualOnly, null));
    }
}
