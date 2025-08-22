using Microsoft.AspNetCore.SignalR;

namespace UmaMusumeTournamerMaker.API.Infrastructure.Hubs
{
    /// <summary>
    /// SignalR hub for real-time tournament updates
    /// Handles broadcasting of tournament state changes to all connected clients
    /// </summary>
    public class TournamentHub : Hub
    {
        /// <summary>
        /// Joins a specific tournament group for receiving updates
        /// </summary>
        /// <param name="tournamentId">The tournament ID to join</param>
        public async Task JoinTournament(string tournamentId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Tournament_{tournamentId}");
        }

        /// <summary>
        /// Leaves a specific tournament group
        /// </summary>
        /// <param name="tournamentId">The tournament ID to leave</param>
        public async Task LeaveTournament(string tournamentId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Tournament_{tournamentId}");
        }

        /// <summary>
        /// Called when client disconnects
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}