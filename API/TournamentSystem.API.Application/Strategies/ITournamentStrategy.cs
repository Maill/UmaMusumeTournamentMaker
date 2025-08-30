using UmaMusumeTournamentMaker.API.Domain.Entities;
using UmaMusumeTournamentMaker.API.Domain.Enums;

namespace UmaMusumeTournamentMaker.API.Application.Strategies
{
    public interface ITournamentStrategy
    {
        TournamentType SupportedType { get; }

        Task CreateMatchesForRoundAsync(Tournament tournament, Round round);
        bool ShouldCompleteTournament(Tournament tournament);
        int CalculateTargetMatches(int playerCount);
        int? DetermineTournamentWinner(Tournament tournament);
    }
}