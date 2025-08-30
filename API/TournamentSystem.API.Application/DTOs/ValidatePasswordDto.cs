using System.ComponentModel.DataAnnotations;

namespace UmaMusumeTournamentMaker.API.Application.DTOs
{
    public class ValidatePasswordDto
    {
        [Required]
        public string Password { get; set; } = string.Empty;
    }
}