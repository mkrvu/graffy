using System.Security.Claims;
using GraffyApi.Contracts;
using GraffyApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GraffyApi.Controllers;

[Authorize]
[ApiController]
[Route("api/habits")]
[Produces("application/json")]
public class HabitsController : ControllerBase
{
    private readonly IHabitService _habits;

    public HabitsController(IHabitService habits) => _habits = habits;

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>Получить все привычки текущего пользователя</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<HabitDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll() =>
        Ok(await _habits.GetHabitsAsync(UserId));

    /// <summary>Получить привычку по ID</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(HabitDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var habit = await _habits.GetByIdAsync(id, UserId);
        return habit == null ? NotFound() : Ok(habit);
    }

    /// <summary>Создать привычку. Требует SphereId. Difficulty: Trivial | Easy | Medium | Hard</summary>
    [HttpPost]
    [ProducesResponseType(typeof(HabitDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateHabitRequest request)
    {
        var result = await _habits.CreateAsync(request, UserId);
        if (!result.IsSuccess) return BadRequest(new ErrorResponse(result.Error!));
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    /// <summary>Обновить привычку. Difficulty: Trivial | Easy | Medium | Hard</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(HabitDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateHabitRequest request)
    {
        var result = await _habits.UpdateAsync(id, request, UserId);
        if (result.IsNotFound) return NotFound();
        if (!result.IsSuccess) return BadRequest(new ErrorResponse(result.Error!));
        return Ok(result.Data);
    }

    /// <summary>Отметить привычку выполненной сегодня. Начисляет XP пользователю</summary>
    [HttpPost("{id:guid}/complete")]
    [ProducesResponseType(typeof(HabitDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Complete(Guid id)
    {
        var result = await _habits.CompleteAsync(id, UserId);
        if (result.IsNotFound) return NotFound();
        if (!result.IsSuccess) return BadRequest(new ErrorResponse(result.Error!));
        return Ok(result.Data);
    }

    /// <summary>Снять отметку выполнения за сегодня. Возвращает списанный XP</summary>
    [HttpDelete("{id:guid}/complete")]
    [ProducesResponseType(typeof(HabitDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Uncomplete(Guid id)
    {
        var result = await _habits.UncompleteAsync(id, UserId);
        if (result.IsNotFound) return NotFound();
        if (!result.IsSuccess) return BadRequest(new ErrorResponse(result.Error!));
        return Ok(result.Data);
    }

    /// <summary>Удалить привычку</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _habits.DeleteAsync(id, UserId);
        return deleted ? NoContent() : NotFound();
    }
}
