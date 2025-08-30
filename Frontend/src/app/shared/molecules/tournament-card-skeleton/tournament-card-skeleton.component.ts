import { Component } from '@angular/core';
import { SkeletonComponent } from '../../atoms/skeleton/skeleton.component';

@Component({
  selector: 'app-tournament-card-skeleton',
  standalone: true,
  imports: [SkeletonComponent],
  template: `
    <div class="tournament-card-skeleton">
      <div class="card-header">
        <app-skeleton type="text" width="70%" height="24px"></app-skeleton>
        <div class="badges">
          <app-skeleton type="button" width="80px" height="28px"></app-skeleton>
          <app-skeleton type="button" width="90px" height="28px"></app-skeleton>
        </div>
      </div>
      
      <div class="card-content">
        <div class="info-row">
          <app-skeleton type="text" width="50%" height="16px"></app-skeleton>
        </div>
        <div class="info-row">
          <app-skeleton type="text" width="40%" height="16px"></app-skeleton>
        </div>
        <div class="info-row">
          <app-skeleton type="text" width="60%" height="16px"></app-skeleton>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tournament-card-skeleton {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      height: 200px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .badges {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .info-row {
      display: flex;
      align-items: center;
    }
  `]
})
export class TournamentCardSkeletonComponent {}