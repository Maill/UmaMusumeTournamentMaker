using UmaMusumeTournamentMaker.API.Application.DTOs;
using UmaMusumeTournamentMaker.API.Domain.Entities;

namespace UmaMusumeTournamentMaker.API.Application.Extensions
{
    /// <summary>
    /// Extension methods for mapping domain entities to DTOs
    /// Pure transformation logic with no database dependencies
    /// </summary>
    public static class EntityMappingExtensions
    {
        /// <summary>
        /// Maps a Tournament entity to TournamentDto
        /// </summary>
        public static TournamentDto ToDto(this Tournament tournament)
        {
            return new TournamentDto
            {
                Id = tournament.Id,
                Name = tournament.Name,
                Type = tournament.Type,
                Status = tournament.Status,
                CreatedAt = tournament.CreatedAt,
                StartedAt = tournament.StartedAt,
                CompletedAt = tournament.CompletedAt,
                CurrentRound = tournament.CurrentRound,
                WinnerId = tournament.WinnerId,
                Players = tournament.Players?.Select(p => p.ToDto()).ToList() ?? new(),
                Rounds = tournament.Rounds?.Select(r => r.ToDto()).ToList() ?? new()
            };
        }

        /// <summary>
        /// Maps a Tournament entity to a simple TournamentDto
        /// </summary>
        public static TournamentDto ToSimpleDto(this Tournament tournament)
        {
            return new TournamentDto
            {
                Id = tournament.Id,
                Name = tournament.Name,
                Type = tournament.Type,
                Status = tournament.Status,
                CreatedAt = tournament.CreatedAt,
                StartedAt = tournament.StartedAt,
                CompletedAt = tournament.CompletedAt,
                CurrentRound = tournament.CurrentRound
            };
        }

        /// <summary>
        /// Maps a Player entity to PlayerDto
        /// </summary>
        public static PlayerDto ToDto(this Player player)
        {
            return new PlayerDto
            {
                Id = player.Id,
                Name = player.Name,
                Wins = player.Wins,
                Losses = player.Losses,
                Points = player.Points,
                Group = player.Group,
                WinRate = player.WinRate,
                TotalMatches = player.TotalMatches,
            };
        }

        /// <summary>
        /// Maps a Round entity to RoundDto
        /// </summary>
        public static RoundDto ToDto(this Round round)
        {
            return new RoundDto
            {
                Id = round.Id,
                RoundNumber = round.RoundNumber,
                CreatedAt = round.CreatedAt,
                IsCompleted = round.IsCompleted,
                RoundType = round.RoundType,
                Matches = round.Matches?.Select(m => m.ToDto()).ToList() ?? []
            };
        }

        /// <summary>
        /// Maps a Match entity to MatchDto
        /// </summary>
        public static MatchDto ToDto(this Match match)
        {
            return new MatchDto
            {
                Id = match.Id,
                RoundId = match.RoundId,
                WinnerId = match.WinnerId,
                CreatedAt = match.CreatedAt,
                CompletedAt = match.CompletedAt,
                PlayerIds = match.MatchPlayers.Select(p => p.PlayerId).ToList() ?? [],
            };
        }

        /// <summary>
        /// Maps a collection of Tournament entities to TournamentDto list
        /// </summary>
        public static List<TournamentDto> ToDto(this IEnumerable<Tournament> tournaments)
        {
            return tournaments.Select(t => t.ToDto()).ToList();
        }

        /// <summary>
        /// Maps a collection of Tournament entities to a simple TournamentDto list
        /// </summary>
        public static List<TournamentDto> ToSimpleDto(this IEnumerable<Tournament> tournaments)
        {
            return tournaments.Select(t => t.ToSimpleDto()).ToList();
        }

        /// <summary>
        /// Maps a collection of Player entities to PlayerDto list
        /// </summary>
        public static List<PlayerDto> ToDto(this IEnumerable<Player> players)
        {
            return players.Select(p => p.ToDto()).ToList();
        }

        /// <summary>
        /// Maps a collection of Round entities to RoundDto list
        /// </summary>
        public static List<RoundDto> ToDto(this IEnumerable<Round> rounds)
        {
            return rounds.Select(r => r.ToDto()).ToList();
        }

        /// <summary>
        /// Maps a collection of Match entities to MatchDto list
        /// </summary>
        public static List<MatchDto> ToDto(this IEnumerable<Match> matches)
        {
            return matches.Select(m => m.ToDto()).ToList();
        }
    }
}