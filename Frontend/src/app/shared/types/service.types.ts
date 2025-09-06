export interface WebSocketUpdate {
  type: WebSocketUpdateType;
  tournamentId: number;
  data: any;
  timestamp: Date;
}

export enum WebSocketUpdateType {
  TournamentUpdated = 'TournamentUpdated',
  PlayerAdded = 'PlayerAdded',
  PlayerRemoved = 'PlayerRemoved',
  WinnerSelected = 'WinnerSelected',
  NewRound = 'NewRound',
  TournamentStarted = 'TournamentStarted',
  ConnectionStatusChanged = 'ConnectionStatusChanged',
  TournamentDeletion = 'TournamentDeletion',
  TournamentEdit = 'TournamentEdit',
}

export interface IdleState {
  isIdle: boolean;
  reason: 'tab-hidden' | 'user-inactive' | null;
  tournamentId: number | null;
}

export class LocalStorageError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class HttpError extends Error {
  httpCode: number;

  constructor(message: string, code: number) {
    super(message);
    this.httpCode = code;
  }
}
