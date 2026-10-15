namespace MaintenanceApi.DTOs.Machines;

public class MachineResponseDto
{
    public int MachineId { get; set; }
    public string AssetCode { get; set; } = "";
    public string MachineName { get; set; } = "";

    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = "";

    public int MachineCategoryId { get; set; }
    public string CategoryName { get; set; } = "";

    public string? Manufacturer { get; set; }
    public string? ModelNumber { get; set; }
    public string? SerialNumber { get; set; }
    public DateTime? InstallationDate { get; set; }

    public string Criticality { get; set; } = "";
    public string CurrentStatus { get; set; } = "";
    public string? Location { get; set; }
    public bool IsActive { get; set; }
}