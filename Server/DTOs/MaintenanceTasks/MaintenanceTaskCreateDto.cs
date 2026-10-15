
using System.ComponentModel.DataAnnotations;

namespace MaintenanceApi.DTOs.MaintenanceTasks;

public class MaintenanceTaskCreateDto
{
    [Required]
    [MaxLength(150)]
    public string TaskName { get; set; } = string.Empty;

    public string? Instructions { get; set; }
}
