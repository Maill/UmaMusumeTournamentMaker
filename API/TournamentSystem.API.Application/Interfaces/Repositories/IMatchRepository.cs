using UmaMusumeTournamentMaker.API.Domain.Entities;

namespace UmaMusumeTournamentMaker.API.Application.Interfaces.Repositories
{
    /// <summary>
    /// Repository interface for Match-specific operations
    /// Handles match entity CRUD, match players, and match-related queries
    /// </summary>
    public interface IMatchRepository
    {
        /// <summary>
        /// Gets match by ID with complete details (players, winner, round, tournament)
        /// </summary>
        Task<Match?> GetByIdWithCompleteDetailsAsync(int id);

        /// <summary>
        /// Creates a new match
        /// </summary>
        Match Create(Match match);

        /// <summary>
        /// Updates an existing match
        /// </summary>
        Match Update(Match match);


        // Batch Operations

        /// <summary>
        /// Adds multiple match players in a single transaction
        /// </summary>
        void AddMultipleMatchPlayers(List<MatchPlayer> matchPlayers);

        /// <summary>
        /// Updates multiple matches in a single transaction
        /// </summary>
        void UpdateMultipleMatches(List<Match> matches);
    }
}