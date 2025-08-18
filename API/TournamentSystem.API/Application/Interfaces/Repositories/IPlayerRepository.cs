using TournamentSystem.API.Domain.Entities;

namespace TournamentSystem.API.Application.Interfaces.Repositories
{
    /// <summary>
    /// Repository interface for Player-specific operations
    /// Handles player entity CRUD, player opponents, and player-related queries
    /// </summary>
    public interface IPlayerRepository
    {

        /// <summary>
        /// Checks if a player with the given name exists in a tournament
        /// </summary>
        Task<bool> ExistsInTournamentAsync(int tournamentId, string playerName);

        /// <summary>
        /// Adds a new player to a tournament
        /// </summary>
        Player AddPlayer(Player player);

        /// <summary>
        /// Updates an existing player
        /// </summary>
        Player Update(Player player);


        // Batch Operations
        
        /// <summary>
        /// Adds multiple opponent relationships in a single transaction
        /// Optimizes opponent tracking by avoiding multiple database calls
        /// </summary>
        void AddMultipleOpponents(List<PlayerOpponent> opponents);
        
        /// <summary>
        /// Updates multiple players' statistics in a single transaction
        /// </summary>
        void UpdateMultiplePlayers(List<Player> players);
        
        /// <summary>
        /// Adds multiple players to a tournament in a single transaction
        /// </summary>
        void AddMultiplePlayers(List<Player> players);
    }
}