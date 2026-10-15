using MaintenanceApi.Interfaces;
using Microsoft.AspNetCore.Mvc;
using MaintenanceApi.DTOs.Machines;
namespace MaintenanceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MachinesController : ControllerBase
{
    private readonly IMachineService _machineService;

    public MachinesController(IMachineService machineService)
    {
        _machineService = machineService;
    }

    // GET: /api/machines?departmentId=1&status=Operational&search=furnace
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? departmentId,
        [FromQuery] string? status,
        [FromQuery] string? search)
    {
        var machines = await _machineService.GetAllAsync(
            departmentId,
            status,
            search);

        return Ok(machines);
    }

    // GET: /api/machines/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var machine = await _machineService.GetByIdAsync(id);

        if (machine == null)
            return NotFound(new { message = "Machine not found." });

        return Ok(machine);
    }


[HttpPost]
public async Task<IActionResult> Create(
    [FromBody] MachineCreateDto dto)
{
    try
    {
        var machine = await _machineService.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { id = machine.MachineId },
            machine);
    }
    catch (ArgumentException ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}

[HttpPut("{id:int}")]
public async Task<IActionResult> Update(
    int id,
    [FromBody] MachineUpdateDto dto)
{
    try
    {
        var machine = await _machineService.UpdateAsync(id, dto);

        if (machine == null)
            return NotFound(new { message = "Machine not found." });

        return Ok(machine);
    }
    catch (ArgumentException ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}

[HttpPatch("{id:int}/deactivate")]
public async Task<IActionResult> Deactivate(int id)
{
    var success = await _machineService.DeactivateAsync(id);

    if (!success)
        return NotFound(new { message = "Machine not found." });

    return Ok(new { message = "Machine deactivated successfully." });
}

}