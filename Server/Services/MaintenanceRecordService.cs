
using MaintenanceApi.Data;
using MaintenanceApi.DTOs.MaintenanceRecords;
using MaintenanceApi.Interfaces;
using MaintenanceApi.Models;
using Microsoft.EntityFrameworkCore;

namespace MaintenanceApi.Services;

public class MaintenanceRecordService : IMaintenanceRecordService
{
    private readonly AppDbContext _context;

    public MaintenanceRecordService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<MaintenanceRecordResponseDto>> GetAllAsync(
        int? machineId)
    {
        var query = _context.MaintenanceRecords
            .AsNoTracking()
            .AsQueryable();

        if (machineId.HasValue)
        {
            query = query.Where(r =>
                r.MachineId == machineId.Value);
        }

        return await query
            .OrderByDescending(r => r.MaintenanceDate)
            .Select(r => new MaintenanceRecordResponseDto
            {
                MaintenanceRecordId = r.MaintenanceRecordId,
                MachineId = r.MachineId,
                MachineName = r.Machine.MachineName,
                WorkOrderId = r.WorkOrderId,
                MaintenanceDate = r.MaintenanceDate,
                Findings = r.Findings,
                ActionsTaken = r.ActionsTaken,
                DowntimeHours = r.DowntimeHours,
                Remarks = r.Remarks
            })
            .ToListAsync();
    }

    public async Task<MaintenanceRecordResponseDto?> GetByIdAsync(int id)
    {
        return await _context.MaintenanceRecords
            .AsNoTracking()
            .Where(r => r.MaintenanceRecordId == id)
            .Select(r => new MaintenanceRecordResponseDto
            {
                MaintenanceRecordId = r.MaintenanceRecordId,
                MachineId = r.MachineId,
                MachineName = r.Machine.MachineName,
                WorkOrderId = r.WorkOrderId,
                MaintenanceDate = r.MaintenanceDate,
                Findings = r.Findings,
                ActionsTaken = r.ActionsTaken,
                DowntimeHours = r.DowntimeHours,
                Remarks = r.Remarks
            })
            .FirstOrDefaultAsync();
    }

    public async Task<MaintenanceRecordResponseDto> CreateAsync(
        MaintenanceRecordCreateDto dto)
    {
        var machineExists = await _context.Machines
            .AnyAsync(m => m.MachineId == dto.MachineId);

        if (!machineExists)
            throw new ArgumentException("Machine not found.");

        if (dto.WorkOrderId.HasValue)
        {
            var workOrder = await _context.WorkOrders
                .FirstOrDefaultAsync(w =>
                    w.WorkOrderId == dto.WorkOrderId.Value);

            if (workOrder == null)
                throw new ArgumentException("Work order not found.");

            if (workOrder.MachineId != dto.MachineId)
            {
                throw new ArgumentException(
                    "The work order does not belong to this machine.");
            }
        }

        var record = new MaintenanceRecord
        {
            MachineId = dto.MachineId,
            WorkOrderId = dto.WorkOrderId,
            MaintenanceDate = DateTime.SpecifyKind(
                dto.MaintenanceDate, DateTimeKind.Utc),
            Findings = dto.Findings,
            ActionsTaken = dto.ActionsTaken,
            DowntimeHours = dto.DowntimeHours,
            Remarks = dto.Remarks
        };

        _context.MaintenanceRecords.Add(record);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(record.MaintenanceRecordId))!;
    }
}
