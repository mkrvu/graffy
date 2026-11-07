using System.Security.Claims;
using GraffyApi.Contracts;
using GraffyApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GraffyApi.Controllers;

[Authorize]
[ApiController]
[Route("api/badges")]
[Produces("application/json")]
public class BadgesController : ControllerBase
{
    private readonly AppDbContext _db;

    public BadgesController(AppDbContext db) => _db = db;

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>Полный каталог бейджей с признаком получения текущим пользователем.
    /// IssuedAt = null означает «бейдж не получен».</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<BadgeDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var userId = UserId;
        var earned = await _db.UserBadges
            .AsNoTracking()
            .Where(ub => ub.UserId == userId)
            .ToDictionaryAsync(ub => ub.BadgeId, ub => (DateTime?)ub.IssuedAt);

        var catalog = await _db.Badges
            .AsNoTracking()
            .OrderBy(b => b.Category).ThenBy(b => b.Tier)
            .ToListAsync();

        var result = catalog.Select(b => new BadgeDto(
            b.Id, b.Code, b.Title, b.Description, b.IconUrl,
            b.Category.ToString(), b.Tier, b.Requirement, b.ManualOnly,
            earned.GetValueOrDefault(b.Id))).ToList();

        return Ok(result);
    }
}
