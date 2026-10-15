
using System.ComponentModel.DataAnnotations;

namespace MaintenanceApi.DTOs.MaintenanceTasks;

public class MaintenanceTaskUpdateDto
{
    [Required]
    public string Status { get; set; } = string.Empty;

    public string? Remarks { get; set; }
}
