using UmaMusumeTournamentMaker.API.Domain.Entities;

namespace UmaMusumeTournamentMaker.API.Application.Interfaces
{
    /// <summary>
    /// Service interface for player statistics operations
    /// Handles win/loss statistics and opponent tracking for matches
    /// </summary>
    public interface IPlayerStatisticsService
    {
        /// <summary>
        /// Updates all player statistics for a completed match
        /// Handles winner stats, loser stats, and opponent tracking
        /// </summary>
        void UpdateAllPlayerStatistics(Match match, int winnerId);
    }
}