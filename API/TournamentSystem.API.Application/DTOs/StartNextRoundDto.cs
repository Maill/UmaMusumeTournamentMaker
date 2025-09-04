using System.ComponentModel.DataAnnotations;

namespace UmaMusumeTournamentMaker.API.Application.DTOs
{
    /// <summary>
    /// DTO for starting the next round with all match winners
    /// </summary>
    public class StartNextRoundDto
    {
        /// <summary>
        /// Tournament password for authorization
        /// </summary>
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// List of match results for the current round
        /// </summary>
        [Required]
        public List<MatchResultDto> MatchResults { get; set; } = new();
    }

    /// <summary>
    /// DTO for individual match result
    /// </summary>
    public class MatchResultDto
    {
        /// <summary>
        /// Match ID
        /// </summary>
        [Required]
        public int MatchId { get; set; }

        /// <summary>
        /// Winner Player ID
        /// </summary>
        [Required]
        public int WinnerId { get; set; }
    }
}