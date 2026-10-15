namespace MaintenanceApi.Models;

public class MaintenanceTask
{
    public int MaintenanceTaskId { get; set; }
    public int WorkOrderId { get; set; }

    public string TaskName { get; set; } = "";
    public string? Instructions { get; set; }
    public string Status { get; set; } = "Pending";
    public string? Remarks { get; set; }
    public DateTime? CompletedAt { get; set; }

    public WorkOrder WorkOrder { get; set; } = null!;
}