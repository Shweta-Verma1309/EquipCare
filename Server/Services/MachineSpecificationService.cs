using MaintenanceApi.Data;
using MaintenanceApi.DTOs.MachineSpecifications;
using MaintenanceApi.Interfaces;
using MaintenanceApi.Models;
using Microsoft.EntityFrameworkCore;

namespace MaintenanceApi.Services;

public class MachineSpecificationService : IMachineSpecificationService
{
    private readonly AppDbContext _context;

    public MachineSpecificationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<MachineSpecificationDto>> GetByMachineIdAsync(int machineId)
    {
        return await _context.MachineSpecifications
            .AsNoTracking()
            .Where(s => s.MachineId == machineId)
            .OrderBy(s => s.SpecificationName)
            .Select(s => new MachineSpecificationDto
            {
                MachineSpecificationId = s.MachineSpecificationId,
                MachineId = s.MachineId,
                SpecificationName = s.SpecificationName,
                SpecificationValue = s.SpecificationValue,
                Unit = s.Unit
            })
            .ToListAsync();
    }

    public async Task<MachineSpecificationDto?> GetByIdAsync(int id)
    {
        return await _context.MachineSpecifications
            .AsNoTracking()
            .Where(s => s.MachineSpecificationId == id)
            .Select(s => new MachineSpecificationDto
            {
                MachineSpecificationId = s.MachineSpecificationId,
                MachineId = s.MachineId,
                SpecificationName = s.SpecificationName,
                SpecificationValue = s.SpecificationValue,
                Unit = s.Unit
            })
            .FirstOrDefaultAsync();
    }

    public async Task<MachineSpecificationDto?> CreateAsync(MachineSpecificationDto dto)
    {
        var machineExists = await _context.Machines
            .AnyAsync(m => m.MachineId == dto.MachineId);

        if (!machineExists)
            return null;

        var specification = new MachineSpecification
        {
            MachineId = dto.MachineId,
            SpecificationName = dto.SpecificationName.Trim(),
            SpecificationValue = dto.SpecificationValue,
            Unit = dto.Unit
        };

        _context.MachineSpecifications.Add(specification);
        await _context.SaveChangesAsync();

        dto.MachineSpecificationId = specification.MachineSpecificationId;
        dto.SpecificationName = specification.SpecificationName;

        return dto;
    }


    public async Task<MachineSpecificationDto?> UpdateAsync(
        int machineId,
        int specificationId,
        MachineSpecificationUpdateDto dto)
    {
        var specification = await _context.MachineSpecifications
            .FirstOrDefaultAsync(s =>
                s.MachineId == machineId &&
                s.MachineSpecificationId == specificationId);

        if (specification == null)
            return null;

        specification.SpecificationName = dto.SpecificationName.Trim();
        specification.SpecificationValue = dto.SpecificationValue.Trim();
        specification.Unit = dto.Unit?.Trim();

        await _context.SaveChangesAsync();

        return new MachineSpecificationDto
        {
            MachineSpecificationId = specification.MachineSpecificationId,
            MachineId = specification.MachineId,
            SpecificationName = specification.SpecificationName,
            SpecificationValue = specification.SpecificationValue,
            Unit = specification.Unit
        };
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var specification = await _context.MachineSpecifications
            .FindAsync(id);

        if (specification == null)
            return false;

        _context.MachineSpecifications.Remove(specification);
        await _context.SaveChangesAsync();

        return true;
    }
}