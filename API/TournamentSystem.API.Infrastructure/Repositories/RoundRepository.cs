using UmaMusumeTournamentMaker.API.Application.Interfaces.Repositories;
using UmaMusumeTournamentMaker.API.Domain.Entities;
using UmaMusumeTournamentMaker.API.Infrastructure.Data;

namespace UmaMusumeTournamentMaker.API.Infrastructure.Repositories
{
    /// <summary>
    /// Repository implementation for Round-specific operations
    /// Handles round entity management and round-related queries
    /// </summary>
    public class RoundRepository : IRoundRepository
    {
        private readonly TournamentDbContext _context;

        public RoundRepository(TournamentDbContext context)
        {
            _context = context;
        }

        public Round Create(Round round)
        {
            _context.Rounds.Add(round);
            return round;
        }

        public Round Update(Round round)
        {
            _context.Rounds.Update(round);
            return round;
        }

        // Batch Operations

        public void UpdateMultipleRounds(List<Round> rounds)
        {
            _context.Rounds.UpdateRange(rounds);
        }
    }
}