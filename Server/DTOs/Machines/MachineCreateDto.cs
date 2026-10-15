
using System.ComponentModel.DataAnnotations;

namespace MaintenanceApi.DTOs.Machines;

public class MachineCreateDto
{
    [Required, MaxLength(50)]
    public string AssetCode { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string MachineName { get; set; } = string.Empty;

    [Required]
    public int DepartmentId { get; set; }

    [Required]
    public int MachineCategoryId { get; set; }

    public string? Manufacturer { get; set; }

    public string? ModelNumber { get; set; }

    public string? SerialNumber { get; set; }

    public DateTime? InstallationDate { get; set; }

    public string Criticality { get; set; } = "Medium";

    public string CurrentStatus { get; set; } = "Operational";

    public string? Location { get; set; }
}
