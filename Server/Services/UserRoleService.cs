
using MaintenanceApi.Data;
using MaintenanceApi.Interfaces;
using MaintenanceApi.Models;
using Microsoft.EntityFrameworkCore;

namespace MaintenanceApi.Services;

public class UserRoleService : IUserRoleService
{
    private readonly AppDbContext _context;

    public UserRoleService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> AssignRoleAsync(int userId, int roleId)
    {
        var userExists = await _context.Users
            .AnyAsync(u => u.UserId == userId);

        var roleExists = await _context.Roles
            .AnyAsync(r => r.RoleId == roleId);

        if (!userExists || !roleExists)
            return false;

        var alreadyAssigned = await _context.UserRoles
            .AnyAsync(ur => ur.UserId == userId && ur.RoleId == roleId);

        if (alreadyAssigned)
            return false;

        _context.UserRoles.Add(new UserRole
        {
            UserId = userId,
            RoleId = roleId
        });

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveRoleAsync(int userId, int roleId)
    {
        var userRole = await _context.UserRoles
            .FirstOrDefaultAsync(ur =>
                ur.UserId == userId && ur.RoleId == roleId);

        if (userRole == null)
            return false;

        _context.UserRoles.Remove(userRole);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<List<string>?> GetRolesByUserIdAsync(int userId)
    {
        var userExists = await _context.Users
            .AnyAsync(u => u.UserId == userId);

        if (!userExists)
            return null;

        return await _context.UserRoles
            .Where(ur => ur.UserId == userId)
            .Select(ur => ur.Role.RoleName)
            .ToListAsync();
    }
}
