namespace MaintenanceApi.Models;

public class User
{
    public int UserId { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string? EmployeeCode { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<WorkOrder> AssignedWorkOrders { get; set; } = new List<WorkOrder>();
    public ICollection<WorkOrder> CreatedWorkOrders { get; set; } = new List<WorkOrder>();
}