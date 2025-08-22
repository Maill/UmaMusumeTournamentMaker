using Microsoft.EntityFrameworkCore;
using UmaMusumeTournamerMaker.API.Application.Interfaces.Repositories;
using UmaMusumeTournamerMaker.API.Domain.Entities;
using UmaMusumeTournamerMaker.API.Infrastructure.Data;
using UmaMusumeTournamerMaker.API.Infrastructure.Extensions;

namespace UmaMusumeTournamerMaker.API.Infrastructure.Repositories
{
    /// <summary>
    /// Repository implementation for Match-specific operations
    /// Handles match entity management, match players, and match-related queries
    /// </summary>
    public class MatchRepository : IMatchRepository
    {
        private readonly TournamentDbContext _context;

        public MatchRepository(TournamentDbContext context)
        {
            _context = context;
        }

        public async Task<Match?> GetByIdWithCompleteDetailsAsync(int id)
        {
            return await _context.Matches
                .WithCompleteDetails()
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public Match Create(Match match)
        {
            _context.Matches.Add(match);
            return match;
        }

        public Match Update(Match match)
        {
            _context.Matches.Update(match);
            return match;
        }


        // Batch Operations


        public void AddMultipleMatchPlayers(List<MatchPlayer> matchPlayers)
        {
            _context.MatchPlayers.AddRange(matchPlayers);
        }

        public void UpdateMultipleMatches(List<Match> matches)
        {
            _context.Matches.UpdateRange(matches);
        }
    }
}