using TournamentSystem.API.Application.Interfaces;

namespace TournamentSystem.API.Application.Services
{
    public class TournamentLogger : ITournamentLogger
    {
        private readonly string _debugLogPath;
        private readonly bool _enableLogging;

        public TournamentLogger(IConfiguration configuration)
        {
            _debugLogPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "tournament_debug.log");
            _enableLogging = configuration.GetValue<bool>("TournamentLogging:EnableDebugLogging", true);
        }

        public void LogDebug(string component, string message)
        {
            if (_enableLogging)
            {
                WriteToFile("DEBUG", component, message);
            }
        }

        public void LogInfo(string component, string message)
        {
            WriteToFile("INFO", component, message);
        }

        public void LogWarning(string component, string message)
        {
            WriteToFile("WARN", component, message);
        }

        public void LogError(string component, string message, Exception? exception = null)
        {
            var fullMessage = exception != null 
                ? $"{message} | Exception: {exception.Message}" 
                : message;
            WriteToFile("ERROR", component, fullMessage);
        }

        public void LogMatchWinner(int matchId, int winnerId)
        {
            LogDebug("MatchService", $"Setting winner for match {matchId}, winner: {winnerId}");
        }

        public void LogRoundCompletion(int roundNumber, int totalMatches, int completedMatches)
        {
            LogDebug("MatchService", $"Round {roundNumber} has {totalMatches} matches, {completedMatches} completed");
            
            if (totalMatches == completedMatches)
            {
                LogDebug("MatchService", $"Round {roundNumber} completed, checking tournament completion");
            }
        }

        public void LogTournamentCompletion(int tournamentId, int currentRound, string tournamentType, int playerCount)
        {
            LogInfo("TournamentService", $"Tournament {tournamentId} completing at round {currentRound}");
            LogInfo("TournamentService", $"Tournament type: {tournamentType}");
            LogInfo("TournamentService", $"Player count: {playerCount}");
        }

        public void LogStrategyDecision(string strategyName, string decision, string reason)
        {
            LogDebug(strategyName, $"{decision} - {reason}");
        }

        private void WriteToFile(string level, string component, string message)
        {
            try
            {
                var timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff");
                var logEntry = $"[{timestamp}] [{level}] {component}: {message}{Environment.NewLine}";
                File.AppendAllText(_debugLogPath, logEntry);
            }
            catch (Exception)
            {
                // Silently ignore logging errors to avoid breaking the application
            }
        }
    }
}