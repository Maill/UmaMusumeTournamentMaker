import { Component, computed, input, output } from '@angular/core';

import { BadgeVariant } from '../../types/ui.types';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [],
  template: `
    <span [class]="badgeClasses()">
      <ng-content></ng-content>
      @if (dismissible()) {
        <button
          type="button"
          class="badge-close"
          (click)="onDismiss($event)"
          aria-label="Close">
          ×
        </button>
      }
    </span>
  `,
  styleUrl: './base-badge.component.css'
})
export class BaseBadgeComponent {
  readonly variant = input<BadgeVariant>('primary');
  readonly dismissible = input<boolean>(false);
  readonly pill = input<boolean>(false);

  readonly dismissed = output<Event>();

  onDismiss(event: Event): void {
    event.stopPropagation();
    this.dismissed.emit(event);
  }

  readonly badgeClasses = computed(() => {
    const classes = ['badge', `badge-${this.variant()}`];
    if (this.pill()) {
      classes.push('badge-pill');
    }
    if (this.dismissible()) {
      classes.push('badge-dismissible');
    }
    return classes.join(' ');
  });
}
