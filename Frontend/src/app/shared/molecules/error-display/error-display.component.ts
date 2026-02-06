
import { Component, computed, input, output } from '@angular/core';
import { BaseButtonComponent } from '../../atoms/button/base-button.component';
import { BaseIconComponent } from '../../atoms/icon/base-icon.component';
import { ErrorType } from '../../types/components.types';

@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [BaseButtonComponent, BaseIconComponent],
  template: `
    <div [class]="errorClasses()" role="alert">
      <div class="error-content">
        <div class="error-icon">
          <app-icon [name]="iconName()" size="md" [color]="iconColor()"> </app-icon>
        </div>

        <div class="error-text">
          @if (title()) {
            <div class="error-title">
              {{ title() }}
            </div>
          }
          <div class="error-message">
            {{ message() }}
          </div>
          @if (details()) {
            <div class="error-details">
              {{ details() }}
            </div>
          }
        </div>

        @if (showActions()) {
          <div class="error-actions">
            @if (retryable()) {
              <app-button
                variant="outline-primary"
                size="sm"
                [loading]="isRetrying()"
                loadingText="Retrying..."
                (clicked)="onRetry()"
                >
                {{ retryText() }}
              </app-button>
              } @if (dismissible()) {
              <app-button variant="outline-secondary" size="sm" (clicked)="onDismiss()">
                <app-icon name="close" size="xs"> </app-icon>
              </app-button>
            }
          </div>
        }
      </div>
    </div>
    `,
  styleUrl: './error-display.component.css',
})
export class ErrorDisplayComponent {
  readonly message = input<string>('');
  readonly title = input<string>('');
  readonly details = input<string>('');
  readonly type = input<ErrorType>('error');
  readonly retryable = input<boolean>(false);
  readonly dismissible = input<boolean>(false);
  readonly retryText = input<string>('Retry');
  readonly isRetrying = input<boolean>(false);
  readonly showActions = input<boolean>(true);
  readonly compact = input<boolean>(false);

  readonly retryClicked = output<void>();
  readonly dismissed = output<void>();

  onRetry(): void {
    if (this.retryable() && !this.isRetrying()) {
      this.retryClicked.emit();
    }
  }

  onDismiss(): void {
    if (this.dismissible()) {
      this.dismissed.emit();
    }
  }

  readonly errorClasses = computed(() => {
    const classes = ['error-display', `error-${this.type()}`];
    if (this.compact()) {
      classes.push('error-compact');
    }
    return classes.join(' ');
  });

  readonly iconName = computed<'warning' | 'info' | 'close'>(() => {
    switch (this.type()) {
      case 'error':
        return 'warning';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'warning';
    }
  });

  readonly iconColor = computed(() => {
    switch (this.type()) {
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'danger';
    }
  });
}
