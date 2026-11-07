using System.Text.RegularExpressions;

namespace GraffyApi.Validation;

public static class NicknameValidator
{
    private static readonly Regex LowercaseLatin = new("^[a-z]+$", RegexOptions.Compiled);

    public static string? Validate(string? nickname)
    {
        if (string.IsNullOrWhiteSpace(nickname))
            return "Никнейм обязателен";
        if (nickname.Length < 5)
            return "Никнейм должен содержать не менее 5 символов";
        if (nickname.Length > 20)
            return "Никнейм должен содержать не более 20 символов";
        if (!LowercaseLatin.IsMatch(nickname))
            return "Никнейм может содержать только маленькие латинские буквы";
        return null;
    }
}
