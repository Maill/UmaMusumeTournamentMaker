using Microsoft.AspNetCore.Mvc;
using TournamentSystem.API.Application.DTOs;
using TournamentSystem.API.Application.Interfaces;

namespace TournamentSystem.API.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MatchesController : ControllerBase
    {
        private readonly ITournamentMatchService _tournamentMatchService;

        public MatchesController(ITournamentMatchService tournamentMatchService)
        {
            _tournamentMatchService = tournamentMatchService;
        }

        [HttpPut("{id}/winner")]
        public async Task<ActionResult<MatchDto>> SetMatchWinner(int id, SetWinnerDto setWinnerDto)
        {
            try
            {
                var match = await _tournamentMatchService.SetMatchWinnerAsync(id, setWinnerDto);
                return Ok(match);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}