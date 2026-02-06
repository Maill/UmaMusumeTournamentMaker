
import { Component, computed, input, output } from '@angular/core';
import { BaseIconComponent, IconName } from '../../atoms/icon/base-icon.component';
import { LoadingSpinnerComponent } from '../../atoms/spinner/loading-spinner.component';
import { ErrorDisplayComponent } from '../../molecules/error-display/error-display.component';
import { StandingsRowComponent } from '../../molecules/standings-row/standings-row.component';
import { StandingsTableData } from '../../types/components.types';
import { Player } from '../../types/tournament.types';

export type StandingsViewMode = 'current' | 'final' | 'live';

@Component({
  selector: 'app-standings-table',
  standalone: true,
  imports: [
    StandingsRowComponent,
    BaseIconComponent,
    LoadingSpinnerComponent,
    ErrorDisplayComponent
],
  template: `
    <div class="standings-table-container">
      <!-- Table Header -->
      <div class="table-header">
        <div class="header-info">
          <h3 class="table-title">
            <app-icon
              [name]="titleIcon()"
              size="md"
              [color]="titleColor()"
              [ariaLabel]="ariaLabel()"
            >
            </app-icon>
            {{ tableTitle() }}
          </h3>
        </div>

        <!-- Champion Banner (Tournament Complete) -->
        @if (data().tournamentComplete && data().winnerId && data().winnerName) {
        <div class="champion-banner">
          <div class="champion-content">
            <div class="champion-text">
              <div>
                <app-icon name="trophy" size="xl" color="warning" ariaLabel="Tournament Champion" />
                <h2>Tournament Champion</h2>
                <app-icon name="trophy" size="xl" color="warning" ariaLabel="Tournament Champion" />
              </div>

              <p class="champion-name">{{ data().winnerName }}</p>
              <p class="champion-subtitle">Congratulations to our tournament winner!</p>
            </div>
          </div>
        </div>
        }
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
        <app-loading-spinner size="lg" variant="primary" loadingText="Loading standings...">
        </app-loading-spinner>
      </div>
      } @else {
      <!-- Standings Table -->
      @if (data().players.length > 0) {
      <div class="table-container">
        <table class="standings-table">
          <thead>
            <tr>
              <th class="rank-col">Rank</th>
              <th class="player-col">Player</th>
              <th class="points-col">Points</th>
              <th class="wins-col">Wins</th>
              <th class="losses-col">Losses</th>
              <th class="winrate-col">Win Rate</th>
              @if (showGamesPlayed()) {
              <th class="games-col">Games</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (player of playersWithRankings(); track player.id) {
            <tr
              app-standings-row
              [player]="player"
              [showGamesPlayed]="showGamesPlayed()"
              [highlightTop3]="highlightTop3()"
            ></tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Table Summary -->
      <div class="table-summary">
        <div class="summary-stats">
          <div class="stat-group">
            <div class="stat-item">
              <app-icon name="users" size="sm" color="primary"></app-icon>
              <span class="stat-label">Total Players:</span>
              <span class="stat-value">{{ data().players.length }}</span>
            </div>

            <div class="stat-item">
              <app-icon name="target" size="sm" color="success"></app-icon>
              <span class="stat-label">Total Games:</span>
              <span class="stat-value">{{ data().totalGames }}</span>
            </div>
          </div>

          <div class="stat-group">
            <div class="stat-item">
              <app-icon name="trending-up" size="sm" color="info"></app-icon>
              <span class="stat-label">Avg Win Rate:</span>
              <span class="stat-value">{{ averageWinRate() }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top 3 Podium (Tournament Complete) -->
      @if (data().tournamentComplete && showPodium() && data().players.length >= 3) {
      <div class="podium-section">
        <h4 class="podium-title">🏆 Final Podium</h4>
        <div class="podium">
          @for (player of topThreePlayers(); track player.id; let i = $index) {
          <div class="podium-place" [class]="getPodiumClass(i)">
            <div class="podium-rank">
              <app-icon [name]="getPodiumIcon(i)" size="lg" [color]="getPodiumColor(i)"> </app-icon>
            </div>
            <div class="podium-player">
              <span class="podium-name">{{ player.name }}</span>
              <span class="podium-points">{{ player.points }} pts</span>
              <span class="podium-record">{{ player.wins }}W - {{ player.losses }}L</span>
            </div>
          </div>
          }
        </div>
      </div>
      } } @else {
      <!-- Empty State -->
      <div class="empty-state">
        <app-icon name="users" size="xl" color="secondary" ariaLabel="No players"> </app-icon>
        <h3>No Players</h3>
        <p>{{ emptyStateMessage() }}</p>
      </div>
      } }
    </div>
  `,
  styleUrl: './standings-table.component.css',
})
export class StandingsTableComponent {
  readonly data = input.required<StandingsTableData>();
  readonly viewMode = input<StandingsViewMode>('current');
  readonly showGamesPlayed = input<boolean>(false);
  readonly highlightTop3 = input<boolean>(true);
  readonly showPodium = input<boolean>(true);
  readonly title = input<string | undefined>(undefined);

  readonly errorDismissed = output<void>();

  tableTitle(): string {
    const t = this.title();
    if (t) return t;

    switch (this.viewMode()) {
      case 'final':
        return 'Final Standings';
      case 'live':
        return 'Live Standings';
      case 'current':
      default:
        return this.data().tournamentComplete ? 'Final Standings' : 'Current Standings';
    }
  }

  titleIcon(): IconName {
    return this.data().tournamentComplete ? 'podium' : 'trending-up';
  }

  titleColor(): string {
    return this.data().tournamentComplete ? 'warning' : 'primary';
  }

  ariaLabel(): string {
    return this.data().tournamentComplete
      ? 'Final tournament standings'
      : 'Current tournament standings';
  }

  readonly playersWithRankings = computed(() => {
    const sortedPlayers = [...this.data().players].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.winRate - a.winRate;
    });

    return sortedPlayers.map((player, index) => ({
      ...player,
      rank: index + 1,
      isChampion: index === 0 && this.data().tournamentComplete,
      isRunnerUp: index === 1 && this.data().tournamentComplete,
      isThirdPlace: index === 2 && this.data().tournamentComplete,
    }));
  });

  readonly topThreePlayers = computed(() => {
    return this.playersWithRankings().slice(0, 3);
  });

  readonly averageWinRate = computed(() => {
    if (this.data().players.length === 0) return 0;
    const totalWinRate = this.data().players.reduce((sum, player) => sum + player.winRate, 0);
    return Math.round((totalWinRate / this.data().players.length) * 100);
  });

  emptyStateMessage(): string {
    if (this.data().tournamentComplete) {
      return 'This tournament had no players.';
    }
    return 'No players have joined this tournament yet.';
  }

  onErrorDismiss(): void {
    this.errorDismissed.emit();
  }

  getPodiumClass(index: number): string {
    const classes = ['first-place', 'second-place', 'third-place'];
    return classes[index] || '';
  }

  getPodiumIcon(index: number): IconName {
    const icons: IconName[] = ['medal-first', 'medal-second', 'medal-thrid'];
    return icons[index] || 'medal-first';
  }

  getPodiumColor(index: number): string {
    const colors = ['warning', 'secondary', 'success'];
    return colors[index] || 'secondary';
  }
}
