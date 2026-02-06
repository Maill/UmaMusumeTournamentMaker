
import { Component, computed, input, output } from '@angular/core';
import { BaseBadgeComponent } from '../../atoms/badge/base-badge.component';
import { BaseButtonComponent } from '../../atoms/button/base-button.component';
import { BaseIconComponent, IconName } from '../../atoms/icon/base-icon.component';
import { LoadingSpinnerComponent } from '../../atoms/spinner/loading-spinner.component';
import { ErrorDisplayComponent } from '../../molecules/error-display/error-display.component';
import { MatchRowComponent } from '../../molecules/match-row/match-row.component';
import { MatchTableData, MatchTableState } from '../../types/components.types';
import { Match, Player } from '../../types/tournament.types';

@Component({
  selector: 'app-match-table',
  standalone: true,
  imports: [
    MatchRowComponent,
    BaseIconComponent,
    LoadingSpinnerComponent,
    ErrorDisplayComponent,
    BaseBadgeComponent,
    BaseButtonComponent
],
  template: `
    <div class="match-table-container">
      <!-- Table Header -->
      <div class="table-header">
        <div class="header-info">
          <h3 class="table-title">
            <app-icon [name]="titleIcon()" size="md" color="primary" ariaLabel="Matches">
            </app-icon>
            {{ titleText() }}
          </h3>

          <div class="round-status">
            @if (data().round.isCompleted) {
            <app-badge variant="success">
              <app-icon name="check" size="xs"></app-icon>
              Round Complete
            </app-badge>
            } @else {
            <app-badge variant="warning">
              <app-icon name="clock" size="xs"></app-icon>
              In Progress
            </app-badge>
            }

            <span class="match-count">
              {{ completedMatchesCount() }} / {{ data().round.matches.length }} matches complete
            </span>
          </div>
        </div>
      </div>

      <!-- Error Display -->
      @if (data().error) {
      <app-error-display
        [message]="data().error!"
        type="error"
        [dismissible]="true"
        (dismissed)="onErrorDismiss()"
      >
      </app-error-display>
      }

      <!-- Loading State -->
      @if (data().isLoading) {
      <div class="loading-container">
        <app-loading-spinner size="lg" variant="primary" loadingText="Loading matches...">
        </app-loading-spinner>
      </div>
      } @else {
      <!-- Matches Table -->
      @if (data().round.matches.length > 0) {
      <div class="table-container">
        <table class="matches-table">
          <thead>
            <tr>
              <th class="match-col">Match</th>
              <th class="players-col">Players</th>
              <th class="status-col">Status</th>
              <th class="winner-col">Winner</th>
              @if (data().canManage) {
              <th class="actions-col">Actions</th>
              } @if (showCompletedTime()) {
              <th class="completed-col">Completed</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (match of matchesWithNumbers(); track match.id) {
            <tr
              app-match-row
              [players]="getMatchPlayers(match)"
              [match]="match"
              [allowWinnerChange]="data().canManage"
              [showCompletedAt]="showCompletedTime()"
              (winnerChanged)="onWinnerChange($event)"
            ></tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Table Summary -->
      <div class="table-summary">
        <div class="summary-stats">
          <div class="stat-item">
            <app-icon name="check" size="sm" color="success"></app-icon>
            <span>{{ completedMatchesCount() }} Completed</span>
          </div>

          <div class="stat-item">
            <app-icon name="clock" size="sm" color="warning"></app-icon>
            <span>{{ pendingMatchesCount() }} Pending</span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="progressPercentage()"></div>
          </div>
          <span class="progress-text">{{ progressPercentage() }}% Complete</span>
        </div>
      </div>

      <!-- Next Round Action -->
      @if (data().canManage && state().canStartNextRound) {
      <div class="next-round-section">
        <div class="next-round-info">
          <app-icon [name]="nextRoundIcon()" size="md" color="primary"> </app-icon>
          <div class="next-round-text">
            <h4>{{ nextRoundTitle() }}</h4>
            <p>{{ nextRoundText() }}</p>
          </div>
        </div>

        <app-button
          variant="primary"
          size="lg"
          [loading]="state().isStartingNextRound"
          loadingText="Loading..."
          [disabled]="state().isStartingNextRound"
          (clicked)="onStartNextRound()"
        >
          {{ state().nextRoundButtonText }}
        </app-button>
      </div>
      }

      <!-- Round Instructions -->
      @if (!data().round.isCompleted && pendingMatchesCount() > 0) {
      <div class="instructions">
        <app-icon name="info" size="sm" color="info"> </app-icon>
        <p>
          @if (data().canManage) { Select winners for all matches to complete this round and proceed
          to the next. } @else { Waiting for tournament organizer to set match winners. }
        </p>
      </div>
      } } @else {
      <!-- Empty State -->
      <div class="empty-state">
        <app-icon name="target" size="xl" color="secondary" ariaLabel="No matches"> </app-icon>
        <h3>No Matches</h3>
        <p>This round has no matches scheduled.</p>
      </div>
      } }
    </div>
  `,
  styleUrl: './match-table.component.css',
})
export class MatchTableComponent {
  readonly data = input.required<MatchTableData>();
  readonly state = input<MatchTableState>({
    updatingMatchId: null,
    canStartNextRound: false,
    isStartingNextRound: false,
    nextRoundButtonText: 'Start Next Round',
  });
  readonly showCompletedTime = input<boolean>(false);

  readonly winnerChanged = output<{
    matchId: number;
    winnerId: number | null;
    playerName?: string;
  }>();
  readonly nextRoundStarted = output<void>();
  readonly errorDismissed = output<void>();

  readonly isRoundFinal = computed(() => this.data().round.roundType == 'Final');

  readonly matchesWithNumbers = computed(() => {
    return this.data().round.matches.map((match, index) => ({
      ...match,
      matchNumber: index + 1,
      canManage: this.data().canManage,
    }));
  });

  readonly completedMatchesCount = computed(() => {
    return this.data().round.matches.filter((match) => match.winnerId).length;
  });

  readonly pendingMatchesCount = computed(() => {
    return this.data().round.matches.filter((match) => !match.winnerId).length;
  });

  readonly progressPercentage = computed(() => {
    const total = this.data().round.matches.length;
    if (total === 0) return 100;
    return Math.round((this.completedMatchesCount() / total) * 100);
  });

  readonly titleIcon = computed<IconName>(() => {
    return this.isRoundFinal() ? 'trophy' : 'target';
  });

  readonly titleText = computed(() => {
    const baseText = `Round ${this.data().round.roundNumber} matches`;
    if (this.isRoundFinal()) return 'Final Round';
    if (this.data().round.roundType == 'Tiebreaker') return `Tiebreaker - ${baseText}`;
    return baseText;
  });

  readonly nextRoundText = computed(() => {
    return this.isRoundFinal()
      ? 'Crown you tournament winner!'
      : 'All matches have been completed. Ready to proceed to the next round.';
  });

  readonly nextRoundTitle = computed(() => {
    return this.isRoundFinal() ? 'Finale complete!' : 'Round Complete!';
  });

  readonly nextRoundIcon = computed<IconName>(() => {
    return this.isRoundFinal() ? 'confetti' : 'chevron-right';
  });

  onWinnerChange(event: { matchId: number; winnerId: number | null; playerName?: string }): void {
    this.winnerChanged.emit(event);
  }

  onStartNextRound(): void {
    this.nextRoundStarted.emit();
  }

  onErrorDismiss(): void {
    this.errorDismissed.emit();
  }

  getMatchPlayers(match: Match): Record<number, Player> {
    return Object.fromEntries(
      Object.entries(this.data().players).filter(([key]) => match.playerIds.includes(Number(key)))
    );
  }
}
