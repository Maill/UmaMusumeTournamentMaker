import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseButtonComponent } from '../../atoms/button/base-button.component';
import { BaseIconComponent } from '../../atoms/icon/base-icon.component';
import { BaseInputComponent } from '../../atoms/input/base-input.component';
import { EditTournamentData, TournamentEditModalData } from '../../types/components.types';

@Component({
  selector: 'app-tournament-edit-modal',
  imports: [FormsModule, BaseIconComponent, BaseButtonComponent, BaseInputComponent],
  template: `
    @if (data.isVisible) {
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
              [(ngModel)]="data.formData.name"
              [disabled]="data.isLoading"
              (keyup.enter)="onSubmit()"
            >
            </app-input>
          </div>

          @if (data.error) {
          <div class="error-message">
            <app-icon name="warning" size="sm" color="danger"></app-icon>
            {{ data.error }}
          </div>
          }
        </div>

        <div class="modal-footer">
          <app-button
            variant="outline-secondary"
            (clicked)="onCancel()"
            [disabled]="data.isLoading"
          >
            Cancel
          </app-button>
          <app-button
            variant="primary"
            (clicked)="onSubmit()"
            [loading]="data.isLoading"
            [disabled]="!data.formData.name.trim()"
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
  @Input() data: TournamentEditModalData = {
    formData: {
      name: '',
    },
    isVisible: false,
    isLoading: false,
    error: null,
  };

  @Output() dataSubmitted = new EventEmitter<EditTournamentData>();
  @Output() cancelled = new EventEmitter<void>();

  onSubmit(): void {
    console.log(this.data.formData.name);
    console.log(!this.data.formData.name.trim());
    if (this.data.formData.name.trim()) {
      console.log('hit');
      this.dataSubmitted.emit(this.data.formData);
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onOverlayClick(): void {
    this.onCancel();
  }
}
