namespace MaintenanceApi.Models;

public class WorkOrder
{
    public int WorkOrderId { get; set; }
    public int MachineId { get; set; }
    public int? MaintenancePlanId { get; set; }

    public int? AssignedToUserId { get; set; }
    public int CreatedByUserId { get; set; }

    public string Title { get; set; } = "";
    public string MaintenanceType { get; set; } = "Preventive";
    public string Priority { get; set; } = "Medium";
    public string Status { get; set; } = "Scheduled";

    public DateTime ScheduledStart { get; set; }
    public DateTime? ScheduledEnd { get; set; }
    public DateTime? ActualStart { get; set; }
    public DateTime? ActualEnd { get; set; }

    public string? Description { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Machine Machine { get; set; } = null!;
    public MaintenancePlan? MaintenancePlan { get; set; }
    public User? AssignedToUser { get; set; }
    public User CreatedByUser { get; set; } = null!;

    public ICollection<MaintenanceTask> Tasks { get; set; } = new List<MaintenanceTask>();
    public ICollection<WorkOrderStatusHistory> StatusHistory { get; set; } = new List<WorkOrderStatusHistory>();
}