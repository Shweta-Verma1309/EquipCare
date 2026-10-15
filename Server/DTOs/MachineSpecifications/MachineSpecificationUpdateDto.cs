
using System.ComponentModel.DataAnnotations;

namespace MaintenanceApi.DTOs.MachineSpecifications;

public class MachineSpecificationUpdateDto
{
    [Required]
    [MaxLength(100)]
    public string SpecificationName { get; set; } = "";

    [Required]
    [MaxLength(500)]
    public string SpecificationValue { get; set; } = "";

    [MaxLength(50)]
    public string? Unit { get; set; }
}
