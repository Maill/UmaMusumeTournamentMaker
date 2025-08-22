using Microsoft.EntityFrameworkCore.Storage;
using UmaMusumeTournamentMaker.API.Application.Interfaces;
using UmaMusumeTournamentMaker.API.Application.Interfaces.Repositories;

namespace UmaMusumeTournamentMaker.API.Infrastructure.Data
{
    /// <summary>
    /// Unit of Work implementation for managing database transactions
    /// Provides centralized access to repositories and transaction management
    /// All repositories share the same DbContext for consistent transaction behavior
    /// </summary>
    public class UnitOfWork : IUnitOfWork
    {
        private readonly TournamentDbContext _context;
        private IDbContextTransaction? _transaction;

        public ITournamentRepository Tournaments { get; }
        public IRoundRepository Rounds { get; }
        public IMatchRepository Matches { get; }
        public IPlayerRepository Players { get; }

        public UnitOfWork(
            TournamentDbContext context,
            ITournamentRepository tournaments,
            IRoundRepository rounds,
            IMatchRepository matches,
            IPlayerRepository players)
        {
            _context = context;
            Tournaments = tournaments;
            Rounds = rounds;
            Matches = matches;
            Players = players;
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            _transaction = await _context.Database.BeginTransactionAsync();
            return _transaction;
        }

        public async Task CommitTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.CommitAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public async Task RollbackTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.RollbackAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public void Dispose()
        {
            _transaction?.Dispose();
        }
    }
}