using GraffyApi.Domain;
using Microsoft.EntityFrameworkCore;

namespace GraffyApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<TaskSection> TaskSections => Set<TaskSection>();
    public DbSet<Sphere> Spheres => Set<Sphere>();
    public DbSet<Habit> Habits => Set<Habit>();
    public DbSet<HabitCompletion> HabitCompletions => Set<HabitCompletion>();
    public DbSet<Badge> Badges => Set<Badge>();
    public DbSet<UserBadge> UserBadges => Set<UserBadge>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Clan> Clans => Set<Clan>();
    public DbSet<ClanMember> ClanMembers => Set<ClanMember>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.HasIndex(u => u.Nickname).IsUnique();
            e.Property(u => u.Role).HasConversion<string>().HasMaxLength(16);
            e.Property(u => u.Email).HasMaxLength(254);
            e.Property(u => u.PasswordHash).HasMaxLength(72);
            e.Property(u => u.Nickname).HasMaxLength(20);
            e.Property(u => u.AvatarUrl).HasMaxLength(512);
            e.Property(u => u.Bio).HasMaxLength(500);
            e.Property(u => u.City).HasMaxLength(100);
            e.Property(u => u.GraphColor).HasMaxLength(7);
        });

        modelBuilder.Entity<TaskItem>(e =>
        {
            e.Property(t => t.Difficulty).HasConversion<string>().HasMaxLength(16);
            e.Property(t => t.Title).HasMaxLength(100);
            e.Property(t => t.Description).HasMaxLength(1000);
            e.HasOne(t => t.User)
                .WithMany(u => u.Tasks)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(t => t.Section)
                .WithMany(s => s.Tasks)
                .HasForeignKey(t => t.SectionId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<TaskSection>(e =>
        {
            e.Property(s => s.Name).HasMaxLength(100);
            e.HasOne(s => s.User)
                .WithMany(u => u.TaskSections)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Sphere>(e =>
        {
            e.Property(s => s.Name).HasMaxLength(50);
            e.Property(s => s.Emoji).HasMaxLength(16);
            e.HasOne(s => s.User)
                .WithMany(u => u.Spheres)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Habit>(e =>
        {
            e.Property(h => h.Difficulty).HasConversion<string>().HasMaxLength(16);
            e.Property(h => h.Frequency).HasConversion<string>().HasMaxLength(16);
            e.Property(h => h.Title).HasMaxLength(100);
            e.Property(h => h.Description).HasMaxLength(1000);
            e.Property(h => h.Emoji).HasMaxLength(16);
            e.Property(h => h.GoalUnit).HasMaxLength(32);
            e.HasOne(h => h.User)
                .WithMany(u => u.Habits)
                .HasForeignKey(h => h.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(h => h.Sphere)
                .WithMany(s => s.Habits)
                .HasForeignKey(h => h.SphereId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<HabitCompletion>(e =>
        {
            e.HasOne(hc => hc.Habit)
                .WithMany(h => h.Completions)
                .HasForeignKey(hc => hc.HabitId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Badge>(e =>
        {
            e.Property(b => b.Code).HasMaxLength(50);
            e.HasIndex(b => b.Code).IsUnique();
            e.Property(b => b.Title).HasMaxLength(100);
            e.Property(b => b.Description).HasMaxLength(500);
            e.Property(b => b.IconUrl).HasMaxLength(512);
            e.Property(b => b.Category).HasConversion<string>().HasMaxLength(32);
        });

        modelBuilder.Entity<UserBadge>(e =>
        {
            e.HasOne(ub => ub.User)
                .WithMany(u => u.UserBadges)
                .HasForeignKey(ub => ub.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(ub => ub.Badge)
                .WithMany()
                .HasForeignKey(ub => ub.BadgeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.Property(rt => rt.Token).HasMaxLength(128);
            e.HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<User>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(u => u.ReferredByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Clan>(e =>
        {
            e.Property(c => c.Name).HasMaxLength(40);
            e.Property(c => c.Nickname).HasMaxLength(20);
            e.Property(c => c.Color).HasMaxLength(7);
            e.Property(c => c.InviteToken).HasMaxLength(64);
            e.HasIndex(c => c.InviteToken).IsUnique();
            e.HasIndex(c => c.Nickname).IsUnique();
            e.HasOne(c => c.Leader)
                .WithMany()
                .HasForeignKey(c => c.LeaderId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ClanMember>(e =>
        {
            e.HasKey(m => new { m.ClanId, m.UserId });
            e.HasIndex(m => m.UserId).IsUnique();
            e.HasOne(m => m.Clan)
                .WithMany(c => c.Members)
                .HasForeignKey(m => m.ClanId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(m => m.User)
                .WithMany()
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
