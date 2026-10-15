
using MaintenanceApi.Data;
using MaintenanceApi.DTOs.MaintenancePlans;
using MaintenanceApi.Interfaces;
using MaintenanceApi.Models;
using Microsoft.EntityFrameworkCore;

namespace MaintenanceApi.Services;

public class MaintenancePlanService : IMaintenancePlanService
{
    private readonly AppDbContext _context;

    public MaintenancePlanService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<MaintenancePlanResponseDto>> GetAllAsync()
    {
        return await _context.MaintenancePlans
            .AsNoTracking()
            .OrderBy(p => p.NextDueDate)
            .Select(p => new MaintenancePlanResponseDto
            {
                MaintenancePlanId = p.MaintenancePlanId,
                MachineId = p.MachineId,
                MachineName = p.Machine.MachineName,
                PlanName = p.PlanName,
                MaintenanceType = p.MaintenanceType,
                FrequencyInterval = p.FrequencyInterval,
                FrequencyUnit = p.FrequencyUnit,
                StartDate = p.StartDate,
                NextDueDate = p.NextDueDate,
                IsActive = p.IsActive
            })
            .ToListAsync();
    }

    public async Task<MaintenancePlanResponseDto?> GetByIdAsync(int id)
    {
        return await _context.MaintenancePlans
            .AsNoTracking()
            .Where(p => p.MaintenancePlanId == id)
            .Select(p => new MaintenancePlanResponseDto
            {
                MaintenancePlanId = p.MaintenancePlanId,
                MachineId = p.MachineId,
                MachineName = p.Machine.MachineName,
                PlanName = p.PlanName,
                MaintenanceType = p.MaintenanceType,
                FrequencyInterval = p.FrequencyInterval,
                FrequencyUnit = p.FrequencyUnit,
                StartDate = p.StartDate,
                NextDueDate = p.NextDueDate,
                IsActive = p.IsActive
            })
            .FirstOrDefaultAsync();
    }

    public async Task<MaintenancePlanResponseDto?> CreateAsync(
        MaintenancePlanCreateDto dto)
    {
        var machineExists = await _context.Machines
            .AnyAsync(m => m.MachineId == dto.MachineId);

        if (!machineExists)
            return null;

        var plan = new MaintenancePlan
        {
            MachineId = dto.MachineId,
            PlanName = dto.PlanName.Trim(),
            MaintenanceType = dto.MaintenanceType.Trim(),
            FrequencyInterval = dto.FrequencyInterval,
            FrequencyUnit = dto.FrequencyUnit.Trim(),
            StartDate = DateTime.SpecifyKind(
            dto.StartDate, DateTimeKind.Utc),
            NextDueDate = DateTime.SpecifyKind(
            dto.NextDueDate, DateTimeKind.Utc),
            IsActive = true
        };

        _context.MaintenancePlans.Add(plan);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(plan.MaintenancePlanId);
    }

    
public async Task<MaintenancePlanResponseDto?> UpdateAsync(
    int id,
    MaintenancePlanUpdateDto dto)
{
    var plan = await _context.MaintenancePlans.FindAsync(id);

    if (plan == null)
        return null;

    if (dto.NextDueDate.Date < dto.StartDate.Date)
        throw new InvalidOperationException(
            "Next due date cannot be before the start date.");

    if (dto.FrequencyUnit is not ("Days" or "Weeks" or "Months" or "Years"))
        throw new InvalidOperationException(
            "Frequency unit must be Days, Weeks, Months, or Years.");

    plan.PlanName = dto.PlanName.Trim();
    plan.MaintenanceType = dto.MaintenanceType.Trim();
    plan.FrequencyInterval = dto.FrequencyInterval;
    plan.FrequencyUnit = dto.FrequencyUnit;
    plan.StartDate = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc);
    plan.NextDueDate = DateTime.SpecifyKind(dto.NextDueDate, DateTimeKind.Utc);

    await _context.SaveChangesAsync();

    return await GetByIdAsync(id);
}

    public async Task<bool> DeactivateAsync(int id)
    {
        var plan = await _context.MaintenancePlans
            .FirstOrDefaultAsync(p => p.MaintenancePlanId == id);

        if (plan == null)
            return false;

        plan.IsActive = false;
        await _context.SaveChangesAsync();

        return true;
    }
}
