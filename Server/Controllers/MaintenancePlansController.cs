
using MaintenanceApi.DTOs.MaintenancePlans;
using MaintenanceApi.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MaintenanceApi.Controllers;

[ApiController]
[Route("api/maintenanceplans")]
public class MaintenancePlansController : ControllerBase
{
    private readonly IMaintenancePlanService _service;

    public MaintenancePlansController(IMaintenancePlanService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<MaintenancePlanResponseDto>>> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MaintenancePlanResponseDto>> GetById(int id)
    {
        var plan = await _service.GetByIdAsync(id);

        if (plan == null)
            return NotFound(new { message = "Maintenance plan not found." });

        return Ok(plan);
    }

    [HttpPost]
    public async Task<ActionResult<MaintenancePlanResponseDto>> Create(
        MaintenancePlanCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.PlanName) ||
            string.IsNullOrWhiteSpace(dto.MaintenanceType) ||
            string.IsNullOrWhiteSpace(dto.FrequencyUnit) ||
            dto.FrequencyInterval <= 0 ||
            dto.StartDate == default ||
            dto.NextDueDate == default ||
            dto.NextDueDate.Date < dto.StartDate.Date)
        {
            return BadRequest(new
            {
                message = "Provide valid plan details, frequency, and dates."
            });
        }

        var plan = await _service.CreateAsync(dto);

        if (plan == null)
            return NotFound(new { message = "Machine not found." });

        return CreatedAtAction(
            nameof(GetById),
            new { id = plan.MaintenancePlanId },
            plan
        );
    }
    [HttpPut("{id:int}")]
public async Task<IActionResult> Update(
    int id,
    MaintenancePlanUpdateDto dto)
{
    try
    {
        var plan = await _service.UpdateAsync(id, dto);

        if (plan == null)
            return NotFound();

        return Ok(plan);
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}
    [HttpPatch("{id:int}/deactivate")]
    public async Task<IActionResult> Deactivate(int id)
    {
        var success = await _service.DeactivateAsync(id);

        if (!success)
            return NotFound(new { message = "Maintenance plan not found." });

        return NoContent();
    }
}
