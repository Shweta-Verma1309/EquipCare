namespace MaintenanceApi.Models;

public class MachineCategory
{
    public int MachineCategoryId { get; set; }
    public string CategoryName { get; set; } = "";
    public string? Description { get; set; }

    public ICollection<Machine> Machines { get; set; } = new List<Machine>();
}