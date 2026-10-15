
using MaintenanceApi.Data;
using MaintenanceApi.DTOs.WorkOrders;
using MaintenanceApi.Interfaces;
using MaintenanceApi.Models;
using Microsoft.EntityFrameworkCore;

namespace MaintenanceApi.Services;

public class WorkOrderService : IWorkOrderService
{
    private readonly AppDbContext _context;

    public WorkOrderService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<WorkOrderResponseDto>> GetAllAsync(
        int? departmentId,
        string? status)
    {
        var query = _context.WorkOrders
            .AsNoTracking()
            .AsQueryable();

        if (departmentId.HasValue)
        {
            query = query.Where(w =>
                w.Machine.DepartmentId == departmentId.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(w => w.Status == status);
        }

        var workOrders = await query
            .OrderByDescending(w => w.CreatedAt)
            .Select(w => new WorkOrderResponseDto
            {
                WorkOrderId = w.WorkOrderId,
                MachineId = w.MachineId,
                MachineName = w.Machine.MachineName,
                MaintenancePlanId = w.MaintenancePlanId,
                AssignedToUserId = w.AssignedToUserId,
                AssignedToUserName = w.AssignedToUser != null
                    ? w.AssignedToUser.FullName
                    : null,
                CreatedByUserId = w.CreatedByUserId,
                Title = w.Title,
                MaintenanceType = w.MaintenanceType,
                Priority = w.Priority,
                Status = w.Status,
                ScheduledStart = w.ScheduledStart,
                ScheduledEnd = w.ScheduledEnd,
                ActualStart = w.ActualStart,
                ActualEnd = w.ActualEnd,
                Description = w.Description,
                Notes = w.Notes,
                CreatedAt = w.CreatedAt
            })
            .ToListAsync();

        return workOrders;
    }

    public async Task<WorkOrderResponseDto?> GetByIdAsync(int id)
    {
        return await _context.WorkOrders
            .AsNoTracking()
            .Where(w => w.WorkOrderId == id)
            .Select(w => new WorkOrderResponseDto
            {
                WorkOrderId = w.WorkOrderId,
                MachineId = w.MachineId,
                MachineName = w.Machine.MachineName,
                MaintenancePlanId = w.MaintenancePlanId,
                AssignedToUserId = w.AssignedToUserId,
                AssignedToUserName = w.AssignedToUser != null
                    ? w.AssignedToUser.FullName
                    : null,
                CreatedByUserId = w.CreatedByUserId,
                Title = w.Title,
                MaintenanceType = w.MaintenanceType,
                Priority = w.Priority,
                Status = w.Status,
                ScheduledStart = w.ScheduledStart,
                ScheduledEnd = w.ScheduledEnd,
                ActualStart = w.ActualStart,
                ActualEnd = w.ActualEnd,
                Description = w.Description,
                Notes = w.Notes,
                CreatedAt = w.CreatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<WorkOrderResponseDto> CreateAsync(
        WorkOrderCreateDto dto)
    {
        var machineExists = await _context.Machines
            .AnyAsync(m => m.MachineId == dto.MachineId);

        if (!machineExists)
            throw new ArgumentException("Machine not found.");

        var creatorExists = await _context.Users
            .AnyAsync(u => u.UserId == dto.CreatedByUserId);

        if (!creatorExists)
            throw new ArgumentException("Creator user not found.");

        if (dto.AssignedToUserId.HasValue)
        {
            var assigneeExists = await _context.Users.AnyAsync(
                u => u.UserId == dto.AssignedToUserId.Value);

            if (!assigneeExists)
                throw new ArgumentException("Assigned user not found.");
        }

        if (dto.MaintenancePlanId.HasValue)
        {
            var planExists = await _context.MaintenancePlans.AnyAsync(
                p => p.MaintenancePlanId == dto.MaintenancePlanId.Value
                     && p.MachineId == dto.MachineId);

            if (!planExists)
                throw new ArgumentException(
                    "Maintenance plan not found for this machine.");
        }

        if (dto.ScheduledEnd.HasValue &&
            dto.ScheduledEnd.Value < dto.ScheduledStart)
        {
            throw new ArgumentException(
                "Scheduled end cannot be earlier than scheduled start.");
        }

        var workOrder = new WorkOrder
        {
            MachineId = dto.MachineId,
            MaintenancePlanId = dto.MaintenancePlanId,
            AssignedToUserId = dto.AssignedToUserId,
            CreatedByUserId = dto.CreatedByUserId,
            Title = dto.Title.Trim(),
            MaintenanceType = dto.MaintenanceType,
            Priority = dto.Priority,
            Status = "Open",
            ScheduledStart = DateTime.SpecifyKind(
                dto.ScheduledStart, DateTimeKind.Utc),
            ScheduledEnd = dto.ScheduledEnd.HasValue
                ? DateTime.SpecifyKind(
                    dto.ScheduledEnd.Value, DateTimeKind.Utc)
                : null,
            Description = dto.Description,
            CreatedAt = DateTime.UtcNow
        };

        _context.WorkOrders.Add(workOrder);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(workOrder.WorkOrderId))!;
    }



    public async Task<WorkOrderResponseDto?> UpdateAsync(
        int id,
        WorkOrderUpdateDto dto)
    {
        var workOrder = await _context.WorkOrders.FindAsync(id);

        if (workOrder == null)
            return null;

        if (workOrder.Status is "Completed" or "Cancelled")
            throw new InvalidOperationException(
                "Completed or cancelled work orders cannot be edited.");

        if (dto.Priority is not ("Low" or "Medium" or "High" or "Critical"))
            throw new InvalidOperationException("Invalid priority.");

        if (dto.ScheduledStart.HasValue &&
            dto.ScheduledEnd.HasValue &&
            dto.ScheduledEnd < dto.ScheduledStart)
            throw new InvalidOperationException(
                "Scheduled end must be after scheduled start.");

        if (dto.AssignedToUserId.HasValue)
        {
            var userExists = await _context.Users.AnyAsync(u =>
                u.UserId == dto.AssignedToUserId.Value && u.IsActive);

            if (!userExists)
                throw new InvalidOperationException(
                    "Assigned technician does not exist or is inactive.");
        }

        workOrder.Title = dto.Title.Trim();
        workOrder.Description = dto.Description?.Trim();
        workOrder.Priority = dto.Priority;
        workOrder.AssignedToUserId = dto.AssignedToUserId;
        workOrder.ScheduledStart = 
             DateTime.SpecifyKind(dto.ScheduledStart.Value, DateTimeKind.Utc);
            
        workOrder.ScheduledEnd = dto.ScheduledEnd.HasValue
            ? DateTime.SpecifyKind(dto.ScheduledEnd.Value, DateTimeKind.Utc)
            : null;
        workOrder.Notes = dto.Notes?.Trim();

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<bool> UpdateStatusAsync(
        int id,
        string newStatus,
        string? remarks)
    {
        var workOrder = await _context.WorkOrders
            .FirstOrDefaultAsync(w => w.WorkOrderId == id);

        if (workOrder == null)
            return false;

        var allowedStatuses = new[]
        {
            "Open",
            "Assigned",
            "In Progress",
            "On Hold",
            "Completed",
            "Cancelled"
        };

        if (!allowedStatuses.Contains(newStatus))
            throw new ArgumentException("Invalid work order status.");

        var previousStatus = workOrder.Status;

        if (previousStatus == newStatus)
            return true;

        workOrder.Status = newStatus;

        if (newStatus == "In Progress" && workOrder.ActualStart == null)
            workOrder.ActualStart = DateTime.UtcNow;

        if (newStatus == "Completed")
            workOrder.ActualEnd = DateTime.UtcNow;

        _context.WorkOrderStatusHistory.Add(
            new WorkOrderStatusHistory
            {
                WorkOrderId = workOrder.WorkOrderId,
                PreviousStatus = previousStatus,
                NewStatus = newStatus,
                Remarks = remarks,
                ChangedAt = DateTime.UtcNow
            });

        await _context.SaveChangesAsync();

        return true;
    }
}
