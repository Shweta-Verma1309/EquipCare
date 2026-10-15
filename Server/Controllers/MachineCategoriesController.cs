using MaintenanceApi.DTOs.MachineCategories;
using MaintenanceApi.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MaintenanceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MachineCategoriesController : ControllerBase
{
    private readonly IMachineCategoryService _service;

    public MachineCategoriesController(IMachineCategoryService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var category = await _service.GetByIdAsync(id);

        if (category == null)
            return NotFound(new { message = "Category not found." });

        return Ok(category);
    }

    [HttpPost]
    public async Task<IActionResult> Create(MachineCategoryDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.CategoryName))
            return BadRequest(new { message = "Category name is required." });

        var category = await _service.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { id = category.MachineCategoryId },
            category);
    }


    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        MachineCategoryUpdateDto dto)
    {
        try
        {
            var category = await _service.UpdateAsync(id, dto);

            if (category == null)
                return NotFound();

            return Ok(category);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // [HttpPatch("{id:int}/deactivate")]
    // public async Task<IActionResult> Deactivate(int id)
    // {
    //     try
    //     {
    //         var success = await _machineCategoryService.DeactivateAsync(id);

    //         if (!success)
    //             return NotFound();

    //         return NoContent();
    //     }
    //     catch (InvalidOperationException ex)
    //     {
    //         return BadRequest(new { message = ex.Message });
    //     }
    // }

}