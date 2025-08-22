namespace UmaMusumeTournamerMaker.API.Application.DTOs
{
    public class PlayerDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Wins { get; set; }
        public int Losses { get; set; }
        public int Points { get; set; }
        public int RoundWins { get; set; }
        public int RoundLosses { get; set; }
        public string Group { get; set; } = string.Empty;
        public double WinRate { get; set; }
        public int TotalMatches { get; set; }
        public int RoundMatches { get; set; }
    }
}