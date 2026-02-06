
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseButtonComponent } from '../../atoms/button/base-button.component';
import { BaseIconComponent } from '../../atoms/icon/base-icon.component';
import { BaseInputComponent } from '../../atoms/input/base-input.component';
import { PasswordModalData } from '../../types/components.types';

@Component({
  selector: 'app-password-modal',
  standalone: true,
  imports: [FormsModule, BaseButtonComponent, BaseIconComponent, BaseInputComponent],
  template: `
    @if (data.isVisible) {
    <div class="modal-overlay" (click)="onOverlayClick()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">{{ data.title }}</h3>
          <button class="modal-close" (click)="onCancel()">
            <app-icon name="close" size="sm"></app-icon>
          </button>
        </div>

        <div class="modal-body">
          <p class="modal-message">{{ data.message }}</p>

          <div class="password-input">
            <app-input
              type="password"
              placeholder="Enter tournament password"
              [(ngModel)]="password"
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
            [disabled]="!password.trim()"
          >
            Enter Management
          </app-button>
        </div>
      </div>
    </div>
    }
  `,
  styleUrl: './password-modal.component.css',
})
export class PasswordModalComponent {
  @Input() data: PasswordModalData = {
    isVisible: false,
    title: '',
    message: '',
    isLoading: false,
    error: null,
  };

  @Output() passwordSubmitted = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  protected password: string = '';

  onSubmit(): void {
    if (this.password.trim()) {
      this.passwordSubmitted.emit(this.password.trim());
    }
  }

  onCancel(): void {
    this.password = '';
    this.cancelled.emit();
  }

  onOverlayClick(): void {
    this.onCancel();
  }
}
