
using System.ComponentModel.DataAnnotations;

namespace MaintenanceApi.DTOs.MachineCategories;

public class MachineCategoryUpdateDto
{
    [Required]
    [MaxLength(100)]
    public string CategoryName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }
}
