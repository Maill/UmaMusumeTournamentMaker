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
        private readonly ITournamentBroadcastService _broadcastService;

        public MatchesController(ITournamentMatchService tournamentMatchService, ITournamentBroadcastService broadcastService)
        {
            _tournamentMatchService = tournamentMatchService;
            _broadcastService = broadcastService;
        }

        [HttpPut("{id}/winner")]
        public async Task<ActionResult> SetMatchWinner(int id, SetWinnerDto setWinnerDto)
        {
            try
            {
                var (match, tournamentId) = await _tournamentMatchService.SetMatchWinnerAsync(id, setWinnerDto);
                await _broadcastService.BroadcastMatchUpdated(tournamentId, match);
                return Ok(new { message = "Match winner set successfully" });
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