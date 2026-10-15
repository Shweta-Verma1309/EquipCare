
namespace MaintenanceApi.DTOs.MaintenancePlans;

public class MaintenancePlanCreateDto
{
    public int MachineId { get; set; }
    public string PlanName { get; set; } = "";
    public string MaintenanceType { get; set; } = "";
    public int FrequencyInterval { get; set; }
    public string FrequencyUnit { get; set; } = "";
    public DateTime StartDate { get; set; }
    public DateTime NextDueDate { get; set; }
}
