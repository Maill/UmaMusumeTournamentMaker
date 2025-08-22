using System.ComponentModel.DataAnnotations;

namespace UmaMusumeTournamerMaker.API.Application.DTOs
{
    public class BroadcastWinnerDto
    {
        [Required]
        public int TournamentId { get; set; }

        [Required]
        public int MatchId { get; set; }

        [Required]
        public int WinnerId { get; set; }
    }
}