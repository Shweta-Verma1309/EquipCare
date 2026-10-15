namespace MaintenanceApi.Models;

public class MachineSpecification
{
    public int MachineSpecificationId { get; set; }
    public int MachineId { get; set; }

    public string SpecificationName { get; set; } = "";
    public string? SpecificationValue { get; set; }
    public string? Unit { get; set; }

    public Machine Machine { get; set; } = null!;
}