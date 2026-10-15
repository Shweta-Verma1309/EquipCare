namespace MaintenanceApi.DTOs.Departments;

public class DepartmentResponseDto
{
public int DepartmentId { get; set; }
public string DepartmentCode { get; set; } = "";
public string DepartmentName { get; set; } = "";
public string? Description { get; set; }
public bool IsActive { get; set; }
}