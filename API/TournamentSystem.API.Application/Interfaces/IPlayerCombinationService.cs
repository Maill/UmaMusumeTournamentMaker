using TournamentSystem.API.Domain.Entities;

namespace TournamentSystem.API.Application.Interfaces
{
    /// <summary>
    /// Manages 3-player combinations for hybrid Swiss-Round-Robin tournaments
    /// Ensures no repeat opponents while enabling Swiss-style competitive pairing
    /// </summary>
    public interface IPlayerCombinationService
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
        List<PlayerTriple> GenerateAllCombinations(List<Player> availablePlayers);

        /// <summary>
        /// Gets all combinations that haven't been used in previous rounds
        /// </summary>
        List<PlayerTriple> GetUnusedCombinations(List<Player> availablePlayers, Tournament tournament);

        /// <summary>
        /// Selects optimal matches for a round using hybrid Swiss-Round-Robin algorithm
        /// </summary>
        List<PlayerTriple> SelectOptimalMatches(List<Player> availablePlayers, Tournament tournament);

        /// <summary>
        /// Gets players who should receive byes this round (strategic selection)
        /// </summary>
        List<Player> SelectByePlayers(List<Player> allPlayers, List<PlayerTriple> selectedMatches, Tournament tournament);

    }
}