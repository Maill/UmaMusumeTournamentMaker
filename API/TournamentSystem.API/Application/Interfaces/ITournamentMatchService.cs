using TournamentSystem.API.Application.DTOs;

namespace TournamentSystem.API.Application.Interfaces
{
    public interface ITournamentMatchService
    {
        Task<(MatchDto Match, int TournamentId)> SetMatchWinnerAsync(int matchId, SetWinnerDto setWinnerDto);
    }
}