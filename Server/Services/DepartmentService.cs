using MaintenanceApi.Data;
using MaintenanceApi.DTOs.Departments;
using MaintenanceApi.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MaintenanceApi.Services;

public class DepartmentService : IDepartmentService
{
    private readonly AppDbContext _context;

    public DepartmentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<DepartmentResponseDto>> GetAllAsync()
    {
        return await _context.Departments
            .AsNoTracking()
            .OrderBy(d => d.DepartmentName)
            .Select(d => new DepartmentResponseDto
            {
                DepartmentId = d.DepartmentId,
                DepartmentCode = d.DepartmentCode,
                DepartmentName = d.DepartmentName,
                Description = d.Description,
                IsActive = d.IsActive
            })
            .ToListAsync();
    }

    public async Task<DepartmentResponseDto?> GetByIdAsync(int id)
    {
        return await _context.Departments
            .AsNoTracking()
            .Where(d => d.DepartmentId == id)
            .Select(d => new DepartmentResponseDto
            {
                DepartmentId = d.DepartmentId,
                DepartmentCode = d.DepartmentCode,
                DepartmentName = d.DepartmentName,
                Description = d.Description,
                IsActive = d.IsActive
            })
            .FirstOrDefaultAsync();
    }
}