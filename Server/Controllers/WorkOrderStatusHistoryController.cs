
using MaintenanceApi.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MaintenanceApi.Controllers;

[ApiController]
[Route("api/workorders/{workOrderId:int}/status-history")]
public class WorkOrderStatusHistoryController : ControllerBase
{
    private readonly IWorkOrderStatusHistoryService _service;

    public WorkOrderStatusHistoryController(
        IWorkOrderStatusHistoryService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetHistory(int workOrderId)
    {
        try
        {
            var history = await _service.GetByWorkOrderIdAsync(
                workOrderId);

            return Ok(history);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
