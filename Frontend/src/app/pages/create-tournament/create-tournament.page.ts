import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

// Import organisms
import {
  TournamentFormComponent,
  TournamentFormData,
  TournamentFormState,
} from '../../shared/organisms/tournament-form/tournament-form.component';

// Import atoms and types
import { BaseButtonComponent } from '../../shared/atoms/button/base-button.component';
import { BaseIconComponent } from '../../shared/atoms/icon/base-icon.component';
import { TournamentService } from '../../shared/services/tournament.service';
import { CreateTournamentRequest } from '../../shared/types/tournament.types';

interface CreateTournamentPageState {
  isCreating: boolean;
  error: string | null;
  formData: TournamentFormData | null;
}

@Component({
  selector: 'app-create-tournament-page',
  standalone: true,
  imports: [CommonModule, TournamentFormComponent, BaseButtonComponent, BaseIconComponent],
  template: `
    <div class="create-tournament-page">
      <div class="page-container">
        <!-- Page Header -->
        <div class="page-header">
          <div class="header-navigation">
            <app-button variant="outline-secondary" size="sm" (clicked)="goBack()">
              <app-icon name="arrow-left" size="xs"></app-icon>
              Back to Tournaments
            </app-button>
          </div>

          <div class="header-content">
            <!--<div class="header-icon">
              <app-icon
                name="add"
                size="xl"
                color="primary"
                ariaLabel="Create tournament">
              </app-icon>
            </div>-->

            <div class="header-text">
              <h1 class="page-title">Create New Tournament</h1>
              <p class="page-description">
                Set up a new tournament with custom settings and invite players to compete.
              </p>
            </div>
          </div>
        </div>

        <!-- Tournament Form -->
        <div class="form-section">
          <app-tournament-form
            [title]="'Tournament Details'"
            [subtitle]="'Configure your tournament settings and rules'"
            [submitText]="'Create Tournament'"
            [submitLoadingText]="'Creating Tournament...'"
            [cancelText]="'Cancel'"
            [showCancel]="true"
            [initialData]="state.formData || undefined"
            [state]="getFormState()"
            (formSubmitted)="onCreateTournament($event)"
            (formCancelled)="onCancel()"
            (formChanged)="onFormChange($event)"
            (errorDismissed)="clearError()"
          >
          </app-tournament-form>
        </div>

        <!-- Help Section -->
        <div class="help-section">
          <div class="help-content">
            <h2 class="help-title">
              <app-icon name="info" size="md" color="info"></app-icon>
              Tournament Types
            </h2>

            <div class="help-cards">
              <div class="help-card">
                <div class="help-card-header">
                  <app-icon name="target" size="lg" color="primary"></app-icon>
                  <h3>Swiss Tournament</h3>
                </div>
                <div class="help-card-content">
                  <p>
                    <strong>Best for:</strong> Balanced competition where all players get to play
                    multiple rounds.
                  </p>
                  <ul>
                    <li>Players are paired based on current standings</li>
                    <li>Everyone plays the same number of rounds</li>
                    <li>Continues until a clear winner emerges</li>
                    <li>Great for skill-based tournaments</li>
                  </ul>
                </div>
              </div>

              <div class="help-card">
                <div class="help-card-header">
                  <app-icon name="star" size="lg" color="info"></app-icon>
                  <h3>Champions Meeting</h3>
                </div>
                <div class="help-card-content">
                  <p>
                    <strong>Best for:</strong> Elite competitions with group divisions and
                    advancement.
                  </p>
                  <ul>
                    <li>Multi-stage tournament structure</li>
                    <li>Group divisions based on performance</li>
                    <li>Top performers advance to final groups</li>
                    <li>Perfect for championship events</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tips Section -->
        <div class="tips-section">
          <div class="tips-content">
            <h2 class="tips-title">
              <app-icon name="lightbulb" size="md" color="warning"></app-icon>
              Pro Tips
            </h2>

            <div class="tips-list">
              <div class="tip-item">
                <app-icon name="check" size="sm" color="success"></app-icon>
                <div class="tip-text">
                  <strong>Name wisely:</strong> Choose a descriptive name that players will
                  recognize and remember.
                </div>
              </div>

              <div class="tip-item">
                <app-icon name="check" size="sm" color="success"></app-icon>
                <div class="tip-text">
                  <strong>Set a password:</strong> Use a password to control who can manage the
                  tournament and set match results.
                </div>
              </div>

              <div class="tip-item">
                <app-icon name="check" size="sm" color="success"></app-icon>
                <div class="tip-text">
                  <strong>Plan ahead:</strong> Consider how many rounds you want and the time needed
                  for each match.
                </div>
              </div>

              <div class="tip-item">
                <app-icon name="check" size="sm" color="success"></app-icon>
                <div class="tip-text">
                  <strong>Minimum players:</strong> You'll need at least 3 players to start any
                  tournament.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './create-tournament.page.css',
})
export class CreateTournamentPageComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  state: CreateTournamentPageState = {
    isCreating: false,
    error: null,
    formData: null,
  };

  constructor(private router: Router, private tournamentService: TournamentService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCreateTournament(request: CreateTournamentRequest): void {
    this.state.isCreating = true;
    this.state.error = null;

    this.tournamentService.createTournament(request).subscribe({
      next: (tournament) => {
        this.state.isCreating = false;
        // Navigate to the newly created tournament
        this.router.navigate(['/tournaments', tournament.id], {
          queryParams: { created: 'true' },
        });
      },
      error: (error) => {
        console.error('Failed to create tournament:', error);
        this.state.isCreating = false;
        this.state.error = error.message || 'Failed to create tournament';
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/tournaments']);
  }

  onFormChange(formData: TournamentFormData): void {
    this.state.formData = formData;
  }

  goBack(): void {
    this.router.navigate(['/tournaments']);
  }

  clearError(): void {
    this.state.error = null;
  }

  getFormState(): TournamentFormState {
    return {
      isLoading: this.state.isCreating,
      error: this.state.error,
      showPassword: true,
    };
  }

  private getErrorMessage(error: any): string {
    // Parse different types of errors
    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.message) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    // Handle validation errors
    if (error?.error?.errors) {
      const validationErrors = Object.values(error.error.errors).flat().join(', ');
      return `Validation failed: ${validationErrors}`;
    }

    // Handle network errors
    if (error?.status === 0) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }

    if (error?.status === 400) {
      return 'Invalid tournament data. Please check your inputs and try again.';
    }

    if (error?.status === 409) {
      return 'A tournament with this name already exists. Please choose a different name.';
    }

    if (error?.status >= 500) {
      return 'Server error occurred. Please try again later.';
    }

    return 'An unexpected error occurred while creating the tournament. Please try again.';
  }

  // Utility methods for template
  canNavigateAway(): boolean {
    if (this.state.isCreating) {
      return false;
    }

    if (this.state.formData) {
      return confirm('You have unsaved changes. Are you sure you want to leave?');
    }

    return true;
  }

  getPageTitle(): string {
    return this.state.isCreating ? 'Creating Tournament...' : 'Create New Tournament';
  }
}
