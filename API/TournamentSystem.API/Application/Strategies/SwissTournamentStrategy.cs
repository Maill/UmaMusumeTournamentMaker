using TournamentSystem.API.Domain.Entities;
using TournamentSystem.API.Domain.Enums;
using TournamentSystem.API.Application.Interfaces;
using TournamentSystem.API.Application.Services;
using TournamentSystem.API.Application.Extensions;

namespace TournamentSystem.API.Application.Strategies
{
    /// <summary>
    /// Hybrid Swiss-Round-Robin Tournament Strategy
    /// 
    /// Features:
    /// - No repeat opponents during regular rounds (Round-Robin guarantee)
    /// - Swiss-style competitive pairing when possible (skill-based matching)
    /// - Strategic bye management for non-multiples of 3
    /// - Robust tiebreaker system for clear championship resolution
    /// </summary>
    public class SwissTournamentStrategy : ITournamentStrategy
    {
        private readonly ITournamentLogger _logger;
        private readonly PlayerCombinationService _combinationService;
        private readonly IMatchCreationService _matchCreationService;

        public TournamentType SupportedType => TournamentType.Swiss;

        public SwissTournamentStrategy(
            ITournamentLogger logger,
            IMatchCreationService matchCreationService)
        {
            _logger = logger;
            _combinationService = new PlayerCombinationService();
            _matchCreationService = matchCreationService;
        }

        public async Task CreateMatchesForRoundAsync(Tournament tournament, Round round)
        {
            var players = tournament.Players.ToList();
            int targetMatches = tournament.CalculateTargetMatches();
            
            _logger.LogDebug("HybridSwiss", $"Round {round.RoundNumber} - Players: {players.Count}, Target: {targetMatches}");
            
            // Check if we should create final championship round
            if (tournament.ShouldCreateFinalRound(targetMatches))
            {
                await CreateFinalChampionshipRound(tournament, round);
                return;
            }
            
            // Check if we need tiebreaker rounds
            if (tournament.ShouldCreateTiebreakerRound(targetMatches))
            {
                await CreateTiebreakerRound(tournament, round);
                return;
            }
            
            // Create regular round with hybrid algorithm
            await CreateRegularRound(tournament, round);
        }

        /// <summary>
        /// Creates a regular round using hybrid Swiss-Round-Robin algorithm
        /// </summary>
        private async Task CreateRegularRound(Tournament tournament, Round round)
        {
            var players = tournament.Players.ToList();
            round.RoundType = "Regular";
            
            _logger.LogDebug("HybridSwiss", $"Creating regular round {round.RoundNumber}");

            List<PlayerCombinationService.PlayerTriple> selectedMatches;

            if (round.RoundNumber == 1)
            {
                // Round 1: Truly random seeding
                selectedMatches = players.CreateRandomFirstRound();
                _logger.LogDebug("HybridSwiss", "Round 1: Using random seeding");
            }
            else
            {
                // Subsequent rounds: Hybrid Swiss-Round-Robin
                selectedMatches = _combinationService.SelectOptimalMatches(players, tournament);
                _logger.LogDebug("HybridSwiss", $"Round {round.RoundNumber}: Using hybrid Swiss-Round-Robin pairing");
            }

            // Create matches from selected combinations
            foreach (var matchCombo in selectedMatches)
            {
                await _matchCreationService.CreateSingleMatchAsync(round, matchCombo.Players);
                _logger.LogDebug("HybridSwiss", 
                    $"Created match with players: {string.Join(", ", matchCombo.Players.Select(p => p.Id))}");
            }

            // Handle bye players
            var byePlayers = _combinationService.SelectByePlayers(players, selectedMatches, tournament);
            await HandleByePlayers(byePlayers, round.RoundNumber);

            _logger.LogDebug("HybridSwiss", 
                $"Round {round.RoundNumber} completed: {selectedMatches.Count} matches, {byePlayers.Count} byes");
        }


        public bool ShouldCompleteTournament(Tournament tournament)
        {
            int targetMatches = tournament.CalculateTargetMatches();
            
            _logger.LogDebug("HybridSwiss", 
                $"Tournament completion check - Players: {tournament.Players.Count}, Target: {targetMatches}");
            
            // Check if final round exists and is completed
            if (tournament.HasCompletedFinalRound())
            {
                _logger.LogDebug("HybridSwiss", "Tournament complete: Final round finished");
                return true;
            }
            
            // Continue if we haven't reached target matches yet
            if (!tournament.AllPlayersReachedTargetMatches())
            {
                _logger.LogDebug("HybridSwiss", "Tournament continues: Players haven't reached target matches");
                return false;
            }
            
            // Need to create final or tiebreaker round
            _logger.LogDebug("HybridSwiss", "Tournament continues: Need final/tiebreaker round");
            return false;
        }

        /// <summary>
        /// Calculates target number of matches per player based on tournament size
        /// Implementation of ITournamentStrategy interface - delegates to extension method
        /// </summary>
        public int CalculateTargetMatches(int playerCount)
        {
            return TournamentCalculationExtensions.CalculateTargetMatches(playerCount);
        }

        /// <summary>
        /// Creates tiebreaker round to resolve standings ties
        /// </summary>
        private async Task CreateTiebreakerRound(Tournament tournament, Round round)
        {
            round.RoundType = "Tiebreaker";
            _logger.LogDebug("HybridSwiss", $"Creating tiebreaker round {round.RoundNumber}");
            
            // Use same hybrid algorithm but focus on tied players
            var players = tournament.Players.ToList();
            var selectedMatches = _combinationService.SelectOptimalMatches(players, tournament);
            
            foreach (var matchCombo in selectedMatches)
            {
                await _matchCreationService.CreateSingleMatchAsync(round, matchCombo.Players);
            }
            
            var byePlayers = _combinationService.SelectByePlayers(players, selectedMatches, tournament);
            await HandleByePlayers(byePlayers, round.RoundNumber);
            
            _logger.LogDebug("HybridSwiss", 
                $"Tiebreaker round {round.RoundNumber}: {selectedMatches.Count} matches, {byePlayers.Count} byes");
        }

        /// <summary>
        /// Creates final championship round with top 3 players
        /// </summary>
        private async Task CreateFinalChampionshipRound(Tournament tournament, Round round)
        {
            round.RoundType = "Final";
            _logger.LogDebug("HybridSwiss", $"Creating final championship round {round.RoundNumber}");
            
            var top3Players = tournament.GetTop3Players();
            
            if (top3Players.Count >= 3)
            {
                await _matchCreationService.CreateSingleMatchAsync(round, top3Players.Take(3).ToList());
                _logger.LogDebug("HybridSwiss", 
                    $"Final championship: {string.Join(", ", top3Players.Take(3).Select(p => p.Id))}");
            }
        }

        /// <summary>
        /// Handles bye players by awarding appropriate points
        /// </summary>
        private Task HandleByePlayers(List<Player> byePlayers, int roundNumber)
        {
            foreach (var player in byePlayers)
            {
                // Strategic bye points: help lower-ranked players more
                int byePoints = player.Points <= 2 ? 2 : 1;
                player.Points += byePoints;
                
                _logger.LogDebug("HybridSwiss", 
                    $"Player {player.Id} gets {byePoints} bye points in round {roundNumber}");
            }
            
            return Task.CompletedTask;
        }


    }
}