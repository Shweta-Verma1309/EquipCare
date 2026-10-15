namespace MaintenanceApi.Models;

public class Department
{
    public int DepartmentId { get; set; }
    public string DepartmentCode { get; set; } = "";
    public string DepartmentName { get; set; } = "";
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Machine> Machines { get; set; } = new List<Machine>();
}