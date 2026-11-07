using System.Security.Claims;
using GraffyApi.Contracts;
using GraffyApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GraffyApi.Controllers;

[Authorize]
[ApiController]
[Route("api/notifications")]
[Produces("application/json")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notifications;

    public NotificationsController(INotificationService notifications) => _notifications = notifications;

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>Забрать накопившиеся уведомления и пометить их доставленными</summary>
    [HttpGet("pending")]
    [ProducesResponseType(typeof(List<NotificationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPending() => Ok(await _notifications.ConsumePendingAsync(UserId));
}
