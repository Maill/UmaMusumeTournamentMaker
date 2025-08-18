using TournamentSystem.API.Application.DTOs;

namespace TournamentSystem.API.Application.Interfaces
{
    public interface ITournamentMatchService
    {
        Task<MatchDto> SetMatchWinnerAsync(int matchId, SetWinnerDto setWinnerDto);
    }
}