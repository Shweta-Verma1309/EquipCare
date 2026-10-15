
using MaintenanceApi.DTOs.MaintenanceRecords;

namespace MaintenanceApi.Interfaces;

public interface IMaintenanceRecordService
{
    Task<List<MaintenanceRecordResponseDto>> GetAllAsync(
        int? machineId);

    Task<MaintenanceRecordResponseDto?> GetByIdAsync(int id);

    Task<MaintenanceRecordResponseDto> CreateAsync(
        MaintenanceRecordCreateDto dto);
}
