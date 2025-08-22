using Microsoft.EntityFrameworkCore;
using TournamentSystem.API.Domain.Entities;

namespace TournamentSystem.API.Infrastructure.Extensions
{
    /// <summary>
    /// Extension methods for building complex Match queries with includes
    /// Encapsulates repetitive EF Core include patterns for match-related operations
    /// </summary>
    public static class MatchQueryExtensions
    {
        /// <summary>
        /// Includes match players and their associated player entities
        /// </summary>
        public static IQueryable<Match> WithMatchPlayers(this IQueryable<Match> query)
        {
            return query
                .Include(m => m.MatchPlayers)
                    .ThenInclude(mp => mp.Player);
        }

        /// <summary>
        /// Includes the winner player entity
        /// </summary>
        public static IQueryable<Match> WithWinner(this IQueryable<Match> query)
        {
            return query.Include(m => m.Winner);
        }

        /// <summary>
        /// Includes round with all matches in that round
        /// Used for round completion checking
        /// </summary>
        public static IQueryable<Match> WithRoundAndAllMatches(this IQueryable<Match> query)
        {
            return query
                .Include(m => m.Round)
                    .ThenInclude(r => r.Matches);
        }

        /// <summary>
        /// Includes tournament with all players
        /// Used when tournament-level operations are needed during match updates
        /// </summary>
        public static IQueryable<Match> WithTournamentAndPlayers(this IQueryable<Match> query)
        {
            return query
                .Include(m => m.Round)
                    .ThenInclude(r => r.Tournament)
                        .ThenInclude(t => t.Players);
        }

        /// <summary>
        /// Comprehensive include for match operations requiring all related data
        /// Includes players, winner, round context, and tournament information
        /// </summary>
        public static IQueryable<Match> WithCompleteDetails(this IQueryable<Match> query)
        {
            return query
                .WithMatchPlayers()
                .WithWinner()
                .WithRoundAndAllMatches()
                .WithTournamentAndPlayers();
        }
    }
}