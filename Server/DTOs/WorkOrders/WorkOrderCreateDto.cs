
using System.ComponentModel.DataAnnotations;

namespace MaintenanceApi.DTOs.WorkOrders;

public class WorkOrderCreateDto
{
    [Required]
    public int MachineId { get; set; }

    public int? MaintenancePlanId { get; set; }

    public int? AssignedToUserId { get; set; }

    [Required]
    public int CreatedByUserId { get; set; }

    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string MaintenanceType { get; set; } = string.Empty;

    public string Priority { get; set; } = "Medium";

    public DateTime ScheduledStart { get; set; }

    public DateTime? ScheduledEnd { get; set; }

    public string? Description { get; set; }
}
