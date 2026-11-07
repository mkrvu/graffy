using System.Security.Claims;
using GraffyApi.Contracts;
using GraffyApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GraffyApi.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin")]
[Produces("application/json")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _admin;
    private readonly IClanService _clans;

    public AdminController(IAdminService admin, IClanService clans)
    {
        _admin = admin;
        _clans = clans;
    }

    private Guid AdminId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>Общая статистика приложения</summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(AdminStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats() =>
        Ok(await _admin.GetStatsAsync());

    /// <summary>Список всех пользователей</summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(List<AdminUserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUsers() =>
        Ok(await _admin.GetUsersAsync());

    /// <summary>Изменить никнейм пользователя</summary>
    [HttpPut("users/{id:guid}/nickname")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateNickname(Guid id, [FromBody] UpdateNicknameRequest request)
    {
        var result = await _admin.UpdateNicknameAsync(id, request.Nickname);
        if (result.IsNotFound) return NotFound();
        if (!result.IsSuccess) return BadRequest(new ErrorResponse(result.Error!));
        return NoContent();
    }

    /// <summary>Выдать бейдж пользователю</summary>
    [HttpPost("users/{id:guid}/badges")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> IssueBadge(Guid id, [FromBody] IssueBadgeRequest request)
    {
        var result = await _admin.IssueBadgeAsync(id, request.BadgeId, AdminId);
        if (result.IsNotFound) return NotFound();
        if (!result.IsSuccess) return BadRequest(new ErrorResponse(result.Error!));
        return NoContent();
    }

    /// <summary>Список всех бейджей</summary>
    [HttpGet("badges")]
    [ProducesResponseType(typeof(List<BadgeDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBadges() =>
        Ok(await _admin.GetBadgesAsync());

    /// <summary>Создать бейдж</summary>
    [HttpPost("badges")]
    [ProducesResponseType(typeof(BadgeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateBadge([FromBody] CreateBadgeRequest request)
    {
        var result = await _admin.CreateBadgeAsync(request);
        if (!result.IsSuccess) return BadRequest(new ErrorResponse(result.Error!));
        return Ok(result.Data);
    }

    /// <summary>Список всех кланов</summary>
    [HttpGet("clans")]
    [ProducesResponseType(typeof(List<AdminClanDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetClans() => Ok(await _clans.AdminListAsync());

    /// <summary>Детали клана</summary>
    [HttpGet("clans/{id:guid}")]
    [ProducesResponseType(typeof(ClanDetailsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetClan(Guid id)
    {
        var clan = await _clans.AdminGetByIdAsync(id);
        return clan == null ? NotFound() : Ok(clan);
    }

    /// <summary>Изменить название или цвет клана</summary>
    [HttpPut("clans/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateClan(Guid id, [FromBody] UpdateClanRequest request)
    {
        var result = await _clans.AdminUpdateAsync(id, request);
        if (result.IsNotFound) return NotFound();
        if (!result.IsSuccess) return BadRequest(new ErrorResponse(result.Error!));
        return NoContent();
    }

    /// <summary>Удалить клан</summary>
    [HttpDelete("clans/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteClan(Guid id)
    {
        var result = await _clans.AdminDeleteAsync(id);
        if (result.IsNotFound) return NotFound();
        return NoContent();
    }
}
