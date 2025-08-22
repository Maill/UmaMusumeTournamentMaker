using UmaMusumeTournamerMaker.API.Domain.Entities;

namespace UmaMusumeTournamerMaker.API.Application.Extensions
{
    /// <summary>
    /// Extension methods for tournament queries that access entity collections but don't modify data
    /// </summary>
    public static class TournamentQueryExtensions
    {
        /// <summary>
        /// Gets the final round if it exists
        /// </summary>
        public static Round? GetFinalRound(this Tournament tournament)
        {
            return tournament.Rounds
                .Where(r => r.RoundType == "Final")
                .OrderByDescending(r => r.RoundNumber)
                .FirstOrDefault();
        }

        /// <summary>
        /// Checks if the tournament has a final round that is completed
        /// </summary>
        public static bool HasCompletedFinalRound(this Tournament tournament)
        {
            return tournament.GetFinalRound()?.IsCompleted == true;
        }
    }
}