
import { Component, computed, input } from '@angular/core';
import { LoadingSize } from '../../types/ui.types';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [],
  template: `
    <!--<span [class]="spinnerClasses()" role="status" [attr.aria-label]="ariaLabel()">
      <span class="visually-hidden">{{ loadingText() }}</span>
    </span>-->
    <div style="text-align: center;">
      <div [class]="spinnerClasses()" role="status" [attr.aria-label]="ariaLabel()"></div>
      <div class="visually-hidden">{{ loadingText() }}</div>
    </div>
  `,
  styleUrl: './loading-spinner.component.css',
})
export class LoadingSpinnerComponent {
  size = input<LoadingSize>('md');
  variant = input<'primary' | 'secondary' | 'light' | 'dark'>('primary');
  loadingText = input<string>('Loading...');
  ariaLabel = input<string>('Loading');
  overlay = input<boolean>(false);

  spinnerClasses = computed(() => {
    const classes = ['spinner', `spinner-${this.size()}`, `spinner-${this.variant()}`];

    if (this.overlay()) {
      classes.push('spinner-overlay');
    }

    return classes.join(' ');
  });
}
