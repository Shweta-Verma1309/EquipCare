
using System.ComponentModel.DataAnnotations;

namespace MaintenanceApi.DTOs.Users;

public class UserUpdateDto
{
    [Required]
    [MaxLength(150)]
    public string FullName { get; set; } = "";

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = "";

    [MaxLength(50)]
    public string? EmployeeCode { get; set; }
}
