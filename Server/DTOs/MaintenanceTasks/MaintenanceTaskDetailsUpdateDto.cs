using System.ComponentModel.DataAnnotations;

namespace MaintenanceApi.DTOs.MaintenanceTasks;

public class MaintenanceTaskDetailsUpdateDto
{
    [Required]
    [MaxLength(150)]
    public string TaskName { get; set; } = "";

    public string? Instructions { get; set; }
    public string? Remarks { get; set; }
}