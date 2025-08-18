using TournamentSystem.API.Domain.Entities;
using TournamentSystem.API.Domain.Enums;

namespace TournamentSystem.API.Application.Strategies
{
    public interface ITournamentStrategy
    {
        TournamentType SupportedType { get; }
        
        Task CreateMatchesForRoundAsync(Tournament tournament, Round round);
        bool ShouldCompleteTournament(Tournament tournament);
        int CalculateTargetMatches(int playerCount);
    }
}