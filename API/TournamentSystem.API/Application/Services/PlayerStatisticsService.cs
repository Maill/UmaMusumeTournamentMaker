using TournamentSystem.API.Application.Interfaces;
using TournamentSystem.API.Application.Extensions;
using TournamentSystem.API.Domain.Entities;

namespace TournamentSystem.API.Application.Services
{
    /// <summary>
    /// Optimized service for player statistics operations using Unit of Work and batch operations
    /// Handles win/loss statistics and opponent tracking with minimal database round trips
    /// </summary>
    public class PlayerStatisticsService : IPlayerStatisticsService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITournamentLogger _logger;

        public PlayerStatisticsService(IUnitOfWork unitOfWork, ITournamentLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        /// <summary>
        /// Records all opponents from a match for a specific player
        /// Uses batch operations for optimal performance
        /// </summary>
        public void RecordOpponents(Player player, Match match)
        {
            var opponents = match.MatchPlayers
                .Where(mp => mp.PlayerId != player.Id)
                .Select(opponent => new PlayerOpponent
                {
                    PlayerId = player.Id,
                    OpponentId = opponent.PlayerId
                })
                .ToList();

            if (opponents.Any())
            {
                _unitOfWork.Players.AddMultipleOpponents(opponents);
            }
        }

        /// <summary>
        /// Updates all player statistics for a completed match
        /// Uses batch operations and Unit of Work for optimal performance
        /// Single transaction for all updates
        /// </summary>
        public async Task UpdateAllPlayerStatisticsAsync(Match match, int winnerId)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            
            try
            {
                var playersToUpdate = new List<Player>();
                
                foreach (var matchPlayer in match.MatchPlayers)
                {
                    var player = matchPlayer.Player;
                    
                    if (player.Id == winnerId)
                    {
                        player.ApplyWinStatistics();
                    }
                    else
                    {
                        player.ApplyLossStatistics();
                    }
                    
                    playersToUpdate.Add(player);
                }

                _unitOfWork.Players.UpdateMultiplePlayers(playersToUpdate);

                // Batch record all opponent relationships
                var allOpponents = new List<PlayerOpponent>();
                
                foreach (var matchPlayer in match.MatchPlayers)
                {
                    var player = matchPlayer.Player;
                    var opponents = match.MatchPlayers
                        .Where(mp => mp.PlayerId != player.Id)
                        .Select(opponent => new PlayerOpponent
                        {
                            PlayerId = player.Id,
                            OpponentId = opponent.PlayerId
                        });
                    
                    allOpponents.AddRange(opponents);
                }

                if (allOpponents.Any())
                {
                    _unitOfWork.Players.AddMultipleOpponents(allOpponents);
                }

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError("PlayerStatisticsService", $"Failed to update player statistics for match {match.Id}: {ex.Message}");
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException($"Failed to update player statistics for match {match.Id}", ex);
            }
        }
    }
}