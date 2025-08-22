using Microsoft.EntityFrameworkCore;
using UmaMusumeTournamentMaker.API.Domain.Entities;

namespace UmaMusumeTournamentMaker.API.Infrastructure.Data
{
    public class TournamentDbContext : DbContext
    {
        public TournamentDbContext(DbContextOptions<TournamentDbContext> options) : base(options)
        {
        }

        public DbSet<Tournament> Tournaments { get; set; }
        public DbSet<Player> Players { get; set; }
        public DbSet<Round> Rounds { get; set; }
        public DbSet<Match> Matches { get; set; }
        public DbSet<MatchPlayer> MatchPlayers { get; set; }
        public DbSet<PlayerOpponent> PlayerOpponents { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Tournament
            modelBuilder.Entity<Tournament>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Type).IsRequired();
                entity.Property(e => e.Status).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.Password).HasMaxLength(100);
            });

            // Player
            modelBuilder.Entity<Player>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.HasOne(e => e.Tournament)
                      .WithMany(e => e.Players)
                      .HasForeignKey(e => e.TournamentId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Round
            modelBuilder.Entity<Round>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.RoundType).IsRequired().HasMaxLength(20).HasDefaultValue("Regular");
                entity.HasOne(e => e.Tournament)
                      .WithMany(e => e.Rounds)
                      .HasForeignKey(e => e.TournamentId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Match
            modelBuilder.Entity<Match>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Round)
                      .WithMany(e => e.Matches)
                      .HasForeignKey(e => e.RoundId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Winner)
                      .WithMany()
                      .HasForeignKey(e => e.WinnerId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // MatchPlayer
            modelBuilder.Entity<MatchPlayer>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Match)
                      .WithMany(e => e.MatchPlayers)
                      .HasForeignKey(e => e.MatchId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Player)
                      .WithMany(e => e.MatchPlayers)
                      .HasForeignKey(e => e.PlayerId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // PlayerOpponent
            modelBuilder.Entity<PlayerOpponent>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Player)
                      .WithMany(e => e.PlayerOpponents)
                      .HasForeignKey(e => e.PlayerId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Opponent)
                      .WithMany()
                      .HasForeignKey(e => e.OpponentId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}