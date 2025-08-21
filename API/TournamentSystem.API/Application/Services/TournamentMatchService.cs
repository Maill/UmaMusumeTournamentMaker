using TournamentSystem.API.Application.DTOs;
using TournamentSystem.API.Application.Interfaces;
using TournamentSystem.API.Application.Extensions;
using TournamentSystem.API.Application.Strategies;
using TournamentSystem.API.Domain.Entities;

namespace TournamentSystem.API.Application.Services
{
    public class TournamentMatchService : ITournamentMatchService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITournamentStrategyFactory _strategyFactory;
        private readonly IPlayerStatisticsService _playerStatisticsService;
        private readonly ITournamentLogger _logger;

        public TournamentMatchService(
            IUnitOfWork unitOfWork,
            ITournamentStrategyFactory strategyFactory,
            IPlayerStatisticsService playerStatisticsService,
            ITournamentLogger logger)
        {
            _unitOfWork = unitOfWork;
            _strategyFactory = strategyFactory;
            _playerStatisticsService = playerStatisticsService;
            _logger = logger;
        }


        // This method is now obsolete - tournament progression is handled by StartNextRoundAsync
        // which properly uses the SwissTournamentStrategy for all round creation decisions

        public async Task<bool> ProcessMatchWinnersAsync(Round round, List<MatchResultDto> matchResults)
        {
            _logger.LogDebug("ProcessMatchWinners", $"Round {round.RoundNumber} has {round.Matches.Count} matches, processing {matchResults.Count} results");
            
            var matchWinnerPairs = new List<(Match match, int winnerId)>();
            
            // First pass: Validate all match results and prepare updates (without applying changes yet)
            foreach (var matchResult in matchResults)
            {
                _logger.LogDebug("ProcessMatchWinners", $"Processing match {matchResult.MatchId} with winner {matchResult.WinnerId}");
                
                var match = round.Matches.FirstOrDefault(m => m.Id == matchResult.MatchId);
                if (match == null)
                {
                    _logger.LogError("ProcessMatchWinners", $"Match {matchResult.MatchId} not found in round {round.RoundNumber}. Available matches: {string.Join(", ", round.Matches.Select(m => m.Id))}");
                    throw new ArgumentException($"Match {matchResult.MatchId} not found in current round");
                }

                var matchPlayerIds = match.MatchPlayers.Select(mp => mp.PlayerId).ToList();
                _logger.LogDebug("ProcessMatchWinners", $"Match {matchResult.MatchId} has players: {string.Join(", ", matchPlayerIds)}");

                // Verify winner is a player in this match
                var winner = match.MatchPlayers.FirstOrDefault(mp => mp.PlayerId == matchResult.WinnerId)?.Player;
                if (winner == null)
                {
                    _logger.LogError("ProcessMatchWinners", $"Winner {matchResult.WinnerId} not found in match {matchResult.MatchId}. Match players: {string.Join(", ", matchPlayerIds)}");
                    throw new ArgumentException($"Winner {matchResult.WinnerId} is not a player in match {matchResult.MatchId}");
                }

                // Store match and winner for later processing (don't modify entities yet)
                matchWinnerPairs.Add((match, matchResult.WinnerId));
            }
            
            // Check if round will be completed after these updates
            var allMatches = round.Matches;
            var updatedMatchIds = matchWinnerPairs.Select(pair => pair.match.Id).ToHashSet();
            
            // Count matches that will have winners after the update
            var matchesWithWinners = allMatches.Count(m => 
                m.WinnerId.HasValue || updatedMatchIds.Contains(m.Id));
            
            _logger.LogRoundCompletion(round.RoundNumber, allMatches.Count, matchesWithWinners);
            
            if (matchesWithWinners == allMatches.Count)
            {
                // Round will be completed - apply all updates to existing tracked entities
                _logger.LogDebug("MatchService", $"Round {round.RoundNumber} will be completed - applying all updates");
                
                // Update existing tracked entities directly (no new entities)
                var matchesToUpdate = new List<Match>();
                foreach (var (match, winnerId) in matchWinnerPairs)
                {
                    match.WinnerId = winnerId;
                    match.CompletedAt = DateTime.UtcNow;
                    matchesToUpdate.Add(match);
                }
                
                // Update all matches in one batch operation
                _unitOfWork.Matches.UpdateMultipleMatches(matchesToUpdate);
                
                // Apply player statistics updates in batch
                foreach (var match in matchesToUpdate)
                {
                    _playerStatisticsService.UpdateAllPlayerStatistics(match, match.WinnerId!.Value);
                }
                
                round.IsCompleted = true;
                _unitOfWork.Rounds.Update(round);
                
                _logger.LogDebug("MatchService", $"Round {round.RoundNumber} completed with batch updates applied");
                return true; // Round is completed
            }
            
            _logger.LogDebug("MatchService", $"Round {round.RoundNumber} not yet completed - no changes applied to database");
            return false; // Round is not completed - no database changes made
        }

    }
}