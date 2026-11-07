using GraffyApi.Common;
using GraffyApi.Contracts;
using GraffyApi.Data;
using GraffyApi.Domain;
using Microsoft.EntityFrameworkCore;

namespace GraffyApi.Services;

public interface ISectionService
{
    Task<List<TaskSectionDto>> GetSectionsAsync(Guid userId);
    Task<TaskSectionDto> CreateAsync(CreateSectionRequest request, Guid userId);
    Task<ServiceResult<TaskSectionDto>> UpdateAsync(Guid id, UpdateSectionRequest request, Guid userId);
    Task<bool> DeleteAsync(Guid id, Guid userId);
}

public class SectionService : ISectionService
{
    private readonly AppDbContext _db;

    public SectionService(AppDbContext db) => _db = db;

    public async Task<List<TaskSectionDto>> GetSectionsAsync(Guid userId) =>
        await _db.TaskSections
            .AsNoTracking()
            .Where(s => s.UserId == userId)
            .OrderBy(s => s.CreatedAt)
            .Select(s => new TaskSectionDto(s.Id, s.UserId, s.Name, s.CreatedAt))
            .ToListAsync();

    public async Task<TaskSectionDto> CreateAsync(CreateSectionRequest request, Guid userId)
    {
        var section = new TaskSection
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            CreatedAt = DateTime.UtcNow
        };
        _db.TaskSections.Add(section);
        await _db.SaveChangesAsync();
        return new TaskSectionDto(section.Id, section.UserId, section.Name, section.CreatedAt);
    }

    public async Task<ServiceResult<TaskSectionDto>> UpdateAsync(Guid id, UpdateSectionRequest request, Guid userId)
    {
        var section = await _db.TaskSections.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);
        if (section == null) return ServiceResult<TaskSectionDto>.NotFound();
        section.Name = request.Name;
        await _db.SaveChangesAsync();
        return ServiceResult<TaskSectionDto>.Success(new TaskSectionDto(section.Id, section.UserId, section.Name, section.CreatedAt));
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        var section = await _db.TaskSections.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);
        if (section == null) return false;
        _db.TaskSections.Remove(section);
        await _db.SaveChangesAsync();
        return true;
    }
}
