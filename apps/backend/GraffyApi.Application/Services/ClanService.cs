using System.Security.Cryptography;
using GraffyApi.Auth;
using GraffyApi.Common;
using GraffyApi.Contracts;
using GraffyApi.Data;
using GraffyApi.Domain;
using GraffyApi.Validation;
using Microsoft.EntityFrameworkCore;

namespace GraffyApi.Services;

public interface IClanService
{
    Task<ServiceResult<ClanDto>> CreateAsync(Guid userId, CreateClanRequest request);
    Task<ClanDetailsDto?> GetMyClanAsync(Guid userId);
    Task<ServiceResult<ClanDetailsDto>> GetByIdAsync(Guid clanId, Guid userId);
    Task<ServiceResult<InviteDto>> GetInviteAsync(Guid userId, Guid clanId);
    Task<ServiceResult<InviteDto>> RegenerateInviteAsync(Guid userId, Guid clanId);
    Task<ServiceResult<InvitePreviewDto>> GetInvitePreviewAsync(string token);
    Task<ServiceResult<ClanDetailsDto>> AcceptInviteAsync(Guid userId, string token);
    Task<ServiceResult> KickMemberAsync(Guid leaderId, Guid clanId, Guid memberUserId);
    Task<ServiceResult> TransferLeadershipAsync(Guid currentLeaderId, Guid clanId, Guid newLeaderId);
    Task<ServiceResult> LeaveAsync(Guid userId, Guid clanId);
    Task<ServiceResult> DeleteAsync(Guid userId, Guid clanId);

    // Admin
    Task<List<AdminClanDto>> AdminListAsync();
    Task<ClanDetailsDto?> AdminGetByIdAsync(Guid clanId);
    Task<ServiceResult> AdminUpdateAsync(Guid clanId, UpdateClanRequest request);
    Task<ServiceResult> AdminDeleteAsync(Guid clanId);
}

public class ClanService : IClanService
{
    public const int MemberLimit = 4;

    private static readonly HashSet<string> AllowedColors = new(StringComparer.OrdinalIgnoreCase)
    {
        "#9957FF", "#F23B54", "#48D5E8", "#FBCD63", "#FFA1FC"
    };

    private readonly AppDbContext _db;

    public ClanService(AppDbContext db) => _db = db;

    public async Task<ServiceResult<ClanDto>> CreateAsync(Guid userId, CreateClanRequest request)
    {
        var name = (request.Name ?? string.Empty).Trim();
        if (name.Length < 2 || name.Length > 40)
            return ServiceResult<ClanDto>.Failure("Название клана должно быть от 2 до 40 символов");

        var nickname = (request.Nickname ?? string.Empty).Trim().ToLowerInvariant();
        var nicknameError = NicknameValidator.Validate(nickname);
        if (nicknameError != null) return ServiceResult<ClanDto>.Failure(nicknameError);

        var color = (request.Color ?? string.Empty).Trim();
        if (!AllowedColors.Contains(color))
            return ServiceResult<ClanDto>.Failure("Недопустимый цвет клана");

        var alreadyInClan = await _db.ClanMembers.AnyAsync(m => m.UserId == userId);
        if (alreadyInClan)
            return ServiceResult<ClanDto>.Failure("Вы уже состоите в клане");

        if (await _db.Clans.AnyAsync(c => c.Nickname == nickname))
            return ServiceResult<ClanDto>.Failure("Ник клана уже занят");

        var clan = new Clan
        {
            Id = Guid.NewGuid(),
            Name = name,
            Nickname = nickname,
            Color = color,
            LeaderId = userId,
            InviteToken = await GenerateUniqueTokenAsync(),
            CreatedAt = DateTime.UtcNow,
        };
        _db.Clans.Add(clan);
        _db.ClanMembers.Add(new ClanMember
        {
            ClanId = clan.Id,
            UserId = userId,
            JoinedAt = DateTime.UtcNow,
        });
        await _db.SaveChangesAsync();

        return ServiceResult<ClanDto>.Success(new ClanDto(
            clan.Id, clan.Name, clan.Nickname, clan.Color, clan.LeaderId, clan.CreatedAt, 1));
    }

    public async Task<ClanDetailsDto?> GetMyClanAsync(Guid userId)
    {
        var membership = await _db.ClanMembers.AsNoTracking().FirstOrDefaultAsync(m => m.UserId == userId);
        if (membership == null) return null;
        return await BuildDetailsAsync(membership.ClanId);
    }

    public async Task<ServiceResult<ClanDetailsDto>> GetByIdAsync(Guid clanId, Guid userId)
    {
        var clan = await _db.Clans.AsNoTracking().FirstOrDefaultAsync(c => c.Id == clanId);
        if (clan == null) return ServiceResult<ClanDetailsDto>.NotFound();

        var isMember = await _db.ClanMembers.AnyAsync(m => m.ClanId == clanId && m.UserId == userId);
        if (!isMember) return ServiceResult<ClanDetailsDto>.Failure("Нет доступа к клану");

        var details = await BuildDetailsAsync(clanId);
        return details == null
            ? ServiceResult<ClanDetailsDto>.NotFound()
            : ServiceResult<ClanDetailsDto>.Success(details);
    }

    public async Task<ServiceResult<InviteDto>> GetInviteAsync(Guid userId, Guid clanId)
    {
        var clan = await _db.Clans.FirstOrDefaultAsync(c => c.Id == clanId);
        if (clan == null) return ServiceResult<InviteDto>.NotFound();
        var isMember = await _db.ClanMembers.AnyAsync(m => m.ClanId == clanId && m.UserId == userId);
        if (!isMember) return ServiceResult<InviteDto>.Failure("Нет доступа к приглашению");
        return ServiceResult<InviteDto>.Success(new InviteDto(clan.InviteToken));
    }

    public async Task<ServiceResult<InviteDto>> RegenerateInviteAsync(Guid userId, Guid clanId)
    {
        var clan = await _db.Clans.FirstOrDefaultAsync(c => c.Id == clanId);
        if (clan == null) return ServiceResult<InviteDto>.NotFound();
        if (clan.LeaderId != userId) return ServiceResult<InviteDto>.Failure("Только лидер может выдавать приглашения");

        clan.InviteToken = await GenerateUniqueTokenAsync();
        await _db.SaveChangesAsync();
        return ServiceResult<InviteDto>.Success(new InviteDto(clan.InviteToken));
    }

    public async Task<ServiceResult<InvitePreviewDto>> GetInvitePreviewAsync(string token)
    {
        var clan = await _db.Clans.AsNoTracking().FirstOrDefaultAsync(c => c.InviteToken == token);
        if (clan == null) return ServiceResult<InvitePreviewDto>.NotFound();
        var count = await _db.ClanMembers.CountAsync(m => m.ClanId == clan.Id);
        return ServiceResult<InvitePreviewDto>.Success(
            new InvitePreviewDto(clan.Id, clan.Name, clan.Nickname, clan.Color, count, MemberLimit));
    }

    public async Task<ServiceResult<ClanDetailsDto>> AcceptInviteAsync(Guid userId, string token)
    {
        var clan = await _db.Clans.FirstOrDefaultAsync(c => c.InviteToken == token);
        if (clan == null) return ServiceResult<ClanDetailsDto>.NotFound();

        var alreadyInSome = await _db.ClanMembers.AnyAsync(m => m.UserId == userId);
        if (alreadyInSome) return ServiceResult<ClanDetailsDto>.Failure("Вы уже состоите в клане");

        var count = await _db.ClanMembers.CountAsync(m => m.ClanId == clan.Id);
        if (count >= MemberLimit) return ServiceResult<ClanDetailsDto>.Failure("В клане уже максимум участников");

        _db.ClanMembers.Add(new ClanMember
        {
            ClanId = clan.Id,
            UserId = userId,
            JoinedAt = DateTime.UtcNow,
        });
        await _db.SaveChangesAsync();

        var details = await BuildDetailsAsync(clan.Id);
        return details == null
            ? ServiceResult<ClanDetailsDto>.NotFound()
            : ServiceResult<ClanDetailsDto>.Success(details);
    }

    public async Task<ServiceResult> KickMemberAsync(Guid leaderId, Guid clanId, Guid memberUserId)
    {
        var clan = await _db.Clans.FirstOrDefaultAsync(c => c.Id == clanId);
        if (clan == null) return ServiceResult.NotFound();
        if (clan.LeaderId != leaderId) return ServiceResult.Failure("Только лидер может удалять участников");
        if (memberUserId == leaderId) return ServiceResult.Failure("Лидер не может удалить сам себя — передайте лидерство");

        var member = await _db.ClanMembers.FirstOrDefaultAsync(m => m.ClanId == clanId && m.UserId == memberUserId);
        if (member == null) return ServiceResult.NotFound();

        _db.ClanMembers.Remove(member);
        await _db.SaveChangesAsync();
        return ServiceResult.Success();
    }

    public async Task<ServiceResult> TransferLeadershipAsync(Guid currentLeaderId, Guid clanId, Guid newLeaderId)
    {
        var clan = await _db.Clans.FirstOrDefaultAsync(c => c.Id == clanId);
        if (clan == null) return ServiceResult.NotFound();
        if (clan.LeaderId != currentLeaderId) return ServiceResult.Failure("Передавать лидерство может только лидер");
        if (currentLeaderId == newLeaderId) return ServiceResult.Failure("Вы уже лидер");

        var newLeaderIsMember = await _db.ClanMembers.AnyAsync(m => m.ClanId == clanId && m.UserId == newLeaderId);
        if (!newLeaderIsMember) return ServiceResult.Failure("Новый лидер должен быть участником клана");

        clan.LeaderId = newLeaderId;
        await _db.SaveChangesAsync();
        return ServiceResult.Success();
    }

    public async Task<ServiceResult> LeaveAsync(Guid userId, Guid clanId)
    {
        var clan = await _db.Clans.FirstOrDefaultAsync(c => c.Id == clanId);
        if (clan == null) return ServiceResult.NotFound();

        var member = await _db.ClanMembers.FirstOrDefaultAsync(m => m.ClanId == clanId && m.UserId == userId);
        if (member == null) return ServiceResult.NotFound();

        if (clan.LeaderId == userId)
        {
            var hasOthers = await _db.ClanMembers.AnyAsync(m => m.ClanId == clanId && m.UserId != userId);
            if (hasOthers)
                return ServiceResult.Failure("Передайте лидерство другому участнику перед выходом");

            _db.Clans.Remove(clan);
            await _db.SaveChangesAsync();
            return ServiceResult.Success();
        }

        _db.ClanMembers.Remove(member);
        await _db.SaveChangesAsync();
        return ServiceResult.Success();
    }

    public async Task<ServiceResult> DeleteAsync(Guid userId, Guid clanId)
    {
        var clan = await _db.Clans.FirstOrDefaultAsync(c => c.Id == clanId);
        if (clan == null) return ServiceResult.NotFound();
        if (clan.LeaderId != userId) return ServiceResult.Failure("Только лидер может удалить клан");

        _db.Clans.Remove(clan);
        await _db.SaveChangesAsync();
        return ServiceResult.Success();
    }

    public async Task<List<AdminClanDto>> AdminListAsync() =>
        await _db.Clans
            .AsNoTracking()
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new AdminClanDto(
                c.Id, c.Name, c.Nickname, c.Color, c.LeaderId, c.Leader.Nickname,
                c.Members.Count, c.CreatedAt))
            .ToListAsync();

    public async Task<ClanDetailsDto?> AdminGetByIdAsync(Guid clanId) => await BuildDetailsAsync(clanId);

    public async Task<ServiceResult> AdminUpdateAsync(Guid clanId, UpdateClanRequest request)
    {
        var clan = await _db.Clans.FirstOrDefaultAsync(c => c.Id == clanId);
        if (clan == null) return ServiceResult.NotFound();

        if (request.Name != null)
        {
            var name = request.Name.Trim();
            if (name.Length < 2 || name.Length > 40)
                return ServiceResult.Failure("Название клана должно быть от 2 до 40 символов");
            clan.Name = name;
        }

        if (request.Nickname != null)
        {
            var nickname = request.Nickname.Trim().ToLowerInvariant();
            var nicknameError = NicknameValidator.Validate(nickname);
            if (nicknameError != null) return ServiceResult.Failure(nicknameError);
            if (nickname != clan.Nickname && await _db.Clans.AnyAsync(c => c.Nickname == nickname))
                return ServiceResult.Failure("Ник клана уже занят");
            clan.Nickname = nickname;
        }

        if (request.Color != null)
        {
            var color = request.Color.Trim();
            if (!AllowedColors.Contains(color))
                return ServiceResult.Failure("Недопустимый цвет клана");
            clan.Color = color;
        }

        await _db.SaveChangesAsync();
        return ServiceResult.Success();
    }

    public async Task<ServiceResult> AdminDeleteAsync(Guid clanId)
    {
        var clan = await _db.Clans.FirstOrDefaultAsync(c => c.Id == clanId);
        if (clan == null) return ServiceResult.NotFound();
        _db.Clans.Remove(clan);
        await _db.SaveChangesAsync();
        return ServiceResult.Success();
    }

    private async Task<ClanDetailsDto?> BuildDetailsAsync(Guid clanId)
    {
        var clan = await _db.Clans.AsNoTracking().FirstOrDefaultAsync(c => c.Id == clanId);
        if (clan == null) return null;

        var members = await _db.ClanMembers
            .AsNoTracking()
            .Where(m => m.ClanId == clanId)
            .OrderBy(m => m.JoinedAt)
            .Select(m => new
            {
                m.UserId,
                m.User.Nickname,
                m.User.AvatarUrl,
                m.User.City,
                m.User.Xp,
                m.JoinedAt,
            })
            .ToListAsync();

        var memberDtos = members.Select(m =>
        {
            var (level, _, _, _) = LevelCalculator.GetProgress(m.Xp);
            return new ClanMemberDto(
                m.UserId, m.Nickname, m.AvatarUrl, m.City,
                m.Xp, level, m.UserId == clan.LeaderId, m.JoinedAt);
        }).ToList();

        var userIds = members.Select(m => m.UserId).ToList();
        var totalXp = members.Sum(m => m.Xp);
        var totalCompletedTasks = await _db.Tasks
            .AsNoTracking()
            .CountAsync(t => userIds.Contains(t.UserId) && t.IsCompleted);
        var totalCompletedHabits = await _db.HabitCompletions
            .AsNoTracking()
            .CountAsync(hc => userIds.Contains(hc.UserId));

        var weekAgo = DateTime.UtcNow.AddDays(-7);
        var activeFromTasks = await _db.Tasks
            .AsNoTracking()
            .Where(t => userIds.Contains(t.UserId) && t.IsCompleted && t.CompletedAt >= weekAgo)
            .Select(t => t.UserId)
            .Distinct()
            .ToListAsync();
        var activeFromHabits = await _db.HabitCompletions
            .AsNoTracking()
            .Where(hc => userIds.Contains(hc.UserId) && hc.CompletedAt >= weekAgo)
            .Select(hc => hc.UserId)
            .Distinct()
            .ToListAsync();
        var activeMembers = activeFromTasks.Union(activeFromHabits).Count();

        var stats = new ClanStatsDto(totalXp, totalCompletedTasks, totalCompletedHabits, activeMembers);
        return new ClanDetailsDto(clan.Id, clan.Name, clan.Nickname, clan.Color, clan.LeaderId, clan.CreatedAt, memberDtos, stats);
    }

    private async Task<string> GenerateUniqueTokenAsync()
    {
        for (var i = 0; i < 5; i++)
        {
            var bytes = RandomNumberGenerator.GetBytes(32);
            var token = Convert.ToBase64String(bytes)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
            var exists = await _db.Clans.AnyAsync(c => c.InviteToken == token);
            if (!exists) return token;
        }
        throw new InvalidOperationException("Не удалось сгенерировать уникальный токен приглашения");
    }
}
