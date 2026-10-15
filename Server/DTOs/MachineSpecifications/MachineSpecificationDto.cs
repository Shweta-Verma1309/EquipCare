namespace MaintenanceApi.DTOs.MachineSpecifications;

public class MachineSpecificationDto
{
    public int MachineSpecificationId { get; set; }
    public int MachineId { get; set; }
    public string SpecificationName { get; set; } = "";
    public string? SpecificationValue { get; set; }
    public string? Unit { get; set; }
}