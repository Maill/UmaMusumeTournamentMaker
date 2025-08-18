export enum TournamentType {
  Swiss = 1,
  ChampionsMeeting = 2
}

export enum TournamentStatus {
  Created = 1,
  InProgress = 2,
  Completed = 3
}

export interface Player {
  id: number;
  name: string;
  wins: number;
  losses: number;
  points: number;
  roundWins: number;
  roundLosses: number;
  group: string;
  winRate: number;
  totalMatches: number;
  roundMatches: number;
}

export interface Match {
  id: number;
  roundId: number;
  winnerId?: number;
  createdAt: string;
  completedAt?: string;
  players: Player[];
  winner?: Player;
}

export interface Round {
  id: number;
  roundNumber: number;
  createdAt: string;
  isCompleted: boolean;
  matches: Match[];
}

export interface Tournament {
  id: number;
  name: string;
  type: TournamentType;
  status: TournamentStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  currentRound: number;
  players: Player[];
  rounds: Round[];
}

export interface CreateTournament {
  name: string;
  type: TournamentType;
  password?: string;
}

export interface AddPlayer {
  name: string;
  password?: string;
}

export interface SetWinner {
  winnerId: number;
  password?: string;
}

export interface StartTournament {
  password?: string;
}

export interface UpdateTournament {
  name: string;
  password: string;
}

export interface DeleteTournament {
  password: string;
}