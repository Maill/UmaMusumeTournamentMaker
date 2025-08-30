import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="skeleton"
      [class.skeleton-text]="type === 'text'"
      [class.skeleton-card]="type === 'card'"
      [class.skeleton-button]="type === 'button'"
      [class.skeleton-avatar]="type === 'avatar'"
      [class.skeleton-image]="type === 'image'"
      [style.width]="width"
      [style.height]="height"
      [style.border-radius]="borderRadius"
    ></div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }

    .skeleton-text {
      height: 16px;
      border-radius: 4px;
    }

    .skeleton-card {
      height: 200px;
      border-radius: 8px;
    }

    .skeleton-button {
      height: 40px;
      border-radius: 4px;
    }

    .skeleton-avatar {
      border-radius: 50%;
    }

    .skeleton-image {
      border-radius: 4px;
    }

    @keyframes loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `]
})
export class SkeletonComponent {
  @Input() type: 'text' | 'card' | 'button' | 'avatar' | 'image' = 'text';
  @Input() width: string = '100%';
  @Input() height: string = '16px';
  @Input() borderRadius: string = '';
}