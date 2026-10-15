using MaintenanceApi.Models;
using Microsoft.EntityFrameworkCore;

namespace MaintenanceApi.Data.Seed;

public static class DepartmentSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Departments.AnyAsync())
            return;

        context.Departments.AddRange(
            new Department
            {
                DepartmentCode = "CAR",
                DepartmentName = "Carbon Plant",
                Description = "Carbon Plant operations"
            },
            new Department
            {
                DepartmentCode = "CAST",
                DepartmentName = "Casting",
                Description = "Casting operations"
            },
            new Department
            {
                DepartmentCode = "POT",
                DepartmentName = "Potline",
                Description = "Potline operations"
            }
        );

        await context.SaveChangesAsync();
    }
}