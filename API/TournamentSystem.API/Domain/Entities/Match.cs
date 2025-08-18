namespace TournamentSystem.API.Domain.Entities
{
    public class Match
    {
        public int Id { get; set; }
        public int RoundId { get; set; }
        public int? WinnerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        
        public Round Round { get; set; } = null!;
        public Player? Winner { get; set; }
        public ICollection<MatchPlayer> MatchPlayers { get; set; } = new List<MatchPlayer>();
    }
}