
using MaintenanceApi.DTOs.MaintenancePlans;

namespace MaintenanceApi.Interfaces;

public interface IMaintenancePlanService
{
    Task<List<MaintenancePlanResponseDto>> GetAllAsync();
    Task<MaintenancePlanResponseDto?> GetByIdAsync(int id);
    Task<MaintenancePlanResponseDto?> CreateAsync(
        MaintenancePlanCreateDto dto);

    Task<MaintenancePlanResponseDto?> UpdateAsync(
    int id,
    MaintenancePlanUpdateDto dto);
    Task<bool> DeactivateAsync(int id);
}
