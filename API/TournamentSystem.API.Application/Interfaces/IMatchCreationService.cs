using UmaMusumeTournamerMaker.API.Domain.Entities;

namespace UmaMusumeTournamerMaker.API.Application.Interfaces
{
    /// <summary>
    /// Service interface for match creation operations
    /// Handles the creation of matches and assignment of players
    /// </summary>
    public interface IMatchCreationService
    {
        /// <summary>
        /// Creates a single match with the specified players in the given round
        /// Handles both match creation and player assignment
        /// </summary>
        Task CreateSingleMatchAsync(Round round, List<Player> players);

        /// <summary>
        /// Creates multiple matches from a list of player groups
        /// Each group should contain 3 players for a single match
        /// </summary>
        Task CreateMatchesAsync(Round round, IEnumerable<List<Player>> playerGroups);
    }
}