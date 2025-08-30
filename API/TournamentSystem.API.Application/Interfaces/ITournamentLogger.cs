namespace UmaMusumeTournamentMaker.API.Application.Interfaces
{
    public interface ITournamentLogger
    {
        void LogDebug(string component, string message);
        void LogInfo(string component, string message);
        void LogWarning(string component, string message);
        void LogError(string component, string message, Exception? exception = null);

        // Specific logging methods for common tournament events
        void LogMatchWinner(int matchId, int winnerId);
        void LogRoundCompletion(int roundNumber, int totalMatches, int completedMatches);
        void LogTournamentCompletion(int tournamentId, int currentRound, string tournamentType, int playerCount);
        void LogStrategyDecision(string strategyName, string decision, string reason);
    }
}