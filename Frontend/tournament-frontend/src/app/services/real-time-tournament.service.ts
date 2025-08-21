import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TournamentService } from './tournament.service';
import { TournamentWebSocketService, TournamentUpdate } from './tournament-websocket.service';
import { PasswordService } from './password.service';
import { Tournament, Player, Match, MatchResult } from '../models/tournament.model';
import { HubConnectionState } from '@microsoft/signalr';

// Extended Player interface for optimistic updates
interface OptimisticPlayer extends Player {
  isTemporary?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RealTimeTournamentService {
  private readonly currentTournamentSubject = new BehaviorSubject<Tournament | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  // Public observables
  public currentTournament$ = this.currentTournamentSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  // Connection state from WebSocket service
  public connectionState$: Observable<HubConnectionState>;

  constructor(
    private tournamentService: TournamentService,
    private webSocketService: TournamentWebSocketService,
    private passwordService: PasswordService
  ) {
    this.connectionState$ = this.webSocketService.connectionState$;
    this.initializeWebSocketHandlers();
  }

  private initializeWebSocketHandlers(): void {
    // Subscribe to WebSocket updates
    this.webSocketService.updates$.subscribe((update: TournamentUpdate) => {
      this.handleWebSocketUpdate(update);
    });
  }

  private handleWebSocketUpdate(update: TournamentUpdate): void {
    const currentTournament = this.currentTournamentSubject.value;
    if (!currentTournament) return;

    console.log('Received WebSocket update:', update);

    switch (update.type) {
      case 'PlayerAdded':
        this.handlePlayerAdded(update.data, currentTournament);
        break;
        
      case 'PlayerRemoved':
        this.handlePlayerRemoved(update.data, currentTournament);
        break;
        
      case 'MatchUpdated':
        this.handleMatchUpdated(update.data, currentTournament);
        break;
        
      case 'TournamentStarted':
        this.handleTournamentStarted(update.data);
        break;
        
      case 'NewRound':
        this.handleNewRound(update.data);
        break;
        
      case 'TournamentUpdated':
        this.handleTournamentUpdated(update.data);
        break;
        
      case 'WinnerSelected':
        this.handleWinnerSelected(update.data, currentTournament);
        break;
    }
  }

  private handlePlayerAdded(player: Player, currentTournament: Tournament): void {
    console.log('WebSocket PlayerAdded received:', player);
    
    // Remove any temporary players with the same name (optimistic updates)
    const playersWithoutTemp = currentTournament.players.filter(p => 
      !((p as OptimisticPlayer).isTemporary && p.name === player.name)
    );
    
    // Add the real player
    const updatedTournament = {
      ...currentTournament,
      players: [...playersWithoutTemp, player]
    };
    this.currentTournamentSubject.next(updatedTournament);
  }

  private handlePlayerRemoved(playerId: number, currentTournament: Tournament): void {
    const updatedTournament = {
      ...currentTournament,
      players: currentTournament.players.filter(p => p.id !== playerId)
    };
    this.currentTournamentSubject.next(updatedTournament);
  }

  private handleMatchUpdated(match: Match, currentTournament: Tournament): void {
    const updatedTournament = {
      ...currentTournament,
      rounds: currentTournament.rounds.map(round => ({
        ...round,
        matches: round.matches.map(m => m.id === match.id ? match : m)
      }))
    };
    
    // Also update player statistics if the match has a winner
    if (match.winnerId) {
      // Find updated players from the match data and update them
      const updatedPlayers = currentTournament.players.map(player => {
        const matchPlayer = match.players.find(mp => mp.id === player.id);
        return matchPlayer ? { ...player, ...matchPlayer } : player;
      });
      
      updatedTournament.players = updatedPlayers;
    }
    
    this.currentTournamentSubject.next(updatedTournament);
  }

  private updateLocalMatchWinner(matchId: number, winnerId: number): void {
    const currentTournament = this.currentTournamentSubject.value;
    if (!currentTournament) return;

    const updatedTournament = {
      ...currentTournament,
      rounds: currentTournament.rounds.map(round => ({
        ...round,
        matches: round.matches.map(match => {
          if (match.id === matchId) {
            // Find the winner player from the match players
            const winner = match.players.find(p => p.id === winnerId);
            return { 
              ...match, 
              winnerId: winnerId,
              winner: winner ? { ...winner } : undefined
            };
          }
          return match;
        })
      }))
    };

    this.currentTournamentSubject.next(updatedTournament);
  }

  private handleTournamentStarted(tournament: Tournament): void {
    this.currentTournamentSubject.next(tournament);
  }

  private handleNewRound(tournament: Tournament): void {
    console.log('WebSocket NewRound received:', tournament);
    this.currentTournamentSubject.next(tournament);
  }

  private handleTournamentUpdated(tournament: Tournament): void {
    this.currentTournamentSubject.next(tournament);
  }

  private handleWinnerSelected(winnerData: { matchId: number, winnerId: number }, currentTournament: Tournament): void {
    console.log('WebSocket WinnerSelected received:', winnerData);
    this.updateLocalMatchWinner(winnerData.matchId, winnerData.winnerId);
  }

  /**
   * Initialize real-time connection and load tournament
   */
  public async initializeTournament(tournamentId: number): Promise<void> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);

      // Start WebSocket connection
      await this.webSocketService.startConnection();
      
      // Load tournament data
      const tournament = await this.tournamentService.getTournamentWithCurrentRound(tournamentId).toPromise();
      
      if (tournament) {
        this.currentTournamentSubject.next(tournament);
        
        // Join tournament group for real-time updates
        await this.webSocketService.joinTournament(tournamentId);
      }
    } catch (error) {
      console.error('Error initializing tournament:', error);
      this.errorSubject.next('Failed to initialize tournament connection');
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Add player with optimistic UI update
   */
  public async addPlayer(tournamentId: number, playerName: string): Promise<void> {
    try {
      const currentTournament = this.currentTournamentSubject.value;
      if (!currentTournament) throw new Error('No tournament loaded');

      // Optimistic update
      const tempPlayer: OptimisticPlayer = {
        id: 0, // Temporary ID
        name: playerName,
        wins: 0,
        losses: 0,
        points: 0,
        roundWins: 0,
        roundLosses: 0,
        group: '',
        winRate: 0,
        totalMatches: 0,
        roundMatches: 0,
        isTemporary: true
      };

      const optimisticTournament = {
        ...currentTournament,
        players: [...currentTournament.players, tempPlayer]
      };
      this.currentTournamentSubject.next(optimisticTournament);

      // Make API call
      console.log('Making API call to add player:', playerName);
      await this.tournamentService.addPlayer(tournamentId, { name: playerName }).toPromise();
      console.log('API call successful, waiting for WebSocket event');
      
      // Success! WebSocket should provide the real data with the actual player ID
      // Set a fallback timeout in case WebSocket event doesn't arrive
      setTimeout(() => {
        const currentState = this.currentTournamentSubject.value;
        if (currentState) {
          // Check if we still have the temporary player (WebSocket event didn't arrive)
          const hasTemp = currentState.players.some(p => (p as OptimisticPlayer).isTemporary && p.name === playerName);
          if (hasTemp) {
            console.warn('WebSocket PlayerAdded event may not have arrived, cleaning up temporary player');
            // Remove the temporary player
            const cleanedTournament = {
              ...currentState,
              players: currentState.players.filter(p => !((p as OptimisticPlayer).isTemporary && p.name === playerName))
            };
            this.currentTournamentSubject.next(cleanedTournament);
          }
        }
      }, 2000); // 2 second fallback

    } catch (error) {
      console.error('Error adding player:', error);
      
      // Revert optimistic update on error
      const currentTournament = this.currentTournamentSubject.value;
      if (currentTournament) {
        const revertedTournament = {
          ...currentTournament,
          players: currentTournament.players.filter(p => !(p as OptimisticPlayer).isTemporary)
        };
        this.currentTournamentSubject.next(revertedTournament);
      }
      
      this.errorSubject.next('Failed to add player');
      throw error;
    }
  }

  /**
   * Remove player with optimistic UI update
   */
  public async removePlayer(tournamentId: number, playerId: number): Promise<void> {
    const currentTournament = this.currentTournamentSubject.value;
    if (!currentTournament) throw new Error('No tournament loaded');

    // Store removed player for potential rollback
    const removedPlayer = currentTournament.players.find(p => p.id === playerId);
    if (!removedPlayer) throw new Error('Player not found');
    
    try {
      // Optimistic update
      const optimisticTournament = {
        ...currentTournament,
        players: currentTournament.players.filter(p => p.id !== playerId)
      };
      this.currentTournamentSubject.next(optimisticTournament);

      // Make API call
      await this.tournamentService.removePlayer(tournamentId, playerId).toPromise();

    } catch (error) {
      console.error('Error removing player:', error);
      
      // Revert optimistic update on error
      const revertedTournament = {
        ...currentTournament,
        players: [...currentTournament.players, removedPlayer]
      };
      this.currentTournamentSubject.next(revertedTournament);
      
      this.errorSubject.next('Failed to remove player');
      throw error;
    }
  }

  // Note: setMatchWinner method removed - winners are now set locally and submitted in batch with Next Round

  /**
   * Start tournament
   */
  public async startTournament(tournamentId: number): Promise<void> {
    try {
      await this.tournamentService.startTournament(tournamentId).toPromise();
      // Tournament update will come via WebSocket
    } catch (error) {
      console.error('Error starting tournament:', error);
      this.errorSubject.next('Failed to start tournament');
      throw error;
    }
  }

  /**
   * Start next round with match results
   */
  public async startNextRound(tournamentId: number, matchResults: MatchResult[]): Promise<void> {
    try {
      await this.tournamentService.startNextRound(tournamentId, matchResults).toPromise();
      // Tournament update will come via WebSocket
    } catch (error) {
      console.error('Error starting next round:', error);
      this.errorSubject.next('Failed to start next round');
      throw error;
    }
  }

  /**
   * Broadcast winner selection to all users (no database update)
   */
  public async broadcastWinnerSelection(tournamentId: number, matchId: number, winnerId: number): Promise<void> {
    try {
      await this.tournamentService.broadcastWinnerSelection(tournamentId, matchId, winnerId).toPromise();
      // Also update local state immediately
      this.updateLocalMatchWinner(matchId, winnerId);
    } catch (error) {
      console.error('Error broadcasting winner selection:', error);
      // Don't throw error - this is just for UI sync, not critical
    }
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    await this.webSocketService.leaveTournament();
    await this.webSocketService.stopConnection();
    this.currentTournamentSubject.next(null);
    this.errorSubject.next(null);
  }

  // Password management helper methods
  public setTournamentPassword(tournamentId: number, password: string): void {
    this.passwordService.setPassword(tournamentId, password);
  }

  public getTournamentPassword(tournamentId: number): string | undefined {
    return this.passwordService.getPassword(tournamentId);
  }

  public hasTournamentPassword(tournamentId: number): boolean {
    return this.passwordService.hasPassword(tournamentId);
  }

  public clearTournamentPassword(tournamentId: number): void {
    this.passwordService.clearPassword(tournamentId);
  }
}