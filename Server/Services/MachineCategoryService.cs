using MaintenanceApi.Data;
using MaintenanceApi.DTOs.MachineCategories;
using MaintenanceApi.Interfaces;
using MaintenanceApi.Models;
using Microsoft.EntityFrameworkCore;

namespace MaintenanceApi.Services;

public class MachineCategoryService : IMachineCategoryService
{
    private readonly AppDbContext _context;

    public MachineCategoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<MachineCategoryDto>> GetAllAsync()
    {
        return await _context.MachineCategories
            .AsNoTracking()
            .OrderBy(c => c.CategoryName)
            .Select(c => new MachineCategoryDto
            {
                MachineCategoryId = c.MachineCategoryId,
                CategoryName = c.CategoryName,
                Description = c.Description
            })
            .ToListAsync();
    }

    public async Task<MachineCategoryDto?> GetByIdAsync(int id)
    {
        return await _context.MachineCategories
            .AsNoTracking()
            .Where(c => c.MachineCategoryId == id)
            .Select(c => new MachineCategoryDto
            {
                MachineCategoryId = c.MachineCategoryId,
                CategoryName = c.CategoryName,
                Description = c.Description
            })
            .FirstOrDefaultAsync();
    }

    public async Task<MachineCategoryDto> CreateAsync(MachineCategoryDto dto)
    {
        var category = new MachineCategory
        {
            CategoryName = dto.CategoryName.Trim(),
            Description = dto.Description
        };

        _context.MachineCategories.Add(category);
        await _context.SaveChangesAsync();

        dto.MachineCategoryId = category.MachineCategoryId;
        dto.CategoryName = category.CategoryName;

        return dto;
    }



    public async Task<MachineCategoryDto?> UpdateAsync(
        int id,
        MachineCategoryUpdateDto dto)
    {
        var category = await _context.MachineCategories
            .FirstOrDefaultAsync(c => c.MachineCategoryId == id);

        if (category == null)
            return null;

        var name = dto.CategoryName.Trim();

        var duplicate = await _context.MachineCategories
            .AnyAsync(c =>
                c.MachineCategoryId != id &&
                c.CategoryName.ToLower() == name.ToLower());

        if (duplicate)
            throw new InvalidOperationException(
                "A machine category with this name already exists.");

        category.CategoryName = name;
        category.Description = dto.Description?.Trim();

        await _context.SaveChangesAsync();

        return new MachineCategoryDto
        {
            MachineCategoryId = category.MachineCategoryId,
            CategoryName = category.CategoryName,
            Description = category.Description
        };
    }

    // public async Task<bool> DeactivateAsync(int id)
    // {
    //     var category = await _context.MachineCategories
    //         .FirstOrDefaultAsync(c => c.MachineCategoryId == id);

    //     if (category == null)
    //         return false;

    //     // Don't deactivate a category currently used by active machines.
    //     var hasActiveMachines = await _context.Machines
    //         .AnyAsync(m =>
    //             m.MachineCategoryId == id &&
    //             m.IsActive);

    //     if (hasActiveMachines)
    //         throw new InvalidOperationException(
    //             "Cannot deactivate a category used by active machines.");

    //     category.IsActive = false;

    //     await _context.SaveChangesAsync();

    //     return true;
    // }

}