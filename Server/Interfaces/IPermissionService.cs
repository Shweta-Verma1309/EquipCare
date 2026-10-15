
using MaintenanceApi.DTOs.Permissions;

namespace MaintenanceApi.Interfaces;

public interface IPermissionService
{
    Task<List<PermissionDto>> GetAllAsync();
    Task<PermissionDto?> GetByIdAsync(int id);
    Task<PermissionDto?> CreateAsync(PermissionDto dto);
}
