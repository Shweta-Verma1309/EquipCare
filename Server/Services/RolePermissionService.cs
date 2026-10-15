
using MaintenanceApi.Data;
using MaintenanceApi.Interfaces;
using MaintenanceApi.Models;
using Microsoft.EntityFrameworkCore;

namespace MaintenanceApi.Services;

public class RolePermissionService : IRolePermissionService
{
    private readonly AppDbContext _context;

    public RolePermissionService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> AssignAsync(int roleId, int permissionId)
    {
        var roleExists = await _context.Roles
            .AnyAsync(r => r.RoleId == roleId);

        var permissionExists = await _context.Permissions
            .AnyAsync(p => p.PermissionId == permissionId);

        if (!roleExists || !permissionExists)
            return false;

        var alreadyAssigned = await _context.RolePermissions
            .AnyAsync(rp =>
                rp.RoleId == roleId &&
                rp.PermissionId == permissionId);

        if (alreadyAssigned)
            return false;

        _context.RolePermissions.Add(new RolePermission
        {
            RoleId = roleId,
            PermissionId = permissionId
        });

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveAsync(int roleId, int permissionId)
    {
        var assignment = await _context.RolePermissions
            .FirstOrDefaultAsync(rp =>
                rp.RoleId == roleId &&
                rp.PermissionId == permissionId);

        if (assignment == null)
            return false;

        _context.RolePermissions.Remove(assignment);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<List<string>?> GetPermissionsByRoleIdAsync(int roleId)
    {
        var roleExists = await _context.Roles
            .AnyAsync(r => r.RoleId == roleId);

        if (!roleExists)
            return null;

        return await _context.RolePermissions
            .Where(rp => rp.RoleId == roleId)
            .Select(rp => rp.Permission.PermissionName)
            .ToListAsync();
    }
}
