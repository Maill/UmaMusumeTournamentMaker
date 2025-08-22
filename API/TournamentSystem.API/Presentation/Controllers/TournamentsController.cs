using Microsoft.AspNetCore.Mvc;
using UmaMusumeTournamerMaker.API.Application.DTOs;
using UmaMusumeTournamerMaker.API.Application.Interfaces;

namespace UmaMusumeTournamerMaker.API.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TournamentsController : ControllerBase
    {
        private readonly ITournamentService _tournamentService;
        private readonly ITournamentBroadcastService _broadcastService;

        public TournamentsController(ITournamentService tournamentService, ITournamentBroadcastService broadcastService)
        {
            _tournamentService = tournamentService;
            _broadcastService = broadcastService;
        }

        [HttpGet]
        public async Task<ActionResult<List<TournamentDto>>> GetAllTournaments()
        {
            try
            {
                var tournaments = await _tournamentService.GetAllTournamentsAsync();
                return Ok(tournaments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TournamentDto>> GetTournament(int id)
        {
            try
            {
                var tournament = await _tournamentService.GetTournamentByIdAsync(id);
                if (tournament == null)
                    return NotFound(new { message = "Tournament not found" });

                return Ok(tournament);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("{id}/current-round")]
        public async Task<ActionResult<TournamentDto>> GetTournamentWithCurrentRound(int id)
        {
            try
            {
                var tournament = await _tournamentService.GetTournamentWithCurrentRoundAsync(id);
                return Ok(tournament);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<TournamentDto>> CreateTournament(CreateTournamentDto createTournamentDto)
        {
            try
            {
                var tournament = await _tournamentService.CreateTournamentAsync(createTournamentDto);
                return CreatedAtAction(nameof(GetTournament), new { id = tournament.Id }, tournament);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("{id}/players")]
        public async Task<ActionResult> AddPlayer(int id, AddPlayerDto addPlayerDto)
        {
            try
            {
                var addedPlayer = await _tournamentService.AddPlayerAsync(id, addPlayerDto);
                await _broadcastService.BroadcastPlayerAdded(id, addedPlayer);
                return Ok(new { message = "Player added successfully" });
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

        [HttpDelete("players")]
        public async Task<ActionResult> RemovePlayer(RemovePlayerDto removePlayerDto)
        {
            try
            {
                var removedPlayerId = await _tournamentService.RemovePlayerAsync(removePlayerDto);
                await _broadcastService.BroadcastPlayerRemoved(removePlayerDto.TournamentId, removedPlayerId);
                return Ok(new { message = "Player removed successfully" });
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

        [HttpPost("{id}/start")]
        public async Task<ActionResult> StartTournament(int id, StartTournamentDto startTournamentDto)
        {
            try
            {
                var tournament = await _tournamentService.StartTournamentAsync(id, startTournamentDto);
                await _broadcastService.BroadcastTournamentStarted(id, tournament);
                return Ok(new { message = "Tournament started successfully" });
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

        [HttpPost("{id}/next-round")]
        public async Task<ActionResult> StartNextRound(int id, StartNextRoundDto startNextRoundDto)
        {
            try
            {
                var tournament = await _tournamentService.StartNextRoundAsync(id, startNextRoundDto);
                await _broadcastService.BroadcastNewRound(id, tournament);
                return Ok(new { message = "Next round started successfully" });
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<TournamentDto>> UpdateTournament(int id, UpdateTournamentDto updateTournamentDto)
        {
            try
            {
                var tournament = await _tournamentService.UpdateTournamentAsync(id, updateTournamentDto);
                return Ok(tournament);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
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

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteTournament(int id, DeleteTournamentDto deleteTournamentDto)
        {
            try
            {
                var result = await _tournamentService.DeleteTournamentAsync(id, deleteTournamentDto);
                if (!result)
                    return NotFound(new { message = "Tournament not found" });

                return NoContent();
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

        [HttpPost("{id}/validate-password")]
        public async Task<ActionResult> ValidatePassword(int id, ValidatePasswordDto validatePasswordDto)
        {
            try
            {
                var isValid = await _tournamentService.ValidatePasswordAsync(id, validatePasswordDto.Password);

                if (isValid)
                {
                    return Ok(new { message = "Password is valid", isValid = true });
                }
                else
                {
                    return Unauthorized(new { message = "Invalid password", isValid = false });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, isValid = false });
            }
        }
    }
}