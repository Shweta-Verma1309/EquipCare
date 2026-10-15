using System.ComponentModel.DataAnnotations;

namespace MaintenanceApi.DTOs.WorkOrders;

public class WorkOrderStatusUpdateDto
{
    [Required]
    public string Status { get; set; } = string.Empty;

    public string? Remarks { get; set; }
}