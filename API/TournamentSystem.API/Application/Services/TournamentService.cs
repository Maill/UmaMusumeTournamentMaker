using TournamentSystem.API.Application.DTOs;
using TournamentSystem.API.Application.Interfaces;
using TournamentSystem.API.Application.Extensions;
using TournamentSystem.API.Domain.Entities;
using TournamentSystem.API.Domain.Enums;

namespace TournamentSystem.API.Application.Services
{
    public class TournamentService : ITournamentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITournamentStrategyFactory _strategyFactory;
        private readonly ITournamentMatchService _matchService;
        private readonly ITournamentLogger _logger;

        public TournamentService(
            IUnitOfWork unitOfWork,
            ITournamentStrategyFactory strategyFactory,
            ITournamentMatchService matchService,
            ITournamentLogger logger)
        {
            _unitOfWork = unitOfWork;
            _strategyFactory = strategyFactory;
            _matchService = matchService;
            _logger = logger;
        }

        public async Task<List<TournamentDto>> GetAllTournamentsAsync()
        {
            var tournaments = await _unitOfWork.Tournaments.GetAllAsync();
            return tournaments.ToDto();
        }

        public async Task<TournamentDto?> GetTournamentByIdAsync(int id)
        {
            var tournament = await _unitOfWork.Tournaments.GetByIdWithPlayersAsync(id);
            return tournament?.ToDto();
        }

        public async Task<TournamentDto> CreateTournamentAsync(CreateTournamentDto createTournamentDto)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            
            try
            {
                var tournament = new Tournament
                {
                    Name = createTournamentDto.Name,
                    Type = createTournamentDto.Type,
                    Status = TournamentStatus.Created,
                    Password = createTournamentDto.Password,
                    CreatedAt = DateTime.UtcNow,
                    CurrentRound = 0
                };

                var createdTournament = _unitOfWork.Tournaments.Create(tournament);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                
                return createdTournament.ToDto();
            }
            catch (Exception ex)
            {
                _logger.LogError("TournamentService", $"Failed to create tournament '{createTournamentDto.Name}': {ex.Message}", ex);
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException($"An unexpected error occurred while creating the tournament '{createTournamentDto.Name}'. Please try again.", ex);
            }
        }

        public async Task<TournamentDto> AddPlayerAsync(int tournamentId, AddPlayerDto addPlayerDto)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            
            try
            {
                var tournament = await _unitOfWork.Tournaments.ValidatePasswordAndGetTournamentAsync(tournamentId, addPlayerDto.Password);

                if (tournament.Status != TournamentStatus.Created)
                    throw new InvalidOperationException("Cannot add players to a tournament that has already started");

                if (await _unitOfWork.Players.ExistsInTournamentAsync(tournamentId, addPlayerDto.Name))
                    throw new InvalidOperationException($"Player '{addPlayerDto.Name}' already exists in this tournament");

                var player = new Player
                {
                    Name = addPlayerDto.Name,
                    TournamentId = tournamentId,
                    Wins = 0,
                    Losses = 0,
                    Points = 0,
                    RoundWins = 0,
                    RoundLosses = 0,
                    Group = string.Empty
                };

                _unitOfWork.Players.AddPlayer(player);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                
                var updatedTournament = await _unitOfWork.Tournaments.GetByIdWithPlayersAsync(tournamentId);
                return updatedTournament!.ToDto();
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
            catch (ArgumentException)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw; // Re-throw validation exceptions as-is
            }
            catch (Exception ex)
            {
                _logger.LogError("TournamentService", $"Failed to add player '{addPlayerDto.Name}' to tournament {tournamentId}: {ex.Message}", ex);
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException($"An unexpected error occurred while adding player '{addPlayerDto.Name}' to the tournament. Please try again.", ex);
            }
        }

        public async Task<TournamentDto> StartTournamentAsync(int tournamentId, StartTournamentDto startTournamentDto)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            
            try
            {
                var tournament = await _unitOfWork.Tournaments.ValidatePasswordAndGetTournamentAsync(tournamentId, startTournamentDto.Password);

                if (tournament.Status != TournamentStatus.Created)
                    throw new InvalidOperationException("Tournament has already been started");

                if (tournament.Players.Count < 3)
                    throw new InvalidOperationException("Need at least 3 players to start a tournament");

                tournament.Status = TournamentStatus.InProgress;
                tournament.StartedAt = DateTime.UtcNow;
                tournament.CurrentRound = 1;

                // Create the first round automatically
                var firstRound = new Round
                {
                    RoundNumber = 1,
                    TournamentId = tournamentId,
                    CreatedAt = DateTime.UtcNow,
                    IsCompleted = false
                };

                _unitOfWork.Tournaments.Update(tournament);
                var createdRound = _unitOfWork.Rounds.Create(firstRound);
                await _unitOfWork.SaveChangesAsync();

                // Generate matches for the first round using the appropriate strategy
                var strategy = _strategyFactory.GetStrategy(tournament.Type);
                await strategy.CreateMatchesForRoundAsync(tournament, createdRound);

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                return tournament.ToDto();
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
            catch (ArgumentException)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw; // Re-throw validation exceptions as-is
            }
            catch (Exception ex)
            {
                _logger.LogError("TournamentService", $"Failed to start tournament {tournamentId}: {ex.Message}", ex);
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException("An unexpected error occurred while starting the tournament. Please try again.", ex);
            }
        }

        public async Task<RoundDto> StartNextRoundAsync(int tournamentId)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            
            try
            {
                var tournament = await _unitOfWork.Tournaments.GetByIdWithCompleteDetailsAsync(tournamentId);
                if (tournament == null)
                    throw new ArgumentException("Tournament not found");

                if (tournament.Status != TournamentStatus.InProgress)
                    throw new InvalidOperationException("Tournament is not in progress");

                // Check if current round is completed
                var currentRound = tournament.Rounds.FirstOrDefault(r => r.RoundNumber == tournament.CurrentRound);
                if (currentRound != null && !currentRound.IsCompleted)
                    throw new InvalidOperationException("Current round is not completed yet");

                // Create new round
                tournament.CurrentRound++;
                var newRound = new Round
                {
                    RoundNumber = tournament.CurrentRound,
                    TournamentId = tournamentId,
                    CreatedAt = DateTime.UtcNow,
                    IsCompleted = false
                };

                var createdRound = _unitOfWork.Rounds.Create(newRound);
                
                // Generate matches for the new round
                var strategy = _strategyFactory.GetStrategy(tournament.Type);
                await strategy.CreateMatchesForRoundAsync(tournament, createdRound);

                _unitOfWork.Tournaments.Update(tournament);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                // Get updated round with matches
                var updatedTournament = await _unitOfWork.Tournaments.GetByIdWithCompleteDetailsAsync(tournamentId);
                var updatedRound = updatedTournament!.Rounds.First(r => r.RoundNumber == tournament.CurrentRound);

                return updatedRound.ToDto();
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
            catch (Exception ex)
            {
                _logger.LogError("TournamentService", $"Failed to start next round for tournament {tournamentId}: {ex.Message}", ex);
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException("An unexpected error occurred while starting the next round. Please try again.", ex);
            }
        }

        public async Task<TournamentDto> GetTournamentWithCurrentRoundAsync(int tournamentId)
        {
            var tournament = await _unitOfWork.Tournaments.GetByIdWithCompleteDetailsAsync(tournamentId);
            if (tournament == null)
                throw new ArgumentException("Tournament not found");

            return tournament.ToDto();
        }

        public async Task<TournamentDto> UpdateTournamentAsync(int tournamentId, UpdateTournamentDto updateTournamentDto)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            
            try
            {
                var tournament = await _unitOfWork.Tournaments.ValidatePasswordAndGetTournamentAsync(tournamentId, updateTournamentDto.Password);

                tournament.Name = updateTournamentDto.Name;
                _unitOfWork.Tournaments.Update(tournament);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                return tournament.ToDto();
            }
            catch (UnauthorizedAccessException)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw; // Re-throw authentication exceptions as-is
            }
            catch (ArgumentException)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw; // Re-throw validation exceptions as-is
            }
            catch (Exception ex)
            {
                _logger.LogError("TournamentService", $"Failed to update tournament {tournamentId}: {ex.Message}", ex);
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException("An unexpected error occurred while updating the tournament. Please try again.", ex);
            }
        }

        public async Task<bool> DeleteTournamentAsync(int tournamentId, DeleteTournamentDto deleteTournamentDto)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            
            try
            {
                await _unitOfWork.Tournaments.ValidatePasswordAsync(tournamentId, deleteTournamentDto.Password);
                var result = await _unitOfWork.Tournaments.DeleteAsync(tournamentId);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                
                return result;
            }
            catch (UnauthorizedAccessException)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw; // Re-throw authentication exceptions as-is
            }
            catch (Exception ex)
            {
                _logger.LogError("TournamentService", $"Failed to delete tournament {tournamentId}: {ex.Message}", ex);
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException("An unexpected error occurred while deleting the tournament. Please try again.", ex);
            }
        }
    }
}