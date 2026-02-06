
import { Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseButtonComponent } from '../../atoms/button/base-button.component';
import { BaseIconComponent } from '../../atoms/icon/base-icon.component';
import { BaseInputComponent } from '../../atoms/input/base-input.component';
import { EditTournamentData, TournamentEditModalData } from '../../types/components.types';

@Component({
  selector: 'app-tournament-edit-modal',
  imports: [FormsModule, BaseIconComponent, BaseButtonComponent, BaseInputComponent],
  template: `
    @if (data().isVisible) {
    <div class="modal-overlay" (click)="onOverlayClick()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">Tournament Edit</h3>
          <button class="modal-close" (click)="onCancel()">
            <app-icon name="close" size="sm"></app-icon>
          </button>
        </div>

        <div class="modal-body">
          <div class="password-input">
            <app-input
              type="text"
              placeholder="Tournament's name"
              [(ngModel)]="editName"
              [disabled]="data().isLoading"
              (keyup.enter)="onSubmit()"
            >
            </app-input>
          </div>

          @if (data().error) {
          <div class="error-message">
            <app-icon name="warning" size="sm" color="danger"></app-icon>
            {{ data().error }}
          </div>
          }
        </div>

        <div class="modal-footer">
          <app-button
            variant="outline-secondary"
            (clicked)="onCancel()"
            [disabled]="data().isLoading"
          >
            Cancel
          </app-button>
          <app-button
            variant="primary"
            (clicked)="onSubmit()"
            [loading]="data().isLoading"
            [disabled]="!editName().trim()"
          >
            Confirm
          </app-button>
        </div>
      </div>
    </div>
    }
  `,
  styleUrl: '../password-modal/password-modal.component.css',
})
export class TournamentEditModal {
  readonly data = input<TournamentEditModalData>({
    formData: {
      name: '',
    },
    isVisible: false,
    isLoading: false,
    error: null,
  });

  readonly dataSubmitted = output<EditTournamentData>();
  readonly cancelled = output<void>();

  readonly editName = signal('');

  constructor() {
    effect(() => {
      this.editName.set(this.data().formData.name);
    });
  }

  onSubmit(): void {
    if (this.editName().trim()) {
      this.dataSubmitted.emit({ name: this.editName().trim() });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onOverlayClick(): void {
    this.onCancel();
  }
}
