using System.Security.Claims;
using GraffyApi.Contracts;
using GraffyApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GraffyApi.Controllers;

[Authorize]
[ApiController]
[Route("api/clans")]
[Produces("application/json")]
public class ClansController : ControllerBase
{
    private readonly IClanService _clans;

    public ClansController(IClanService clans) => _clans = clans;

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>Создать клан</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ClanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateClanRequest request)
    {
        var result = await _clans.CreateAsync(UserId, request);
        if (!result.IsSuccess) return BadRequest(new ErrorResponse(result.Error!));
        return Ok(result.Data);
    }

    /// <summary>Клан текущего пользователя (или 404 если не состоит)</summary>
    [HttpGet("my")]
    [ProducesResponseType(typeof(ClanDetailsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> My()
    {
        var clan = await _clans.GetMyClanAsync(UserId);
        return clan == null ? NotFound() : Ok(clan);
    }

    /// <summary>Получить клан по id (только для участников)</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ClanDetailsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(Guid id)
    {
        var result = await _clans.GetByIdAsync(id, UserId);
        if (result.IsNotFound) return NotFound();
        if (!result.IsSuccess) return StatusCode(403, new ErrorResponse(result.Error!));
        return Ok(result.Data);
    }

    /// <summary>Получить токен приглашения (только лидер)</summary>
    [HttpGet("{id:guid}/invite")]
    [ProducesResponseType(typeof(InviteDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetInvite(Guid id)
    {
        var result = await _clans.GetInviteAsync(UserId, id);
        if (result.IsNotFound) return NotFound();
        if (!result.IsSuccess) return StatusCode(403, new ErrorResponse(result.Error!));
        return Ok(result.Data);
    }

    /// <summary>Перегенерировать токен приглашения (только лидер)</summary>
    [HttpPost("{id:guid}/invite/regenerate")]
    [ProducesResponseType(typeof(InviteDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RegenerateInvite(Guid id)
    {
        var result = await _clans.RegenerateInviteAsync(UserId, id);
        if (result.IsNotFound) return NotFound();
        if (!result.IsSuccess) return StatusCode(403, new ErrorResponse(result.Error!));
        return Ok(result.Data);
    }

    /// <summary>Превью приглашения по токену (имя клана, число участников)</summary>
    [HttpGet("invites/{token}")]
    [ProducesResponseType(typeof(InvitePreviewDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetInvitePreview(string token)
    {
        var result = await _clans.GetInvitePreviewAsync(token);
        if (result.IsNotFound) return NotFound();
        return Ok(result.Data);
    }

    /// <summary>Принять приглашение по токену</summary>
    [HttpPost("invites/{token}/accept")]
    [ProducesResponseType(typeof(ClanDetailsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AcceptInvite(string token)
    {
        var result = await _clans.AcceptInviteAsync(UserId, token);
        if (result.IsNotFound) return NotFound();
        if (!result.IsSuccess) return BadRequest(new ErrorResponse(result.Error!));
        return Ok(result.Data);
    }

    /// <summary>Удалить участника клана (только лидер)</summary>
    [HttpDelete("{id:guid}/members/{userId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> KickMember(Guid id, Guid userId)
    {
        var result = await _clans.KickMemberAsync(UserId, id, userId);
        if (result.IsNotFound) return NotFound();
        if (!result.IsSuccess) return StatusCode(403, new ErrorResponse(result.Error!));
        return NoContent();
    }

    /// <summary>Передать лидерство (только текущий лидер)</summary>
    [HttpPost("{id:guid}/transfer/{userId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Transfer(Guid id, Guid userId)
    {
        var result = await _clans.TransferLeadershipAsync(UserId, id, userId);
        if (result.IsNotFound) return NotFound();
        if (!result.IsSuccess) return BadRequest(new ErrorResponse(result.Error!));
        return NoContent();
    }

    /// <summary>Выйти из клана (лидер должен сначала передать лидерство)</summary>
    [HttpPost("{id:guid}/leave")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Leave(Guid id)
    {
        var result = await _clans.LeaveAsync(UserId, id);
        if (result.IsNotFound) return NotFound();
        if (!result.IsSuccess) return BadRequest(new ErrorResponse(result.Error!));
        return NoContent();
    }

    /// <summary>Удалить клан (только лидер)</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _clans.DeleteAsync(UserId, id);
        if (result.IsNotFound) return NotFound();
        if (!result.IsSuccess) return StatusCode(403, new ErrorResponse(result.Error!));
        return NoContent();
    }
}
