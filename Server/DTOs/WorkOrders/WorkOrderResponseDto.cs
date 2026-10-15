
namespace MaintenanceApi.DTOs.WorkOrders;

public class WorkOrderResponseDto
{
    public int WorkOrderId { get; set; }

    public int MachineId { get; set; }

    public string MachineName { get; set; } = string.Empty;

    public int? MaintenancePlanId { get; set; }

    public int? AssignedToUserId { get; set; }

    public string? AssignedToUserName { get; set; }

    public int CreatedByUserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string MaintenanceType { get; set; } = string.Empty;

    public string Priority { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime ScheduledStart { get; set; }

    public DateTime? ScheduledEnd { get; set; }

    public DateTime? ActualStart { get; set; }

    public DateTime? ActualEnd { get; set; }

    public string? Description { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }
}
