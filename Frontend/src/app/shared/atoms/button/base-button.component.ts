import { Component, Input, Output, EventEmitter } from '@angular/core';

import { ButtonVariant, ButtonSize, ButtonType } from '../../types/ui.types';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  template: `
    <button 
      [type]="type"
      [class]="getButtonClasses()"
      [disabled]="disabled || loading"
      (click)="handleClick($event)">
      
      @if (loading) {
        <span class="loading-text">{{ loadingText }}</span>
      } @else {
        <ng-content></ng-content>
      }
    </button>
  `,
  styleUrl: './base-button.component.css'
})
export class BaseButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: ButtonType = 'button';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() loadingText: string = 'Loading...';
  @Input() fullWidth: boolean = false;

  @Output() clicked = new EventEmitter<Event>();

  handleClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }

  getButtonClasses(): string {
    const classes = ['btn', `btn-${this.variant}`, `btn-${this.size}`];
    
    if (this.fullWidth) {
      classes.push('btn-full-width');
    }
    
    if (this.loading) {
      classes.push('btn-loading');
    }

    return classes.join(' ');
  }
}