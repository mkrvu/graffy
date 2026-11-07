namespace GraffyApi.Services;

public interface IAvatarStorage
{
    Task UploadAsync(string key, Stream data, string contentType);
}
