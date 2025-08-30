import { Observable } from 'rxjs';
import { Tournament, CreateTournamentRequest, Player, Match, Round, TournamentListItem } from './tournament.types';
import { AppError } from './error.types';

// API Request/Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Tournament API Operations
export interface AddPlayerRequest {
  name: string;
  password?: string;
}

export interface RemovePlayerRequest {
  tournamentId: number;
  playerId: number;
  password?: string;
}

export interface StartTournamentRequest {
  tournamentId: number;
  password?: string;
}

export interface SetMatchWinnerRequest {
  tournamentId: number;
  matchId: number;
  winnerId: number;
  password?: string;
}

export interface StartNextRoundRequest {
  tournamentId: number;
  matchResults: { matchId: number; winnerId: number }[];
  password?: string;
}

export interface UpdateTournamentRequest {
  tournamentId: number;
  name?: string;
  password?: string;
}

export interface DeleteTournamentRequest {
  tournamentId: number;
  password?: string;
}

export interface ValidatePasswordRequest {
  tournamentId: number;
  password: string;
}

export interface PasswordValidationResponse {
  isValid: boolean;
  message: string;
}

// Service Interfaces

// Core HTTP API Interface
export interface ITournamentApiService {
  getAllTournaments(): Observable<TournamentListItem[]>;
  getTournamentById(id: number): Observable<Tournament>;
  createTournament(request: CreateTournamentRequest): Observable<Tournament>;
  updateTournament(request: UpdateTournamentRequest): Observable<Tournament>;
  deleteTournament(request: DeleteTournamentRequest): Observable<void>;
  
  addPlayer(tournamentId: number, request: AddPlayerRequest): Observable<Tournament>;
  removePlayer(request: RemovePlayerRequest): Observable<Tournament>;
  startTournament(request: StartTournamentRequest): Observable<Tournament>;
  
  setMatchWinner(request: SetMatchWinnerRequest): Observable<Match>;
  startNextRound(request: StartNextRoundRequest): Observable<Tournament>;
  
  validatePassword(request: ValidatePasswordRequest): Observable<PasswordValidationResponse>;
}

// WebSocket Interface
export interface IWebSocketService {
  readonly connectionState$: Observable<WebSocketConnectionState>;
  readonly updates$: Observable<WebSocketUpdate>;
  
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  joinTournament(tournamentId: number): Promise<void>;
  leaveTournament(tournamentId?: number): Promise<void>;
  
  sendMessage<T>(method: string, ...args: any[]): Promise<T>;
}

export enum WebSocketConnectionState {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting', 
  Connected = 'Connected',
  Disconnecting = 'Disconnecting',
  Reconnecting = 'Reconnecting'
}

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
  MatchWinnerSet = 'MatchWinnerSet',
  RoundStarted = 'RoundStarted',
  TournamentCompleted = 'TournamentCompleted',
  ConnectionStatusChanged = 'ConnectionStatusChanged'
}

// Business Service Interface
export interface ITournamentBusinessService {
  // Tournament Management
  createTournament(data: CreateTournamentRequest): Observable<Tournament>;
  getTournament(id: number): Observable<Tournament>;
  getAllTournaments(): Observable<TournamentListItem[]>;
  updateTournament(id: number, data: UpdateTournamentRequest): Observable<Tournament>;
  deleteTournament(id: number, password?: string): Observable<void>;
  
  // Player Management
  addPlayer(tournamentId: number, playerName: string, password?: string): Observable<Tournament>;
  removePlayer(tournamentId: number, playerId: number, password?: string): Observable<Tournament>;
  
  // Match Management
  setMatchWinner(tournamentId: number, matchId: number, winnerId: number, password?: string): Observable<Match>;
  startTournament(tournamentId: number, password?: string): Observable<Tournament>;
  startNextRound(tournamentId: number, matchResults: { matchId: number; winnerId: number }[], password?: string): Observable<Tournament>;
  
  // Validation
  validateTournamentPassword(tournamentId: number, password: string): Observable<boolean>;
  canManageTournament(tournamentId: number): boolean;
}

// State Management Interface
export interface ITournamentStateService {
  // State Observables
  readonly currentTournament$: Observable<Tournament | null>;
  readonly tournaments$: Observable<TournamentListItem[]>;
  readonly loading$: Observable<boolean>;
  readonly error$: Observable<AppError | null>;
  
  // State Management
  loadTournament(id: number): Promise<void>;
  loadTournaments(): Promise<void>;
  selectTournament(tournament: Tournament): void;
  clearCurrentTournament(): void;
  
  // Error Management
  setError(error: AppError): void;
  clearError(): void;
  
  // Loading Management
  setLoading(loading: boolean): void;
}

// Storage Interface
export interface IStorageService {
  // Password Management
  setPassword(tournamentId: number, password: string): void;
  getPassword(tournamentId: number): string | null;
  hasPassword(tournamentId: number): boolean;
  clearPassword(tournamentId: number): void;
  clearAllPasswords(): void;
  
  // Settings Management
  setSetting<T>(key: string, value: T): void;
  getSetting<T>(key: string, defaultValue?: T): T | null;
  removeSetting(key: string): void;
  
  // Cache Management
  setCache<T>(key: string, value: T, expirationMinutes?: number): void;
  getCache<T>(key: string): T | null;
  clearCache(key?: string): void;
  clearExpiredCache(): void;
}

// Notification Interface
export interface INotificationService {
  readonly notifications$: Observable<Notification[]>;
  
  showSuccess(message: string, duration?: number): void;
  showError(error: AppError): void;
  showWarning(message: string, duration?: number): void;
  showInfo(message: string, duration?: number): void;
  
  dismissNotification(id: string): void;
  dismissAll(): void;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  dismissible: boolean;
  timestamp: Date;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

// Cache Strategy Interface
export interface ICacheStrategy<T> {
  get(key: string): T | null;
  set(key: string, value: T, options?: CacheOptions): void;
  remove(key: string): void;
  clear(): void;
  has(key: string): boolean;
  size(): number;
}

export interface CacheOptions {
  expirationMinutes?: number;
  maxSize?: number;
  priority?: number;
}

// Request Configuration
export interface RequestConfig {
  retries?: number;
  timeout?: number;
  cache?: boolean;
  cacheKey?: string;
  showLoading?: boolean;
  showError?: boolean;
  requiresAuth?: boolean;
}