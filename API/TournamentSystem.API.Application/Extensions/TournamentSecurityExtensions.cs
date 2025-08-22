using TournamentSystem.API.Application.Interfaces.Repositories;
using TournamentSystem.API.Domain.Entities;

namespace TournamentSystem.API.Application.Extensions
{
    /// <summary>
    /// Extension methods for tournament security and password validation
    /// Consolidates repeated password validation logic across services
    /// </summary>
    public static class TournamentSecurityExtensions
    {
        /// <summary>
        /// Validates tournament password and returns the tournament if valid
        /// Throws UnauthorizedAccessException if password is invalid
        /// Throws ArgumentException if tournament is not found
        /// </summary>
        public static async Task<Tournament> ValidatePasswordAndGetTournamentAsync(
            this ITournamentRepository repository, 
            int tournamentId, 
            string? password)
        {
            if (!await repository.VerifyPasswordAsync(tournamentId, password))
                throw new UnauthorizedAccessException("Invalid tournament password");
                
            var tournament = await repository.GetByIdWithPlayersAsync(tournamentId);
            if (tournament == null)
                throw new ArgumentException("Tournament not found");
                
            return tournament;
        }

        /// <summary>
        /// Validates tournament password and returns the tournament with rounds and matches if valid
        /// Throws UnauthorizedAccessException if password is invalid
        /// Throws ArgumentException if tournament is not found
        /// </summary>
        public static async Task<Tournament> ValidatePasswordAndGetTournamentWithRoundsAsync(
            this ITournamentRepository repository, 
            int tournamentId, 
            string? password)
        {
            if (!await repository.VerifyPasswordAsync(tournamentId, password))
                throw new UnauthorizedAccessException("Invalid tournament password");
                
            var tournament = await repository.GetByIdWithCompleteDetailsAsync(tournamentId);
            if (tournament == null)
                throw new ArgumentException("Tournament not found");
                
            return tournament;
        }

        /// <summary>
        /// Validates tournament password only
        /// Throws UnauthorizedAccessException if password is invalid
        /// </summary>
        public static async Task ValidatePasswordAsync(
            this ITournamentRepository repository, 
            int tournamentId, 
            string? password)
        {
            if (!await repository.VerifyPasswordAsync(tournamentId, password))
                throw new UnauthorizedAccessException("Invalid tournament password");
        }
    }
}