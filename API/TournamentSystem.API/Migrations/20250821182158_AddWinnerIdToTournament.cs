using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TournamentSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class AddWinnerIdToTournament : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "WinnerId",
                table: "Tournaments",
                type: "INTEGER",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WinnerId",
                table: "Tournaments");
        }
    }
}
