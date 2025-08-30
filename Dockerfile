# Multi-stage Dockerfile for Tournament System
# Stage 1: Build Angular Frontend with pre-compression
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Copy package files
COPY Frontend/package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy frontend source
COPY Frontend/ .

# Build with pre-compression
RUN npm run build:compressed

# Stage 2: Build .NET API
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS api-build

WORKDIR /app/api

# Copy API project files
COPY API/TournamentSystem.API/*.csproj ./TournamentSystem.API/
COPY API/TournamentSystem.API.Application/*.csproj ./TournamentSystem.API.Application/
COPY API/TournamentSystem.API.Domain/*.csproj ./TournamentSystem.API.Domain/
COPY API/TournamentSystem.API.Infrastructure/*.csproj ./TournamentSystem.API.Infrastructure/
COPY API/TournamentSystem.API.PostgreSQLMigrations/*.csproj ./TournamentSystem.API.PostgreSQLMigrations/
COPY API/TournamentSystem.API.SQLiteMigrations/*.csproj ./TournamentSystem.API.SQLiteMigrations/

# Restore dependencies
RUN dotnet restore TournamentSystem.API/UmaMusumeTournamentMaker.API.csproj

# Copy API source code
COPY API/ .

# Build and publish API
RUN dotnet publish TournamentSystem.API/UmaMusumeTournamentMaker.API.csproj -c Release -o /app/api/publish

# Stage 3: Runtime Image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

WORKDIR /app

# Copy published API
COPY --from=api-build /app/api/publish .

# Copy compressed frontend files to wwwroot
COPY --from=frontend-build /app/frontend/dist/tournament-frontend/browser/ ./wwwroot/

# Expose port
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://*:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Run the application
ENTRYPOINT ["dotnet", "UmaMusumeTournamentMaker.API.dll"]