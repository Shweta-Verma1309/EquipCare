
using MaintenanceApi.DTOs.MaintenanceRecords;
using MaintenanceApi.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MaintenanceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MaintenanceRecordsController : ControllerBase
{
    private readonly IMaintenanceRecordService _service;

    public MaintenanceRecordsController(
        IMaintenanceRecordService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? machineId)
    {
        return Ok(await _service.GetAllAsync(machineId));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var record = await _service.GetByIdAsync(id);

        if (record == null)
        {
            return NotFound(
                new { message = "Maintenance record not found." });
        }

        return Ok(record);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] MaintenanceRecordCreateDto dto)
    {
        try
        {
            var record = await _service.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = record.MaintenanceRecordId },
                record);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
