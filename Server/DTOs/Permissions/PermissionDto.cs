
namespace MaintenanceApi.DTOs.Permissions;

public class PermissionDto
{
    public int PermissionId { get; set; }
    public string PermissionName { get; set; } = "";
    public string? Description { get; set; }
}
