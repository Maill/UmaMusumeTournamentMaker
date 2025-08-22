using Microsoft.EntityFrameworkCore;
using UmaMusumeTournamerMaker.API.Domain.Entities;

namespace UmaMusumeTournamerMaker.API.Infrastructure.Extensions
{
    /// <summary>
    /// Extension methods for building complex Tournament queries with includes
    /// Encapsulates repetitive EF Core include patterns for better maintainability
    /// </summary>
    public static class TournamentQueryExtensions
    {
        /// <summary>
        /// Includes basic player data for tournaments
        /// </summary>
        public static IQueryable<Tournament> WithPlayers(this IQueryable<Tournament> query)
        {
            return query.Include(t => t.Players);
        }

        /// <summary>
        /// Includes complete rounds and matches data with all related entities
        /// Used for comprehensive tournament views with match details
        /// </summary>
        public static IQueryable<Tournament> WithRoundsAndMatches(this IQueryable<Tournament> query)
        {
            return query
                .Include(t => t.Rounds)
                    .ThenInclude(r => r.Matches)
                        .ThenInclude(m => m.MatchPlayers)
                            .ThenInclude(mp => mp.Player)
                .Include(t => t.Rounds)
                    .ThenInclude(r => r.Matches)
                        .ThenInclude(m => m.Winner);
        }

        /// <summary>
        /// Includes all data needed for safe tournament deletion
        /// Loads related entities that need to be handled during cascade deletion
        /// </summary>
        public static IQueryable<Tournament> WithFullDeletionGraph(this IQueryable<Tournament> query)
        {
            return query
                .Include(t => t.Players)
                    .ThenInclude(p => p.PlayerOpponents)
                .Include(t => t.Rounds)
                    .ThenInclude(r => r.Matches)
                        .ThenInclude(m => m.MatchPlayers);
        }

        /// <summary>
        /// Combines player and rounds/matches includes for complete tournament data
        /// Most comprehensive view including all tournament details
        /// </summary>
        public static IQueryable<Tournament> WithCompleteDetails(this IQueryable<Tournament> query)
        {
            return query
                .WithPlayers()
                .WithRoundsAndMatches();
        }

    }
}