namespace MaintenanceApi.Models;

public class WorkOrderStatusHistory
{
    public int WorkOrderStatusHistoryId { get; set; }
    public int WorkOrderId { get; set; }

    public string? PreviousStatus { get; set; }
    public string NewStatus { get; set; } = "";
    public string? Remarks { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

    public WorkOrder WorkOrder { get; set; } = null!;
}