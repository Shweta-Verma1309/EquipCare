
namespace MaintenanceApi.DTOs.MaintenanceTasks;

public class MaintenanceTaskResponseDto
{
    public int MaintenanceTaskId { get; set; }

    public int WorkOrderId { get; set; }

    public string TaskName { get; set; } = string.Empty;

    public string? Instructions { get; set; }

    public string Status { get; set; } = string.Empty;

    public string? Remarks { get; set; }

    public DateTime? CompletedAt { get; set; }
}
