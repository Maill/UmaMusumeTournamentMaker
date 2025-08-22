using UmaMusumeTournamerMaker.API.Application.Interfaces;
using UmaMusumeTournamerMaker.API.Domain.Entities;
using UmaMusumeTournamerMaker.API.Domain.Enums;

namespace UmaMusumeTournamerMaker.API.Application.Strategies
{
    /// <summary>
    /// W.I.P : Will follow the same rules of the official Champions Meeting competition (https://gametora.com/umamusume/events/champions-meeting)
    /// </summary>
    public class ChampionsMeetingTournamentStrategy : ITournamentStrategy
    {
        private readonly IMatchCreationService _matchCreationService;

        public TournamentType SupportedType => TournamentType.ChampionsMeeting;

        public ChampionsMeetingTournamentStrategy(
            IMatchCreationService matchCreationService)
        {
            _matchCreationService = matchCreationService;
        }

        public async Task CreateMatchesForRoundAsync(Tournament tournament, Round round)
        {
            // Keep the simple logic for Champions Meeting for now
            var availablePlayers = tournament.Players.ToList();

            while (availablePlayers.Count >= 3)
            {
                var matchPlayers = availablePlayers.Take(3).ToList();
                availablePlayers.RemoveRange(0, 3);

                await _matchCreationService.CreateSingleMatchAsync(round, matchPlayers);
            }

            // Handle bye players (give them points)
            foreach (var player in availablePlayers)
            {
                player.Points += 1;
            }
        }

        public bool ShouldCompleteTournament(Tournament tournament)
        {
            // Champions Meeting tournament has fixed structure
            // Complete after 3 rounds (First Round, Groups A & B, Final Round)
            return tournament.CurrentRound >= 3;
        }

        public int CalculateTargetMatches(int playerCount)
        {
            // Champions Meeting has a fixed structure
            return 3; // Standard 3 rounds for Champions Meeting
        }

        public int? DetermineTournamentWinner(Tournament tournament)
        {
            throw new NotImplementedException();
        }
    }
}