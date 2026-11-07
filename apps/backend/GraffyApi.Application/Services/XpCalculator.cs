using GraffyApi.Domain;

namespace GraffyApi.Services;

public static class XpCalculator
{
    public static int GetXpReward(Difficulty difficulty) => difficulty switch
    {
        Difficulty.Trivial => 5,
        Difficulty.Easy    => 10,
        Difficulty.Medium  => 25,
        Difficulty.Hard    => 50,
        _ => 0
    };

    public static bool TryParseDifficulty(string value, out Difficulty result) =>
        Enum.TryParse(value, ignoreCase: true, out result);
}
