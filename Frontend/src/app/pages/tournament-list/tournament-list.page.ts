import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Import organisms and molecules
import { BaseButtonComponent } from '../../shared/atoms/button/base-button.component';
import { BaseIconComponent } from '../../shared/atoms/icon/base-icon.component';
import { LoadingSpinnerComponent } from '../../shared/atoms/spinner/loading-spinner.component';
import { ErrorDisplayComponent } from '../../shared/molecules/error-display/error-display.component';
import { TournamentCardComponent } from '../../shared/molecules/tournament-card/tournament-card.component';

// Import types and services
import { TournamentCardData } from '../../shared/molecules/tournament-card/tournament-card.component';
import { TournamentService } from '../../shared/services/tournament.service';
import {
  TournamentListItem,
  TournamentStatus,
  TournamentType,
} from '../../shared/types/tournament.types';

interface TournamentListState {
  tournaments: TournamentListItem[];
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;
}

@Component({
  selector: 'app-tournament-list-page',
  standalone: true,
  imports: [
    CommonModule,
    TournamentCardComponent,
    ErrorDisplayComponent,
    LoadingSpinnerComponent,
    BaseButtonComponent,
    BaseIconComponent,
  ],
  template: `
    <div class="tournament-list-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1 class="page-title">
              <app-icon name="trophy" size="xl" color="primary" ariaLabel="Tournaments"> </app-icon>
              Tournaments
            </h1>
            <p class="page-subtitle">Manage and participate in competitive tournaments</p>
          </div>

          <div class="header-actions">
            <app-button variant="primary" size="lg" (clicked)="onCreateTournament()">
              <!--<app-icon name="add" size="sm"> </app-icon>-->
              Create Tournament
            </app-button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="page-content">
        <!-- Loading State -->
        @if (state.isLoading && !state.hasLoaded) {
        <div class="loading-section">
          <app-loading-spinner
            size="lg"
            variant="primary"
            loadingText="Loading tournaments..."
            [overlay]="false"
          >
          </app-loading-spinner>
          <p class="loading-text">Fetching your tournaments...</p>
        </div>
        }

        <!-- Error State -->
        @if (state.error && !state.isLoading) {
        <div class="error-section">
          <app-error-display
            [message]="state.error"
            type="error"
            [retryable]="true"
            retryText="Retry Loading"
            title="Failed to Load Tournaments"
            (retryClicked)="loadTournaments()"
            (dismissed)="clearError()"
          >
          </app-error-display>
        </div>
        }

        <!-- Tournaments Grid -->
        @if (!state.isLoading && !state.error && state.tournaments.length > 0) {
        <div class="tournaments-section">
          <!-- Tournament Stats -->
          <div class="tournaments-stats">
            <div class="stat-card">
              <app-icon name="trophy" size="lg" color="primary"></app-icon>
              <div class="stat-content">
                <span class="stat-value">{{ state.tournaments.length }}</span>
                <span class="stat-label">Total Tournaments</span>
              </div>
            </div>

            <div class="stat-card">
              <app-icon name="play" size="md" color="success"></app-icon>
              <div class="stat-content">
                <span class="stat-value">{{ getActiveTournamentsCount() }}</span>
                <span class="stat-label">Active</span>
              </div>
            </div>

            <div class="stat-card">
              <app-icon name="check" size="md" color="warning"></app-icon>
              <div class="stat-content">
                <span class="stat-value">{{ getCompletedTournamentsCount() }}</span>
                <span class="stat-label">Completed</span>
              </div>
            </div>
          </div>

          <!-- Filter/Sort Options -->
          <div class="tournaments-filters">
            <div class="filter-info">
              <span class="results-count">
                Showing {{ getFilteredTournaments().length }} tournaments
              </span>
            </div>

            <div class="filter-actions">
              <app-button
                variant="outline-secondary"
                size="sm"
                [loading]="state.isLoading"
                (clicked)="refreshTournaments()"
              >
                <app-icon name="refresh" size="xs"></app-icon>
                Refresh
              </app-button>
            </div>
          </div>

          <!-- Tournaments Grid -->
          <div class="tournaments-grid">
            @for (tournament of getFilteredTournaments(); track tournament.id) {
            <app-tournament-card
              [tournament]="mapToCardData(tournament)"
              [clickable]="true"
              [showActions]="true"
              (cardClicked)="onTournamentClick($event)"
            >
            </app-tournament-card>
            }
          </div>
        </div>
        }

        <!-- Empty State -->
        @if (!state.isLoading && !state.error && state.tournaments.length === 0 && state.hasLoaded)
        {
        <div class="empty-state">
          <div class="empty-content">
            <app-icon name="trophy" size="xxl" color="secondary" ariaLabel="No tournaments">
            </app-icon>
            <h2>No Tournaments Found</h2>
            <p>
              You haven't created any tournaments yet. Get started by creating your first
              tournament!
            </p>

            <div class="empty-actions">
              <app-button variant="primary" size="lg" (clicked)="onCreateTournament()">
                <!--<app-icon name="add" size="sm"> </app-icon>-->
                Create Your First Tournament
              </app-button>
            </div>
          </div>
        </div>
        }
      </div>
    </div>
  `,
  styleUrl: './tournament-list.page.css',
})
export class TournamentListPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  state: TournamentListState = {
    tournaments: [],
    isLoading: true,
    error: null,
    hasLoaded: false,
  };

  constructor(private tournamentService: TournamentService, private router: Router) {}

  ngOnInit(): void {
    this.loadTournaments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTournaments(): void {
    // Simple subscription to service observables
    this.tournamentService.tournaments$.pipe(takeUntil(this.destroy$)).subscribe((tournaments) => {
      this.state.tournaments = tournaments;
      this.state.hasLoaded = true;
    });

    this.tournamentService.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => {
      this.state.isLoading = loading;
    });

    this.tournamentService.error$.pipe(takeUntil(this.destroy$)).subscribe((error) => {
      this.state.error = error;
    });

    // Load tournaments
    this.tournamentService.getAllTournaments().subscribe();
  }

  refreshTournaments(): void {
    this.loadTournaments();
  }

  onCreateTournament(): void {
    this.router.navigate(['/tournaments/create']);
  }

  onTournamentClick(tournament: TournamentCardData): void {
    this.router.navigate(['/tournaments', tournament.id]);
  }

  clearError(): void {
    this.state.error = null;
  }

  getActiveTournamentsCount(): number {
    return this.state.tournaments.filter(
      (t) => t.status === TournamentStatus.Created || t.status === TournamentStatus.InProgress
    ).length;
  }

  getCompletedTournamentsCount(): number {
    return this.state.tournaments.filter((t) => t.status === TournamentStatus.Completed).length;
  }

  getFilteredTournaments(): TournamentListItem[] {
    // Add filtering logic here if needed
    return [...this.state.tournaments].sort((a, b) => {
      // Sort by status (active first), then by creation date (newest first)
      const statusOrder = {
        [TournamentStatus.InProgress]: 0,
        [TournamentStatus.Created]: 1,
        [TournamentStatus.Completed]: 2,
      };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  mapToCardData(tournament: TournamentListItem): TournamentCardData {
    return {
      id: tournament.id,
      name: tournament.name,
      type: tournament.type,
      status: tournament.status,
      playersCount: tournament.playersCount,
      currentRound: tournament.currentRound,
      createdAt: tournament.createdAt,
      winnerId: undefined, // Not available in list view
      winnerName: undefined,
    };
  }

  // Utility methods for template
  getTournamentTypeName(type: TournamentType): string {
    switch (type) {
      case TournamentType.Swiss:
        return 'Swiss';
      case TournamentType.ChampionsMeeting:
        return 'Champions Meeting';
      default:
        return 'Unknown';
    }
  }

  getStatusText(status: TournamentStatus): string {
    switch (status) {
      case TournamentStatus.Created:
        return 'Created';
      case TournamentStatus.InProgress:
        return 'In Progress';
      case TournamentStatus.Completed:
        return 'Completed';
      default:
        return 'Unknown';
    }
  }
}
