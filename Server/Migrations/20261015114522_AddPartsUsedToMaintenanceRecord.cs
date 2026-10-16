using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MaintenanceApi.Migrations
{
    /// <inheritdoc />
    public partial class AddPartsUsedToMaintenanceRecord : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PartsUsed",
                table: "MaintenanceRecords",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PartsUsed",
                table: "MaintenanceRecords");
        }
    }
}
