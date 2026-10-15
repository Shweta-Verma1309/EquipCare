
namespace MaintenanceApi.DTOs.WorkOrderStatusHistory;

public class WorkOrderStatusHistoryResponseDto
{
    public int WorkOrderStatusHistoryId { get; set; }

    public int WorkOrderId { get; set; }

    public string PreviousStatus { get; set; } = string.Empty;

    public string NewStatus { get; set; } = string.Empty;

    public string? Remarks { get; set; }

    public DateTime ChangedAt { get; set; }
}
