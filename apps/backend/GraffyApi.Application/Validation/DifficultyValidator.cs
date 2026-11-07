using GraffyApi.Domain;
using GraffyApi.Services;

namespace GraffyApi.Validation;

public static class DifficultyValidator
{
    public static string? Validate(string value, out Difficulty difficulty) =>
        XpCalculator.TryParseDifficulty(value, out difficulty) ? null : "Недопустимая сложность";
}
