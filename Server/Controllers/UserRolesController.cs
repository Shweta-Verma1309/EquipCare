
using MaintenanceApi.DTOs.UserRoles;
using MaintenanceApi.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MaintenanceApi.Controllers;

[ApiController]
[Route("api/users/{userId:int}/roles")]
public class UserRolesController : ControllerBase
{
    private readonly IUserRoleService _service;

    public UserRolesController(IUserRoleService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetRoles(int userId)
    {
        var roles = await _service.GetRolesByUserIdAsync(userId);

        if (roles == null)
            return NotFound(new { message = "User not found." });

        return Ok(roles);
    }

    [HttpPost]
    public async Task<IActionResult> AssignRole(
        int userId, AssignRoleDto dto)
    {
        if (dto.UserId != 0 && dto.UserId != userId)
            return BadRequest(new { message = "User ID does not match the URL." });

        var assigned = await _service.AssignRoleAsync(userId, dto.RoleId);

        if (!assigned)
            return BadRequest(new
            {
                message = "User or role not found, or role already assigned."
            });

        return Ok(new { message = "Role assigned successfully." });
    }

    [HttpDelete("{roleId:int}")]
    public async Task<IActionResult> RemoveRole(int userId, int roleId)
    {
        var removed = await _service.RemoveRoleAsync(userId, roleId);

        if (!removed)
            return NotFound(new { message = "Role assignment not found." });

        return NoContent();
    }
}
