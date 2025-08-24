import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseBadgeComponent } from '../../atoms/badge/base-badge.component';
import { BaseIconComponent } from '../../atoms/icon/base-icon.component';
import { Player } from '../../types/tournament.types';

export interface StandingsRowData extends Player {
  rank: number;
  isChampion?: boolean;
  isRunnerUp?: boolean;
  isThirdPlace?: boolean;
}

@Component({
  selector: 'app-standings-row',
  standalone: true,
  imports: [CommonModule, BaseBadgeComponent, BaseIconComponent],
  template: `
    <tr 
      class="standings-row" 
      [class.champion]="player.isChampion"
      [class.runner-up]="player.isRunnerUp" 
      [class.third-place]="player.isThirdPlace"
      [class.highlight]="isHighlighted()">
      
      <!-- Rank -->
      <td class="rank-cell">
        <div class="rank-display">
          @if (player.isChampion) {
            <app-icon
              name="trophy"
              size="md"
              color="warning"
              ariaLabel="Champion">
            </app-icon>
            <span class="rank-text gold">1st</span>
          } @else if (player.isRunnerUp) {
            <app-icon
              name="medal"
              size="md"
              color="secondary"
              ariaLabel="Runner-up">
            </app-icon>
            <span class="rank-text silver">2nd</span>
          } @else if (player.isThirdPlace) {
            <app-icon
              name="medal"
              size="md"
              color="warning"
              ariaLabel="Third place">
            </app-icon>
            <span class="rank-text bronze">3rd</span>
          } @else {
            <span class="rank-number">{{ player.rank }}</span>
          }
        </div>
      </td>
      
      <!-- Player Name -->
      <td class="player-cell">
        <div class="player-info">
          <span class="player-name">{{ player.name }}</span>
          @if (showBadge()) {
            <app-badge [variant]="getBadgeVariant()">
              {{ getBadgeText() }}
            </app-badge>
          }
        </div>
      </td>
      
      <!-- Points -->
      <td class="points-cell">
        <div class="stat-display">
          <span class="stat-value">{{ player.points }}</span>
          <span class="stat-label">pts</span>
        </div>
      </td>
      
      <!-- Wins -->
      <td class="wins-cell">
        <div class="stat-display wins">
          <span class="stat-value">{{ player.wins }}</span>
          <span class="stat-label">wins</span>
        </div>
      </td>
      
      <!-- Losses -->
      <td class="losses-cell">
        <div class="stat-display losses">
          <span class="stat-value">{{ player.losses }}</span>
          <span class="stat-label">losses</span>
        </div>
      </td>
      
      <!-- Win Rate -->
      <td class="winrate-cell">
        <div class="winrate-display">
          <div class="winrate-bar">
            <div 
              class="winrate-fill" 
              [style.width.%]="getWinRatePercentage()">
            </div>
          </div>
          <span class="winrate-text">{{ getWinRateDisplay() }}</span>
        </div>
      </td>
      
      <!-- Games Played (Optional) -->
      @if (showGamesPlayed) {
        <td class="games-cell">
          <div class="stat-display">
            <span class="stat-value">{{ getTotalGames() }}</span>
            <span class="stat-label">games</span>
          </div>
        </td>
      }
    </tr>
  `,
  styleUrl: './standings-row.component.css'
})
export class StandingsRowComponent {
  @Input() player!: StandingsRowData;
  @Input() showGamesPlayed: boolean = false;
  @Input() highlightTop3: boolean = true;

  isHighlighted(): boolean {
    return !!(this.highlightTop3 === true && (
      this.player.isChampion || 
      this.player.isRunnerUp || 
      this.player.isThirdPlace
    ));
  }

  showBadge(): boolean {
    return !!(this.player.isChampion || this.player.isRunnerUp || this.player.isThirdPlace);
  }

  getBadgeVariant(): 'warning' | 'secondary' | 'success' {
    if (this.player.isChampion) return 'warning';
    if (this.player.isRunnerUp) return 'secondary';
    if (this.player.isThirdPlace) return 'success';
    return 'secondary';
  }

  getBadgeText(): string {
    if (this.player.isChampion) return 'Champion';
    if (this.player.isRunnerUp) return 'Runner-up';
    if (this.player.isThirdPlace) return '3rd Place';
    return '';
  }

  getWinRatePercentage(): number {
    return Math.round(this.player.winRate * 100);
  }

  getWinRateDisplay(): string {
    return `${this.getWinRatePercentage()}%`;
  }

  getTotalGames(): number {
    return this.player.wins + this.player.losses;
  }

  getWinRateColor(): string {
    const rate = this.player.winRate;
    if (rate >= 0.8) return 'excellent';
    if (rate >= 0.6) return 'good';
    if (rate >= 0.4) return 'average';
    return 'poor';
  }
}