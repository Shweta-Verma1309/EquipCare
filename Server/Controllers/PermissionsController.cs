
using MaintenanceApi.DTOs.Permissions;
using MaintenanceApi.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MaintenanceApi.Controllers;

[ApiController]
[Route("api/permissions")]
public class PermissionsController : ControllerBase
{
    private readonly IPermissionService _service;

    public PermissionsController(IPermissionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<PermissionDto>>> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PermissionDto>> GetById(int id)
    {
        var permission = await _service.GetByIdAsync(id);

        if (permission == null)
            return NotFound(new { message = "Permission not found." });

        return Ok(permission);
    }

    [HttpPost]
    public async Task<ActionResult<PermissionDto>> Create(PermissionDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.PermissionName))
            return BadRequest(new { message = "Permission name is required." });

        var permission = await _service.CreateAsync(dto);

        if (permission == null)
            return Conflict(new { message = "Permission already exists." });

        return CreatedAtAction(
            nameof(GetById),
            new { id = permission.PermissionId },
            permission
        );
    }
}
