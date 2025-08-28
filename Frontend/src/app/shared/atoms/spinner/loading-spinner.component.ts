import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LoadingSize } from '../../types/ui.types';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!--<span [class]="getSpinnerClasses()" role="status" [attr.aria-label]="ariaLabel">
      <span class="visually-hidden">{{ loadingText }}</span>
    </span>-->
    <div style="text-align: center;">
      <div [class]="getSpinnerClasses()" role="status" [attr.aria-label]="ariaLabel"></div>
      <div class="visually-hidden">{{ loadingText }}</div>
    </div>
  `,
  styleUrl: './loading-spinner.component.css',
})
export class LoadingSpinnerComponent {
  @Input() size: LoadingSize = 'md';
  @Input() variant: 'primary' | 'secondary' | 'light' | 'dark' = 'primary';
  @Input() loadingText: string = 'Loading...';
  @Input() ariaLabel: string = 'Loading';
  @Input() overlay: boolean = false;

  getSpinnerClasses(): string {
    const classes = ['spinner', `spinner-${this.size}`, `spinner-${this.variant}`];

    if (this.overlay) {
      classes.push('spinner-overlay');
    }

    return classes.join(' ');
  }
}
