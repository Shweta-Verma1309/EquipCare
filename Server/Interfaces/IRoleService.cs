
using MaintenanceApi.DTOs.Roles;

namespace MaintenanceApi.Interfaces;

public interface IRoleService
{
    Task<List<RoleDto>> GetAllAsync();
    Task<RoleDto?> GetByIdAsync(int id);
    Task<RoleDto?> CreateAsync(RoleDto dto);

    Task<RoleDto?> UpdateAsync(int id, RoleUpdateDto dto);

}
