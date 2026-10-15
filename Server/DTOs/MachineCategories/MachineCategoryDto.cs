
namespace MaintenanceApi.DTOs.MachineCategories;

public class MachineCategoryDto
{
    public int MachineCategoryId { get; set; }
    public string CategoryName { get; set; } = "";
    public string? Description { get; set; }
}