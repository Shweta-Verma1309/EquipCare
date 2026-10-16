namespace MaintenanceApi.Models;

public class MaintenanceRecord
{
    public int MaintenanceRecordId { get; set; }
    public int MachineId { get; set; }
    public int? WorkOrderId { get; set; }

    public DateTime MaintenanceDate { get; set; }
    public string Findings { get; set; } = "";
    public string? ActionsTaken { get; set; }
    public string? PartsUsed { get; set; }
    public decimal DowntimeHours { get; set; } = 0;
    public string? Remarks { get; set; }

    public Machine Machine { get; set; } = null!;
    public WorkOrder? WorkOrder { get; set; }
}