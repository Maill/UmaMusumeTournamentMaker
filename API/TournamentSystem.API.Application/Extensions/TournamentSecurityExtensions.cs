using UmaMusumeTournamentMaker.API.Application.Interfaces.Repositories;
using UmaMusumeTournamentMaker.API.Domain.Entities;

namespace UmaMusumeTournamentMaker.API.Application.Extensions
{
    /// <summary>
    /// Extension methods for tournament security and password validation
    /// Consolidates repeated password validation logic across services
    /// </summary>
    public static class TournamentSecurityExtensions
    {
        /// <summary>
        /// Validates tournament password and returns the tournament with rounds and matches if valid
        /// Throws UnauthorizedAccessException if password is invalid
        /// Throws ArgumentException if tournament is not found
        /// </summary>
        public static async Task<Tournament> ValidatePasswordAndGetTournamentAsync(
            this ITournamentRepository repository,
            int tournamentId,
            string? password)
        {
            var tournament = await repository.GetByIdWithCompleteDetailsAsync(tournamentId);
            tournament.ValidatePassword(password);

            return tournament!;
        }

        public static void ValidatePassword(
            this Tournament? tournament,
            string? password)
        {
            if (tournament == null)
                throw new ArgumentException("Tournament not found");

            if (string.IsNullOrEmpty(tournament.Password) || tournament.Password == password)
                return;

            throw new UnauthorizedAccessException("Invalid tournament password");
        }
    }
}