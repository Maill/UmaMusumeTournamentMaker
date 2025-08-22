using TournamentSystem.API.Domain.Entities;

namespace TournamentSystem.API.Application.Interfaces.Repositories
{
    /// <summary>
    /// Repository interface for Round-specific operations
    /// Handles round entity CRUD and round-related queries
    /// </summary>
    public interface IRoundRepository
    {

        /// <summary>
        /// Creates a new round
        /// </summary>
        Round Create(Round round);

        /// <summary>
        /// Updates an existing round
        /// </summary>
        Round Update(Round round);


        // Batch Operations
        
        /// <summary>
        /// Updates multiple rounds in a single transaction
        /// </summary>
        void UpdateMultipleRounds(List<Round> rounds);
    }
}