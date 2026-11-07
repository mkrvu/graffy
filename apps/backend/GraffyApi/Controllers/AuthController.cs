using System.Security.Claims;
using GraffyApi.Contracts;
using GraffyApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GraffyApi.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    /// <summary>Зарегистрировать нового пользователя</summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _auth.RegisterAsync(request);
        if (!result.IsSuccess) return BadRequest(new ErrorResponse(result.Error!));
        return Ok(result.Data);
    }

    /// <summary>Войти в аккаунт</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _auth.LoginAsync(request);
        if (!result.IsSuccess) return Unauthorized(new ErrorResponse(result.Error!));
        return Ok(result.Data);
    }

    /// <summary>Обновить access-токен по refresh-токену</summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
    {
        var result = await _auth.RefreshAsync(request.RefreshToken);
        if (!result.IsSuccess) return Unauthorized(new ErrorResponse(result.Error!));
        return Ok(result.Data);
    }

    /// <summary>Выйти из аккаунта (инвалидировать refresh-токен)</summary>
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout([FromBody] RefreshRequest request)
    {
        await _auth.LogoutAsync(request.RefreshToken);
        return NoContent();
    }

    /// <summary>Получить текущего авторизованного пользователя</summary>
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Me()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _auth.GetCurrentUserAsync(userId);
        if (user == null) return NotFound();
        return Ok(user);
    }
}
