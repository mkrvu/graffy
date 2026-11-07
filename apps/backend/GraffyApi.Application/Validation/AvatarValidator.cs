namespace GraffyApi.Validation;

public static class AvatarValidator
{
    private const long MaxBytes = 5 * 1024 * 1024;

    public static string? Validate(long fileSize)
    {
        if (fileSize == 0) return "Файл пустой";
        if (fileSize > MaxBytes) return "Размер файла не должен превышать 5 МБ";
        return null;
    }
}
