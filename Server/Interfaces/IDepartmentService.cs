using MaintenanceApi.DTOs.Departments;

namespace MaintenanceApi.Interfaces;

public interface IDepartmentService
{
Task<List<DepartmentResponseDto>> GetAllAsync();
Task<DepartmentResponseDto?> GetByIdAsync(int id);
}