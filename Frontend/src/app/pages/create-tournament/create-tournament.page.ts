
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

// Import organisms
import { TournamentFormComponent } from '../../shared/organisms/tournament-form/tournament-form.component';

// Import atoms and types
import { BaseButtonComponent } from '../../shared/atoms/button/base-button.component';
import { BaseIconComponent } from '../../shared/atoms/icon/base-icon.component';
import { TournamentService } from '../../shared/services/tournament.service';
import { CreateTournamentRequest } from '../../shared/types/api.types';
import {
  TournamentFormData,
  TournamentFormState,
} from '../../shared/types/components.types';

@Component({
  selector: 'app-create-tournament-page',
  standalone: true,
  imports: [TournamentFormComponent, BaseButtonComponent, BaseIconComponent],
  templateUrl: './create-tournament.page.html',
  styleUrl: './create-tournament.page.css',
})
export class CreateTournamentPageComponent {
  private tournamentService: TournamentService = inject(TournamentService);
  private router: Router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // State signals
  readonly isCreating = signal(false);
  readonly error = signal<string | null>(null);
  readonly formData = signal<TournamentFormData | null>(null);

  formState(): TournamentFormState {
    return {
      isLoading: this.isCreating(),
      error: this.error(),
      showPassword: true,
    };
  }

  pageTitle(): string {
    return this.isCreating() ? 'Creating Tournament...' : 'Create New Tournament';
  }

  onCreateTournament(request: CreateTournamentRequest): void {
    this.isCreating.set(true);
    this.error.set(null);

    this.tournamentService
      .createTournament(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tournament) => {
          this.isCreating.set(false);
          // Navigate to the newly created tournament
          this.router.navigate(['/tournaments', tournament.id]);
        },
        error: (error) => {
          console.error('Failed to create tournament:', error);
          this.isCreating.set(false);
          this.error.set(error.message || 'Failed to create tournament');
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/tournaments']);
  }

  onFormChange(formData: TournamentFormData): void {
    this.formData.set(formData);
  }

  goBack(): void {
    this.router.navigate(['/tournaments']);
  }

  clearError(): void {
    this.error.set(null);
  }

  // Utility methods for template
  canNavigateAway(): boolean {
    if (this.isCreating()) {
      return false;
    }

    if (this.formData()) {
      return confirm('You have unsaved changes. Are you sure you want to leave?');
    }

    return true;
  }
}
