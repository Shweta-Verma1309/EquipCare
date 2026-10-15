
using MaintenanceApi.DTOs.MaintenanceTasks;

namespace MaintenanceApi.Interfaces;

public interface IMaintenanceTaskService
{
    Task<List<MaintenanceTaskResponseDto>> GetByWorkOrderIdAsync(
        int workOrderId);

    Task<MaintenanceTaskResponseDto> CreateAsync(
        int workOrderId,
        MaintenanceTaskCreateDto dto);

    Task<bool> UpdateStatusAsync(
        int taskId,
        MaintenanceTaskUpdateDto dto);

    Task<MaintenanceTaskResponseDto?> UpdateAsync(
    int id,
    MaintenanceTaskDetailsUpdateDto dto);    
}
