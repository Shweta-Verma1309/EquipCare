
using System.ComponentModel.DataAnnotations;

namespace MaintenanceApi.DTOs.Roles;

public class RoleUpdateDto
{
    [Required]
    [MaxLength(100)]
    public string RoleName { get; set; } = "";

    [MaxLength(500)]
    public string? Description { get; set; }
}
