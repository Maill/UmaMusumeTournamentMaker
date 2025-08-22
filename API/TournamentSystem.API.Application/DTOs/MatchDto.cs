namespace UmaMusumeTournamerMaker.API.Application.DTOs
{
    public class MatchDto
    {
        public int Id { get; set; }
        public int RoundId { get; set; }
        public int? WinnerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public List<PlayerDto> Players { get; set; } = new();
        public PlayerDto? Winner { get; set; }
    }

    public class SetWinnerDto
    {
        public int WinnerId { get; set; }
        public string? Password { get; set; }
    }
}