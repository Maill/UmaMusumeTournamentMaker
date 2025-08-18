using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TournamentSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class FixPlayerOpponentCascadeDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PlayerOpponents_Players_OpponentId",
                table: "PlayerOpponents");

            migrationBuilder.AddForeignKey(
                name: "FK_PlayerOpponents_Players_OpponentId",
                table: "PlayerOpponents",
                column: "OpponentId",
                principalTable: "Players",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PlayerOpponents_Players_OpponentId",
                table: "PlayerOpponents");

            migrationBuilder.AddForeignKey(
                name: "FK_PlayerOpponents_Players_OpponentId",
                table: "PlayerOpponents",
                column: "OpponentId",
                principalTable: "Players",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
