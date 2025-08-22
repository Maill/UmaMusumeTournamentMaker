using UmaMusumeTournamentMaker.API.Application.DTOs;

namespace UmaMusumeTournamentMaker.API.Application.Interfaces
{
    public interface ITournamentService
    {
        Task<List<TournamentDto>> GetAllTournamentsAsync();
        Task<TournamentDto?> GetTournamentByIdAsync(int id);
        Task<TournamentDto> CreateTournamentAsync(CreateTournamentDto createTournamentDto);
        Task<PlayerDto> AddPlayerAsync(int tournamentId, AddPlayerDto addPlayerDto);
        Task<int> RemovePlayerAsync(RemovePlayerDto removePlayerDto);
        Task<TournamentDto> StartTournamentAsync(int tournamentId, StartTournamentDto startTournamentDto);
        Task<TournamentDto> StartNextRoundAsync(int tournamentId, StartNextRoundDto startNextRoundDto);
        Task<TournamentDto> GetTournamentWithCurrentRoundAsync(int tournamentId);
        Task<TournamentDto> UpdateTournamentAsync(int tournamentId, UpdateTournamentDto updateTournamentDto);
        Task<bool> DeleteTournamentAsync(int tournamentId, DeleteTournamentDto deleteTournamentDto);
        Task<bool> ValidatePasswordAsync(int tournamentId, string password);
    }
}