using System.Security.Claims;
using GraffyApi.Contracts;
using GraffyApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GraffyApi.Controllers;

[Authorize]
[ApiController]
[Route("api/graph")]
[Produces("application/json")]
public class GraphController : ControllerBase
{
    private readonly IGraphService _graph;

    public GraphController(IGraphService graph) => _graph = graph;

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>Граф активности текущего пользователя (узлы: user → месяцы → дни → задачи/привычки)</summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(GraphResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyGraph() =>
        Ok(await _graph.GetPersonalGraphAsync(UserId));

    /// <summary>Граф всех пользователей (узлы: user)</summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(GraphResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUsersGraph() =>
        Ok(await _graph.GetUsersGraphAsync());
}
