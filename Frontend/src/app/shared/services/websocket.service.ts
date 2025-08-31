import { Injectable, inject } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IdleManagerService } from './idle-manager.service';

export interface WebSocketUpdate {
  type:
    | 'PlayerAdded'
    | 'PlayerRemoved'
    | 'MatchUpdated'
    | 'TournamentStarted'
    | 'NewRound'
    | 'TournamentUpdated'
    | 'WinnerSelected';
  tournamentId: number;
  data: any;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private idleManager = inject(IdleManagerService);
  private connection: HubConnection | null = null;
  private currentTournamentId: number | null = null;
  private isIdleDisconnected = false;

  // Simple state tracking
  private connectionStateSubject = new BehaviorSubject<HubConnectionState>(
    HubConnectionState.Disconnected
  );
  private updatesSubject = new Subject<WebSocketUpdate>();

  // Public observables
  connectionState$ = this.connectionStateSubject.asObservable();
  updates$ = this.updatesSubject.asObservable();

  constructor() {
    this.initializeConnection();
    this.setupIdleIntegration();
  }

  // Connection Management
  async connect(): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      return;
    }

    try {
      this.connectionStateSubject.next(HubConnectionState.Connecting);
      await this.connection?.start();
      this.connectionStateSubject.next(HubConnectionState.Connected);
      this.isIdleDisconnected = false;
      this.idleManager.startIdleDetection();
      console.log('WebSocket connected');
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.connectionStateSubject.next(HubConnectionState.Disconnected);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      await this.connection.stop();
    }
    this.connectionStateSubject.next(HubConnectionState.Disconnected);
    this.currentTournamentId = null;
    this.idleManager.stopIdleDetection();
  }

  // Tournament Group Management - match backend method names exactly
  async joinTournament(tournamentId: number): Promise<void> {
    if (this.connection?.state !== HubConnectionState.Connected) {
      await this.connect();
    }

    try {
      // Leave previous tournament if different
      if (this.currentTournamentId && this.currentTournamentId !== tournamentId) {
        await this.leaveTournament();
      }

      // Backend expects string
      await this.connection!.invoke('JoinTournament', tournamentId.toString());
      this.currentTournamentId = tournamentId;
      console.log(`Joined tournament group: ${tournamentId}`);
    } catch (error) {
      console.error('Failed to join tournament group:', error);
      throw error;
    }
  }

  async leaveTournament(): Promise<void> {
    if (!this.currentTournamentId || this.connection?.state !== HubConnectionState.Connected) {
      return;
    }

    try {
      // Backend expects string
      await this.connection.invoke('LeaveTournament', this.currentTournamentId.toString());
      console.log(`Left tournament group: ${this.currentTournamentId}`);
      this.currentTournamentId = null;
    } catch (error) {
      console.error('Failed to leave tournament group:', error);
    }
  }

  // Utility
  isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }

  getCurrentTournamentId(): number | null {
    return this.currentTournamentId;
  }

  // Private Methods
  private initializeConnection(): void {
    this.connection = new HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/tournamentHub`)
      .withAutomaticReconnect()
      .configureLogging(environment.production ? LogLevel.Warning : LogLevel.Information)
      .build();

    this.setupEventHandlers();
    this.setupConnectionHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Match backend events exactly
    this.connection.on('PlayerAdded', (player: any) => {
      this.emitUpdate('PlayerAdded', player);
    });

    this.connection.on('PlayerRemoved', (playerId: number) => {
      this.emitUpdate('PlayerRemoved', { playerId });
    });

    this.connection.on('MatchUpdated', (match: any) => {
      this.emitUpdate('MatchUpdated', match);
    });

    this.connection.on('TournamentStarted', (tournament: any) => {
      this.emitUpdate('TournamentStarted', tournament);
    });

    this.connection.on('NewRound', (tournament: any) => {
      this.emitUpdate('NewRound', tournament);
    });

    this.connection.on('TournamentUpdated', (tournament: any) => {
      this.emitUpdate('TournamentUpdated', tournament);
    });

    this.connection.on('WinnerSelected', (data: { matchId: number; winnerId: number }) => {
      this.emitUpdate('WinnerSelected', data);
    });
  }

  private setupConnectionHandlers(): void {
    if (!this.connection) return;

    this.connection.onreconnecting(() => {
      console.log('WebSocket reconnecting...');
      this.connectionStateSubject.next(HubConnectionState.Reconnecting);
    });

    this.connection.onreconnected(async (connectionId) => {
      console.log('WebSocket reconnected:', connectionId);
      this.connectionStateSubject.next(HubConnectionState.Connected);

      // Rejoin tournament group if we were in one
      if (this.currentTournamentId) {
        try {
          await this.connection!.invoke('JoinTournament', this.currentTournamentId.toString());
        } catch (error) {
          console.error('Failed to rejoin tournament group:', error);
        }
      }
    });

    this.connection.onclose((error) => {
      console.log('WebSocket connection closed:', error);
      this.connectionStateSubject.next(HubConnectionState.Disconnected);
      this.currentTournamentId = null;
    });
  }

  private emitUpdate(type: WebSocketUpdate['type'], data: any): void {
    const update: WebSocketUpdate = {
      type,
      tournamentId: this.currentTournamentId || 0,
      data,
      timestamp: new Date(),
    };

    this.updatesSubject.next(update);
  }

  // Idle Management Integration
  private setupIdleIntegration(): void {
    // Subscribe to idle state changes
    this.idleManager.idleState$.subscribe(async (state) => {
      if (state.isIdle && this.connection?.state === HubConnectionState.Connected) {
        console.log(`Disconnecting due to idle: ${state.reason}`);
        this.isIdleDisconnected = true;
        await this.disconnect();
      } else if (!state.isIdle && this.isIdleDisconnected) {
        console.log('Reconnecting after idle period ended');
        await this.reconnectAfterIdle();
      }
    });
  }

  private async reconnectAfterIdle(): Promise<void> {
    try {
      await this.connect();

      // Rejoin tournament if we were in one
      if (this.currentTournamentId) {
        await this.joinTournament(this.currentTournamentId);
      }
    } catch (error) {
      console.error('Failed to reconnect after idle:', error);
    }
  }
}
