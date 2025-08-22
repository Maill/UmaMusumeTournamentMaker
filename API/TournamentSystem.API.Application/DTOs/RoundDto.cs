namespace TournamentSystem.API.Application.DTOs
{
    public class RoundDto
    {
        public int Id { get; set; }
        public int RoundNumber { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsCompleted { get; set; }
        public string RoundType { get; set; } = "Regular"; // Regular, Tiebreaker, Final
        public List<MatchDto> Matches { get; set; } = new();
    }
}