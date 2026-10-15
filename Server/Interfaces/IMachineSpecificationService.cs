using MaintenanceApi.DTOs.MachineSpecifications;

namespace MaintenanceApi.Interfaces;

public interface IMachineSpecificationService
{
    Task<List<MachineSpecificationDto>> GetByMachineIdAsync(int machineId);
    Task<MachineSpecificationDto?> GetByIdAsync(int id);
    Task<MachineSpecificationDto?> CreateAsync(MachineSpecificationDto dto);

    Task<MachineSpecificationDto?> UpdateAsync(
        int machineId,
        int specificationId,
        MachineSpecificationUpdateDto dto);

    Task<bool> DeleteAsync(int id);
}