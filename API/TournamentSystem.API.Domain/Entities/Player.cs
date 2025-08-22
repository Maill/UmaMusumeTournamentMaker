namespace UmaMusumeTournamentMaker.API.Domain.Entities
{
    public class Player
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Wins { get; set; }
        public int Losses { get; set; }
        public int Points { get; set; }
        public int RoundWins { get; set; }
        public int RoundLosses { get; set; }
        public string Group { get; set; } = string.Empty;
        public int TournamentId { get; set; }

        public Tournament Tournament { get; set; } = null!;
        public ICollection<MatchPlayer> MatchPlayers { get; set; } = new List<MatchPlayer>();
        public ICollection<PlayerOpponent> PlayerOpponents { get; set; } = new List<PlayerOpponent>();

        public double WinRate => Wins + Losses == 0 ? 0 : (double)Wins / (Wins + Losses);
        public int TotalMatches => Wins + Losses;
        public int RoundMatches => RoundWins + RoundLosses;
    }
}