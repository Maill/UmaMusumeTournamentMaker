using Microsoft.EntityFrameworkCore;
using TournamentSystem.API.Application.Interfaces.Repositories;
using TournamentSystem.API.Domain.Entities;
using TournamentSystem.API.Infrastructure.Data;

namespace TournamentSystem.API.Infrastructure.Repositories
{
    /// <summary>
    /// Repository implementation for Player-specific operations
    /// Handles player entity management, player opponents, and player-related queries
    /// </summary>
    public class PlayerRepository : IPlayerRepository
    {
        private readonly TournamentDbContext _context;

        public PlayerRepository(TournamentDbContext context)
        {
            _context = context;
        }

        public async Task<Player?> GetByIdAsync(int playerId)
        {
            return await _context.Players.FindAsync(playerId);
        }

        public async Task<bool> ExistsInTournamentAsync(int tournamentId, string playerName)
        {
            return await _context.Players
                .AnyAsync(p => p.TournamentId == tournamentId && 
                              p.Name.ToLower() == playerName.ToLower());
        }

        public Player AddPlayer(Player player)
        {
            _context.Players.Add(player);
            return player;
        }

        public void Remove(Player player)
        {
            _context.Players.Remove(player);
        }

        public Player Update(Player player)
        {
            _context.Players.Update(player);
            return player;
        }


        // Batch Operations

        public void AddMultipleOpponents(List<PlayerOpponent> opponents)
        {
            _context.PlayerOpponents.AddRange(opponents);
        }

        public void UpdateMultiplePlayers(List<Player> players)
        {
            _context.Players.UpdateRange(players);
        }

        public void AddMultiplePlayers(List<Player> players)
        {
            _context.Players.AddRange(players);
        }
    }
}