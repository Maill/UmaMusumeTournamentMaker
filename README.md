# Uma Musume Tournament Maker

A web application tournament maker for the game Uma Musume.

## 🎯 Main Features

The web application implements a **unique tournament format** that combines the best of Swiss and Round-Robin systems:

- **3-Player Simultaneous Matches** for dynamic competition
- **No Repeat Opponents Algorithm** ensuring fair play across all rounds
- **Swiss-Style Competitive Pairing** matching players of similar skill levels
- **Real-time Multi-user Management** with instant synchronization across all devices

## 🤖 Disclaimer

This project has been partially developped with an AI. Claude Code to be exact. I used it for everything in the frontend and a good part of the backend. And also for everything logic related before implementation. (You need to thouroughly test him by questionning the use cases and edge cases and make Claude understand everything if I want a concise and **_"bug free"_** logic)

However, I am very aware of how the code should be and look and won't let the AI take control of the project at 100%. At least for the backend part. I didn't really focused my attention on the frontend for now but I will get there. It's the very first project I use with the help of an AI, although I don't follow blindly Claude, I am in control and I make it sure that Claude follow proper code conventions and clean coding. Once the absolute first stable version drops, I will stop using it, since AI with a big context tends to make too many mistakes and take more and more time to do things. And I am closer than you think of.

## 📑 Table of Contents

- [🏗️ Architecture](#️-architecture)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [VS Code Setup (Recommended)](#vs-code-setup-recommended)
- [🎮 Features](#-features)
- [🛠️ API Endpoints](#️-api-endpoints)
- [💾 Database Schema](#-database-schema)
- [🎯 Usage Flow](#-usage-flow)
- [🔧 Development](#-development)
  - [VS Code Tasks](#vs-code-tasks)
  - [VS Code Debug Configurations](#vs-code-debug-configurations)
  - [Backend Development](#backend-development)
  - [Frontend Development](#frontend-development)
- [🧪 Testing](#-testing)
- [📝 Configuration](#-configuration)
- [🤝 Contributing](#-contributing)
- [🐛 Troubleshooting](#-troubleshooting)

## 🏗️ Architecture

### Backend (API)

- **Framework**: .NET 9.0
- **Architecture**: Clean Architecture with Unit of Work pattern
- **Database**: SQLite with Entity Framework Core
- **API Style**: RESTful with real-time updates
- **Security**: Password-protected tournaments
- **Real-time**: WebSockets/SignalR for live updates _(TODO)_

### Frontend

- **Framework**: Angular 18
- **Styling**: CSS with responsive design
- **HTTP Client**: Angular HttpClient with real-time connections
- **Real-time**: WebSocket client for live tournament updates _(TODO)_
- **Multi-user**: Concurrent user support with conflict resolution _(TODO)_

## 📁 Project Structure

```
TournamentSystem/
├── API/
│   └── TournamentSystem.API/
│       ├── Domain/           # Business logic and entities
│       ├── Application/      # Use cases and DTOs
│       ├── Infrastructure/   # Data access and external services
│       └── Presentation/     # Controllers and API endpoints
├── Frontend/
│   └── tournament-frontend/
│       └── src/
│           ├── app/
│           │   ├── components/    # Angular components
│           │   ├── services/      # HTTP services
│           │   └── models/        # TypeScript interfaces
│           ├── environments/      # Environment configurations
│           │   ├── environment.ts      # Development config
│           │   ├── environment.prod.ts # Production config
│           │   └── environment.local.ts # Local config (gitignored)
│           └── styles.css         # Global styles
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 18+](https://nodejs.org/)
- [Angular CLI 18+](https://angular.io/cli) (`npm install -g @angular/cli`)

### Backend Setup

1. Navigate to the API directory:

   ```bash
   cd API/TournamentSystem.API
   ```

2. Restore dependencies:

   ```bash
   dotnet restore
   ```

3. Run the API:
   ```bash
   dotnet run
   ```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd Frontend/tournament-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:4200`

### VS Code Setup (Recommended)

The project includes comprehensive VS Code configuration for optimal development experience.

#### Recommended Extensions

When you open the project in VS Code, you'll be prompted to install recommended extensions. Key extensions include:

- **C# Dev Kit** - Complete C# development support
- **Angular Language Service** - Angular development tools
- **Prettier** - Code formatting
- **ESLint** - Code linting

#### Quick Start with VS Code

1. **Open the project folder** in VS Code
2. **Install recommended extensions** when prompted
3. **Press `Ctrl+Shift+P`** and run **"Tasks: Run Task"**
4. **Select "start-full-stack"** - This starts both API and frontend automatically

#### Available Tasks

- `start-full-stack` - **⭐ Recommended**: Start both API and frontend
- `watch-api` - Start API with hot reload
- `start-frontend` - Start Angular development server
- `build-api` - Build the .NET API
- `build-frontend` - Build Angular for production (uses production environment)
- `build-frontend-dev` - Build Angular for development (uses development environment)
- `build-frontend-prod` - Build Angular for production (explicit)
- `test-frontend` - Run Angular tests
- `restore-api-deps` - Restore NuGet packages
- `install-frontend-deps` - Install npm packages

#### Debug Configurations

- **Launch Full Stack** - Debug frontend with API running
- **Launch API** - Debug .NET API only
- **Launch Frontend** - Debug Angular in Chrome
- **Launch API + Frontend** - Compound debug configuration

## 🎮 Tournament System Features

### 🔄 Advanced Tournament Algorithm

The core innovation of this system is its **sophisticated Swiss-Round-Robin hybrid algorithm**:

#### Pairing Intelligence

- **Competitiveness Analysis**: Uses statistical variance to create balanced matchups
- **Performance-Based Matching**: Similar skill levels compete together for exciting matches
- **No-Repeat Guarantee**: Complex algorithm ensures no player faces same opponents twice
- **Priority System**: Players with fewer matches get priority in next round generation

#### Match Generation Process

1. **Calculate Player Priorities**: Players needing matches get higher priority
2. **Generate All Possible 3-Player Combinations**: Exclude previously used combinations
3. **Score Each Combination**: Rate competitiveness using points and wins variance
4. **Optimize Selection**: Choose best combinations ensuring all priority players get matches
5. **Handle Odd Numbers**: Rotating bye system with compensation points

#### Tournament Progression Logic

- **Target Achievement**: Each player must reach calculated target matches
- **Tie Resolution**: Automatic tiebreaker rounds (max 2) when needed
- **Final Championship**: Always concludes with top 3 players in climactic match
- **Flexible Scaling**: Supports any number of players from 4 to unlimited

### Tournament Types

#### Swiss-Round-Robin Tournament (Primary Format)

The system implements a unique **hybrid Swiss-Round-Robin system** optimized for 3-player matches:

**Core Mechanics:**

- **3-Player Matches**: Every match involves exactly 3 players competing simultaneously
- **No Repeat Opponents**: Advanced algorithm ensures no player faces the same opponents twice
- **Swiss-Style Pairing**: Players with similar performance levels are matched together
- **Target-Based Progression**: Each player plays a predetermined number of matches based on tournament size

**Tournament Structure:**

- **Regular Rounds**: Players compete until reaching their target match count
- **Automatic Tiebreaker Rounds**: Generated when top 3 positions are tied (max 2 tiebreaker rounds)
- **Final Championship**: Top 3 players compete in the climactic final match
- **Bye System**: For odd player counts, rotating bye system with compensation points

**Advanced Features:**

- **Competitiveness Scoring**: Algorithm pairs players with similar skill levels using variance analysis
- **Priority Queue System**: Players with fewer matches get priority for next round generation
- **Dynamic Targets**: Match targets scale intelligently with tournament size:
  - 4 players → 3 matches each + final
  - 5-6 players → 4 matches each + final
  - 7-9 players → 5 matches each + final
  - 10-12 players → 6 matches each + final
  - 13+ players → Scales to max 8 matches + final

**Scoring System:**

- **Win**: 3 points
- **Bye**: 2 points (compensation for sitting out)
- **Loss**: 0 points
- **Standings**: Ranked by Points → Wins → Losses → Player ID

#### Champions Meeting Tournament (Legacy Format)

- Multi-round tournament with group divisions
- Players advance through groups based on performance
- Three rounds: First Round, Second Round (Groups A & B), Final Round
- Complex advancement criteria based on wins

### Core Functionality

- **Tournament Management**: Create, start, and manage tournaments with password protection
- **Player Management**: Add/delete players with real-time sync across all users
- **Match Management**: Set winners with immediate broadcast to all tournament viewers
- **Multi-user Support**: Multiple users can manage tournaments simultaneously _(TODO)_
- **Real-time Updates**: Live synchronization via WebSockets for all tournament actions _(TODO)_
- **Optimistic UI**: Immediate feedback with rollback on API failures
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ API Endpoints

### Tournaments

- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/{id}` - Get tournament by ID (requires password)
- `GET /api/tournaments/{id}/current-round` - Get tournament with current round details
- `POST /api/tournaments` - Create new tournament (with optional password)
- `POST /api/tournaments/{id}/players` - Add player to tournament (broadcasts to all users)
- `DELETE /api/tournaments/{id}/players/{playerId}` - Delete player from tournament (broadcasts to all users)
- `POST /api/tournaments/{id}/start` - Start tournament (broadcasts to all users)
- `POST /api/tournaments/{id}/next-round` - Start next round (broadcasts to all users)

### Matches

- `PUT /api/matches/{id}/winner` - Set match winner (broadcasts to all users)

### Real-time _(TODO)_

- **WebSocket/SignalR Hub**: `/tournamentHub` - Real-time tournament updates
  - Player additions/deletions
  - Match result updates
  - Round progressions
  - Tournament state changes

## 💾 Database Schema

The system uses SQLite with Entity Framework Core following Clean Architecture:

### Core Entities

- **Tournament**: Tournament metadata, configuration, and password protection
- **Player**: Player information with comprehensive statistics (Points, Wins, Losses)
- **Round**: Tournament rounds with types (Regular, Tiebreaker, Final)
- **Match**: 3-player matches with winner tracking
- **MatchPlayer**: Links players to matches (exactly 3 per match)
- **PlayerOpponent**: Prevents repeat matchups by tracking opponent history

### Advanced Features

- **Unit of Work Pattern**: Ensures transactional consistency across all operations
- **Repository Pattern**: Clean data access with batch operations for performance
- **Query Extensions**: Optimized EF Core queries with proper includes for complex data loading

## 🎯 Usage Flow

### Tournament Management Flow

#### Setup Phase

1. **Create Tournament**: Choose Swiss-Round-Robin format, set name and optional password
2. **Add Players**: Add participants (minimum 3, no maximum limit)
3. **Player Management**: Add/remove players with real-time sync across all users
4. **Start Tournament**: System generates first round with optimal 3-player matchups

#### Active Tournament Phase

1. **Round Execution**: Players compete in simultaneous 3-player matches
2. **Winner Selection**: Set match winners with immediate broadcast to all users
3. **Automatic Progression**: System tracks match completion and player statistics
4. **Smart Round Generation**:
   - Regular rounds until all players reach target matches
   - Automatic tiebreaker rounds if top 3 are tied
   - Final championship round with top 3 players

#### Multi-user Collaboration

- **Password Protection**: Secure tournament access for authorized users
- **Real-time Synchronization**: Instant updates across all connected devices
- **Concurrent Management**: Multiple users can manage tournament simultaneously
- **Live Progression**: All users advance to new rounds together automatically
- **Optimistic UI**: Immediate feedback with server validation and rollback on conflicts

#### Tournament Completion

- **Dynamic Standings**: Real-time leaderboard with Points → Wins → Losses ranking
- **Final Results**: Championship match determines ultimate winner
- **Tournament History**: Complete match history and statistics preserved

## 🔧 Development

### VS Code Tasks

The project includes comprehensive VS Code tasks for efficient development:

#### Development Tasks

```bash
# Start full stack development environment
Ctrl+Shift+P → "Tasks: Run Task" → "start-full-stack"

# Individual services
start-frontend          # Angular dev server (http://localhost:4200)
watch-api              # .NET API with hot reload (http://localhost:5000)
```

#### Build Tasks

```bash
build-api              # Build .NET API
build-frontend         # Build Angular for production
publish-api            # Publish API for deployment
```

#### Maintenance Tasks

```bash
restore-api-deps       # Restore NuGet packages
install-frontend-deps  # Install npm dependencies
test-frontend         # Run Angular unit tests
```

### VS Code Debug Configurations

Press **F5** and select from available configurations:

#### For Full Stack Development

- **Launch Full Stack** - ⭐ Recommended for complete debugging
- **Launch API + Frontend** - Compound configuration

#### For Individual Services

- **Launch API** - Debug .NET API with automatic browser opening
- **Launch API (Watch)** - Debug with hot reload
- **Launch Frontend** - Debug Angular in Chrome
- **Test Frontend** - Debug Angular tests

#### Debugging Features

- **Breakpoints** work in both C# API and TypeScript frontend
- **Hot reload** for both API and frontend changes
- **Automatic browser opening** when API starts
- **Source maps** configured for Angular debugging

### Backend Development

The API follows Clean Architecture with modern patterns:

- **Domain Layer**: Business logic, entities, and domain services
- **Application Layer**: Use cases, DTOs, application services, and interfaces
- **Infrastructure Layer**: Data access with Unit of Work pattern, repositories, EF Core, and real-time hubs
- **Presentation Layer**: Controllers, middleware, API configuration, and WebSocket endpoints

#### Key Patterns

- **Unit of Work**: Centralized transaction management across repositories
- **Repository Pattern**: Data access abstraction with batch operations
- **Real-time Hub**: SignalR/WebSocket hub for broadcasting tournament updates
- **Password Protection**: Secure tournament access with authorization middleware

### Frontend Development

The Angular frontend features modern reactive patterns:

- **Components**: Reactive UI components with optimistic updates
- **Services**: HTTP services with WebSocket integration for real-time updates
- **Models**: TypeScript interfaces matching API DTOs
- **Real-time Service**: WebSocket client for live tournament synchronization
- **State Management**: Local state with server sync and conflict resolution
- **Routing**: Navigation between tournament management screens with real-time updates

### Adding New Features

1. **Backend**: Add entities to Domain, create DTOs in Application, implement repositories with Unit of Work, expose via Controllers, add real-time broadcasting
2. **Frontend**: Create reactive components, update models, add service methods with WebSocket support, configure routing with real-time updates
3. **Real-time**: Add SignalR hub methods for broadcasting, update frontend WebSocket handlers for live updates

## 🧪 Testing _(TODO)_

There are no tests for the moment. (TBH, I didn't thought that this application will grow that big and skipped the tests). But they are planned!

### Backend Testing

```bash
cd API/TournamentSystem.API
dotnet test
```

### Frontend Testing

```bash
cd Frontend/tournament-frontend
npm test
```

## 📝 Configuration

### Backend Configuration

The API can be configured via `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=tournaments.db"
  }
}
```

### Frontend Configuration

The frontend uses Angular environment files for configuration:

#### Environment Files

- `src/environments/environment.ts` - **Development** (default)
- `src/environments/environment.prod.ts` - **Production**
- `src/environments/environment.local.ts` - **Local development** (gitignored)

#### API URL Configuration

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: "https://localhost:7281/api", // Development API
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: "https://your-production-api-url.com/api", // Production API
};
```

#### Building with Different Environments

```bash
# Development build (uses environment.ts)
npm start
ng build --configuration=development

# Production build (uses environment.prod.ts)
npm run build
ng build --configuration=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

#### API Issues

1. **CORS Error**: Ensure the API is running and CORS is properly configured
2. **Database Issues**: Delete `tournaments.db` to reset the database
3. **Port Conflicts**: Change ports in `launchSettings.json` (API) or `angular.json` (Frontend)
4. **NuGet Package Issues**: Run `restore-api-deps` task in VS Code

#### Frontend Issues

1. **TypeScript Compilation Errors**:
   - Ensure all component classes are properly named (e.g., `TournamentDetailComponent`)
   - Run `npm install` in the frontend directory
   - Check Angular CLI version compatibility
2. **Module Import Errors**: Verify component exports match import statements
3. **Environment Configuration Issues**:
   - Verify environment files exist in `src/environments/`
   - Check API URL in environment files matches running API
   - Ensure production environment is properly configured before deployment
4. **Node Modules Issues**: Delete `node_modules` and run `npm install`
5. **Angular CLI Issues**: Update Angular CLI globally: `npm install -g @angular/cli@latest`

#### VS Code Issues

1. **Tasks Not Working**:
   - Ensure you're in the root project directory
   - Reload VS Code window (`Ctrl+Shift+P` → "Developer: Reload Window")
2. **Extensions Not Working**: Install recommended extensions when prompted
3. **Debugging Issues**: Check that both API and frontend are running before debugging

#### Development Workflow Issues

1. **First Time Setup**:
   ```bash
   # Run these tasks in order:
   1. restore-api-deps
   2. install-frontend-deps
   3. start-full-stack
   ```
2. **Hot Reload Not Working**: Restart the respective development server
3. **Database Connection Issues**: Check SQLite file permissions and path

### Support

For issues and questions, please create an issue in the repository.

## 📋 Quick Reference

### Essential Commands

```bash
# VS Code (Recommended)
Ctrl+Shift+P → "Tasks: Run Task" → "start-full-stack"

# Manual Setup
cd API/TournamentSystem.API && dotnet run          # API on :5000
cd Frontend/tournament-frontend && npm start       # Frontend on :4200
```

### Key URLs

- **Frontend**: http://localhost:4200
- **API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/swagger (when running)

### VS Code Shortcuts

- **F5** - Start debugging (select configuration)
- **Ctrl+Shift+P** - Command palette (access all tasks)
- **Ctrl+`** - Open terminal
- **Ctrl+Shift+E** - Explorer panel

### Project Files

- **API Configuration**: `API/TournamentSystem.API/appsettings.json`
- **Frontend Environment**: `Frontend/tournament-frontend/src/environments/environment*.ts`
- **Frontend Build Config**: `Frontend/tournament-frontend/angular.json`
- **VS Code Tasks**: `.vscode/tasks.json`
- **VS Code Debug**: `.vscode/launch.json`
- **VS Code Settings**: `.vscode/settings.json`

---

**Start your tournaments!** 🎯
