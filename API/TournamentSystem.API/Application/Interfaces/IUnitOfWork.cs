using TournamentSystem.API.Application.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore.Storage;

namespace TournamentSystem.API.Application.Interfaces
{
    /// <summary>
    /// Unit of Work pattern interface for managing database transactions
    /// Provides access to all repositories and transaction management
    /// </summary>
    public interface IUnitOfWork : IDisposable
    {
        /// <summary>
        /// Tournament repository access
        /// </summary>
        ITournamentRepository Tournaments { get; }

        /// <summary>
        /// Round repository access
        /// </summary>
        IRoundRepository Rounds { get; }

        /// <summary>
        /// Match repository access
        /// </summary>
        IMatchRepository Matches { get; }

        /// <summary>
        /// Player repository access
        /// </summary>
        IPlayerRepository Players { get; }

        /// <summary>
        /// Saves all changes to the database in a single transaction
        /// </summary>
        Task<int> SaveChangesAsync();

        /// <summary>
        /// Begins a database transaction for complex operations
        /// </summary>
        Task<IDbContextTransaction> BeginTransactionAsync();

        /// <summary>
        /// Commits the current transaction
        /// </summary>
        Task CommitTransactionAsync();

        /// <summary>
        /// Rolls back the current transaction
        /// </summary>
        Task RollbackTransactionAsync();
    }
}