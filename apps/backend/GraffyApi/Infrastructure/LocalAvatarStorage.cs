using GraffyApi.Services;

namespace GraffyApi.Infrastructure;

// Stub — сохраняет файл локально в wwwroot/{key}.
// Для подключения CDN (S3, Cloudflare R2 и т.п.) реализуй IAvatarStorage
// и замени регистрацию в Program.cs.
public class LocalAvatarStorage : IAvatarStorage
{
    private readonly IWebHostEnvironment _env;

    public LocalAvatarStorage(IWebHostEnvironment env) => _env = env;

    public async Task UploadAsync(string key, Stream data, string contentType)
    {
        var webRoot = _env.WebRootPath
            ?? throw new InvalidOperationException("WebRootPath is not configured. Ensure wwwroot exists.");
        var path = Path.Combine(webRoot, key.Replace('/', Path.DirectorySeparatorChar));
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        await using var file = File.Create(path);
        await data.CopyToAsync(file);
    }
}
