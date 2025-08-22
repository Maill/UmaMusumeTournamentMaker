using UmaMusumeTournamerMaker.API.Domain.Entities;
using UmaMusumeTournamerMaker.API.Domain.Enums;

namespace UmaMusumeTournamerMaker.API.Application.Strategies
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