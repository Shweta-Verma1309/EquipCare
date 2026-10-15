
using MaintenanceApi.Data;
using MaintenanceApi.DTOs.WorkOrderStatusHistory;
using MaintenanceApi.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MaintenanceApi.Services;

public class WorkOrderStatusHistoryService
    : IWorkOrderStatusHistoryService
{
    private readonly AppDbContext _context;

    public WorkOrderStatusHistoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<WorkOrderStatusHistoryResponseDto>>
        GetByWorkOrderIdAsync(int workOrderId)
    {
        var workOrderExists = await _context.WorkOrders
            .AnyAsync(w => w.WorkOrderId == workOrderId);

        if (!workOrderExists)
            throw new ArgumentException("Work order not found.");

        return await _context.WorkOrderStatusHistory
            .AsNoTracking()
            .Where(h => h.WorkOrderId == workOrderId)
            .OrderBy(h => h.ChangedAt)
            .Select(h => new WorkOrderStatusHistoryResponseDto
            {
                WorkOrderStatusHistoryId =
                    h.WorkOrderStatusHistoryId,
                WorkOrderId = h.WorkOrderId,
                PreviousStatus = h.PreviousStatus,
                NewStatus = h.NewStatus,
                Remarks = h.Remarks,
                ChangedAt = h.ChangedAt
            })
            .ToListAsync();
    }
}
