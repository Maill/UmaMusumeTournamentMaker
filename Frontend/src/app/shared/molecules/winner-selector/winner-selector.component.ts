
import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseIconComponent } from '../../atoms/icon/base-icon.component';
import { BaseSelectComponent } from '../../atoms/select/base-select.component';
import { SelectOption } from '../../types/components.types';
import { Player } from '../../types/tournament.types';

@Component({
  selector: 'app-winner-selector',
  standalone: true,
  imports: [FormsModule, BaseSelectComponent, BaseIconComponent],
  template: `
    <div class="winner-selector-wrapper">
      <div class="selector-container">
        <app-select
          [options]="playerOptions()"
          [disabled]="disabled()"
          [error]="error()"
          [label]="label()"
          (valueChange)="onWinnerChange($event)"
        >
        </app-select>

        <div class="winner-indicator">
          @if (selectedWinnerId() && !disabled()) {
          <!--<app-icon
              name="check"
              size="sm"
              color="success"
              [ariaLabel]="'Winner selected: ' + selectedPlayerName()">
            </app-icon>
          <span class="winner-text">{{ selectedPlayerName() }}</span>-->
          } @else if (selectedWinnerId() && disabled()) {
          <app-icon
            name="trophy"
            size="sm"
            color="warning"
            [ariaLabel]="'Match winner: ' + selectedPlayerName()"
          >
          </app-icon>
          <span class="winner-text winner-final">{{ selectedPlayerName() }}</span>
          }
        </div>
      </div>

      @if (showHelp() && !error()) {
      <div class="selector-help">
        {{ helpText() }}
      </div>
      }
    </div>
  `,
  styleUrl: './winner-selector.component.css',
})
export class WinnerSelectorComponent {
  readonly matchId = input<number>(0);
  readonly players = input<Player[]>([]);
  readonly selectedWinnerId = input<number | null>(null);
  readonly disabled = input<boolean>(false);
  readonly error = input<string | null>(null);
  readonly label = input<string>(' ');
  readonly placeholder = input<string>('Choose match winner...');
  readonly helpText = input<string>('Select the player who won this match');
  readonly showHelp = input<boolean>(false);

  readonly winnerChanged = output<{
    matchId: number;
    winnerId: number | null;
    playerName?: string;
  }>();

  readonly playerOptions = computed<SelectOption<number>[]>(() => {
    const options: SelectOption<number>[] = [];

    if (!this.selectedWinnerId()) {
      options.push({
        value: 0,
        label: this.placeholder(),
        disabled: false,
      });
    }

    this.players().forEach((player) => {
      options.push({
        value: player.id,
        label: player.name,
        disabled: false,
      });
    });

    return options;
  });

  readonly selectedPlayerName = computed(() => {
    if (!this.selectedWinnerId()) return '';
    const selectedPlayer = this.players().find((p) => p.id === this.selectedWinnerId());
    return selectedPlayer?.name || '';
  });

  onWinnerChange(winnerId: number): void {
    const actualWinnerId = winnerId === 0 ? null : winnerId;
    const selectedPlayer = this.players().find((p) => p.id === actualWinnerId);

    this.winnerChanged.emit({
      matchId: this.matchId(),
      winnerId: actualWinnerId,
      playerName: selectedPlayer?.name,
    });
  }
}
