using GraffyApi.Domain;
using GraffyApi.Services;
using Microsoft.EntityFrameworkCore;

namespace GraffyApi.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext db, IConfiguration config, IBadgeAwardService badges)
    {
        var adminEmail = config["ADMIN_EMAIL"];
        var adminPassword = config["ADMIN_PASSWORD"];

        User? admin = null;

        if (!string.IsNullOrEmpty(adminEmail) && !string.IsNullOrEmpty(adminPassword))
        {
            admin = await db.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);
            if (admin == null)
            {
                admin = new User
                {
                    Id = Guid.NewGuid(),
                    Email = adminEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                    Nickname = "admin",
                    GraphColor = "#6366f1",
                    Role = UserRole.Admin,
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow
                };
                db.Users.Add(admin);
            }
        }

        await SeedBadgesAsync(db, config);

        await db.SaveChangesAsync();

        if (admin != null)
        {
            await SeedHabitsAsync(db, admin.Id);
            await SeedTestActivityAsync(db, admin, badges);
        }
    }

    // Наполняем тестовый админский аккаунт активностью: ~200 выполненных задач за последние
    // 90 дней (по 1 на каждый день — для стрика DISCIPLINE T3 + дополнительные сверху),
    // и ежедневные привычки за последние 60 дней. После — выдаём ручные бейджи и зовём
    // авто-выдачу: админ получит почти весь каталог из коробки.
    private static async Task SeedTestActivityAsync(AppDbContext db, User admin, IBadgeAwardService badges)
    {
        if (await db.Tasks.AnyAsync(t => t.UserId == admin.Id)) return; // уже наполняли — выходим.

        var now = DateTime.UtcNow;
        var rng = new Random(42); // фиксированный сид — стабильные данные между запусками.
        var difficulties = new[] { Difficulty.Trivial, Difficulty.Easy, Difficulty.Medium, Difficulty.Hard };

        int xpAccumulated = 0;
        var tasks = new List<TaskItem>();

        // Покрытие 90 дней подряд: минимум 1 задача в каждый день — это даст стрик 90.
        for (int day = 0; day < 90; day++)
        {
            var d = difficulties[rng.Next(difficulties.Length)];
            var xp = XpCalculator.GetXpReward(d);
            var completedAt = DateTime.SpecifyKind(
                now.AddDays(-day).Date.AddHours(rng.Next(8, 22)).AddMinutes(rng.Next(60)),
                DateTimeKind.Utc);
            tasks.Add(MakeTask(admin.Id, d, xp, completedAt));
            xpAccumulated += xp;
        }
        // Дополнительный объём — чтобы пробить TASK_MASTER T1 (50) с запасом.
        for (int i = 0; i < 120; i++)
        {
            var d = difficulties[rng.Next(difficulties.Length)];
            var xp = XpCalculator.GetXpReward(d);
            var completedAt = DateTime.SpecifyKind(
                now.AddDays(-rng.Next(0, 90)).Date.AddHours(rng.Next(24)).AddMinutes(rng.Next(60)),
                DateTimeKind.Utc);
            tasks.Add(MakeTask(admin.Id, d, xp, completedAt));
            xpAccumulated += xp;
        }
        db.Tasks.AddRange(tasks);

        // Привычки: ежедневные — по выполнению на каждый из последних 60 дней (кроме «сегодня»,
        // он уже отмечен в SeedHabitsAsync, чтобы не нарушить уникальность).
        var dailyHabits = await db.Habits
            .Where(h => h.UserId == admin.Id && h.Frequency == HabitFrequency.Daily)
            .ToListAsync();
        foreach (var habit in dailyHabits)
        {
            for (int day = 1; day <= 60; day++)
            {
                var ca = DateTime.SpecifyKind(now.AddDays(-day).Date.AddHours(9), DateTimeKind.Utc);
                db.HabitCompletions.Add(new HabitCompletion
                {
                    Id = Guid.NewGuid(),
                    HabitId = habit.Id,
                    UserId = admin.Id,
                    CompletedAt = ca,
                    XpReward = habit.XpReward
                });
                xpAccumulated += habit.XpReward;
            }
        }

        admin.Xp += xpAccumulated;
        await db.SaveChangesAsync();

        // Ручные бейджи (Pioneer + Social) — админ-тестировщик «всё видел».
        var manual = await db.Badges.Where(b => b.ManualOnly).ToListAsync();
        var owned = await db.UserBadges.Where(ub => ub.UserId == admin.Id).Select(ub => ub.BadgeId).ToListAsync();
        var ownedSet = owned.ToHashSet();
        foreach (var b in manual.Where(b => !ownedSet.Contains(b.Id)))
        {
            db.UserBadges.Add(new UserBadge
            {
                Id = Guid.NewGuid(),
                UserId = admin.Id,
                BadgeId = b.Id,
                IssuedAt = now,
                IssuedByAdminId = admin.Id
            });
        }
        await db.SaveChangesAsync();

        // Авто-выдача по метрикам: TASK_MASTER, XP_HUNTER, UNSTOPPABLE, DISCIPLINE, TERMINATOR.
        await badges.EvaluateAsync(admin.Id);
    }

    private static TaskItem MakeTask(Guid userId, Difficulty d, int xp, DateTime completedAt) => new()
    {
        Id = Guid.NewGuid(),
        UserId = userId,
        Title = $"Тестовая задача · {d}",
        Difficulty = d,
        XpReward = xp,
        IsCompleted = true,
        CompletedAt = completedAt,
        CreatedAt = completedAt.AddHours(-1)
    };

    // Каталог бейджей. Список и пороги — из дизайна в Figma. Идемпотентно по Code.
    // PNG-файлы лежат в `apps/backend/GraffyApi/wwwroot/badges/` и раздаются через UseStaticFiles.
    // URL собирается на основе STATIC_BASE_URL (как у аватаров) — клиент получает полный путь.
    private static async Task SeedBadgesAsync(AppDbContext db, IConfiguration config)
    {
        var baseUrl = (config["STATIC_BASE_URL"] ?? string.Empty).TrimEnd('/');
        string Icon(string code) => $"{baseUrl}/badges/{code}.png";

        var catalog = new (string Code, string Title, string Desc, BadgeCategory Cat, int Tier, int Req, bool Manual, string Icon)[]
        {
            // TASK_MASTER — выполнить N задач любого типа
            ("task_master_t1", "Мастер задач",  "Выполнить 50 задач любого типа",   BadgeCategory.TaskMaster,   1,    50, false, Icon("task_master_t1")),
            ("task_master_t2", "Мастер задач",  "Выполнить 500 задач любого типа",  BadgeCategory.TaskMaster,   2,   500, false, Icon("task_master_t2")),
            ("task_master_t3", "Мастер задач",  "Выполнить 1000 задач любого типа", BadgeCategory.TaskMaster,   3,  1000, false, Icon("task_master_t3")),

            // TERMINATOR — заработать XP за месяц
            ("terminator_t1",  "Терминатор",    "Заработать +1000 XP за месяц",     BadgeCategory.Terminator,   1,  1000, false, Icon("terminator_t1")),
            ("terminator_t2",  "Терминатор",    "Заработать +2000 XP за месяц",     BadgeCategory.Terminator,   2,  2000, false, Icon("terminator_t2")),
            ("terminator_t3",  "Терминатор",    "Заработать +5000 XP за месяц",     BadgeCategory.Terminator,   3,  5000, false, Icon("terminator_t3")),

            // XP_HUNTER — суммарно накопить XP
            ("xp_hunter_t1",   "XP-Охотник",    "Накопить 3000 XP",                 BadgeCategory.XpHunter,     1,  3000, false, Icon("xp_hunter_t1")),
            ("xp_hunter_t2",   "XP-Охотник",    "Накопить 10 000 XP",               BadgeCategory.XpHunter,     2, 10000, false, Icon("xp_hunter_t2")),
            ("xp_hunter_t3",   "XP-Охотник",    "Накопить 30 000 XP",               BadgeCategory.XpHunter,     3, 30000, false, Icon("xp_hunter_t3")),

            // DISCIPLINE — стрик дней с минимум 1 выполненной задачей
            ("discipline_t1",  "Дисциплина",    "Серия 7 дней — минимум 1 задача/привычка в день",   BadgeCategory.Discipline,  1,  7, false, Icon("discipline_t1")),
            ("discipline_t2",  "Дисциплина",    "Серия 30 дней — минимум 1 задача/привычка в день",  BadgeCategory.Discipline,  2, 30, false, Icon("discipline_t2")),
            ("discipline_t3",  "Дисциплина",    "Серия 90 дней — минимум 1 задача/привычка в день",  BadgeCategory.Discipline,  3, 90, false, Icon("discipline_t3")),

            // UNSTOPPABLE — достичь уровня
            ("unstoppable_t1", "Напролом",      "Достичь 1-го уровня",              BadgeCategory.Unstoppable,  1,  1, false, Icon("unstoppable_t1")),
            ("unstoppable_t2", "Напролом",      "Достичь 7-го уровня",              BadgeCategory.Unstoppable,  2,  7, false, Icon("unstoppable_t2")),
            ("unstoppable_t3", "Напролом",      "Достичь 10-го уровня",             BadgeCategory.Unstoppable,  3, 10, false, Icon("unstoppable_t3")),

            // PIONEER — без логики, только наличие (выдаётся вручную админом)
            ("pioneer",        "Первооткрыватель", "Особый бейдж для тестировщиков", BadgeCategory.Pioneer,    1,  0, true,  Icon("pioneer")),

            // SOCIAL — рефералы (логики автовыдачи пока нет — соц-фич нет)
            ("social_t1",      "Душа компании", "Пригласить 1 пользователя",        BadgeCategory.Social,       1,  1, true,  Icon("social_t1")),
            ("social_t2",      "Душа компании", "Пригласить 3 пользователей",       BadgeCategory.Social,       2,  3, true,  Icon("social_t2")),
            ("social_t3",      "Душа компании", "Пригласить 10 пользователей",      BadgeCategory.Social,       3, 10, true,  Icon("social_t3")),
        };

        var existing = await db.Badges.ToDictionaryAsync(b => b.Code);
        foreach (var (code, title, desc, cat, tier, req, manual, icon) in catalog)
        {
            if (existing.TryGetValue(code, out var b))
            {
                // Каталог — источник истины: подтягиваем актуальные значения у уже существующих.
                b.Title = title;
                b.Description = desc;
                b.IconUrl = icon;
                b.Category = cat;
                b.Tier = tier;
                b.Requirement = req;
                b.ManualOnly = manual;
            }
            else
            {
                db.Badges.Add(new Badge
                {
                    Id = Guid.NewGuid(),
                    Code = code,
                    Title = title,
                    Description = desc,
                    IconUrl = icon,
                    Category = cat,
                    Tier = tier,
                    Requirement = req,
                    ManualOnly = manual
                });
            }
        }
        await db.SaveChangesAsync();
    }

    // Тестовые сферы и привычки для админа — чтобы список был не пустым из коробки.
    private static async Task SeedHabitsAsync(AppDbContext db, Guid userId)
    {
        var hasSpheres = await db.Spheres.AnyAsync(s => s.UserId == userId);
        if (hasSpheres) return;

        var now = DateTime.UtcNow;

        var sport = new Sphere { Id = Guid.NewGuid(), UserId = userId, Name = "Спорт", Emoji = "1f3c3", CreatedAt = now };
        var study = new Sphere { Id = Guid.NewGuid(), UserId = userId, Name = "Учёба", Emoji = "1f4da", CreatedAt = now };
        var work = new Sphere { Id = Guid.NewGuid(), UserId = userId, Name = "Работа", Emoji = "1f4bc", CreatedAt = now };
        var hobby = new Sphere { Id = Guid.NewGuid(), UserId = userId, Name = "Хобби", Emoji = "1f3a8", CreatedAt = now };
        db.Spheres.AddRange(sport, study, work, hobby);

        var habits = new[]
        {
            NewHabit(userId, sport.Id, "Пробежка", "Утренняя пробежка в парке", Difficulty.Medium,
                "1f3c3", HabitFrequency.Daily, 5, "км", now),
            NewHabit(userId, study.Id, "Читать книгу", "30 минут чтения", Difficulty.Easy,
                "1f4d6", HabitFrequency.Daily, 30, "мин", now),
            NewHabit(userId, work.Id, "Разбор задач", "Планирование дня с утра", Difficulty.Trivial,
                "2705", HabitFrequency.Daily, null, null, now),
            NewHabit(userId, hobby.Id, "Рисование", "Скетч на выходных", Difficulty.Hard,
                "1f58c", HabitFrequency.Weekly, 1, "скетч", now),
        };
        db.Habits.AddRange(habits);

        await db.SaveChangesAsync();

        // Отметим одну привычку выполненной сегодня — чтобы в списке был виден завершённый день.
        var first = habits[0];
        db.HabitCompletions.Add(new HabitCompletion
        {
            Id = Guid.NewGuid(),
            HabitId = first.Id,
            UserId = userId,
            CompletedAt = now,
            XpReward = first.XpReward
        });

        var user = await db.Users.FindAsync(userId);
        if (user != null) user.Xp += first.XpReward;

        await db.SaveChangesAsync();
    }

    private static Habit NewHabit(
        Guid userId, Guid sphereId, string title, string description, Difficulty difficulty,
        string emoji, HabitFrequency frequency, int? goalAmount, string? goalUnit, DateTime now) => new()
    {
        Id = Guid.NewGuid(),
        UserId = userId,
        SphereId = sphereId,
        Title = title,
        Description = description,
        Difficulty = difficulty,
        XpReward = XpCalculator.GetXpReward(difficulty),
        Emoji = emoji,
        Frequency = frequency,
        GoalAmount = goalAmount,
        GoalUnit = goalUnit,
        StartDate = now.Date,
        CreatedAt = now
    };
}
