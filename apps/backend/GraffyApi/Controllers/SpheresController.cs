using System.Security.Claims;
using GraffyApi.Contracts;
using GraffyApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GraffyApi.Controllers;

[Authorize]
[ApiController]
[Route("api/spheres")]
[Produces("application/json")]
public class SpheresController : ControllerBase
{
    private readonly ISphereService _spheres;

    public SpheresController(ISphereService spheres) => _spheres = spheres;

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>Получить все сферы текущего пользователя с количеством привычек</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<SphereDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll() =>
        Ok(await _spheres.GetSpheresAsync(UserId));

    /// <summary>Создать сферу</summary>
    [HttpPost]
    [ProducesResponseType(typeof(SphereDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateSphereRequest request)
    {
        var result = await _spheres.CreateAsync(request, UserId);
        if (!result.IsSuccess) return BadRequest(new ErrorResponse(result.Error!));
        return Ok(result.Data);
    }

    /// <summary>Удалить сферу. Нельзя удалить если есть привычки</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _spheres.DeleteAsync(id, UserId);
        if (result.IsNotFound) return NotFound();
        if (!result.IsSuccess) return BadRequest(new ErrorResponse(result.Error!));
        return NoContent();
    }
}
