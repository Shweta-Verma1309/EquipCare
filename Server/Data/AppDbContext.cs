using Microsoft.EntityFrameworkCore;
using MaintenanceApi.Models;

namespace MaintenanceApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Machine> Machines => Set<Machine>();
    public DbSet<MachineCategory> MachineCategories => Set<MachineCategory>();
    public DbSet<MachineSpecification> MachineSpecifications => Set<MachineSpecification>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<MaintenancePlan> MaintenancePlans => Set<MaintenancePlan>();
    public DbSet<WorkOrder> WorkOrders => Set<WorkOrder>();
    public DbSet<MaintenanceTask> MaintenanceTasks => Set<MaintenanceTask>();
    public DbSet<MaintenanceRecord> MaintenanceRecords => Set<MaintenanceRecord>();
    public DbSet<WorkOrderStatusHistory> WorkOrderStatusHistory => Set<WorkOrderStatusHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<UserRole>()
            .HasKey(ur => new { ur.UserId, ur.RoleId });

        modelBuilder.Entity<RolePermission>()
            .HasKey(rp => new { rp.RoleId, rp.PermissionId });

        modelBuilder.Entity<Department>()
            .HasIndex(d => d.DepartmentCode).IsUnique();

        modelBuilder.Entity<Machine>()
            .HasIndex(m => m.AssetCode).IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email).IsUnique();

        modelBuilder.Entity<Machine>()
            .HasOne(m => m.Department)
            .WithMany(d => d.Machines)
            .HasForeignKey(m => m.DepartmentId);

        modelBuilder.Entity<Machine>()
            .HasOne(m => m.MachineCategory)
            .WithMany(c => c.Machines)
            .HasForeignKey(m => m.MachineCategoryId);

        modelBuilder.Entity<WorkOrder>()
            .HasOne(w => w.AssignedToUser)
            .WithMany(u => u.AssignedWorkOrders)
            .HasForeignKey(w => w.AssignedToUserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<WorkOrder>()
            .HasOne(w => w.CreatedByUser)
            .WithMany(u => u.CreatedWorkOrders)
            .HasForeignKey(w => w.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<WorkOrder>()
            .HasOne(w => w.MaintenancePlan)
            .WithMany(p => p.WorkOrders)
            .HasForeignKey(w => w.MaintenancePlanId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<MaintenanceRecord>()
            .HasOne(r => r.WorkOrder)
            .WithMany()
            .HasForeignKey(r => r.WorkOrderId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<MachineSpecification>()
            .Property(s => s.SpecificationValue)
            .HasMaxLength(500);

        modelBuilder.Entity<MaintenanceRecord>()
            .Property(r => r.DowntimeHours)
            .HasPrecision(10, 2);
    }
}