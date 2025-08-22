using Microsoft.Extensions.DependencyInjection;
using TournamentSystem.API.Application.Strategies;
using TournamentSystem.API.Domain.Enums;

namespace TournamentSystem.API.Application.Services
{
    public class TournamentStrategyFactory : ITournamentStrategyFactory
    {
        private readonly IServiceProvider _serviceProvider;

        public TournamentStrategyFactory(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public ITournamentStrategy GetStrategy(TournamentType type)
        {
            return type switch
            {
                TournamentType.Swiss => _serviceProvider.GetRequiredService<SwissTournamentStrategy>(),
                TournamentType.ChampionsMeeting => _serviceProvider.GetRequiredService<ChampionsMeetingTournamentStrategy>(),
                _ => throw new ArgumentException($"Unsupported tournament type: {type}")
            };
        }
    }

    public interface ITournamentStrategyFactory
    {
        ITournamentStrategy GetStrategy(TournamentType type);
    }
}