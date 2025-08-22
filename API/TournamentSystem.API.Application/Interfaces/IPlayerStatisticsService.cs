using UmaMusumeTournamerMaker.API.Domain.Entities;
namespace UmaMusumeTournamerMaker.API.Application.Interfaces
{
    /// <summary>
    /// Service interface for player statistics operations
    /// Handles win/loss statistics and opponent tracking for matches
    /// </summary>
    public interface IPlayerStatisticsService
    {
        /// <summary>
        /// Records all opponents from a match for a specific player
        /// Creates PlayerOpponent records for tracking who has played against whom
        /// </summary>
        void RecordOpponents(Player player, Match match);

        /// <summary>
        /// Updates all player statistics for a completed match
        /// Handles winner stats, loser stats, and opponent tracking
        /// </summary>
        void UpdateAllPlayerStatistics(Match match, int winnerId);
    }
}