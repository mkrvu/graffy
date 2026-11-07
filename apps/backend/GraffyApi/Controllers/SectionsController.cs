using System.Security.Claims;
using GraffyApi.Contracts;
using GraffyApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GraffyApi.Controllers;

[Authorize]
[ApiController]
[Route("api/sections")]
[Produces("application/json")]
public class SectionsController : ControllerBase
{
    private readonly ISectionService _sections;

    public SectionsController(ISectionService sections) => _sections = sections;

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>Получить все разделы текущего пользователя</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<TaskSectionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll() =>
        Ok(await _sections.GetSectionsAsync(UserId));

    /// <summary>Создать раздел</summary>
    [HttpPost]
    [ProducesResponseType(typeof(TaskSectionDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateSectionRequest request)
    {
        var section = await _sections.CreateAsync(request, UserId);
        return CreatedAtAction(nameof(GetAll), section);
    }

    /// <summary>Переименовать раздел</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(TaskSectionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSectionRequest request)
    {
        var result = await _sections.UpdateAsync(id, request, UserId);
        if (result.IsNotFound) return NotFound();
        return Ok(result.Data);
    }

    /// <summary>Удалить раздел (задачи в нём становятся без раздела)</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _sections.DeleteAsync(id, UserId);
        return deleted ? NoContent() : NotFound();
    }
}
