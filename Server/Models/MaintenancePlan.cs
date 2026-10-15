namespace MaintenanceApi.Models;

public class MaintenancePlan
{
    public int MaintenancePlanId { get; set; }
    public int MachineId { get; set; }

    public string PlanName { get; set; } = "";
    public string MaintenanceType { get; set; } = "Preventive";
    public int FrequencyInterval { get; set; } = 1;
    public string FrequencyUnit { get; set; } = "Month";

    public DateTime StartDate { get; set; }
    public DateTime? NextDueDate { get; set; }
    public bool IsActive { get; set; } = true;

    public Machine Machine { get; set; } = null!;
    public ICollection<WorkOrder> WorkOrders { get; set; } = new List<WorkOrder>();
}