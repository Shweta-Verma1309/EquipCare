
using MaintenanceApi.DTOs.Roles;
using MaintenanceApi.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MaintenanceApi.Controllers;

[ApiController]
[Route("api/roles")]
public class RolesController : ControllerBase
{
    private readonly IRoleService _service;

    public RolesController(IRoleService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<RoleDto>>> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RoleDto>> GetById(int id)
    {
        var role = await _service.GetByIdAsync(id);

        if (role == null)
            return NotFound(new { message = "Role not found." });

        return Ok(role);
    }

    [HttpPost]
    public async Task<ActionResult<RoleDto>> Create(RoleDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.RoleName))
            return BadRequest(new { message = "Role name is required." });

        var role = await _service.CreateAsync(dto);

        if (role == null)
            return Conflict(new { message = "Role already exists." });

        return CreatedAtAction(
            nameof(GetById),
            new { id = role.RoleId },
            role
        );
    }


    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, RoleUpdateDto dto)
    {
        try
        {
            var role = await _service.UpdateAsync(id, dto);

            if (role == null)
                return NotFound();

            return Ok(role);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

}
