using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TournamentSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTournamentPassword : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Password",
                table: "Tournaments",
                type: "TEXT",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Password",
                table: "Tournaments");
        }
    }
}
