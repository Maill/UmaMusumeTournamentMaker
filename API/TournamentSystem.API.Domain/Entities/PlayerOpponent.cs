namespace TournamentSystem.API.Domain.Entities
{
    public class PlayerOpponent
    {
        public int Id { get; set; }
        public int PlayerId { get; set; }
        public int OpponentId { get; set; }
        
        public Player Player { get; set; } = null!;
        public Player Opponent { get; set; } = null!;
    }
}