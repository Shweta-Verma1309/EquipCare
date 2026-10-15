
using System.ComponentModel.DataAnnotations;

namespace MaintenanceApi.DTOs.WorkOrders;

public class WorkOrderUpdateDto
{
    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = "";

    public string? Description { get; set; }

    [Required]
    public string Priority { get; set; } = "";

    public int? AssignedToUserId { get; set; }

    public DateTime? ScheduledStart { get; set; }
    public DateTime? ScheduledEnd { get; set; }

    public string? Notes { get; set; }
}
