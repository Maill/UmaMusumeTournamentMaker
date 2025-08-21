using TournamentSystem.API.Application.DTOs;
using TournamentSystem.API.Domain.Entities;

namespace TournamentSystem.API.Application.Interfaces
{
    public interface ITournamentMatchService
    {
        Task<bool> ProcessMatchWinnersAsync(Round round, List<MatchResultDto> matchResults);
    }
}