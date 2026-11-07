namespace GraffyApi.Services;

// Логика уровней (источник: таблица уровней).
// Накопительный XP по уровням; прирост между уровнями растёт на 195 начиная с 3-го уровня.
public static class LevelCalculator
{
    public static readonly int[] Thresholds =
    {
        0,      // 0
        100,    // 1
        150,    // 2
        395,    // 3
        835,    // 4
        1470,   // 5
        2300,   // 6
        3325,   // 7
        4545,   // 8
        5960,   // 9
        7570,   // 10
        9375,   // 11
        11375,  // 12
        13570,  // 13
        15960,  // 14
        18545,  // 15
        21325,  // 16
        24300,  // 17
        27470,  // 18
        30835,  // 19
        34395,  // 20
    };

    public static int MaxLevel => Thresholds.Length - 1;

    public static int GetLevel(int xp)
    {
        for (var i = Thresholds.Length - 1; i >= 0; i--)
            if (xp >= Thresholds[i]) return i;
        return 0;
    }

    // Возвращает: уровень, XP внутри уровня, размах уровня, процент прогресса (0..100).
    public static (int Level, int XpInLevel, int XpForLevel, int ProgressPercent) GetProgress(int xp)
    {
        var level = GetLevel(xp);
        var currentLevelXp = Thresholds[level];
        var nextLevelXp = level >= MaxLevel ? Thresholds[^1] : Thresholds[level + 1];
        var span = nextLevelXp - currentLevelXp;
        var inLevel = xp - currentLevelXp;
        var percent = level >= MaxLevel
            ? 100
            : (span <= 0 ? 0 : (int)Math.Round(Math.Min(100.0, inLevel * 100.0 / span)));
        return (level, inLevel, span, percent);
    }
}
