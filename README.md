# Uma Musume Tournament Maker

A web application tournament maker for the game Uma Musume.

## 🎯 Main Features

The web application implements a **unique tournament format** that combines the best of Swiss and Round-Robin systems:

- **3-Player Simultaneous Matches** for dynamic competition
- **No Repeat Opponents Algorithm** ensuring fair play across all rounds
- **Swiss-Style Competitive Pairing** matching players of similar skill levels
- **Real-time Multi-user Management** with instant synchronization across all devices

## 📑 Table of Contents

- [🎮 Tournament System Features](#-tournament-system-features)
- [🎯 Usage Flow](#-usage-flow)

## 🎮 Tournament System Features

### 🔄 Advanced Tournament Algorithm

The core innovation of this system is its **sophisticated Swiss-Round-Robin hybrid algorithm**:

#### Pairing Intelligence

- **Competitiveness Analysis**: Uses standings to create balanced matchups
- **Performance-Based Matching**: Similar skill levels compete together for exciting matches
- **No-Repeat Guarantee**: Complex algorithm ensures no player faces same opponents twice _(Dev Note: this need calibration, you may face the same opponents multiple times)_
- **Priority System**: Players with fewer matches get priority in next round generation

#### Match Generation Process

1. **Calculate Player Priorities**: Players needing matches get higher priority
2. **Generate All Possible 3-Player Combinations**: Exclude previously used combinations
3. **Score Each Combination**: Rate competitiveness using points and wins variance
4. **Optimize Selection**: Choose best combinations ensuring all priority players get matches
5. **Handle Odd Numbers**: Rotating bye system with compensation points

#### Tournament Progression Logic

- **Target Achievement**: Each player must reach calculated target matches
- **Tie Resolution**: Automatic tiebreaker rounds when needed
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

- **Win**: 1 points
- **Bye**: 1 points (compensation for sitting out)
- **Loss**: 0 points
- **Standings**: Ranked by Points → Wins → Losses → Player ID

#### Champions Meeting Tournament (In Development)

- Multi-round tournament with group divisions
- Players advance through groups based on performance
- Three rounds: First Round, Second Round (Groups A & B), Final Round
- Complex advancement criteria based on wins

### Core Functionality

- **Tournament Management**: Create, start, and manage tournaments with password protection
- **Player Management**: Add/delete players with real-time sync across all users
- **Match Management**: Set winners with immediate broadcast to all tournament viewers
- **Multi-user Support**: Multiple users can manage tournaments simultaneously
- **Real-time Updates**: Live synchronization via WebSockets for all tournament actions
- **Optimistic UI**: Immediate feedback with rollback on API failures
- **Responsive Design**: Works on desktop and mobile devices

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

## 📄 License

This project is licensed under the MIT License.

**Start your tournaments!** 🎯
