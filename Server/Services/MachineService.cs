using MaintenanceApi.Data;
using MaintenanceApi.DTOs.Machines;
using MaintenanceApi.Interfaces;
using MaintenanceApi.Models;
using Microsoft.EntityFrameworkCore;

namespace MaintenanceApi.Services;

public class MachineService : IMachineService
{
    private readonly AppDbContext _context;

    public MachineService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<MachineResponseDto>> GetAllAsync(
        int? departmentId,
        string? status,
        string? search)
    {
        var query = _context.Machines
            .AsNoTracking()
            .Include(m => m.Department)
            .Include(m => m.MachineCategory)
            .AsQueryable();

        if (departmentId.HasValue)
            query = query.Where(m => m.DepartmentId == departmentId.Value);

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(m => m.CurrentStatus == status);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            var lowerTerm = term.ToLower();

            query = query.Where(m =>
                m.MachineName.ToLower().Contains(lowerTerm) ||
                m.AssetCode.ToLower().Contains(lowerTerm));
        }

        return await query
            .OrderBy(m => m.MachineName)
            .Select(m => new MachineResponseDto
            {
                MachineId = m.MachineId,
                AssetCode = m.AssetCode,
                MachineName = m.MachineName,
                DepartmentId = m.DepartmentId,
                DepartmentName = m.Department.DepartmentName,
                MachineCategoryId = m.MachineCategoryId,
                CategoryName = m.MachineCategory.CategoryName,
                Manufacturer = m.Manufacturer,
                ModelNumber = m.ModelNumber,
                SerialNumber = m.SerialNumber,
                InstallationDate = m.InstallationDate,
                Criticality = m.Criticality,
                CurrentStatus = m.CurrentStatus,
                Location = m.Location,
                IsActive = m.IsActive
            })
            .ToListAsync();
    }

    public async Task<MachineResponseDto?> GetByIdAsync(int id)

    {
        return await _context.Machines
            .AsNoTracking()
            .Where(m => m.MachineId == id)
            .Select(m => new MachineResponseDto
            {
                MachineId = m.MachineId,
                AssetCode = m.AssetCode,
                MachineName = m.MachineName,
                DepartmentId = m.DepartmentId,
                DepartmentName = m.Department.DepartmentName,
                MachineCategoryId = m.MachineCategoryId,
                CategoryName = m.MachineCategory.CategoryName,
                Manufacturer = m.Manufacturer,
                ModelNumber = m.ModelNumber,
                SerialNumber = m.SerialNumber,
                InstallationDate = m.InstallationDate,
                Criticality = m.Criticality,
                CurrentStatus = m.CurrentStatus,
                Location = m.Location,
                IsActive = m.IsActive
            })
            .FirstOrDefaultAsync();
    }


    public async Task<MachineResponseDto> CreateAsync(
        MachineCreateDto dto)
    {
        var assetCode = dto.AssetCode.Trim();

        if (await _context.Machines.AnyAsync(
            m => m.AssetCode == assetCode))
        {
            throw new ArgumentException("Asset code already exists.");
        }

        if (!await _context.Departments.AnyAsync(
            d => d.DepartmentId == dto.DepartmentId))
        {
            throw new ArgumentException("Department not found.");
        }

        if (!await _context.MachineCategories.AnyAsync(
            c => c.MachineCategoryId == dto.MachineCategoryId))
        {
            throw new ArgumentException("Machine category not found.");
        }

        ValidateMachineValues(dto.Criticality, dto.CurrentStatus);

        var machine = new Machine
        {
            AssetCode = assetCode,
            MachineName = dto.MachineName.Trim(),
            DepartmentId = dto.DepartmentId,
            MachineCategoryId = dto.MachineCategoryId,
            Manufacturer = dto.Manufacturer,
            ModelNumber = dto.ModelNumber,
            SerialNumber = dto.SerialNumber,
            InstallationDate = dto.InstallationDate.HasValue
            ? DateTime.SpecifyKind(
                dto.InstallationDate.Value, DateTimeKind.Utc)
            : null,
            Criticality = dto.Criticality,
            CurrentStatus = dto.CurrentStatus,
            Location = dto.Location,
            IsActive = true
        };

        _context.Machines.Add(machine);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(machine.MachineId))!;
    }

    public async Task<MachineResponseDto?> UpdateAsync(
        int id,
        MachineUpdateDto dto)
    {
        var machine = await _context.Machines
            .FirstOrDefaultAsync(m => m.MachineId == id);

        if (machine == null)
            return null;

        var assetCode = dto.AssetCode.Trim();

        if (await _context.Machines.AnyAsync(
            m => m.AssetCode == assetCode && m.MachineId != id))
        {
            throw new ArgumentException("Asset code already exists.");
        }

        if (!await _context.Departments.AnyAsync(
            d => d.DepartmentId == dto.DepartmentId))
        {
            throw new ArgumentException("Department not found.");
        }

        if (!await _context.MachineCategories.AnyAsync(
            c => c.MachineCategoryId == dto.MachineCategoryId))
        {
            throw new ArgumentException("Machine category not found.");
        }

        ValidateMachineValues(dto.Criticality, dto.CurrentStatus);

        machine.AssetCode = assetCode;
        machine.MachineName = dto.MachineName.Trim();
        machine.DepartmentId = dto.DepartmentId;
        machine.MachineCategoryId = dto.MachineCategoryId;
        machine.Manufacturer = dto.Manufacturer;
        machine.ModelNumber = dto.ModelNumber;
        machine.SerialNumber = dto.SerialNumber;
        machine.InstallationDate = dto.InstallationDate.HasValue
            ? DateTime.SpecifyKind(
                dto.InstallationDate.Value, DateTimeKind.Utc)
            : null;
        machine.Criticality = dto.Criticality;
        machine.CurrentStatus = dto.CurrentStatus;
        machine.Location = dto.Location;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        var machine = await _context.Machines
            .FirstOrDefaultAsync(m => m.MachineId == id);

        if (machine == null)
            return false;

        machine.IsActive = false;

        await _context.SaveChangesAsync();

        return true;
    }

    private static void ValidateMachineValues(
        string criticality,
        string status)
    {
        var validCriticalities = new[]
        {
        "Low", "Medium", "High", "Critical"
    };

        var validStatuses = new[]
        {
        "Operational", "Under Maintenance",
        "Breakdown", "Inactive"
    };

        if (!validCriticalities.Contains(criticality))
            throw new ArgumentException("Invalid machine criticality.");

        if (!validStatuses.Contains(status))
            throw new ArgumentException("Invalid machine status.");
    }

}