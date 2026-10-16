
namespace MaintenanceApi.DTOs.MaintenanceRecords;

public class MaintenanceRecordResponseDto
{
    public int MaintenanceRecordId { get; set; }

    public int MachineId { get; set; }

    public string MachineName { get; set; } = string.Empty;

    public int? WorkOrderId { get; set; }

    public DateTime MaintenanceDate { get; set; }

    public string? Findings { get; set; }

    public string? PartsUsed { get; set; }

    public string? ActionsTaken { get; set; }

    public decimal DowntimeHours { get; set; }

    public string? Remarks { get; set; }
}
