using System.ComponentModel.DataAnnotations;

namespace UmaMusumeTournamerMaker.API.Application.DTOs
{
    public class ValidatePasswordDto
    {
        [Required]
        public string Password { get; set; } = string.Empty;
    }
}