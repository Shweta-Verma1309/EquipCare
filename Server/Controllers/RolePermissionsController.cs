
using MaintenanceApi.DTOs.RolePermissions;
using MaintenanceApi.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MaintenanceApi.Controllers;

[ApiController]
[Route("api/roles/{roleId:int}/permissions")]
public class RolePermissionsController : ControllerBase
{
    private readonly IRolePermissionService _service;

    public RolePermissionsController(IRolePermissionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetPermissions(int roleId)
    {
        var permissions =
            await _service.GetPermissionsByRoleIdAsync(roleId);

        if (permissions == null)
            return NotFound(new { message = "Role not found." });

        return Ok(permissions);
    }

    [HttpPost]
    public async Task<IActionResult> Assign(
        int roleId, AssignPermissionDto dto)
    {
        var assigned = await _service.AssignAsync(
            roleId, dto.PermissionId);

        if (!assigned)
        {
            return BadRequest(new
            {
                message = "Role or permission not found, or permission already assigned."
            });
        }

        return Ok(new { message = "Permission assigned successfully." });
    }

    [HttpDelete("{permissionId:int}")]
    public async Task<IActionResult> Remove(
        int roleId, int permissionId)
    {
        var removed = await _service.RemoveAsync(roleId, permissionId);

        if (!removed)
            return NotFound(new { message = "Assignment not found." });

        return NoContent();
    }
}
