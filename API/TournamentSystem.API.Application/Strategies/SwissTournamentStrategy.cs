using UmaMusumeTournamentMaker.API.Application.Extensions;
using UmaMusumeTournamentMaker.API.Application.Interfaces;
using UmaMusumeTournamentMaker.API.Domain.Entities;
using UmaMusumeTournamentMaker.API.Domain.Enums;

namespace UmaMusumeTournamentMaker.API.Application.Strategies
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
        private readonly IPlayerCombinationService _combinationService;
        private readonly IMatchCreationService _matchCreationService;

        public TournamentType SupportedType => TournamentType.Swiss;

        public SwissTournamentStrategy(
            ITournamentLogger logger,
            IPlayerCombinationService combinationService,
            IMatchCreationService matchCreationService)
        {
            _logger = logger;
            _combinationService = combinationService;
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

            List<IPlayerCombinationService.PlayerTriple> selectedMatches;

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
            await _matchCreationService.CreateMatchesAsync(round, selectedMatches.Select(tbm => tbm.Players));
            foreach (var matchCombo in selectedMatches)
            {
                //await _matchCreationService.CreateSingleMatchAsync(round, matchCombo.Players);
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
        /// Determines the tournament winner - always the winner of the final round
        /// </summary>
        public int? DetermineTournamentWinner(Tournament tournament)
        {
            var finalRound = tournament.GetFinalRound();
            _logger.LogDebug("SwissTournament", $"Final round found: {finalRound != null}, IsCompleted: {finalRound?.IsCompleted}");

            if (finalRound?.IsCompleted == true)
            {
                var finalMatch = finalRound.Matches.FirstOrDefault();
                _logger.LogDebug("SwissTournament", $"Final match found: {finalMatch != null}, WinnerId: {finalMatch?.WinnerId}");

                if (finalMatch?.WinnerId.HasValue == true)
                {
                    _logger.LogDebug("SwissTournament", $"Tournament winner: Player {finalMatch.WinnerId}");
                    return finalMatch.WinnerId;
                }
            }

            _logger.LogDebug("SwissTournament", "Tournament has no winner yet - final round not completed");
            return null;
        }


        /// <summary>
        /// Creates tiebreaker round to resolve standings ties
        /// </summary>
        private async Task CreateTiebreakerRound(Tournament tournament, Round round)
        {
            round.RoundType = "Tiebreaker";
            _logger.LogDebug("HybridSwiss", $"Creating tiebreaker round {round.RoundNumber}");

            // Get the specific tiebreaker matches we want to create
            var tiebreakerMatches = GetTiebreakerMatches(tournament);
            _logger.LogDebug("HybridSwiss", $"Tiebreaker involves {tiebreakerMatches.Count} matches");

            await _matchCreationService.CreateMatchesAsync(round, tiebreakerMatches.Select(tbm => tbm.Players));

            foreach (var matchCombo in tiebreakerMatches)
            {
                //await _matchCreationService.CreateSingleMatchAsync(round, matchCombo.Players);
                _logger.LogDebug("HybridSwiss", $"Created tiebreaker match: {string.Join(", ", matchCombo.Players.Select(p => p.Id))}");
            }

            _logger.LogDebug("HybridSwiss",
                $"Tiebreaker round {round.RoundNumber}: {tiebreakerMatches.Count} matches, no bye points awarded");
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
                await _matchCreationService.CreateSingleMatchAsync(round, top3Players);
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
                // Fair bye points: all players get same points regardless of standings
                int byePoints = 1;
                player.Points += byePoints;

                _logger.LogDebug("HybridSwiss",
                    $"Player {player.Id} gets {byePoints} bye points in round {roundNumber}");
            }

            return Task.CompletedTask;
        }

        /// <summary>
        /// Gets tiebreaker matches needed to resolve podium standings (top 3 positions)
        /// Includes ALL players who could potentially claim a top 3 spot based on their current statistics
        /// </summary>
        private List<IPlayerCombinationService.PlayerTriple> GetTiebreakerMatches(Tournament tournament)
        {
            var sortedPlayers = tournament.GetPlayersSortedByStandings();

            // Find the score threshold for potential top 3 contenders
            // Anyone tied with 3rd place (or better) should compete in tiebreaker
            var thirdPlace = sortedPlayers[2];
            var podiumContenders = new List<Player>();

            podiumContenders.AddRange(sortedPlayers.Skip(2).Where(p => p.ArePlayersTied(thirdPlace)));

            if (podiumContenders.Count > 3)
                podiumContenders.AddRange(sortedPlayers.Where(p => p.Points >= thirdPlace.Points));

            podiumContenders = podiumContenders.Distinct().GetPlayersSortedByStandings();

            _logger.LogDebug("HybridSwiss", $"Podium contenders (tied for top 3): {podiumContenders.Count} players (threshold: {thirdPlace.Points} points, {thirdPlace.Wins} wins, {thirdPlace.Losses} losses) - IDs: {string.Join(", ", podiumContenders.Select(p => p.Id))}");

            // If we have less than 2 contenders, no tiebreaker needed (top 3 is clear)
            if (podiumContenders.Count < 2)
            {
                _logger.LogDebug("HybridSwiss", "Less than 2 podium contenders - top 3 is clear, no tiebreaker needed");
                return new List<IPlayerCombinationService.PlayerTriple>();
            }

            var tiebreakerPlayers = new List<Player>(podiumContenders);
            if (podiumContenders.Count % 3 != 0) // If not multiple of 3, add more players
            {
                // Get available players to fill out matches if needed (below podium contention level)
                var availablePlayers = sortedPlayers
                    .Skip(2) // Except top 2 (if top should be included, they were added before)
                    .Except(podiumContenders)  // Not already in contender group
                    .GetPlayersSortedByStandings()
                    .ToList();

                // Add players to reach multiple of 3 for proper matches
                while (tiebreakerPlayers.Count % 3 != 0 && availablePlayers.Any())
                {
                    var nextPlayer = availablePlayers.First();
                    tiebreakerPlayers.Add(nextPlayer);
                    availablePlayers.Remove(nextPlayer);
                    _logger.LogDebug("HybridSwiss", $"Added player {nextPlayer.Id} to reach multiple of 3");
                }
            }

            _logger.LogDebug("HybridSwiss", $"Final tiebreaker participants: {tiebreakerPlayers.Count} players - IDs: {string.Join(", ", tiebreakerPlayers.Select(p => p.Id))}");

            // Create PlayerTriple matches from the tiebreaker players
            var tiebreakerMatches = new List<IPlayerCombinationService.PlayerTriple>();

            for (int i = 0; i + 2 < tiebreakerPlayers.Count; i += 3)
            {
                var match = new IPlayerCombinationService.PlayerTriple(
                    tiebreakerPlayers[i],
                    tiebreakerPlayers[i + 1],
                    tiebreakerPlayers[i + 2]
                );
                tiebreakerMatches.Add(match);
                _logger.LogDebug("HybridSwiss", $"Created tiebreaker match: {tiebreakerPlayers[i].Id}, {tiebreakerPlayers[i + 1].Id}, {tiebreakerPlayers[i + 2].Id}");
            }

            return tiebreakerMatches;
        }
    }
}