
using System.ComponentModel.DataAnnotations;

namespace MaintenanceApi.DTOs.Chat;

public class ChatRequestDto
{
    [Required]
    [StringLength(2000, MinimumLength = 1)]
    public string Message { get; set; } = string.Empty;
}
