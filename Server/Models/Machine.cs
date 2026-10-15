namespace MaintenanceApi.Models;

public class Machine
{
    public int MachineId { get; set; }
    public string AssetCode { get; set; } = "";
    public string MachineName { get; set; } = "";

    public int DepartmentId { get; set; }
    public int MachineCategoryId { get; set; }

    public string? Manufacturer { get; set; }
    public string? ModelNumber { get; set; }
    public string? SerialNumber { get; set; }
    public DateTime? InstallationDate { get; set; }

    public string Criticality { get; set; } = "Medium";
    public string CurrentStatus { get; set; } = "Operational";
    public string? Location { get; set; }
    public bool IsActive { get; set; } = true;

    public Department Department { get; set; } = null!;
    public MachineCategory MachineCategory { get; set; } = null!;

    public ICollection<MachineSpecification> Specifications { get; set; } = new List<MachineSpecification>();
    public ICollection<MaintenancePlan> MaintenancePlans { get; set; } = new List<MaintenancePlan>();
    public ICollection<WorkOrder> WorkOrders { get; set; } = new List<WorkOrder>();
    public ICollection<MaintenanceRecord> MaintenanceRecords { get; set; } = new List<MaintenanceRecord>();
}