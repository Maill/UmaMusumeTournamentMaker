using TournamentSystem.API.Application.DTOs;
using TournamentSystem.API.Application.Interfaces;
using TournamentSystem.API.Application.Extensions;
using TournamentSystem.API.Application.Strategies;
using TournamentSystem.API.Domain.Entities;

namespace TournamentSystem.API.Application.Services
{
    public class TournamentMatchService : ITournamentMatchService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITournamentStrategyFactory _strategyFactory;
        private readonly ITournamentLogger _logger;

        public TournamentMatchService(
            IUnitOfWork unitOfWork,
            ITournamentStrategyFactory strategyFactory,
            ITournamentLogger logger)
        {
            _unitOfWork = unitOfWork;
            _strategyFactory = strategyFactory;
            _logger = logger;
        }

        public async Task<(MatchDto Match, int TournamentId)> SetMatchWinnerAsync(int matchId, SetWinnerDto setWinnerDto)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            
            try
            {
                _logger.LogMatchWinner(matchId, setWinnerDto.WinnerId);
                
                var match = await _unitOfWork.Matches.GetByIdWithCompleteDetailsAsync(matchId);
                if (match == null)
                    throw new ArgumentException("Match not found");

                // Verify tournament password
                var tournamentId = match.Round.Tournament.Id;
                await _unitOfWork.Tournaments.ValidatePasswordAsync(tournamentId, setWinnerDto.Password);

                if (match.WinnerId.HasValue)
                    throw new InvalidOperationException("Match already has a winner");

                var winner = match.MatchPlayers.FirstOrDefault(mp => mp.PlayerId == setWinnerDto.WinnerId)?.Player;
                if (winner == null)
                    throw new ArgumentException("Winner must be one of the players in this match");

                // Set match winner
                match.WinnerId = setWinnerDto.WinnerId;
                match.CompletedAt = DateTime.UtcNow;

                // Update player statistics directly within this transaction
                var playersToUpdate = new List<Player>();
                var allOpponents = new List<PlayerOpponent>();
                
                foreach (var matchPlayer in match.MatchPlayers)
                {
                    var player = matchPlayer.Player;
                    
                    if (player.Id == setWinnerDto.WinnerId)
                    {
                        player.ApplyWinStatistics();
                    }
                    else
                    {
                        player.ApplyLossStatistics();
                    }
                    
                    playersToUpdate.Add(player);
                    
                    // Collect opponent relationships
                    var opponents = match.MatchPlayers
                        .Where(mp => mp.PlayerId != player.Id)
                        .Select(opponent => new PlayerOpponent
                        {
                            PlayerId = player.Id,
                            OpponentId = opponent.PlayerId
                        });
                    
                    allOpponents.AddRange(opponents);
                }

                _unitOfWork.Players.UpdateMultiplePlayers(playersToUpdate);

                if (allOpponents.Any())
                {
                    _unitOfWork.Players.AddMultipleOpponents(allOpponents);
                }

                _unitOfWork.Matches.Update(match);

                // Check if round is completed
                var round = match.Round;
                var allMatches = round.Matches;
                _logger.LogRoundCompletion(round.RoundNumber, allMatches.Count(), allMatches.Count(m => m.WinnerId.HasValue));
                
                if (allMatches.All(m => m.WinnerId.HasValue))
                {
                    round.IsCompleted = true;
                    _unitOfWork.Rounds.Update(round);
                    
                    // Check if tournament is completed or needs final round
                    var tournament = round.Tournament;
                    var strategy = _strategyFactory.GetStrategy(tournament.Type);
                    
                    if (strategy.ShouldCompleteTournament(tournament))
                    {
                        _logger.LogTournamentCompletion(tournament.Id, tournament.CurrentRound, tournament.Type.ToString(), tournament.Players.Count);
                        
                        tournament.Status = Domain.Enums.TournamentStatus.Completed;
                        tournament.CompletedAt = DateTime.UtcNow;
                        _unitOfWork.Tournaments.Update(tournament);
                    }
                    else
                    {
                        // Check if we need to create a final round automatically
                        await TryCreateFinalRoundIfNeeded(tournament, strategy);
                    }
                }

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                
                return (match.ToDto(), tournamentId);
            }
            catch (ArgumentException)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw; // Re-throw validation exceptions as-is
            }
            catch (InvalidOperationException)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw; // Re-throw business logic exceptions as-is
            }
            catch (UnauthorizedAccessException)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw; // Re-throw authentication exceptions as-is
            }
            catch (Exception ex)
            {
                _logger.LogError("TournamentMatchService", $"Failed to set winner for match {matchId}: {ex.Message}", ex);
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException($"An unexpected error occurred while setting the match winner. Please try again.", ex);
            }
        }

        private async Task TryCreateFinalRoundIfNeeded(Tournament tournament, ITournamentStrategy strategy)
        {
            // For Swiss tournaments, check if we need to create a final round
            if (tournament.Type == Domain.Enums.TournamentType.Swiss)
            {
                var players = tournament.Players.ToList();
                int targetMatchesPerPlayer = ((dynamic)strategy).CalculateTargetMatches(players.Count);
                
                // Check if all players have reached their target match count
                bool allPlayersReachedTarget = players.All(p => p.Wins + p.Losses >= targetMatchesPerPlayer);
                
                if (allPlayersReachedTarget)
                {
                    _logger.LogDebug("TournamentMatchService", "All players reached target matches - checking for final round creation");
                    
                    // Check if we already have a final round
                    var existingFinalRound = tournament.Rounds
                        .Where(r => r.RoundType == "Final")
                        .FirstOrDefault();
                    
                    if (existingFinalRound == null)
                    {
                        _logger.LogDebug("TournamentMatchService", "No existing final round found - creating next round");
                        
                        // Create next round and let the strategy decide what type it should be
                        tournament.CurrentRound++;
                        var nextRound = new Round
                        {
                            RoundNumber = tournament.CurrentRound,
                            TournamentId = tournament.Id,
                            CreatedAt = DateTime.UtcNow,
                            IsCompleted = false,
                            RoundType = "Regular"
                        };

                        var createdRound = _unitOfWork.Rounds.Create(nextRound);
                        
                        await strategy.CreateMatchesForRoundAsync(tournament, createdRound);
                        _unitOfWork.Tournaments.Update(tournament);
                    }
                }
            }
        }

    }
}