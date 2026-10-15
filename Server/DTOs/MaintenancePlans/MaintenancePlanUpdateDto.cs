
using System.ComponentModel.DataAnnotations;

namespace MaintenanceApi.DTOs.MaintenancePlans;

public class MaintenancePlanUpdateDto
{
    [Required]
    [MaxLength(150)]
    public string PlanName { get; set; } = "";

    [Required]
    public string MaintenanceType { get; set; } = "";

    [Range(1, 1000)]
    public int FrequencyInterval { get; set; }

    [Required]
    public string FrequencyUnit { get; set; } = "";

    public DateTime StartDate { get; set; }
    public DateTime NextDueDate { get; set; }
}
