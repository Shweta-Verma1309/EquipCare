
using MaintenanceApi.DTOs.WorkOrderStatusHistory;

namespace MaintenanceApi.Interfaces;

public interface IWorkOrderStatusHistoryService
{
    Task<List<WorkOrderStatusHistoryResponseDto>> GetByWorkOrderIdAsync(
        int workOrderId);
}
