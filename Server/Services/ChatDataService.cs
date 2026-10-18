
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
}
