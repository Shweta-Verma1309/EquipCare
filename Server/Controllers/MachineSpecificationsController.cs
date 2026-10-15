using MaintenanceApi.DTOs.MachineSpecifications;
using MaintenanceApi.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MaintenanceApi.Controllers;

[ApiController]
[Route("api/machines/{machineId:int}/specifications")]
public class MachineSpecificationsController : ControllerBase
{
    private readonly IMachineSpecificationService _service;

    public MachineSpecificationsController(IMachineSpecificationService service)
    {
        _service = service;
    }

    // GET: /api/machines/1/specifications
    [HttpGet]
    public async Task<IActionResult> GetByMachine(int machineId)
    {
        var specifications = await _service.GetByMachineIdAsync(machineId);
        return Ok(specifications);
    }

    // POST: /api/machines/1/specifications
    [HttpPost]
    public async Task<IActionResult> Create(
        int machineId,
        MachineSpecificationDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.SpecificationName))
            return BadRequest(new { message = "Specification name is required." });

        dto.MachineId = machineId;

        var specification = await _service.CreateAsync(dto);

        if (specification == null)
            return NotFound(new { message = "Machine not found." });

        return Ok(specification);
    }

    [HttpPut("{specificationId:int}")]
    public async Task<IActionResult> Update(
            int machineId,
            int specificationId,
            MachineSpecificationUpdateDto dto)
    {
        var result = await _service.UpdateAsync(
            machineId, specificationId, dto);

        if (result == null)
            return NotFound(new { message = "Machine specification not found." });

        return Ok(result);
    }

    // DELETE: /api/machines/1/specifications/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int machineId, int id)
    {
        var specification = await _service.GetByIdAsync(id);

        if (specification == null || specification.MachineId != machineId)
            return NotFound(new { message = "Specification not found." });

        await _service.DeleteAsync(id);
        return NoContent();
    }
}