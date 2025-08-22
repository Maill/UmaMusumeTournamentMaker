import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TournamentUpdate {
  type: 'PlayerAdded' | 'PlayerRemoved' | 'MatchUpdated' | 'TournamentStarted' | 'NewRound' | 'TournamentUpdated' | 'WinnerSelected';
  data: any;
  tournamentId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TournamentWebSocketService {
  private hubConnection: HubConnection | null = null;
  private readonly updateSubject = new Subject<TournamentUpdate>();
  private readonly connectionStateSubject = new BehaviorSubject<HubConnectionState>(HubConnectionState.Disconnected);
  
  // Observable streams for components to subscribe to
  public updates$ = this.updateSubject.asObservable();
  public connectionState$ = this.connectionStateSubject.asObservable();
  
  private currentTournamentId: number | null = null;

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    // Build the SignalR connection
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl.replace('/api', '')}/tournamentHub`, {
        withCredentials: false
      })
      .withAutomaticReconnect()
      .build();

    // Set up event handlers
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.hubConnection) return;

    // Player events
    this.hubConnection.on('PlayerAdded', (player: any) => {
      this.updateSubject.next({
        type: 'PlayerAdded',
        data: player
      });
    });

    this.hubConnection.on('PlayerRemoved', (playerId: number) => {
      this.updateSubject.next({
        type: 'PlayerRemoved',
        data: playerId
      });
    });

    // Match events
    this.hubConnection.on('MatchUpdated', (match: any) => {
      this.updateSubject.next({
        type: 'MatchUpdated',
        data: match
      });
    });

    // Tournament events
    this.hubConnection.on('TournamentStarted', (tournament: any) => {
      this.updateSubject.next({
        type: 'TournamentStarted',
        data: tournament
      });
    });

    this.hubConnection.on('NewRound', (tournament: any) => {
      this.updateSubject.next({
        type: 'NewRound',
        data: tournament
      });
    });

    this.hubConnection.on('TournamentUpdated', (tournament: any) => {
      this.updateSubject.next({
        type: 'TournamentUpdated',
        data: tournament
      });
    });

    // Winner selection events
    this.hubConnection.on('WinnerSelected', (winnerData: any) => {
      this.updateSubject.next({
        type: 'WinnerSelected',
        data: winnerData
      });
    });

    // Connection state events
    this.hubConnection.onclose(() => {
      this.connectionStateSubject.next(HubConnectionState.Disconnected);
      console.log('SignalR connection closed');
    });

    this.hubConnection.onreconnecting(() => {
      this.connectionStateSubject.next(HubConnectionState.Reconnecting);
      console.log('SignalR reconnecting...');
    });

    this.hubConnection.onreconnected(() => {
      this.connectionStateSubject.next(HubConnectionState.Connected);
      console.log('SignalR reconnected');
      
      // Rejoin tournament group if we were in one
      if (this.currentTournamentId) {
        this.joinTournament(this.currentTournamentId);
      }
    });
  }

  /**
   * Start the SignalR connection
   */
  public async startConnection(): Promise<void> {
    if (!this.hubConnection) {
      this.initializeConnection();
    }

    if (this.hubConnection?.state === HubConnectionState.Disconnected) {
      try {
        await this.hubConnection.start();
        this.connectionStateSubject.next(HubConnectionState.Connected);
        console.log('SignalR connection established');
      } catch (error) {
        console.error('Error starting SignalR connection:', error);
        this.connectionStateSubject.next(HubConnectionState.Disconnected);
        throw error;
      }
    }
  }

  /**
   * Stop the SignalR connection
   */
  public async stopConnection(): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === HubConnectionState.Connected) {
      try {
        await this.hubConnection.stop();
        this.connectionStateSubject.next(HubConnectionState.Disconnected);
        console.log('SignalR connection stopped');
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }
    }
  }

  /**
   * Join a tournament group to receive updates for that tournament
   */
  public async joinTournament(tournamentId: number): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state !== HubConnectionState.Connected) {
      throw new Error('SignalR connection is not active');
    }

    try {
      // Leave current tournament if any
      if (this.currentTournamentId && this.currentTournamentId !== tournamentId) {
        await this.leaveTournament();
      }

      await this.hubConnection.invoke('JoinTournament', tournamentId.toString());
      this.currentTournamentId = tournamentId;
      console.log(`Joined tournament group: ${tournamentId}`);
    } catch (error) {
      console.error('Error joining tournament group:', error);
      throw error;
    }
  }

  /**
   * Leave the current tournament group
   */
  public async leaveTournament(): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state !== HubConnectionState.Connected || !this.currentTournamentId) {
      return;
    }

    try {
      await this.hubConnection.invoke('LeaveTournament', this.currentTournamentId.toString());
      console.log(`Left tournament group: ${this.currentTournamentId}`);
      this.currentTournamentId = null;
    } catch (error) {
      console.error('Error leaving tournament group:', error);
    }
  }

  /**
   * Get the current tournament ID we're subscribed to
   */
  public getCurrentTournamentId(): number | null {
    return this.currentTournamentId;
  }

  /**
   * Check if currently connected
   */
  public isConnected(): boolean {
    return this.hubConnection?.state === HubConnectionState.Connected;
  }

  /**
   * Clean up resources
   */
  public ngOnDestroy(): void {
    this.stopConnection();
    this.updateSubject.complete();
    this.connectionStateSubject.complete();
  }
}