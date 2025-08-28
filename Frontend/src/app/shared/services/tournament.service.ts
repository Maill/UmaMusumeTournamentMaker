import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

import { 
  Tournament, 
  TournamentListItem, 
  CreateTournamentRequest,
  TournamentType 
} from '../types/tournament.types';

import { environment } from '../../../environments/environment';

export interface AddPlayerRequest {
  name: string;
  password?: string;
}

export interface RemovePlayerRequest {
  tournamentId: number;
  playerId: number;
  password?: string;
}

export interface SetWinnerRequest {
  tournamentId: number;
  matchId: number;
  winnerId: number;
  password?: string;
}

export interface StartTournamentRequest {
  tournamentId: number;
  password?: string;
}

export interface StartNextRoundRequest {
  tournamentId: number;
  matchResults: { matchId: number; winnerId: number }[];
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TournamentService {
  private readonly apiUrl = `${environment.apiUrl}/tournaments`;
  
  // Simple reactive state
  private tournamentsSubject = new BehaviorSubject<TournamentListItem[]>([]);
  private currentTournamentSubject = new BehaviorSubject<Tournament | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Public observables
  tournaments$ = this.tournamentsSubject.asObservable();
  currentTournament$ = this.currentTournamentSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  // Password storage (simple)
  private readonly PASSWORD_KEY_PREFIX = 'tournament_password_';

  constructor(private http: HttpClient) {}

  // Tournament CRUD
  getAllTournaments(): Observable<TournamentListItem[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    return this.http.get<TournamentListItem[]>(this.apiUrl).pipe(
      tap(tournaments => {
        this.tournamentsSubject.next(tournaments);
      }),
      catchError(this.handleError),
      tap(() => this.loadingSubject.next(false))
    );
  }

  getTournament(id: number): Observable<Tournament> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    return this.http.get<Tournament>(`${this.apiUrl}/${id}`).pipe(
      tap(tournament => {
        this.currentTournamentSubject.next(tournament);
      }),
      catchError(this.handleError),
      tap(() => this.loadingSubject.next(false))
    );
  }

  createTournament(request: CreateTournamentRequest): Observable<Tournament> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    // Set default type if not provided
    const tournamentData = {
      name: request.name,
      type: request.type || TournamentType.Swiss,
      password: request.password
    };
    
    return this.http.post<Tournament>(this.apiUrl, tournamentData).pipe(
      tap(tournament => {
        // Store password if provided
        if (request.password) {
          this.setPassword(tournament.id, request.password);
        }
        
        // Update state
        const currentTournaments = this.tournamentsSubject.value;
        const tournamentListItem: TournamentListItem = {
          id: tournament.id,
          name: tournament.name,
          type: tournament.type,
          status: tournament.status,
          playersCount: tournament.players.length,
          currentRound: tournament.rounds?.length || 0,
          createdAt: tournament.createdAt
        };
        this.tournamentsSubject.next([tournamentListItem, ...currentTournaments]);
        this.currentTournamentSubject.next(tournament);
      }),
      catchError(this.handleError),
      tap(() => this.loadingSubject.next(false))
    );
  }

  deleteTournament(tournamentId: number, password?: string): Observable<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    const storedPassword = this.getPassword(tournamentId);
    const deleteData = {
      password: password || storedPassword
    };

    return this.http.delete<void>(`${this.apiUrl}/${tournamentId}`, { body: deleteData }).pipe(
      tap(() => {
        // Remove from state
        const currentTournaments = this.tournamentsSubject.value;
        this.tournamentsSubject.next(currentTournaments.filter(t => t.id !== tournamentId));
        
        // Clear current tournament if it was deleted
        if (this.currentTournamentSubject.value?.id === tournamentId) {
          this.currentTournamentSubject.next(null);
        }
        
        // Clear password
        this.clearPassword(tournamentId);
      }),
      catchError(this.handleError),
      tap(() => this.loadingSubject.next(false))
    );
  }

  // Player Management
  addPlayer(tournamentId: number, request: AddPlayerRequest): Observable<{message: string}> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    const storedPassword = this.getPassword(tournamentId);
    const playerData = {
      name: request.name.trim(),
      password: request.password || storedPassword
    };

    return this.http.post<{message: string}>(`${this.apiUrl}/${tournamentId}/players`, playerData).pipe(
      tap(response => {
        console.log('Add player success:', response.message);
        // Tournament data will come via WebSocket
      }),
      catchError(this.handleError),
      tap(() => this.loadingSubject.next(false))
    );
  }

  removePlayer(request: RemovePlayerRequest): Observable<{message: string}> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    const storedPassword = this.getPassword(request.tournamentId);
    const removeData = {
      tournamentId: request.tournamentId,
      playerId: request.playerId,
      password: request.password || storedPassword
    };

    return this.http.delete<{message: string}>(`${this.apiUrl}/players`, { 
      body: removeData 
    }).pipe(
      tap(response => {
        console.log('Remove player success:', response.message);
        // Tournament data will come via WebSocket
      }),
      catchError(this.handleError),
      tap(() => this.loadingSubject.next(false))
    );
  }

  // Match Management
  setMatchWinner(request: SetWinnerRequest): Observable<{message: string}> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    const winnerData = {
      tournamentId: request.tournamentId,
      matchId: request.matchId,
      winnerId: request.winnerId
    };

    return this.http.post<{message: string}>(`${environment.apiUrl}/matches/broadcast-winner`, winnerData).pipe(
      tap(response => {
        console.log('Broadcast winner success:', response.message);
        // Tournament data will come via WebSocket
      }),
      catchError(this.handleError),
      tap(() => this.loadingSubject.next(false))
    );
  }

  startTournament(request: StartTournamentRequest): Observable<{message: string}> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    const storedPassword = this.getPassword(request.tournamentId);
    const startData = {
      password: request.password || storedPassword
    };

    return this.http.post<{message: string}>(`${this.apiUrl}/${request.tournamentId}/start`, startData).pipe(
      tap(response => {
        console.log('Start tournament success:', response.message);
        // Tournament data will come via WebSocket
      }),
      catchError(this.handleError),
      tap(() => this.loadingSubject.next(false))
    );
  }

  startNextRound(request: StartNextRoundRequest): Observable<{message: string}> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    const storedPassword = this.getPassword(request.tournamentId);
    const roundData = {
      password: request.password || storedPassword,
      matchResults: request.matchResults
    };

    return this.http.post<{message: string}>(`${this.apiUrl}/${request.tournamentId}/next-round`, roundData).pipe(
      tap(response => {
        console.log('Start next round success:', response.message);
        // Tournament data will come via WebSocket
      }),
      catchError(this.handleError),
      tap(() => this.loadingSubject.next(false))
    );
  }

  // Password Management (localStorage-based)
  setPassword(tournamentId: number, password: string): void {
    localStorage.setItem(`${this.PASSWORD_KEY_PREFIX}${tournamentId}`, password);
  }

  getPassword(tournamentId: number): string | undefined {
    return localStorage.getItem(`${this.PASSWORD_KEY_PREFIX}${tournamentId}`) || undefined;
  }

  hasPassword(tournamentId: number): boolean {
    return localStorage.getItem(`${this.PASSWORD_KEY_PREFIX}${tournamentId}`) !== null;
  }

  clearPassword(tournamentId: number): void {
    localStorage.removeItem(`${this.PASSWORD_KEY_PREFIX}${tournamentId}`);
  }

  // Password validation
  validatePassword(tournamentId: number, password: string): Observable<{ isValid: boolean; message: string }> {
    return this.http.post<{ isValid: boolean; message: string }>(
      `${this.apiUrl}/${tournamentId}/validate-password`, 
      { password }
    ).pipe(
      tap(response => {
        if (response.isValid) {
          this.setPassword(tournamentId, password);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Utility Methods
  clearError(): void {
    this.errorSubject.next(null);
  }

  refreshTournaments(): void {
    this.getAllTournaments().subscribe();
  }

  refreshCurrentTournament(): void {
    const current = this.currentTournamentSubject.value;
    if (current) {
      this.getTournament(current.id).subscribe();
    }
  }

  // Private Methods
  private updateTournamentInList(tournamentId: number, updates: Partial<TournamentListItem>): void {
    const currentTournaments = this.tournamentsSubject.value;
    const updatedTournaments = currentTournaments.map(tournament =>
      tournament.id === tournamentId ? { ...tournament, ...updates } : tournament
    );
    this.tournamentsSubject.next(updatedTournaments);
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('Tournament Service Error:', error);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = 'Network error. Please check your connection.';
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Invalid request data';
          break;
        case 401:
          errorMessage = 'Authentication required. Please provide a password.';
          break;
        case 403:
          errorMessage = 'Access denied. Invalid password.';
          break;
        case 404:
          errorMessage = 'Tournament not found';
          break;
        case 409:
          errorMessage = error.error?.message || 'Conflict with current state';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
      }
    }
    
    this.errorSubject.next(errorMessage);
    return throwError(() => new Error(errorMessage));
  };
}