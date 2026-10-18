
using Microsoft.EntityFrameworkCore;
using MaintenanceApi.Data;

namespace MaintenanceApi.Services;

public class ChatDataService
{
    private readonly AppDbContext _context;

    public ChatDataService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<object> GetMachineCountAsync()
    {
        var totalMachines = await _context.Machines.CountAsync();

        var activeMachines = await _context.Machines
            .CountAsync(m => m.IsActive);

        var inactiveMachines = await _context.Machines
            .CountAsync(m => !m.IsActive);

        return new
        {
            TotalMachines = totalMachines,
            ActiveMachines = activeMachines,
            InactiveMachines = inactiveMachines
        };
    }

    public async Task<object> GetDepartmentMachineCountsAsync()
    {
        var counts = await _context.Departments
            .Select(d => new
            {
                Department = d.DepartmentName,
                MachineCount = d.Machines.Count()
            })
            .ToListAsync();

        return counts;
    }


    public async Task<object> GetMachineDetailsAsync(string search)
    {
        var machines = await _context.Machines
            .AsNoTracking()
            .Where(m =>
                m.AssetCode.Contains(search) ||
                m.MachineName.Contains(search))
            .Select(m => new
            {
                m.MachineId,
                m.AssetCode,
                m.MachineName,
                Department = m.Department.DepartmentName,
                Category = m.MachineCategory.CategoryName,
                m.Manufacturer,
                m.ModelNumber,
                m.SerialNumber,
                m.Criticality,
                m.CurrentStatus,
                m.Location,
                m.IsActive
            })
            .Take(20)
            .ToListAsync();

        return machines;
    }

    public async Task<object> GetWorkOrderCountsAsync()
    {
        var total = await _context.WorkOrders.CountAsync();

        var countsByStatus = await _context.WorkOrders
            .AsNoTracking()
            .GroupBy(w => w.Status)
            .Select(g => new
            {
                Status = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        return new
        {
            TotalWorkOrders = total,
            CountsByStatus = countsByStatus
        };
    }

    public async Task<object> GetWorkOrdersAsync(
        string? status = null,
        string? priority = null,
        string? search = null)
    {
        var query = _context.WorkOrders
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(w => w.Status == status);

        if (!string.IsNullOrWhiteSpace(priority))
            query = query.Where(w => w.Priority == priority);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(w =>
                w.Title.Contains(search) ||
                w.Machine.AssetCode.Contains(search) ||
                w.Machine.MachineName.Contains(search));
        }

        var results = await query
            .OrderByDescending(w => w.CreatedAt)
            .Select(w => new
            {
                w.WorkOrderId,
                w.Title,
                Machine = w.Machine.MachineName,
                AssetCode = w.Machine.AssetCode,
                Department = w.Machine.Department.DepartmentName,
                w.MaintenanceType,
                w.Priority,
                w.Status,
                w.ScheduledStart,
                AssignedTo = w.AssignedToUser != null
                    ? w.AssignedToUser.FullName
                    : "Unassigned"
            })
            .Take(50)
            .ToListAsync();

        return results;
    }

    public async Task<object> GetUserWorkOrderCountsAsync(
        string userName)
    {
        var users = await _context.Users
            .AsNoTracking()
            .Where(u => u.FullName.Contains(userName))
            .Select(u => new
            {
                u.UserId,
                u.FullName,
                u.Email,
                AssignedWorkOrders = u.AssignedWorkOrders.Count(),
                OpenWorkOrders = u.AssignedWorkOrders.Count(w =>
                    w.Status != "Completed" &&
                    w.Status != "Cancelled")
            })
            .Take(20)
            .ToListAsync();

        return users;
    }

    public async Task<object> GetWorkOrderDetailsAsync(int workOrderId)
    {
        var workOrder = await _context.WorkOrders
            .AsNoTracking()
            .Where(w => w.WorkOrderId == workOrderId)
            .Select(w => new
            {
                w.WorkOrderId,
                w.Title,
                w.Description,
                w.Notes,
                Machine = w.Machine.MachineName,
                AssetCode = w.Machine.AssetCode,
                Department = w.Machine.Department.DepartmentName,
                w.MaintenanceType,
                w.Priority,
                w.Status,
                w.ScheduledStart,
                w.ScheduledEnd,
                w.ActualStart,
                w.ActualEnd,
                AssignedTo = w.AssignedToUser != null
                    ? w.AssignedToUser.FullName
                    : "Unassigned",
                CreatedBy = w.CreatedByUser.FullName,
                w.CreatedAt
            })
            .FirstOrDefaultAsync();

        return (object?)workOrder ?? new
        {
            Message = $"Work order {workOrderId} was not found."
        };
    }

}
