using Microsoft.EntityFrameworkCore;
using TournamentSystem.API.Infrastructure.Data;
using TournamentSystem.API.Application.Interfaces;
using TournamentSystem.API.Application.Services;
using TournamentSystem.API.Application.Strategies;
using TournamentSystem.API.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<TournamentDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register focused repositories
builder.Services.AddScoped<TournamentSystem.API.Application.Interfaces.Repositories.ITournamentRepository, TournamentRepository>();
builder.Services.AddScoped<TournamentSystem.API.Application.Interfaces.Repositories.IRoundRepository, RoundRepository>();
builder.Services.AddScoped<TournamentSystem.API.Application.Interfaces.Repositories.IMatchRepository, MatchRepository>();
builder.Services.AddScoped<TournamentSystem.API.Application.Interfaces.Repositories.IPlayerRepository, PlayerRepository>();

// Register new refactored services
builder.Services.AddSingleton<ITournamentLogger, TournamentLogger>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IMatchCreationService, MatchCreationService>();
builder.Services.AddScoped<IPlayerStatisticsService, PlayerStatisticsService>();
builder.Services.AddScoped<ITournamentStrategyFactory, TournamentStrategyFactory>();
builder.Services.AddScoped<SwissTournamentStrategy>();
builder.Services.AddScoped<ChampionsMeetingTournamentStrategy>();
builder.Services.AddScoped<ITournamentMatchService, TournamentMatchService>();
builder.Services.AddScoped<ITournamentService, TournamentService>();

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<TournamentDbContext>();
    context.Database.EnsureCreated();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseHttpsRedirection();
app.MapControllers();

app.Run();
