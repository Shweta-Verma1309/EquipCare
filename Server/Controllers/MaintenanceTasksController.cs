
using MaintenanceApi.DTOs.MaintenanceTasks;
using MaintenanceApi.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MaintenanceApi.Controllers;

[ApiController]
[Route("api/workorders/{workOrderId:int}/tasks")]
public class MaintenanceTasksController : ControllerBase
{
    private readonly IMaintenanceTaskService _service;

    public MaintenanceTasksController(
        IMaintenanceTaskService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetTasks(int workOrderId)
    {
        var tasks = await _service.GetByWorkOrderIdAsync(workOrderId);
        return Ok(tasks);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTask(
        int workOrderId,
        [FromBody] MaintenanceTaskCreateDto dto)
    {
        try
        {
            var task = await _service.CreateAsync(workOrderId, dto);

            return Created(
                $"/api/workorders/{workOrderId}/tasks",
                task);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("~/api/maintenancetasks/{taskId:int}/status")]
    public async Task<IActionResult> UpdateStatus(
        int taskId,
        [FromBody] MaintenanceTaskUpdateDto dto)
    {
        try
        {
            var updated = await _service.UpdateStatusAsync(taskId, dto);

            if (!updated)
                return NotFound(new { message = "Task not found." });

            return Ok(new { message = "Task status updated." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
