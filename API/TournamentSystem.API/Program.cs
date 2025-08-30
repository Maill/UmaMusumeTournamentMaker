using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using UmaMusumeTournamentMaker.API.Middleware;
using UmaMusumeTournamentMaker.API.Application.Interfaces;
using UmaMusumeTournamentMaker.API.Application.Interfaces.Repositories;
using UmaMusumeTournamentMaker.API.Application.Services;
using UmaMusumeTournamentMaker.API.Application.Strategies;
using UmaMusumeTournamentMaker.API.Infrastructure.Data;
using UmaMusumeTournamentMaker.API.Infrastructure.Hubs;
using UmaMusumeTournamentMaker.API.Infrastructure.Repositories;
using UmaMusumeTournamentMaker.API.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Configure database based on environment
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL") ?? builder.Configuration.GetConnectionString("DefaultConnection");
#if DEBUG
var provider = builder.Configuration.GetValue("Provider", "SQLite");
#else
var provider = builder.Configuration.GetValue("Provider", "PostgreSQL");
#endif
builder.Services.AddDbContext<TournamentDbContext>(options => _ = provider switch
{
    "SQLite" => options.UseSqlite(connectionString, sqliteOptions => sqliteOptions.MigrationsAssembly("TournamentSystem.API.SQLiteMigrations")),
    "PostgreSQL" => options.UseNpgsql(connectionString,
            npgsqlOptions =>
            {
                npgsqlOptions.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(5),
                errorCodesToAdd: null);

                //npgsqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);

                npgsqlOptions.MigrationsAssembly("TournamentSystem.API.PostgreSQLMigrations");
            }),
    _ => throw new Exception($"Unsupported provider: {provider}")
});

builder.Services.AddScoped<ITournamentRepository, TournamentRepository>();
builder.Services.AddScoped<IRoundRepository, RoundRepository>();
builder.Services.AddScoped<IMatchRepository, MatchRepository>();
builder.Services.AddScoped<IPlayerRepository, PlayerRepository>();

builder.Services.AddSingleton<ITournamentLogger, TournamentLogger>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IPlayerCombinationService, PlayerCombinationService>();
builder.Services.AddScoped<IMatchCreationService, MatchCreationService>();
builder.Services.AddScoped<IPlayerStatisticsService, PlayerStatisticsService>();
builder.Services.AddScoped<ITournamentStrategyFactory, TournamentStrategyFactory>();
builder.Services.AddScoped<SwissTournamentStrategy>();
builder.Services.AddScoped<ChampionsMeetingTournamentStrategy>();
builder.Services.AddScoped<ITournamentMatchService, TournamentMatchService>();
builder.Services.AddScoped<ITournamentService, TournamentService>();

// Register SignalR and broadcast service
builder.Services.AddSignalR();
builder.Services.AddScoped<ITournamentBroadcastService, TournamentBroadcastService>();

builder.Services.AddMemoryCache();
builder.Services.AddScoped<ICacheService, CacheService>();

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Required for SignalR
        }
        else
        {
            policy.WithOrigins("https://umamusumetournamentmaker-599360421785.europe-west1.run.app")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Required for SignalR
        }
    });
});

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<GzipCompressionProvider>();
    options.Providers.Add<BrotliCompressionProvider>();
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services
    .AddHealthChecks()
    .AddDbContextCheck<TournamentDbContext>(
        failureStatus: HealthStatus.Unhealthy,
        customTestQuery: (ctx, ct) => {
            return Task.FromResult(ctx.Database.GetAppliedMigrations().Any());
        });

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

app.UseDefaultFiles();

// Use custom middleware for pre-compressed static files
app.UseMiddleware<PrecompressedStaticFileMiddleware>();

app.UseStaticFiles();

app.MapFallbackToFile("index.html");

app.UseCors();
app.UseHttpsRedirection();
app.MapControllers();

app.UseResponseCompression();

app.MapHealthChecks("api/health");

// Map SignalR hub
app.MapHub<TournamentHub>("/tournamentHub");

app.Run();
