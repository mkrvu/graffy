using System.Security.Claims;
using GraffyApi.Contracts;
using GraffyApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GraffyApi.Controllers;

[Authorize]
[ApiController]
[Route("api/tasks")]
[Produces("application/json")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _tasks;

    public TasksController(ITaskService tasks) => _tasks = tasks;

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>Получить страницу задач текущего пользователя (skip/take).
    /// Если в ответе вернулось меньше элементов, чем take — это конец списка.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<TaskDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int skip = 0, [FromQuery] int take = 30)
    {
        skip = Math.Max(0, skip);
        take = Math.Clamp(take, 1, 100);
        return Ok(await _tasks.GetTasksAsync(UserId, skip, take));
    }

    /// <summary>Получить задачу по ID</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var task = await _tasks.GetByIdAsync(id, UserId);
        return task == null ? NotFound() : Ok(task);
    }

    /// <summary>Создать задачу. Difficulty: Trivial | Easy | Medium | Hard</summary>
    [HttpPost]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateTaskRequest request)
    {
        var result = await _tasks.CreateAsync(request, UserId);
        if (!result.IsSuccess) return BadRequest(new ErrorResponse(result.Error!));
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    /// <summary>Обновить задачу. Difficulty: Trivial | Easy | Medium | Hard</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTaskRequest request)
    {
        var result = await _tasks.UpdateAsync(id, request, UserId);
        if (result.IsNotFound) return NotFound();
        if (!result.IsSuccess) return BadRequest(new ErrorResponse(result.Error!));
        return Ok(result.Data);
    }

    /// <summary>Отметить задачу выполненной. Начисляет XP пользователю</summary>
    [HttpPost("{id:guid}/complete")]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Complete(Guid id)
    {
        var result = await _tasks.CompleteAsync(id, UserId);
        if (result.IsNotFound) return NotFound();
        if (!result.IsSuccess) return BadRequest(new ErrorResponse(result.Error!));
        return Ok(result.Data);
    }

    /// <summary>Снять отметку выполнения задачи. Списывает XP</summary>
    [HttpDelete("{id:guid}/complete")]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Uncomplete(Guid id)
    {
        var result = await _tasks.UncompleteAsync(id, UserId);
        if (result.IsNotFound) return NotFound();
        if (!result.IsSuccess) return BadRequest(new ErrorResponse(result.Error!));
        return Ok(result.Data);
    }

    /// <summary>Удалить задачу</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _tasks.DeleteAsync(id, UserId);
        return deleted ? NoContent() : NotFound();
    }
}
