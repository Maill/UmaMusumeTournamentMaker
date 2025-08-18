using TournamentSystem.API.Domain.Entities;

namespace TournamentSystem.API.Application.Services
{
    /// <summary>
    /// Manages 3-player combinations for hybrid Swiss-Round-Robin tournaments
    /// Ensures no repeat opponents while enabling Swiss-style competitive pairing
    /// </summary>
    public class PlayerCombinationService
    {
        /// <summary>
        /// Represents a 3-player combination with Swiss-style ranking capabilities
        /// </summary>
        public class PlayerTriple
        {
            public Player Player1 { get; }
            public Player Player2 { get; }
            public Player Player3 { get; }
            public List<Player> Players { get; }

            public PlayerTriple(Player p1, Player p2, Player p3)
            {
                // Always store players in ID order for consistent comparison
                var sorted = new[] { p1, p2, p3 }.OrderBy(p => p.Id).ToArray();
                Player1 = sorted[0];
                Player2 = sorted[1];
                Player3 = sorted[2];
                Players = new List<Player> { Player1, Player2, Player3 };
            }

            /// <summary>
            /// Gets unique key for this combination (for tracking used combinations)
            /// </summary>
            public string GetKey() => $"{Player1.Id}-{Player2.Id}-{Player3.Id}";

            /// <summary>
            /// Calculates Swiss-style competitiveness score (lower = more competitive)
            /// </summary>
            public double GetCompetitivenessScore()
            {
                var points = Players.Select(p => p.Points).ToArray();
                var wins = Players.Select(p => p.Wins).ToArray();
                
                // Calculate variance in points and wins (lower variance = more competitive)
                var pointVariance = CalculateVariance(points);
                var winVariance = CalculateVariance(wins);
                
                return pointVariance + (winVariance * 0.5); // Weight points more than wins
            }

            private double CalculateVariance(int[] values)
            {
                if (values.Length == 0) return 0;
                
                double mean = values.Average();
                return values.Sum(v => Math.Pow(v - mean, 2)) / values.Length;
            }

            /// <summary>
            /// Checks if this combination contains any of the specified players
            /// </summary>
            public bool ContainsAnyPlayer(IEnumerable<int> playerIds)
            {
                var idSet = new HashSet<int>(playerIds);
                return Players.Any(p => idSet.Contains(p.Id));
            }
        }

        /// <summary>
        /// Generates all possible 3-player combinations from available players
        /// </summary>
        public List<PlayerTriple> GenerateAllCombinations(List<Player> availablePlayers)
        {
            var combinations = new List<PlayerTriple>();
            
            for (int i = 0; i < availablePlayers.Count - 2; i++)
            {
                for (int j = i + 1; j < availablePlayers.Count - 1; j++)
                {
                    for (int k = j + 1; k < availablePlayers.Count; k++)
                    {
                        combinations.Add(new PlayerTriple(
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
        public List<PlayerTriple> GetUnusedCombinations(List<Player> availablePlayers, Tournament tournament)
        {
            var allCombinations = GenerateAllCombinations(availablePlayers);
            var usedCombinations = GetUsedCombinationKeys(tournament);
            
            return allCombinations
                .Where(combo => !usedCombinations.Contains(combo.GetKey()))
                .ToList();
        }

        /// <summary>
        /// Selects optimal matches for a round using hybrid Swiss-Round-Robin algorithm
        /// </summary>
        public List<PlayerTriple> SelectOptimalMatches(List<Player> availablePlayers, Tournament tournament)
        {
            var unusedCombinations = GetUnusedCombinations(availablePlayers, tournament);
            var selectedMatches = new List<PlayerTriple>();
            var usedPlayerIds = new HashSet<int>();

            // Sort combinations by competitiveness (Swiss-style preference)
            var sortedCombinations = unusedCombinations
                .OrderBy(combo => combo.GetCompetitivenessScore())
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
        /// Gets players who should receive byes this round (strategic selection)
        /// </summary>
        public List<Player> SelectByePlayers(List<Player> allPlayers, List<PlayerTriple> selectedMatches, Tournament tournament)
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