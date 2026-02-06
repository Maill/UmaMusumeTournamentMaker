import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

// Import organisms and molecules
import { BaseButtonComponent } from '../../shared/atoms/button/base-button.component';
import { BaseIconComponent } from '../../shared/atoms/icon/base-icon.component';
import { ErrorDisplayComponent } from '../../shared/molecules/error-display/error-display.component';
import { TournamentCardSkeletonComponent } from '../../shared/molecules/tournament-card-skeleton/tournament-card-skeleton.component';
import { TournamentCardComponent } from '../../shared/molecules/tournament-card/tournament-card.component';

// Import types and services
import { TournamentService } from '../../shared/services/tournament.service';
import { TournamentCardData } from '../../shared/types/components.types';
import {
  TournamentListItem,
  TournamentStatus,
  TournamentType,
} from '../../shared/types/tournament.types';

@Component({
  selector: 'app-tournament-list-page',
  standalone: true,
  imports: [
    TournamentCardComponent,
    TournamentCardSkeletonComponent,
    ErrorDisplayComponent,
    BaseButtonComponent,
    BaseIconComponent,
  ],
  templateUrl: './tournament-list.page.html',
  styleUrl: './tournament-list.page.css',
})
export class TournamentListPageComponent implements OnInit {
  private router: Router = inject(Router);
  private tournamentService: TournamentService = inject(TournamentService);
  private destroyRef = inject(DestroyRef);

  // State signals
  readonly tournaments = signal<TournamentListItem[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly hasLoaded = signal(false);

  // Computed signals
  readonly activeTournamentsCount = computed(() =>
    this.tournaments().filter(
      (t) => t.status === TournamentStatus.Created || t.status === TournamentStatus.InProgress,
    ).length,
  );

  readonly completedTournamentsCount = computed(() =>
    this.tournaments().filter((t) => t.status === TournamentStatus.Completed).length,
  );

  readonly filteredTournaments = computed(() => {
    return [...this.tournaments()].sort((a, b) => {
      const statusOrder = {
        [TournamentStatus.InProgress]: 0,
        [TournamentStatus.Created]: 1,
        [TournamentStatus.Completed]: 2,
      };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  });

  ngOnInit(): void {
    this.loadTournaments();
  }

  loadTournaments(): void {
    this.tournamentService.tournaments$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tournaments) => {
        this.tournaments.set(tournaments);
        this.hasLoaded.set(true);
      });

    this.tournamentService.loading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => {
        this.isLoading.set(loading);
      });

    this.tournamentService.error$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((error) => {
        this.error.set(error);
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
    this.error.set(null);
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
      winnerId: undefined,
      winnerName: undefined,
    };
  }

  // Utility methods for template
  getTournamentTypeName(type: TournamentType): string {
    switch (type) {
      case TournamentType.Swiss:
        return 'Swiss';
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
