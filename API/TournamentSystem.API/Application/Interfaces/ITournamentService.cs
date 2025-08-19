using TournamentSystem.API.Application.DTOs;

namespace TournamentSystem.API.Application.Interfaces
{
    public interface ITournamentService
    {
        Task<List<TournamentDto>> GetAllTournamentsAsync();
        Task<TournamentDto?> GetTournamentByIdAsync(int id);
        Task<TournamentDto> CreateTournamentAsync(CreateTournamentDto createTournamentDto);
        Task<PlayerDto> AddPlayerAsync(int tournamentId, AddPlayerDto addPlayerDto);
        Task<int> RemovePlayerAsync(RemovePlayerDto removePlayerDto);
        Task<TournamentDto> StartTournamentAsync(int tournamentId, StartTournamentDto startTournamentDto);
        Task<TournamentDto> StartNextRoundAsync(int tournamentId);
        Task<TournamentDto> GetTournamentWithCurrentRoundAsync(int tournamentId);
        Task<TournamentDto> UpdateTournamentAsync(int tournamentId, UpdateTournamentDto updateTournamentDto);
        Task<bool> DeleteTournamentAsync(int tournamentId, DeleteTournamentDto deleteTournamentDto);
    }
}