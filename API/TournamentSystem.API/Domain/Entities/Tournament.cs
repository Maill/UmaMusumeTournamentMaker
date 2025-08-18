using TournamentSystem.API.Domain.Enums;

namespace TournamentSystem.API.Domain.Entities
{
    public class Tournament
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public TournamentType Type { get; set; }
        public TournamentStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int CurrentRound { get; set; }
        public string? Password { get; set; }
        
        public ICollection<Player> Players { get; set; } = new List<Player>();
        public ICollection<Round> Rounds { get; set; } = new List<Round>();
    }
}