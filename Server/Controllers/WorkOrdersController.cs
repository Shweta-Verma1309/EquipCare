
using MaintenanceApi.DTOs.WorkOrders;
using MaintenanceApi.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MaintenanceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkOrdersController : ControllerBase
{
    private readonly IWorkOrderService _service;

    public WorkOrdersController(IWorkOrderService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? departmentId,
        [FromQuery] string? status)
    {
        return Ok(await _service.GetAllAsync(departmentId, status));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var workOrder = await _service.GetByIdAsync(id);

        if (workOrder == null)
            return NotFound(new { message = "Work order not found." });

        return Ok(workOrder);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] WorkOrderCreateDto dto)
    {
        try
        {
            var workOrder = await _service.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = workOrder.WorkOrderId },
                workOrder);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(
        int id,
        [FromBody] WorkOrderStatusUpdateDto dto)
    {
        try
        {
            var updated = await _service.UpdateStatusAsync(
                id, dto.Status, dto.Remarks);

            if (!updated)
                return NotFound(new { message = "Work order not found." });

            return Ok(new { message = "Work order status updated." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
    int id,
    WorkOrderUpdateDto dto)
    {
        try
        {
            var result = await _service.UpdateAsync(id, dto);

            if (result == null)
                return NotFound();

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
