using System.Security.Claims;
using GraffyApi.Contracts;
using GraffyApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GraffyApi.Controllers;

[ApiController]
[Route("api")]
[Produces("application/json")]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profile;

    public ProfileController(IProfileService profile) => _profile = profile;

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>Метрики профиля: всего выполнено задач/привычек, текущий стрик (task|habit), всего полученных бейджей</summary>
    [Authorize]
    [HttpGet("profile/stats")]
    [ProducesResponseType(typeof(ProfileStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats() => Ok(await _profile.GetStatsAsync(UserId));

    /// <summary>Получить профиль текущего пользователя</summary>
    [Authorize]
    [HttpGet("profile/me")]
    [ProducesResponseType(typeof(ProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMyProfile()
    {
        var profile = await _profile.GetMyProfileAsync(UserId);
        return profile == null ? NotFound() : Ok(profile);
    }

    /// <summary>Загрузить аватар. Формат: multipart/form-data, поле file. Макс. 5 MB, JPEG/PNG/WebP</summary>
    [Authorize]
    [HttpPost("profile/me/avatar")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    [ProducesResponseType(typeof(AvatarUploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        var result = await _profile.UploadAvatarAsync(UserId, file.OpenReadStream(), file.Length);
        if (result.IsNotFound) return NotFound();
        if (!result.IsSuccess) return BadRequest(new ErrorResponse(result.Error!));
        return Ok(new AvatarUploadResponse(result.Data!));
    }

    /// <summary>Обновить профиль текущего пользователя</summary>
    [Authorize]
    [HttpPut("profile/me")]
    [ProducesResponseType(typeof(ProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileRequest request)
    {
        var result = await _profile.UpdateProfileAsync(UserId, request);
        if (result.IsNotFound) return NotFound();
        if (!result.IsSuccess) return BadRequest(new ErrorResponse(result.Error!));
        return Ok(result.Data);
    }

    /// <summary>Получить публичный профиль пользователя по ID</summary>
    [HttpGet("users/{id:guid}/public-profile")]
    [ProducesResponseType(typeof(PublicProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPublicProfile(Guid id)
    {
        var profile = await _profile.GetPublicProfileAsync(id);
        return profile == null ? NotFound() : Ok(profile);
    }
}
