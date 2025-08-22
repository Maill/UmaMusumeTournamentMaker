namespace UmaMusumeTournamentMaker.API.Domain.Entities
{
    public class Round
    {
        public int Id { get; set; }
        public int RoundNumber { get; set; }
        public int TournamentId { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsCompleted { get; set; }
        public string RoundType { get; set; } = "Regular"; // Regular, Tiebreaker, Final

        public Tournament Tournament { get; set; } = null!;
        public ICollection<Match> Matches { get; set; } = new List<Match>();
    }
}