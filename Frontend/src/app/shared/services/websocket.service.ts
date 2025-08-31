import { Injectable } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  private connection: HubConnection | null = null;
  private currentTournamentId: number | null = null;

  // Simple state tracking
  private connectionStateSubject = new BehaviorSubject<HubConnectionState>(
    HubConnectionState.Disconnected
  );
  private updatesSubject = new Subject<WebSocketUpdate>();

  // Idle management
  private tabHiddenTimer: number | null = null;
  private userInactiveTimer: number | null = null;
  private isIdleDisconnected = false;

  // Timeouts
  private readonly TAB_HIDDEN_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  private readonly USER_INACTIVE_TIMEOUT = 15 * 60 * 1000; // 15 minutes

  // Public observables
  connectionState$ = this.connectionStateSubject.asObservable();
  updates$ = this.updatesSubject.asObservable();

  constructor() {
    this.initializeConnection();
    this.setupIdleManagement();
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
      this.resetUserInactiveTimer();
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
    this.clearAllTimers();
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

  // Idle Management
  private setupIdleManagement(): void {
    // Page Visibility API - handle tab switching
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handleTabHidden();
      } else {
        this.handleTabVisible();
      }
    });

    // User activity detection
    const activityEvents = ['click', 'keydown', 'scroll', 'mousemove', 'touchstart'];
    activityEvents.forEach((event) => {
      document.addEventListener(event, () => this.handleUserActivity(), { passive: true });
    });

    // Start user inactivity timer
    this.resetUserInactiveTimer();
  }

  private handleTabHidden(): void {
    console.log('Tab hidden - starting disconnect timer');
    this.clearTabHiddenTimer();

    this.tabHiddenTimer = setTimeout(async () => {
      if (this.connection?.state === HubConnectionState.Connected) {
        console.log('Disconnecting due to tab being hidden for 5 minutes');
        this.isIdleDisconnected = true;
        await this.disconnect();
      }
    }, this.TAB_HIDDEN_TIMEOUT);
  }

  private handleTabVisible(): void {
    console.log('Tab visible - clearing disconnect timer');
    this.clearTabHiddenTimer();

    // Reconnect if we were idle disconnected
    if (this.isIdleDisconnected && this.connection?.state === HubConnectionState.Disconnected) {
      console.log('Reconnecting after tab became visible');
      this.reconnectAfterIdle();
    }

    this.resetUserInactiveTimer();
  }

  private handleUserActivity(): void {
    // Only reset timer if we're connected and tab is visible
    if (!document.hidden && this.connection?.state === HubConnectionState.Connected) {
      this.resetUserInactiveTimer();
    }
  }

  private resetUserInactiveTimer(): void {
    this.clearUserInactiveTimer();

    this.userInactiveTimer = setTimeout(async () => {
      if (this.connection?.state === HubConnectionState.Connected && !document.hidden) {
        console.log('Disconnecting due to user inactivity for 15 minutes');
        this.isIdleDisconnected = true;
        await this.disconnect();
      }
    }, this.USER_INACTIVE_TIMEOUT);
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

  private clearTabHiddenTimer(): void {
    if (this.tabHiddenTimer) {
      clearTimeout(this.tabHiddenTimer);
      this.tabHiddenTimer = null;
    }
  }

  private clearUserInactiveTimer(): void {
    if (this.userInactiveTimer) {
      clearTimeout(this.userInactiveTimer);
      this.userInactiveTimer = null;
    }
  }

  private clearAllTimers(): void {
    this.clearTabHiddenTimer();
    this.clearUserInactiveTimer();
  }
}
