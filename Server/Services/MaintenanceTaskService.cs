
using MaintenanceApi.Data;
using MaintenanceApi.DTOs.MaintenanceTasks;
using MaintenanceApi.Interfaces;
using MaintenanceApi.Models;
using Microsoft.EntityFrameworkCore;

namespace MaintenanceApi.Services;

public class MaintenanceTaskService : IMaintenanceTaskService
{
    private readonly AppDbContext _context;

    public MaintenanceTaskService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<MaintenanceTaskResponseDto>>
        GetByWorkOrderIdAsync(int workOrderId)
    {
        return await _context.MaintenanceTasks
            .AsNoTracking()
            .Where(t => t.WorkOrderId == workOrderId)
            .Select(t => new MaintenanceTaskResponseDto
            {
                MaintenanceTaskId = t.MaintenanceTaskId,
                WorkOrderId = t.WorkOrderId,
                TaskName = t.TaskName,
                Instructions = t.Instructions,
                Status = t.Status,
                Remarks = t.Remarks,
                CompletedAt = t.CompletedAt
            })
            .ToListAsync();
    }

    public async Task<MaintenanceTaskResponseDto> CreateAsync(
        int workOrderId,
        MaintenanceTaskCreateDto dto)
    {
        var workOrderExists = await _context.WorkOrders
            .AnyAsync(w => w.WorkOrderId == workOrderId);

        if (!workOrderExists)
            throw new ArgumentException("Work order not found.");

        var task = new MaintenanceTask
        {
            WorkOrderId = workOrderId,
            TaskName = dto.TaskName.Trim(),
            Instructions = dto.Instructions,
            Status = "Pending"
        };

        _context.MaintenanceTasks.Add(task);
        await _context.SaveChangesAsync();

        return new MaintenanceTaskResponseDto
        {
            MaintenanceTaskId = task.MaintenanceTaskId,
            WorkOrderId = task.WorkOrderId,
            TaskName = task.TaskName,
            Instructions = task.Instructions,
            Status = task.Status,
            Remarks = task.Remarks,
            CompletedAt = task.CompletedAt
        };
    }

    public async Task<bool> UpdateStatusAsync(
        int taskId,
        MaintenanceTaskUpdateDto dto)
    {
        var task = await _context.MaintenanceTasks
            .FirstOrDefaultAsync(t =>
                t.MaintenanceTaskId == taskId);

        if (task == null)
            return false;

        var allowedStatuses = new[]
        {
            "Pending",
            "In Progress",
            "Completed",
            "Skipped"
        };

        if (!allowedStatuses.Contains(dto.Status))
            throw new ArgumentException("Invalid task status.");

        task.Status = dto.Status;
        task.Remarks = dto.Remarks;

        task.CompletedAt = dto.Status == "Completed"
            ? DateTime.UtcNow
            : null;

        await _context.SaveChangesAsync();

        return true;
    }



    public async Task<MaintenanceTaskResponseDto?> UpdateAsync(
        int id,
        MaintenanceTaskDetailsUpdateDto dto)
    {
        var task = await _context.MaintenanceTasks.FindAsync(id);

        if (task == null)
            return null;

        if (task.Status is "Completed" or "Skipped")
            throw new InvalidOperationException(
                "Completed or skipped tasks cannot be edited.");

        task.TaskName = dto.TaskName.Trim();
        task.Instructions = dto.Instructions?.Trim();
        task.Remarks = dto.Remarks?.Trim();

        await _context.SaveChangesAsync();

        return new MaintenanceTaskResponseDto
        {
            MaintenanceTaskId = task.MaintenanceTaskId,
            WorkOrderId = task.WorkOrderId,
            TaskName = task.TaskName,
            Instructions = task.Instructions,
            Status = task.Status,
            Remarks = task.Remarks,
            CompletedAt = task.CompletedAt
        };
    }

}
