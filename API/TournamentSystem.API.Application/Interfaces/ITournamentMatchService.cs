using UmaMusumeTournamerMaker.API.Application.DTOs;
using UmaMusumeTournamerMaker.API.Domain.Entities;

namespace UmaMusumeTournamerMaker.API.Application.Interfaces
{
    public interface ITournamentMatchService
    {
        Task<bool> ProcessMatchWinnersAsync(Round round, List<MatchResultDto> matchResults);
    }
}