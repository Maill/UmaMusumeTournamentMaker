
import { Component, computed, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

// Import organisms
import { MatchTableComponent } from '../../shared/organisms/match-table/match-table.component';
import { PlayerManagementComponent } from '../../shared/organisms/player-management/player-management.component';
import { StandingsTableComponent } from '../../shared/organisms/standings-table/standings-table.component';

// Import molecules and atoms
import { BaseBadgeComponent } from '../../shared/atoms/badge/base-badge.component';
import { BaseButtonComponent } from '../../shared/atoms/button/base-button.component';
import { BaseIconComponent } from '../../shared/atoms/icon/base-icon.component';
import { LoadingSpinnerComponent } from '../../shared/atoms/spinner/loading-spinner.component';
import { ErrorDisplayComponent } from '../../shared/molecules/error-display/error-display.component';
import { PasswordModalComponent } from '../../shared/molecules/password-modal/password-modal.component';
import { TournamentDeleteModal } from '../../shared/molecules/tournament-delete-modal/tournament-delete-modal';
import { TournamentEditModal } from '../../shared/molecules/tournament-edit-modal/tournament-edit-modal';

// Import types and services
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { TournamentService } from '../../shared/services/tournament.service';
import { WebSocketService } from '../../shared/services/websocket.service';
import {
  EditTournamentData,
  MatchTableData,
  MatchTableState,
  PasswordModalData,
  PlayerManagementState,
  StandingsTableData,
  TournamentDeleteModalData,
  TournamentEditModalData,
} from '../../shared/types/components.types';
import { HttpError, LocalStorageError, WebSocketUpdate } from '../../shared/types/service.types';
import {
  Round,
  Tournament,
  TournamentStatus,
  TournamentType,
} from '../../shared/types/tournament.types';

@Component({
  selector: 'app-tournament-detail-page',
  standalone: true,
  imports: [
    PlayerManagementComponent,
    MatchTableComponent,
    StandingsTableComponent,
    ErrorDisplayComponent,
    LoadingSpinnerComponent,
    BaseButtonComponent,
    BaseIconComponent,
    BaseBadgeComponent,
    PasswordModalComponent,
    TournamentDeleteModal,
    TournamentEditModal,
  ],
  templateUrl: './tournament-detail.page.html',
  styleUrl: './tournament-detail.page.css',
})
export class TournamentDetailPageComponent implements OnInit, OnDestroy {
  // Dependency injection
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private tournamentService: TournamentService = inject(TournamentService);
  private webSocketService: WebSocketService = inject(WebSocketService);
  private localStorageService: LocalStorageService = inject(LocalStorageService);
  private destroyRef = inject(DestroyRef);

  // Private non-signal state
  private tournamentId: number = 0;

  // Expose enums for template
  TournamentStatus = TournamentStatus;
  TournamentType = TournamentType;

  // Core state signals
  readonly tournament = signal<Tournament | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly managementMode = signal(false);
  readonly isUpdating = signal(false);

  // Modal state signals
  readonly passwordModal = signal<PasswordModalData>({
    isVisible: false,
    title: 'Enter Management Mode',
    message: 'Enter the tournament password to manage this tournament.',
    isLoading: false,
    error: null,
  });

  readonly tournamentDeleteModal = signal<TournamentDeleteModalData>({
    error: null,
    isLoading: false,
    isVisible: false,
  });

  readonly tournamentEditModal = signal<TournamentEditModalData>({
    formData: { name: '' },
    error: null,
    isLoading: false,
    isVisible: false,
  });

  // Computed signals
  readonly currentRound = computed<Round | null>(() => {
    if (!this.tournament()?.rounds) return null;
    return this.tournament()!.rounds.find((r) => !r.isCompleted) || null;
  });

  tournamentTypeName(): string {
    switch (this.tournament()?.type) {
      case TournamentType.Swiss:
        return 'Swiss Tournament';
      default:
        return 'Unknown';
    }
  }

  statusText(): string {
    switch (this.tournament()?.status) {
      case TournamentStatus.Created:
        return 'Setup Phase';
      case TournamentStatus.InProgress:
        return 'In Progress';
      case TournamentStatus.Completed:
        return 'Completed';
      default:
        return 'Unknown';
    }
  }

  typeVariant(): 'primary' | 'info' {
    return this.tournament()?.type === TournamentType.Swiss ? 'primary' : 'info';
  }

  statusVariant(): 'warning' | 'primary' | 'success' {
    switch (this.tournament()?.status) {
      case TournamentStatus.Created:
        return 'warning';
      case TournamentStatus.InProgress:
        return 'primary';
      case TournamentStatus.Completed:
        return 'success';
      default:
        return 'warning';
    }
  }

  winnerName(): string {
    if (!this.tournament()?.winnerId) return '';
    const winner = this.tournament()!.players.find(
      (p) => p.id === this.tournament()?.winnerId,
    );
    return winner?.name || '';
  }

  readonly canStartNextRound = computed(() => {
    const round = this.currentRound();
    if (!round) return false;
    return round.matches.every((match) => match.winnerId) && this.managementMode();
  });

  nextRoundButtonText(): string {
    return this.currentRound()?.roundType == 'Final' ? 'Complete Tournament' : 'Start Next Round';
  }

  playerManagementState(): PlayerManagementState {
    return {
      isAddingPlayer: this.isUpdating(),
      isRemovingPlayer: this.isUpdating(),
      isStartingTournament: this.isUpdating(),
      canManage: this.managementMode(),
      error: this.error(),
      addPlayerError: null,
    };
  }

  readonly matchTableData = computed<MatchTableData>(() => ({
    players: Object.fromEntries(
      this.tournament()!.players.map((player) => [player.id, player]),
    ),
    round: this.currentRound()!,
    canManage: this.managementMode(),
    isLoading: this.isUpdating(),
    error: this.error(),
  }));

  matchTableState(): MatchTableState {
    return {
      updatingMatchId: this.isUpdating() ? -1 : null,
      canStartNextRound: this.canStartNextRound(),
      isStartingNextRound: this.isUpdating(),
      nextRoundButtonText: this.nextRoundButtonText(),
    };
  }

  readonly standingsData = computed<StandingsTableData>(() => ({
    players: this.tournament()?.players || [],
    isLoading: this.isUpdating(),
    error: this.error(),
    tournamentComplete: this.tournament()?.status === TournamentStatus.Completed,
    winnerId: this.tournament()?.winnerId,
    winnerName: this.winnerName(),
    totalGames:
      this.tournament()?.rounds.reduce((sum, obj) => sum + obj.matches.length, 0) ?? 0,
  }));

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.tournamentId = +params['id'];
      this.loadTournament();
    });
  }

  private async initializeWebSocket(): Promise<void> {
    // Don't connect WebSocket for completed tournaments
    if (
      this.tournament()?.status === TournamentStatus.Completed &&
      !this.managementMode()
    ) {
      console.log('Skipping WebSocket connection for completed tournament');
      return;
    }

    try {
      // Join tournament WebSocket group
      await this.webSocketService.joinTournament(this.tournamentId);

      // Subscribe to updates
      this.webSocketService.updates$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((update: WebSocketUpdate) => {
          if (update.tournamentId === this.tournamentId) {
            this.handleWebSocketUpdate(update);
          }
        });
    } catch (error: unknown) {
      console.warn('Failed to initialize WebSocket:', error);
    }
  }

  ngOnDestroy(): void {
    this.webSocketService.leaveTournament(true).catch((error: unknown) => {
      console.warn('Failed to leave WebSocket group:', error);
    });
  }

  loadTournament(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.tournamentService
      .getTournament(this.tournamentId)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (tournament: Tournament) => {
          this.tournament.set(tournament);
          this.tournamentEditModal.update((m) => ({
            ...m,
            formData: { name: tournament.name },
          }));
          // Auto-enter management mode if password is stored
          if (this.localStorageService.hasPassword(this.tournamentId)) {
            this.managementMode.set(true);
          }
          // Initialize WebSocket connection after tournament data is loaded
          this.initializeWebSocket();
        },
        error: this.handleError.bind(this, 'Failed to load tournament. Please try again.', null),
      });
  }

  // Navigation methods
  goBack(): void {
    this.router.navigate(['/tournaments']);
  }

  // Management mode methods
  async exitManagementMode(): Promise<void> {
    this.localStorageService.clearPassword(this.tournamentId);
    this.managementMode.set(false);
    await this.webSocketService
      .leaveTournament()
      .catch(console.warn)
      .then(() => this.webSocketService.disconnect(true).catch(console.warn));
  }

  // Player management methods
  onPlayerAdd(playerName: string): void {
    if (!this.tournament()) return;

    this.isUpdating.set(true);
    const request = {
      tournamentId: this.tournamentId,
      name: playerName,
      password: '', //Service will fetch password from localstorage
    };

    this.tournamentService
      .addPlayer(request)
      .pipe(
        finalize(() => this.isUpdating.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response: { message: string }) => {
          console.log('Player added successfully:', response.message);
          // Tournament data will be updated via WebSocket
        },
        error: this.handleError.bind(this, 'Failed to add player. Please try again.', null),
      });
  }

  onPlayerRemove(event: { playerId: number; playerName: string }): void {
    if (!this.tournament()) return;

    this.isUpdating.set(true);
    const request = {
      tournamentId: this.tournamentId,
      playerId: event.playerId,
      password: '', //Service will fetch password from localstorage
    };

    this.tournamentService
      .removePlayer(request)
      .pipe(
        finalize(() => this.isUpdating.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response: { message: string }) => {
          console.log('Player removed successfully:', response.message);
          // Tournament data will be updated via WebSocket
        },
        error: this.handleError.bind(this, 'Failed to remove player. Please try again.', null),
      });
  }

  onTournamentStart(): void {
    if (!this.tournament()) return;

    this.isUpdating.set(true);
    const request = {
      tournamentId: this.tournamentId,
      password: '',
    };

    this.tournamentService
      .startTournament(request)
      .pipe(
        finalize(() => this.isUpdating.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response: { message: string }) => {
          console.log('Tournament started successfully:', response.message);
          // Tournament data will be updated via WebSocket
        },
        error: this.handleError.bind(
          this,
          'Failed to start tournament. Please try again.',
          request,
        ),
      });
  }

  // Match management methods
  onWinnerChange(event: { matchId: number; winnerId: number | null; playerName?: string }): void {
    if (!this.tournament()) return;

    const request = {
      tournamentId: this.tournamentId,
      matchId: event.matchId,
      winnerId: event.winnerId || 0,
    };

    this.tournamentService
      .setMatchWinner(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: { message: string }) => {
          console.log('Winner selection broadcasted:', response.message);
          // Tournament data will be updated via WebSocket
        },
        error: this.handleError.bind(this, 'Failed to set match winner. Please try again.', null),
      });
  }

  onNextRoundStart(): void {
    if (!this.tournament()) return;

    // Collect all match results with winners from current round
    const round = this.currentRound();
    if (!round) {
      this.error.set('No current round found');
      return;
    }

    const matchResults = round.matches
      .filter((match) => match.winnerId) // Only matches with winners
      .map((match) => ({
        matchId: match.id,
        winnerId: match.winnerId!,
      }));

    // Ensure all matches have winners before proceeding
    if (matchResults.length !== round.matches.length) {
      this.error.set('All matches must have winners before starting the next round');
      return;
    }

    this.isUpdating.set(true);
    const request = {
      tournamentId: this.tournamentId,
      matchResults: matchResults,
    };

    this.tournamentService
      .startNextRound(request)
      .pipe(
        finalize(() => this.isUpdating.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response: { message: string }) => {
          console.log('Next round started:', response.message);
          // Tournament data will be updated via WebSocket
        },
        error: this.handleError.bind(this, 'Failed to start next round. Please try again.', null),
      });
  }

  clearError(): void {
    this.error.set(null);
  }

  // Password Modal handling
  passwordModalSubmitted(password: string): void {
    this.passwordModal.update((m) => ({ ...m, isLoading: true, error: null }));

    const request = {
      tournamentId: this.tournamentId,
      password,
    };

    this.tournamentService
      .validateTournamentPassword(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: async (response) => {
          this.passwordModal.update((m) => ({ ...m, isLoading: false }));
          if (response.isValid) {
            // Password is correct - store it and enter management mode
            this.localStorageService.setPassword(this.tournamentId, password);
            this.managementMode.set(true);
            this.passwordModal.update((m) => ({ ...m, isVisible: false }));

            if (
              this.tournament()?.status == TournamentStatus.Completed &&
              !this.webSocketService.isConnected()
            ) {
              await this.initializeWebSocket();
            }
          } else {
            // Password is incorrect - show error
            this.passwordModal.update((m) => ({
              ...m,
              error: 'Invalid password. Please try again.',
            }));
          }
        },
        error: (error) => {
          this.passwordModal.update((m) => ({
            ...m,
            isLoading: false,
            error: 'Failed to validate password. Please try again.',
          }));
          console.error('Password validation failed:', error);
        },
      });
  }

  passwordModalCancelled(): void {
    this.passwordModal.update((m) => ({ ...m, isVisible: false, error: null }));
  }

  showPasswordModal(): void {
    this.passwordModal.update((m) => ({ ...m, isVisible: true, error: null }));
  }

  // Tournament Deletion Modal handling
  tournamentDeleteModalSubmitted(password: string): void {
    this.tournamentDeleteModal.update((m) => ({ ...m, isLoading: true, error: null }));

    const request = {
      tournamentId: this.tournamentId,
      password: password,
    };
    this.tournamentService
      .deleteTournament(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          //Response via Websocket
        },
        error: (error) => {
          if (error instanceof HttpError && error.httpCode == 401) {
            this.tournamentDeleteModal.update((m) => ({
              ...m,
              isLoading: false,
              error: 'Failed to validate password. Please try again.',
            }));
          } else {
            console.error(error);
            this.tournamentDeleteModal.update((m) => ({
              ...m,
              isLoading: false,
              error: 'Unexpected error. Please try again.',
            }));
          }
        },
      });
  }

  tournamentDeleteModalCancelled(): void {
    this.tournamentDeleteModal.update((m) => ({ ...m, isVisible: false, error: null }));
  }

  showTournamentDeleteModal(): void {
    this.tournamentDeleteModal.update((m) => ({ ...m, isVisible: true, error: null }));
  }

  // Tournament Edition Modal handling
  tournamentEditModalSubmitted(data: EditTournamentData) {
    this.tournamentEditModal.update((m) => ({ ...m, isLoading: true, error: null }));
    const request = {
      tournamentId: this.tournamentId,
      name: data.name,
      password: '',
    };

    this.tournamentService
      .updateTournament(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          //Response via Websocket
        },
        error: (error) => {
          if (error instanceof HttpError && error.httpCode == 401) {
            this.tournamentEditModal.update((m) => ({
              ...m,
              isLoading: false,
              error: 'Failed to update tournament. Please try again.',
            }));
          } else {
            console.error(error);
            this.tournamentEditModal.update((m) => ({
              ...m,
              isLoading: false,
              error: 'Unexpected error. Please try again.',
            }));
          }
        },
      });
  }

  tournamentEditCancelled(): void {
    this.tournamentEditModal.update((m) => ({
      ...m,
      formData: { name: this.tournament()?.name! },
      isVisible: false,
      error: null,
    }));
  }

  showTournamentEditModal(): void {
    this.tournamentEditModal.update((m) => ({ ...m, isVisible: true, error: null }));
  }

  // WebSocket update handling
  handleWebSocketUpdate(update: WebSocketUpdate): void {
    switch (update.type) {
      case 'PlayerAdded':
        // Add player to local state (immutable)
        if (this.tournament() && update.data) {
          this.tournament.update((t) =>
            t ? { ...t, players: [...t.players, update.data] } : t,
          );
        }
        break;
      case 'PlayerRemoved':
        // Remove player from local state by ID (immutable)
        if (this.tournament() && update.data.playerId) {
          this.tournament.update((t) =>
            t
              ? {
                  ...t,
                  players: t.players.filter((player) => player.id !== update.data.playerId),
                }
              : t,
          );
        }
        break;
      case 'TournamentUpdated':
        this.tournament.update((t) => (t ? { ...t, name: update.data } : t));
        this.tournamentEditModal.update((m) => ({ ...m, isLoading: false }));
        this.tournamentEditCancelled();
        break;
      case 'NewRound':
      case 'TournamentStarted':
        // Use the tournament data directly from WebSocket update
        this.tournament.set(update.data);

        // Check if tournament just completed and disconnect WebSocket
        if (update.data.status === TournamentStatus.Completed && !this.managementMode()) {
          console.log('Tournament completed via WebSocket - disconnecting');
          this.webSocketService
            .leaveTournament()
            .catch(console.warn)
            .then(() => this.webSocketService.disconnect(true).catch(console.warn));
        }
        break;
      case 'WinnerSelected':
        // Handle winner selection locally without DB reload
        this.handleWinnerSelection(update.data);
        break;
      case 'TournamentDeletion':
        this.goBack();
        break;
    }
  }

  private handleWinnerSelection(data: any): void {
    if (!this.tournament() || !data.matchId || !data.winnerId) return;

    this.tournament.update((t) => {
      if (!t) return t;
      const updatedRounds = t.rounds.map((round) => {
        if (round.isCompleted) return round;
        const matchIndex = round.matches.findIndex((m) => m.id === data.matchId);
        if (matchIndex === -1) return round;
        const match = round.matches[matchIndex];
        const winner = match.playerIds.find((pId) => pId === data.winnerId);
        if (!winner) return round;

        console.log(
          `Winner selected for match ${data.matchId}:`,
          t.players.find((p) => p.id === winner)?.id,
        );

        return {
          ...round,
          matches: round.matches.map((m) =>
            m.id === data.matchId ? { ...m, winnerId: data.winnerId } : m,
          ),
        };
      });
      return { ...t, rounds: updatedRounds };
    });
  }

  getCompletedMatchesInRound(round: Round): number {
    return round.matches.filter((match) => match.winnerId).length;
  }

  // Error Handling
  private handleError = (defaultErrorMessage: string, additionalObject: any, error: any) => {
    console.error(defaultErrorMessage, error);
    this.error.set(error.message || defaultErrorMessage);

    if (additionalObject !== null) {
      console.error('Additional info:', additionalObject);
    }

    if (
      error instanceof LocalStorageError ||
      (error instanceof HttpError && error.httpCode == 401)
    ) {
      this.exitManagementMode();
    }
    return;
  };
}
