using UmaMusumeTournamentMaker.API.Application.DTOs;
using UmaMusumeTournamentMaker.API.Domain.Entities;

namespace UmaMusumeTournamentMaker.API.Application.Interfaces
{
    public interface ITournamentMatchService
    {
        bool ProcessMatchWinners(Round round, List<MatchResultDto> matchResults);
    }
}