using UmaMusumeTournamentMaker.API.Domain.Entities;

namespace UmaMusumeTournamentMaker.API.Application.Interfaces.Repositories
{
    /// <summary>
    /// Repository interface for Player-specific operations
    /// Handles player entity CRUD, player opponents, and player-related queries
    /// </summary>
    public interface IPlayerRepository
    {

        /// <summary>
        /// Gets a player by ID
        /// </summary>
        Task<Player?> GetByIdAsync(int playerId);

        /// <summary>
        /// Checks if a player with the given name exists in a tournament
        /// </summary>
        Task<bool> ExistsInTournamentAsync(int tournamentId, string playerName);

        /// <summary>
        /// Adds a new player to a tournament
        /// </summary>
        Player AddPlayer(Player player);

        /// <summary>
        /// Removes a player from a tournament
        /// </summary>
        void Remove(Player player);

        /// <summary>
        /// Updates an existing player
        /// </summary>
        Player Update(Player player);


        // Batch Operations

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