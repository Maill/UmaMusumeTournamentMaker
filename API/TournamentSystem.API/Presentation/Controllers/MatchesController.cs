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

        [HttpPost("broadcast-winner")]
        public async Task<ActionResult> BroadcastWinnerSelection([FromBody] BroadcastWinnerDto broadcastWinnerDto)
        {
            try
            {
                // Simply broadcast the winner selection - no database updates, no password validation
                await _broadcastService.BroadcastWinnerSelection(broadcastWinnerDto.TournamentId, broadcastWinnerDto.MatchId, broadcastWinnerDto.WinnerId);
                return Ok(new { message = "Winner selection broadcasted successfully" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Failed to broadcast winner selection" });
            }
        }
    }
}