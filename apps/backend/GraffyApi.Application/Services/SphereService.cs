using GraffyApi.Common;
using GraffyApi.Contracts;
using GraffyApi.Data;
using GraffyApi.Domain;
using Microsoft.EntityFrameworkCore;

namespace GraffyApi.Services;

public interface ISphereService
{
    Task<List<SphereDto>> GetSpheresAsync(Guid userId);
    Task<ServiceResult<SphereDto>> CreateAsync(CreateSphereRequest request, Guid userId);
    Task<ServiceResult> DeleteAsync(Guid id, Guid userId);
}

public class SphereService : ISphereService
{
    private readonly AppDbContext _db;

    public SphereService(AppDbContext db) => _db = db;

    public async Task<List<SphereDto>> GetSpheresAsync(Guid userId) =>
        await _db.Spheres
            .AsNoTracking()
            .Where(s => s.UserId == userId && s.DeletedAt == null)
            .OrderBy(s => s.CreatedAt)
            .Select(s => new SphereDto(
                s.Id, s.Name, s.Emoji,
                s.Habits.Count(h => h.IsActive),
                s.CreatedAt))
            .ToListAsync();

    public async Task<ServiceResult<SphereDto>> CreateAsync(CreateSphereRequest request, Guid userId)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ServiceResult<SphereDto>.Failure("Название обязательно");
        if (string.IsNullOrWhiteSpace(request.Emoji))
            return ServiceResult<SphereDto>.Failure("Эмодзи обязательно");

        var sphere = new Sphere
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name.Trim(),
            Emoji = request.Emoji.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.Spheres.Add(sphere);
        await _db.SaveChangesAsync();

        return ServiceResult<SphereDto>.Success(new SphereDto(sphere.Id, sphere.Name, sphere.Emoji, 0, sphere.CreatedAt));
    }

    public async Task<ServiceResult> DeleteAsync(Guid id, Guid userId)
    {
        var sphere = await _db.Spheres.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId && s.DeletedAt == null);
        if (sphere == null) return ServiceResult.NotFound();

        // Soft-delete: оставляем строку, чтобы существующие привычки/задачи продолжали ссылаться
        // на сферу. В списке для выбора сфера больше не появится (фильтр по DeletedAt).
        sphere.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return ServiceResult.Success();
    }
}
