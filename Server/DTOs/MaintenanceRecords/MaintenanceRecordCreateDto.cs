
using System.ComponentModel.DataAnnotations;

namespace MaintenanceApi.DTOs.MaintenanceRecords;

public class MaintenanceRecordCreateDto
{
    [Required]
    public int MachineId { get; set; }

    public int? WorkOrderId { get; set; }

    [Required]
    public DateTime MaintenanceDate { get; set; }

    public string? Findings { get; set; }

    public string? PartsUsed { get; set; }

    public string? ActionsTaken { get; set; }

    [Range(0, 100000)]
    public decimal DowntimeHours { get; set; }

    public string? Remarks { get; set; }
}
