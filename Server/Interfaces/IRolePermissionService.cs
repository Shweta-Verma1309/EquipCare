namespace MaintenanceApi.Interfaces;

public interface IRolePermissionService
{
    Task<bool> AssignAsync(int roleId, int permissionId);
    Task<bool> RemoveAsync(int roleId, int permissionId);
    Task<List<string>?> GetPermissionsByRoleIdAsync(int roleId);
}