import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeVariant } from '../../types/ui.types';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="getBadgeClasses()">
      <ng-content></ng-content>
      @if (dismissible) {
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
  @Input() variant: BadgeVariant = 'primary';
  @Input() dismissible: boolean = false;
  @Input() pill: boolean = false;

  @Output() dismissed = new EventEmitter<Event>();

  onDismiss(event: Event): void {
    event.stopPropagation();
    this.dismissed.emit(event);
  }

  getBadgeClasses(): string {
    const classes = ['badge', `badge-${this.variant}`];
    
    if (this.pill) {
      classes.push('badge-pill');
    }
    
    if (this.dismissible) {
      classes.push('badge-dismissible');
    }

    return classes.join(' ');
  }
}