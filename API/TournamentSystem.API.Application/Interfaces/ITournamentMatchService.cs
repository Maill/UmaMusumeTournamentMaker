using UmaMusumeTournamentMaker.API.Application.DTOs;
using UmaMusumeTournamentMaker.API.Domain.Entities;

namespace UmaMusumeTournamentMaker.API.Application.Interfaces
{
    public interface ITournamentMatchService
    {
        Task<bool> ProcessMatchWinnersAsync(Round round, List<MatchResultDto> matchResults);
    }
}