using UmaMusumeTournamerMaker.API.Application.Interfaces;
using UmaMusumeTournamerMaker.API.Domain.Entities;

namespace UmaMusumeTournamerMaker.API.Application.Services
{
    /// <summary>
    /// Manages 3-player combinations for hybrid Swiss-Round-Robin tournaments
    /// Ensures no repeat opponents while enabling Swiss-style competitive pairing
    /// </summary>
    public class PlayerCombinationService : IPlayerCombinationService
    {

        private readonly ITournamentLogger _logger;

        public PlayerCombinationService(ITournamentLogger logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Generates all possible 3-player combinations from available players
        /// </summary>
        public List<IPlayerCombinationService.PlayerTriple> GenerateAllCombinations(List<Player> availablePlayers)
        {
            var combinations = new List<IPlayerCombinationService.PlayerTriple>();

            for (int i = 0; i < availablePlayers.Count - 2; i++)
            {
                for (int j = i + 1; j < availablePlayers.Count - 1; j++)
                {
                    for (int k = j + 1; k < availablePlayers.Count; k++)
                    {
                        combinations.Add(new IPlayerCombinationService.PlayerTriple(
                            availablePlayers[i],
                            availablePlayers[j],
                            availablePlayers[k]
                        ));
                    }
                }
            }

            return combinations;
        }

        /// <summary>
        /// Gets all combinations that haven't been used in previous rounds
        /// </summary>
        public List<IPlayerCombinationService.PlayerTriple> GetUnusedCombinations(List<Player> availablePlayers, Tournament tournament)
        {
            var allCombinations = GenerateAllCombinations(availablePlayers);
            var usedCombinations = GetUsedCombinationKeys(tournament);

            return allCombinations
                .Where(combo => !usedCombinations.Contains(combo.GetKey()))
                .ToList();
        }

        /// <summary>
        /// Selects optimal matches for a round using hybrid Swiss-Round-Robin algorithm
        /// Prioritizes balanced match participation to ensure all players get similar number of matches
        /// </summary>
        public List<IPlayerCombinationService.PlayerTriple> SelectOptimalMatches(List<Player> availablePlayers, Tournament tournament)
        {
            var unusedCombinations = GetUnusedCombinations(availablePlayers, tournament);
            var selectedMatches = new List<IPlayerCombinationService.PlayerTriple>();
            var usedPlayerIds = new HashSet<int>();

            // Sort combinations to prioritize players who have played fewer matches
            var sortedCombinations = unusedCombinations
                .OrderBy(combo => GetParticipationScore(combo))
                .ThenBy(combo => combo.GetCompetitivenessScore()) // Tie-breaker: competitiveness
                .ToList();

            // Greedily select non-conflicting matches
            foreach (var combination in sortedCombinations)
            {
                // Check if any player in this combination is already used
                if (!combination.ContainsAnyPlayer(usedPlayerIds))
                {
                    selectedMatches.Add(combination);

                    // Mark these players as used
                    foreach (var player in combination.Players)
                    {
                        usedPlayerIds.Add(player.Id);
                    }

                    // Stop if we can't form more 3-player matches
                    if (availablePlayers.Count - usedPlayerIds.Count < 3)
                    {
                        break;
                    }
                }
            }

            return selectedMatches;
        }

        /// <summary>
        /// Calculates participation score using existing player statistics (Wins + Losses)
        /// Lower score = better (players with fewer matches should be prioritized)
        /// </summary>
        private double GetParticipationScore(IPlayerCombinationService.PlayerTriple combination)
        {
            // Sum of matches played by all players in this combination (Wins + Losses = total matches)
            var totalMatches = combination.Players.Sum(p => p.Wins + p.Losses);

            // Return average matches per player in this combination (lower = better for balance)
            return totalMatches / 3.0;
        }

        /// <summary>
        /// Gets players who should receive byes this round (strategic selection)
        /// </summary>
        public List<Player> SelectByePlayers(List<Player> allPlayers, List<IPlayerCombinationService.PlayerTriple> selectedMatches, Tournament tournament)
        {
            var playersInMatches = selectedMatches
                .SelectMany(match => match.Players.Select(p => p.Id))
                .ToHashSet();

            var byePlayers = allPlayers
                .Where(p => !playersInMatches.Contains(p.Id))
                .OrderBy(p => GetPlayerByeCount(p, tournament))  // Fewer byes first
                .ThenBy(p => p.Points)                           // Lower points first (help underdogs)
                .ThenBy(p => p.Id)                               // Consistent ordering
                .ToList();

            return byePlayers;
        }

        /// <summary>
        /// Calculates how many byes a player has had
        /// </summary>
        private int GetPlayerByeCount(Player player, Tournament tournament)
        {
            int totalCompletedRounds = tournament.Rounds.Count(r => r.IsCompleted);
            int roundsPlayed = 0;

            foreach (var round in tournament.Rounds.Where(r => r.IsCompleted))
            {
                bool playerInRound = round.Matches.Any(m =>
                    m.MatchPlayers.Any(mp => mp.PlayerId == player.Id));

                if (playerInRound)
                    roundsPlayed++;
            }

            return totalCompletedRounds - roundsPlayed;
        }

        /// <summary>
        /// Gets set of all combination keys that have been used in previous rounds
        /// </summary>
        private HashSet<string> GetUsedCombinationKeys(Tournament tournament)
        {
            var usedKeys = new HashSet<string>();

            foreach (var round in tournament.Rounds)
            {
                foreach (var match in round.Matches)
                {
                    var playerIds = match.MatchPlayers
                        .Select(mp => mp.PlayerId)
                        .OrderBy(id => id)
                        .ToList();

                    if (playerIds.Count == 3)
                    {
                        var key = $"{playerIds[0]}-{playerIds[1]}-{playerIds[2]}";
                        usedKeys.Add(key);
                    }
                }
            }

            return usedKeys;
        }
    }
}