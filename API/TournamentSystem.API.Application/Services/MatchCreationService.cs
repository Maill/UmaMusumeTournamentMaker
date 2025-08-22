using TournamentSystem.API.Application.Interfaces;
using TournamentSystem.API.Domain.Entities;

namespace TournamentSystem.API.Application.Services
{
    /// <summary>
    /// Service for match creation operations
    /// Uses Unit of Work pattern for optimized batch operations and transaction management
    /// Consolidates match creation logic that was previously duplicated across tournament strategies
    /// </summary>
    public class MatchCreationService : IMatchCreationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITournamentLogger _logger;

        public MatchCreationService(IUnitOfWork unitOfWork, ITournamentLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        /// <summary>
        /// Creates a single match with the specified players in the given round
        /// Participates in the parent transaction - does not manage its own transaction
        /// </summary>
        public async Task CreateSingleMatchAsync(Round round, List<Player> players)
        {
            try
            {
                var match = new Match
                {
                    RoundId = round.Id,
                    CreatedAt = DateTime.UtcNow
                };

                var createdMatch = _unitOfWork.Matches.Create(match);
                await _unitOfWork.SaveChangesAsync();

                var matchPlayers = players.Select(player => new MatchPlayer
                {
                    MatchId = createdMatch.Id,
                    PlayerId = player.Id
                }).ToList();

                _unitOfWork.Matches.AddMultipleMatchPlayers(matchPlayers);
                await _unitOfWork.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError("MatchCreationService", $"Failed to create match in round {round.Id}: {ex.Message}", ex);
                throw new InvalidOperationException($"An unexpected error occurred while creating the match. Please try again.", ex);
            }
        }

        /// <summary>
        /// Creates multiple matches from a list of player groups
        /// Participates in the parent transaction - does not manage its own transaction
        /// Each group should contain 3 players for a single match
        /// </summary>
        public async Task CreateMatchesAsync(Round round, IEnumerable<List<Player>> playerGroups)
        {
            try
            {
                var allMatchPlayers = new List<MatchPlayer>();
                
                foreach (var playerGroup in playerGroups)
                {
                    var match = new Match
                    {
                        RoundId = round.Id,
                        CreatedAt = DateTime.UtcNow
                    };
                    
                    var createdMatch = _unitOfWork.Matches.Create(match);
                    await _unitOfWork.SaveChangesAsync();
                    
                    var matchPlayers = playerGroup.Select(player => new MatchPlayer
                    {
                        MatchId = createdMatch.Id,
                        PlayerId = player.Id
                    });
                    
                    allMatchPlayers.AddRange(matchPlayers);
                }
                
                if (allMatchPlayers.Count != 0)
                {
                    _unitOfWork.Matches.AddMultipleMatchPlayers(allMatchPlayers);
                    await _unitOfWork.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("MatchCreationService", $"Failed to create matches for round {round.Id}: {ex.Message}", ex);
                throw new InvalidOperationException($"An unexpected error occurred while creating matches for the round. Please try again.", ex);
            }
        }
    }
}