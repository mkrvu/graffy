namespace GraffyApi.Services;

public interface IEmailSender
{
    Task SendEmailConfirmationAsync(string email, string token);
    Task SendPasswordResetAsync(string email, string token);
}

// Stub — реальная отправка не подключена.
// Позже можно подключить SMTP через Яндекс.Почту:
//   host: smtp.yandex.ru, port: 465 (SSL) / 587 (TLS)
//   Credentials: app-password from Yandex account settings
// Или через MailKit/SmtpClient + IOptions<SmtpSettings>
public class StubEmailSender : IEmailSender
{
    private readonly ILogger<StubEmailSender> _logger;

    public StubEmailSender(ILogger<StubEmailSender> logger)
    {
        _logger = logger;
    }

    public Task SendEmailConfirmationAsync(string email, string token)
    {
        _logger.LogInformation("[STUB] Email confirmation for {Email}: token={Token}", email, token);
        return Task.CompletedTask;
    }

    public Task SendPasswordResetAsync(string email, string token)
    {
        _logger.LogInformation("[STUB] Password reset for {Email}: token={Token}", email, token);
        return Task.CompletedTask;
    }
}
