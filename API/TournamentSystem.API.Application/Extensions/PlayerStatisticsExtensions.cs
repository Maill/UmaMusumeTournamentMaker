using UmaMusumeTournamentMaker.API.Domain.Entities;

namespace UmaMusumeTournamentMaker.API.Application.Extensions
{
    /// <summary>
    /// Extension methods for player statistics operations
    /// Pure logic methods with no database dependencies
    /// </summary>
    public static class PlayerStatisticsExtensions
    {
        /// <summary>
        /// Applies win statistics to a player (called when player wins a match)
        /// Pure logic method - no database access
        /// </summary>
        public static void ApplyWinStatistics(this Player player)
        {
            player.Wins++;
            player.Points++;
        }

        /// <summary>
        /// Applies loss statistics to a player (called when player loses a match)
        /// Pure logic method - no database access
        /// </summary>
        public static void ApplyLossStatistics(this Player player)
        {
            player.Losses++;
        }
    }
}