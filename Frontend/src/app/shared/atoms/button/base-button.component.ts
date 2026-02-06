import { Component, computed, input, output } from '@angular/core';

import { ButtonVariant, ButtonSize, ButtonType } from '../../types/ui.types';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  template: `
    <button
      [type]="type()"
      [class]="buttonClasses()"
      [disabled]="disabled() || loading()"
      (click)="handleClick($event)">

      @if (loading()) {
        <span class="loading-text">{{ loadingText() }}</span>
      } @else {
        <ng-content></ng-content>
      }
    </button>
  `,
  styleUrl: './base-button.component.css'
})
export class BaseButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<ButtonType>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly loadingText = input<string>('Loading...');
  readonly fullWidth = input<boolean>(false);

  readonly clicked = output<Event>();

  handleClick(event: Event): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }

  readonly buttonClasses = computed(() => {
    const classes = ['btn', `btn-${this.variant()}`, `btn-${this.size()}`];
    if (this.fullWidth()) {
      classes.push('btn-full-width');
    }
    if (this.loading()) {
      classes.push('btn-loading');
    }
    return classes.join(' ');
  });
}
