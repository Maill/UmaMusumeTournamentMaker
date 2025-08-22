using Microsoft.AspNetCore.SignalR;
using UmaMusumeTournamerMaker.API.Application.DTOs;
using UmaMusumeTournamerMaker.API.Application.Interfaces;
using UmaMusumeTournamerMaker.API.Infrastructure.Hubs;

namespace UmaMusumeTournamerMaker.API.Infrastructure.Services
{
    /// <summary>
    /// Implementation of tournament broadcast service using SignalR
    /// Sends real-time updates to all clients connected to specific tournaments
    /// </summary>
    public class TournamentBroadcastService : ITournamentBroadcastService
    {
        private readonly IHubContext<TournamentHub> _hubContext;

        public TournamentBroadcastService(IHubContext<TournamentHub> hubContext)
        {
            _hubContext = hubContext;
        }

        /// <summary>
        /// Gets the SignalR group name for a tournament
        /// </summary>
        private string GetTournamentGroup(int tournamentId) => $"Tournament_{tournamentId}";

        public async Task BroadcastPlayerAdded(int tournamentId, PlayerDto player)
        {
            await _hubContext.Clients.Group(GetTournamentGroup(tournamentId))
                .SendAsync("PlayerAdded", player);
        }

        public async Task BroadcastPlayerRemoved(int tournamentId, int playerId)
        {
            await _hubContext.Clients.Group(GetTournamentGroup(tournamentId))
                .SendAsync("PlayerRemoved", playerId);
        }

        public async Task BroadcastMatchUpdated(int tournamentId, MatchDto match)
        {
            await _hubContext.Clients.Group(GetTournamentGroup(tournamentId))
                .SendAsync("MatchUpdated", match);
        }

        public async Task BroadcastTournamentStarted(int tournamentId, TournamentDto tournament)
        {
            await _hubContext.Clients.Group(GetTournamentGroup(tournamentId))
                .SendAsync("TournamentStarted", tournament);
        }

        public async Task BroadcastNewRound(int tournamentId, TournamentDto tournament)
        {
            await _hubContext.Clients.Group(GetTournamentGroup(tournamentId))
                .SendAsync("NewRound", tournament);
        }

        public async Task BroadcastTournamentUpdated(int tournamentId, TournamentDto tournament)
        {
            await _hubContext.Clients.Group(GetTournamentGroup(tournamentId))
                .SendAsync("TournamentUpdated", tournament);
        }

        public async Task BroadcastWinnerSelection(int tournamentId, int matchId, int winnerId)
        {
            await _hubContext.Clients.Group(GetTournamentGroup(tournamentId))
                .SendAsync("WinnerSelected", new { matchId, winnerId });
        }
    }
}