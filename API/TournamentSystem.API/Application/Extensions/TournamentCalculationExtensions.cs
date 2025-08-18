using TournamentSystem.API.Domain.Entities;
using TournamentSystem.API.Application.Services;

namespace TournamentSystem.API.Application.Extensions
{
    /// <summary>
    /// Extension methods for tournament calculations and logic that don't require database access
    /// </summary>
    public static class TournamentCalculationExtensions
    {
        /// <summary>
        /// Calculates target number of matches per player based on tournament size
        /// </summary>
        public static int CalculateTargetMatches(this Tournament tournament)
        {
            return CalculateTargetMatches(tournament.Players.Count);
        }

        /// <summary>
        /// Calculates target number of matches per player based on player count
        /// </summary>
        public static int CalculateTargetMatches(int playerCount)
        {
            if (playerCount <= 4) return 3;
            if (playerCount <= 6) return 4;
            if (playerCount <= 9) return 5;
            if (playerCount <= 12) return 6;
            
            return Math.Min(8, (playerCount - 1) / 2 + 2);
        }

        /// <summary>
        /// Gets players sorted by tournament standings (points, wins, losses, ID)
        /// </summary>
        public static List<Player> GetPlayersSortedByStandings(this Tournament tournament)
        {
            return tournament.Players
                .OrderByDescending(p => p.Points)
                .ThenByDescending(p => p.Wins)
                .ThenBy(p => p.Losses)
                .ThenBy(p => p.Id)
                .ToList();
        }

        /// <summary>
        /// Gets the top 3 players based on current standings
        /// </summary>
        public static List<Player> GetTop3Players(this Tournament tournament)
        {
            return tournament.GetPlayersSortedByStandings().Take(3).ToList();
        }

        /// <summary>
        /// Checks if two players are tied in standings (points, wins, losses)
        /// </summary>
        public static bool ArePlayersTied(this Player player1, Player player2)
        {
            return player1.Points == player2.Points && 
                   player1.Wins == player2.Wins && 
                   player1.Losses == player2.Losses;
        }

        /// <summary>
        /// Checks if there's a clear top 3 without ties affecting 3rd place
        /// </summary>
        public static bool HasClearTop3(this Tournament tournament)
        {
            var sortedPlayers = tournament.GetPlayersSortedByStandings();
            
            if (sortedPlayers.Count < 4)
                return true;
                
            var third = sortedPlayers[2];
            var fourth = sortedPlayers[3];
            
            // Check if 3rd and 4th are tied
            return !third.ArePlayersTied(fourth);
        }

        /// <summary>
        /// Creates truly random 3-player match combinations for the first round
        /// </summary>
        public static List<PlayerCombinationService.PlayerTriple> CreateRandomFirstRound(this List<Player> players)
        {
            // Shuffle players randomly
            var shuffledPlayers = players.OrderBy(p => Guid.NewGuid()).ToList();
            var matches = new List<PlayerCombinationService.PlayerTriple>();
            
            // Create 3-player matches from shuffled list
            for (int i = 0; i + 2 < shuffledPlayers.Count; i += 3)
            {
                var triple = new PlayerCombinationService.PlayerTriple(
                    shuffledPlayers[i], 
                    shuffledPlayers[i + 1], 
                    shuffledPlayers[i + 2]
                );
                matches.Add(triple);
            }
            
            return matches;
        }

        /// <summary>
        /// Checks if all players have reached their target number of matches
        /// </summary>
        public static bool AllPlayersReachedTargetMatches(this Tournament tournament)
        {
            int targetMatches = tournament.CalculateTargetMatches();
            return tournament.Players.All(p => p.Wins + p.Losses >= targetMatches);
        }


        /// <summary>
        /// Gets the number of completed tiebreaker rounds
        /// </summary>
        public static int GetTiebreakerRoundCount(this Tournament tournament)
        {
            return tournament.Rounds
                .Count(r => r.IsCompleted && r.RoundType == "Tiebreaker");
        }

        /// <summary>
        /// Determines if we should create the final championship round
        /// </summary>
        public static bool ShouldCreateFinalRound(this Tournament tournament, int targetMatches)
        {
            if (!tournament.AllPlayersReachedTargetMatches())
                return false;
                
            // Check if we already have a final round
            if (tournament.GetFinalRound() != null)
                return false;
                
            // Check if we have clear top 3 or have exhausted tiebreakers
            bool hasClearTop3 = tournament.HasClearTop3();
            int tiebreakerRounds = tournament.GetTiebreakerRoundCount();
            
            return hasClearTop3 || tiebreakerRounds >= 2;
        }

        /// <summary>
        /// Determines if we should create a tiebreaker round
        /// </summary>
        public static bool ShouldCreateTiebreakerRound(this Tournament tournament, int targetMatches)
        {
            if (!tournament.AllPlayersReachedTargetMatches())
                return false;
                
            if (tournament.GetFinalRound() != null)
                return false;
                
            bool hasClearTop3 = tournament.HasClearTop3();
            int tiebreakerRounds = tournament.GetTiebreakerRoundCount();
            
            return !hasClearTop3 && tiebreakerRounds < 2;
        }
    }
}