namespace GraffyApi.Domain;

public class Sphere
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Emoji { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // Soft-delete: сфера удаляется флагом. Существующие ссылки (привычки/задачи) сохраняются,
    // но в списке для выбора такая сфера не показывается.
    public DateTime? DeletedAt { get; set; }

    public User User { get; set; } = null!;
    public ICollection<Habit> Habits { get; set; } = new List<Habit>();
}
