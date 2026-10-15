
using MaintenanceApi.Data;
using MaintenanceApi.DTOs.Permissions;
using MaintenanceApi.Interfaces;
using MaintenanceApi.Models;
using Microsoft.EntityFrameworkCore;

namespace MaintenanceApi.Services;

public class PermissionService : IPermissionService
{
    private readonly AppDbContext _context;

    public PermissionService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<PermissionDto>> GetAllAsync()
    {
        return await _context.Permissions
            .AsNoTracking()
            .OrderBy(p => p.PermissionName)
            .Select(p => new PermissionDto
            {
                PermissionId = p.PermissionId,
                PermissionName = p.PermissionName,
                Description = p.Description
            })
            .ToListAsync();
    }

    public async Task<PermissionDto?> GetByIdAsync(int id)
    {
        return await _context.Permissions
            .AsNoTracking()
            .Where(p => p.PermissionId == id)
            .Select(p => new PermissionDto
            {
                PermissionId = p.PermissionId,
                PermissionName = p.PermissionName,
                Description = p.Description
            })
            .FirstOrDefaultAsync();
    }

    public async Task<PermissionDto?> CreateAsync(PermissionDto dto)
    {
        var name = dto.PermissionName.Trim();

        var exists = await _context.Permissions
            .AnyAsync(p => p.PermissionName.ToLower() == name.ToLower());

        if (exists)
            return null;

        var permission = new Permission
        {
            PermissionName = name,
            Description = dto.Description
        };

        _context.Permissions.Add(permission);
        await _context.SaveChangesAsync();

        return new PermissionDto
        {
            PermissionId = permission.PermissionId,
            PermissionName = permission.PermissionName,
            Description = permission.Description
        };
    }
}
