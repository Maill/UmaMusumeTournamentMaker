using UmaMusumeTournamentMaker.API.Application.DTOs;
namespace UmaMusumeTournamentMaker.API.Application.Interfaces
{
    /// <summary>
    /// Service for broadcasting tournament updates to all connected clients
    /// </summary>
    public interface ITournamentBroadcastService
    {
        /// <summary>
        /// Broadcasts when a player is added to a tournament
        /// </summary>
        /// <param name="tournamentId">The tournament ID</param>
        /// <param name="player">The added player</param>
        Task BroadcastPlayerAdded(int tournamentId, PlayerDto player);

        /// <summary>
        /// Broadcasts when a player is removed from a tournament
        /// </summary>
        /// <param name="tournamentId">The tournament ID</param>
        /// <param name="playerId">The removed player ID</param>
        Task BroadcastPlayerRemoved(int tournamentId, int playerId);

        /// <summary>
        /// Broadcasts when a match winner is set
        /// </summary>
        /// <param name="tournamentId">The tournament ID</param>
        /// <param name="match">The updated match</param>
        Task BroadcastMatchUpdated(int tournamentId, MatchDto match);

        /// <summary>
        /// Broadcasts when tournament starts
        /// </summary>
        /// <param name="tournamentId">The tournament ID</param>
        /// <param name="tournament">The updated tournament with first round</param>
        Task BroadcastTournamentStarted(int tournamentId, TournamentDto tournament);

        /// <summary>
        /// Broadcasts when a new round is generated
        /// </summary>
        /// <param name="tournamentId">The tournament ID</param>
        /// <param name="tournament">The updated tournament with new round</param>
        Task BroadcastNewRound(int tournamentId, TournamentDto tournament);

        /// <summary>
        /// Broadcasts general tournament state updates
        /// </summary>
        /// <param name="tournamentId">The tournament ID</param>
        /// <param name="tournament">The updated tournament</param>
        Task BroadcastTournamentUpdated(int tournamentId, TournamentDto tournament);

        /// <summary>
        /// Broadcasts winner selection for real-time UI updates (no database changes)
        /// </summary>
        /// <param name="tournamentId">The tournament ID</param>
        /// <param name="matchId">The match ID</param>
        /// <param name="winnerId">The selected winner ID</param>
        Task BroadcastWinnerSelection(int tournamentId, int matchId, int winnerId);
    }
}