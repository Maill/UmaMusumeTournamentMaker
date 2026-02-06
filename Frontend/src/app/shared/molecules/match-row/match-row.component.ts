
import { Component, computed, input, output } from '@angular/core';
import { BaseBadgeComponent } from '../../atoms/badge/base-badge.component';
import { BaseIconComponent } from '../../atoms/icon/base-icon.component';
import { MatchRowData } from '../../types/components.types';
import { Player } from '../../types/tournament.types';
import { WinnerSelectorComponent } from '../winner-selector/winner-selector.component';

@Component({
  selector: 'tr[app-match-row]',
  standalone: true,
  imports: [BaseBadgeComponent, BaseIconComponent, WinnerSelectorComponent],
  host: {
    class: 'match-row',
    '[class.completed]': 'isCompleted()',
    '[class.pending]': '!isCompleted()',
  },
  template: `
    <!-- Match Number -->
    <td class="match-number">
      <span>#{{ match().matchNumber }}</span>
    </td>

    <!-- Players -->
    <td class="match-players">
      <div class="players-list">
        @for (player of match().playerIds; track $index) {
        <span class="player-name" [class.winner]="isWinner(player)" [class.loser]="isLoser(player)">
          {{ players()[player].name }}
          @if (isWinner(player)) {
          <app-icon name="trophy" size="xs" color="warning" ariaLabel="Winner"> </app-icon>
          }
        </span>
        @if ($index < match().playerIds.length - 1) {
        <span class="vs-separator">vs</span>
        } }
      </div>
    </td>

    <!-- Status -->
    <td class="match-status">
      @if (isCompleted()) {
      <app-badge variant="success">
        <app-icon name="check" size="xs"> </app-icon>
        Completed
      </app-badge>
      } @else {
      <app-badge variant="warning"> Pending </app-badge>
      }
    </td>

    <!-- Winner -->
    <td class="match-winner">
      @if (match().winnerId) {
      <div class="winner-display">
        <app-icon name="star" size="sm" color="success"> </app-icon>
        <span class="winner-name">{{ players()[match().winnerId!].name }}</span>
      </div>
      } @else {
      <span class="no-winner">-</span>
      }
    </td>

    <!-- Actions (Management Mode) -->
    @if (match().canManage) {
    <td class="match-actions">
      <app-winner-selector
        [matchId]="match().id"
        [players]="playersForWinnerSelector()"
        [selectedWinnerId]="match().winnerId || null"
        [disabled]="isCompleted() && !allowWinnerChange()"
        placeholder="Select winner..."
        (winnerChanged)="onWinnerChange($event)"
      >
      </app-winner-selector>
    </td>
    }

    <!-- Completed At (Optional) -->
    @if (showCompletedAt() && match().completedAt) {
    <td class="match-completed">
      <span class="completed-time" [title]="fullCompletedDate()">
        {{ completedTimeDisplay() }}
      </span>
    </td>
    }
  `,
  styleUrl: './match-row.component.css',
})
export class MatchRowComponent {
  readonly players = input.required<Record<number, Player>>();
  readonly match = input.required<MatchRowData>();
  readonly allowWinnerChange = input<boolean>(true);
  readonly showCompletedAt = input<boolean>(false);

  readonly winnerChanged = output<{
    matchId: number;
    winnerId: number | null;
    playerName?: string;
  }>();

  isCompleted(): boolean { return !!this.match().winnerId; }

  readonly playersForWinnerSelector = computed(() => Object.values(this.players()));

  completedTimeDisplay(): string {
    if (!this.match().completedAt) return '';

    const completedDate = new Date(this.match().completedAt!);
    const now = new Date();
    const diffMs = now.getTime() - completedDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return completedDate.toLocaleDateString();
  }

  fullCompletedDate(): string {
    if (!this.match().completedAt) return '';
    return new Date(this.match().completedAt!).toLocaleString();
  }

  onWinnerChange(event: { matchId: number; winnerId: number | null; playerName?: string }): void {
    this.winnerChanged.emit(event);
  }

  isWinner(playerId: number): boolean {
    return this.match().winnerId === playerId;
  }

  isLoser(playerId: number): boolean {
    return this.isCompleted() && !this.isWinner(playerId);
  }
}
