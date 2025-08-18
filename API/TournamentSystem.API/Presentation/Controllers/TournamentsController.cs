using Microsoft.AspNetCore.Mvc;
using TournamentSystem.API.Application.DTOs;
using TournamentSystem.API.Application.Interfaces;

namespace TournamentSystem.API.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TournamentsController : ControllerBase
    {
        private readonly ITournamentService _tournamentService;

        public TournamentsController(ITournamentService tournamentService)
        {
            _tournamentService = tournamentService;
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
        public async Task<ActionResult<TournamentDto>> AddPlayer(int id, AddPlayerDto addPlayerDto)
        {
            try
            {
                var tournament = await _tournamentService.AddPlayerAsync(id, addPlayerDto);
                return Ok(tournament);
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
        public async Task<ActionResult<TournamentDto>> StartTournament(int id, StartTournamentDto startTournamentDto)
        {
            try
            {
                var tournament = await _tournamentService.StartTournamentAsync(id, startTournamentDto);
                return Ok(tournament);
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
        public async Task<ActionResult<RoundDto>> StartNextRound(int id)
        {
            try
            {
                var round = await _tournamentService.StartNextRoundAsync(id);
                return Ok(round);
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
    }
}