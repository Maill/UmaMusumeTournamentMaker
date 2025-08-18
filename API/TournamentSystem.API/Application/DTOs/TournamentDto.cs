using TournamentSystem.API.Domain.Enums;

namespace TournamentSystem.API.Application.DTOs
{
    public class TournamentDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public TournamentType Type { get; set; }
        public TournamentStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int CurrentRound { get; set; }
        public List<PlayerDto> Players { get; set; } = new();
        public List<RoundDto> Rounds { get; set; } = new();
    }

    public class CreateTournamentDto
    {
        public string Name { get; set; } = string.Empty;
        public TournamentType Type { get; set; }
        public string? Password { get; set; }
    }

    public class AddPlayerDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Password { get; set; }
    }

    public class UpdateTournamentDto
    {
        public string Name { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class DeleteTournamentDto
    {
        public string Password { get; set; } = string.Empty;
    }

    public class StartTournamentDto
    {
        public string? Password { get; set; }
    }
}