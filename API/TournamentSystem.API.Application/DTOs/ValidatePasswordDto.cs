using System.ComponentModel.DataAnnotations;

namespace TournamentSystem.API.Application.DTOs
{
    public class ValidatePasswordDto
    {
        [Required]
        public string Password { get; set; } = string.Empty;
    }
}