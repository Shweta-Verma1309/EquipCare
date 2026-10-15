
namespace MaintenanceApi.Interfaces;

public interface IUserRoleService
{
    Task<bool> AssignRoleAsync(int userId, int roleId);
    Task<bool> RemoveRoleAsync(int userId, int roleId);
    Task<List<string>?> GetRolesByUserIdAsync(int userId);
}
