import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AddPlayer,
  Match,
  Round,
  SetWinner,
  Tournament,
  TournamentStatus,
  TournamentType,
} from '../../models/tournament.model';
import { TournamentService } from '../../services/tournament.service';
import { PasswordInputComponent } from '../password-input/password-input';

@Component({
  selector: 'app-tournament-detail',
  imports: [FormsModule, CommonModule, RouterLink, PasswordInputComponent],
  templateUrl: './tournament-detail.html',
  styleUrl: './tournament-detail.css',
})
export class TournamentDetailComponent implements OnInit {
  tournament: Tournament | null = null;
  isLoading = false;
  error = '';

  // Player management
  newPlayerName = '';
  isAddingPlayer = false;
  addPlayerError = '';

  // Tournament management
  isStartingTournament = false;
  isStartingNextRound = false;

  // Match management
  isSettingWinner = false;
  currentSettingMatchId: number | null = null;
  selectedWinners: { [matchId: number]: number | null } = {};

  // Tournament management
  isDeletingTournament = false;
  isEditingName = false;
  editingTournamentName = '';
  isSavingName = false;

  // Password management
  showPasswordModal = false;
  passwordModalTitle = '';
  passwordModalMessage = '';
  passwordModalError = '';
  passwordModalLoading = false;
  pendingAction: (() => void) | null = null;

  TournamentStatus = TournamentStatus;
  TournamentType = TournamentType;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tournamentService: TournamentService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = +params['id'];
      if (id) {
        this.loadTournament(id);
      }
    });
  }

  loadTournament(id: number) {
    this.isLoading = true;
    this.error = '';

    this.tournamentService.getTournamentWithCurrentRound(id).subscribe({
      next: (tournament) => {
        this.tournament = tournament;
        this.isLoading = false;
        // Reset UI state to ensure dropdowns are cleared
        this.resetUIState();
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load tournament';
        this.isLoading = false;
      },
    });
  }

  addPlayer() {
    if (!this.tournament || !this.newPlayerName.trim()) {
      this.addPlayerError = 'Player name is required';
      return;
    }

    this.executeWithPasswordCheck(() => this.doAddPlayer(), 'add player');
  }

  private doAddPlayer() {
    if (!this.tournament || !this.newPlayerName.trim()) return;

    this.isAddingPlayer = true;
    this.addPlayerError = '';

    const addPlayerDto: AddPlayer = {
      name: this.newPlayerName.trim(),
    };

    this.tournamentService.addPlayer(this.tournament.id, addPlayerDto).subscribe({
      next: (updatedTournament) => {
        this.tournament = updatedTournament;
        this.newPlayerName = '';
        this.isAddingPlayer = false;
      },
      error: (error) => {
        if (error.status === 401) {
          this.handleAuthError(error, 'add player');
          this.isAddingPlayer = false;
        } else {
          this.addPlayerError = error.error?.message || 'Failed to add player';
          this.isAddingPlayer = false;
        }
      },
    });
  }

  startTournament() {
    if (!this.tournament) return;
    this.executeWithPasswordCheck(() => this.doStartTournament(), 'start tournament');
  }

  private doStartTournament() {
    if (!this.tournament) return;

    this.isStartingTournament = true;
    this.error = '';

    this.tournamentService.startTournament(this.tournament.id).subscribe({
      next: (updatedTournament) => {
        this.tournament = updatedTournament;
        this.isStartingTournament = false;
        // Reload tournament to get the first round data
        this.loadTournament(this.tournament.id);
      },
      error: (error) => {
        if (error.status === 401) {
          this.handleAuthError(error, 'start tournament');
          this.isStartingTournament = false;
        } else {
          this.error = error.error?.message || 'Failed to start tournament';
          this.isStartingTournament = false;
        }
      },
    });
  }

  startNextRound() {
    if (!this.tournament) return;

    this.isStartingNextRound = true;
    this.error = '';

    this.tournamentService.startNextRound(this.tournament.id).subscribe({
      next: (round) => {
        // Reload tournament to get updated data
        this.loadTournamentAndResetState(this.tournament!.id);
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to start next round';
        this.isStartingNextRound = false;
      },
    });
  }

  private loadTournamentAndResetState(id: number) {
    this.tournamentService.getTournamentWithCurrentRound(id).subscribe({
      next: (tournament) => {
        this.tournament = tournament;
        this.isStartingNextRound = false;
        this.isLoading = false;
        // Reset any UI state that might be lingering
        this.resetUIState();
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load tournament';
        this.isStartingNextRound = false;
        this.isLoading = false;
      },
    });
  }

  private resetUIState() {
    // Reset any form states or UI elements that might need clearing
    this.isSettingWinner = false;
    this.currentSettingMatchId = null;
    this.selectedWinners = {};

    // Force a UI refresh by updating the DOM
    setTimeout(() => {
      // This timeout ensures the DOM has been updated with new data
      // before we potentially trigger any additional UI updates
    }, 0);
  }

  onWinnerSelectionChange(match: Match, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const winnerId = +selectElement.value;

    if (winnerId) {
      this.selectedWinners[match.id] = winnerId;
      this.setMatchWinner(match, winnerId);
    } else {
      this.selectedWinners[match.id] = null;
    }
  }

  setMatchWinner(match: Match, winnerId: number) {
    this.executeWithPasswordCheck(() => this.doSetMatchWinner(match, winnerId), 'set match winner');
  }

  private doSetMatchWinner(match: Match, winnerId: number) {
    this.isSettingWinner = true;
    this.currentSettingMatchId = match.id;
    this.error = '';

    const setWinner: SetWinner = { winnerId };

    this.tournamentService.setMatchWinner(match.id, setWinner, this.tournament?.id).subscribe({
      next: (updatedMatch) => {
        // Update the match in the tournament
        if (this.tournament) {
          const currentRound = this.getCurrentRound();
          if (currentRound) {
            const matchIndex = currentRound.matches.findIndex((m) => m.id === match.id);
            if (matchIndex !== -1) {
              currentRound.matches[matchIndex] = updatedMatch;
            }
          }
        }
        this.isSettingWinner = false;
        this.currentSettingMatchId = null;
        // Clear the selected value for this match since it's now completed
        delete this.selectedWinners[match.id];

        // Check if round is completed and reload tournament
        this.loadTournament(this.tournament!.id);
      },
      error: (error) => {
        if (error.status === 401) {
          this.handleAuthError(error, 'set match winner');
          this.isSettingWinner = false;
          this.currentSettingMatchId = null;
          this.selectedWinners[match.id] = null;
        } else {
          this.error = error.error?.message || 'Failed to set match winner';
          this.isSettingWinner = false;
          this.currentSettingMatchId = null;
          // Reset the dropdown to empty on error
          this.selectedWinners[match.id] = null;
        }
      },
    });
  }

  getCurrentRound(): Round | null {
    if (!this.tournament || this.tournament.rounds.length === 0) {
      return null;
    }
    return (
      this.tournament.rounds.find((r) => r.roundNumber === this.tournament!.currentRound) || null
    );
  }

  isCurrentRoundCompleted(): boolean {
    const currentRound = this.getCurrentRound();
    if (!currentRound) return false;
    return currentRound.matches.every((match) => match.winnerId !== null);
  }

  canStartNextRound(): boolean {
    return (
      this.tournament?.status === TournamentStatus.InProgress && 
      this.isCurrentRoundCompleted() &&
      !this.isCurrentRoundFinal()
    );
  }

  isCurrentRoundFinal(): boolean {
    const currentRound = this.getCurrentRound();
    if (!currentRound || !this.tournament) return false;
    
    // A final round in Swiss tournament has exactly one match with 3 players
    // and is for tournaments with Swiss type
    if (this.tournament.type === TournamentType.Swiss) {
      return currentRound.matches.length === 1 && 
             currentRound.matches[0]?.players?.length === 3;
    }
    
    return false;
  }

  getFinalRoundTitle(): string {
    if (this.isCurrentRoundFinal()) {
      return 'Final Round - Top 3 Championship';
    }
    if (this.isCurrentRoundTiebreaker()) {
      return `Tiebreaker Round ${this.tournament?.currentRound}`;
    }
    return `Round ${this.tournament?.currentRound}`;
  }

  isCurrentRoundTiebreaker(): boolean {
    if (!this.tournament || this.tournament.type !== TournamentType.Swiss) {
      return false;
    }
    
    // Check if all players have reached target matches (indicating we're in tiebreaker phase)
    const targetMatches = this.calculateTargetMatches(this.tournament.players.length);
    const allPlayersReachedTarget = this.tournament.players.every(p => 
      (p.wins + p.losses) >= targetMatches
    );
    
    return allPlayersReachedTarget && !this.isCurrentRoundFinal();
  }

  getNextRoundButtonText(): string {
    if (!this.tournament) return 'Start Next Round';
    
    // Check if next round would be the final round
    const targetMatches = this.calculateTargetMatches(this.tournament.players.length);
    const allPlayersReachedTarget = this.tournament.players.every(p => 
      (p.wins + p.losses) >= targetMatches
    );
    
    if (allPlayersReachedTarget && this.tournament.type === TournamentType.Swiss) {
      return 'Start Final Championship';
    }
    
    return 'Start Next Round';
  }

  private calculateTargetMatches(playerCount: number): number {
    // Match the backend logic for target matches
    if (playerCount <= 4) return 3;
    if (playerCount <= 6) return 4;
    if (playerCount <= 9) return 5;
    if (playerCount <= 12) return 6;
    
    return Math.min(8, Math.floor((playerCount - 1) / 2) + 2);
  }

  getTournamentTypeName(type: TournamentType): string {
    switch (type) {
      case TournamentType.Swiss:
        return 'Swiss';
      case TournamentType.ChampionsMeeting:
        return 'Champions Meeting';
      default:
        return 'Unknown';
    }
  }

  getStatusText(status: TournamentStatus): string {
    switch (status) {
      case TournamentStatus.Created:
        return 'Created';
      case TournamentStatus.InProgress:
        return 'In Progress';
      case TournamentStatus.Completed:
        return 'Completed';
      default:
        return 'Unknown';
    }
  }

  getPlayersSortedByPoints() {
    if (!this.tournament) return [];
    return [...this.tournament.players].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.losses - b.losses;
    });
  }

  getSelectedWinnerValue(matchId: number): string {
    const selectedValue = this.selectedWinners[matchId];
    return selectedValue ? selectedValue.toString() : '';
  }

  // Password management methods
  private requiresPassword(): boolean {
    return this.tournament ? !this.tournamentService.hasTournamentPassword(this.tournament.id) : false;
  }

  private showPasswordPrompt(title: string, message: string, action: () => void) {
    this.passwordModalTitle = title;
    this.passwordModalMessage = message;
    this.passwordModalError = '';
    this.passwordModalLoading = false;
    this.pendingAction = action;
    this.showPasswordModal = true;
  }

  onPasswordSubmitted(password: string) {
    if (!this.tournament || !this.pendingAction) return;

    this.passwordModalLoading = true;
    this.passwordModalError = '';

    // Store the password
    this.tournamentService.setTournamentPassword(this.tournament.id, password);

    // Execute the pending action
    this.pendingAction();
    this.hidePasswordModal();
  }

  onPasswordCancelled() {
    this.hidePasswordModal();
  }

  private hidePasswordModal() {
    this.showPasswordModal = false;
    this.passwordModalTitle = '';
    this.passwordModalMessage = '';
    this.passwordModalError = '';
    this.passwordModalLoading = false;
    this.pendingAction = null;
  }

  private executeWithPasswordCheck(action: () => void, actionName: string) {
    if (!this.tournament) return;

    if (this.requiresPassword()) {
      this.showPasswordPrompt(
        'Password Required',
        `This tournament is password protected. Please enter the password to ${actionName}.`,
        action
      );
    } else {
      action();
    }
  }

  private handleAuthError(error: any, actionName: string) {
    if (error.status === 401) {
      // Clear stored password and prompt again
      if (this.tournament) {
        this.tournamentService.clearTournamentPassword(this.tournament.id);
      }
      this.passwordModalError = 'Invalid password. Please try again.';
      this.passwordModalLoading = false;
      // Don't hide modal, allow user to retry
    } else {
      this.error = error.error?.message || `Failed to ${actionName}`;
      this.hidePasswordModal();
    }
  }

  // Tournament management methods
  deleteTournament() {
    if (!this.tournament) return;
    
    if (confirm(`Are you sure you want to delete the tournament "${this.tournament.name}"? This action cannot be undone.`)) {
      this.executeWithPasswordCheck(() => this.doDeleteTournament(), 'delete tournament');
    }
  }

  private doDeleteTournament() {
    if (!this.tournament) return;

    this.isDeletingTournament = true;
    this.error = '';

    const deleteData = {
      password: this.tournamentService.getTournamentPassword(this.tournament.id) || ''
    };

    this.tournamentService.deleteTournament(this.tournament.id, deleteData).subscribe({
      next: () => {
        // Navigate back to tournaments list
        this.router.navigate(['/tournaments']);
      },
      error: (error) => {
        if (error.status === 401) {
          this.handleAuthError(error, 'delete tournament');
          this.isDeletingTournament = false;
        } else {
          this.error = error.error?.message || 'Failed to delete tournament';
          this.isDeletingTournament = false;
        }
      },
    });
  }

  startNameEdit() {
    if (!this.tournament) return;
    
    this.isEditingName = true;
    this.editingTournamentName = this.tournament.name;
    
    // Focus the input after the view updates
    setTimeout(() => {
      const input = document.querySelector('.tournament-name-input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 0);
  }

  cancelNameEdit() {
    this.isEditingName = false;
    this.editingTournamentName = '';
    this.isSavingName = false;
  }

  saveNameEdit() {
    if (!this.tournament || !this.editingTournamentName.trim()) return;
    
    if (this.editingTournamentName.trim() === this.tournament.name) {
      // No change, just cancel
      this.cancelNameEdit();
      return;
    }

    this.executeWithPasswordCheck(() => this.doSaveNameEdit(), 'update tournament name');
  }

  private doSaveNameEdit() {
    if (!this.tournament || !this.editingTournamentName.trim()) return;

    this.isSavingName = true;
    this.error = '';

    const updateData = {
      name: this.editingTournamentName.trim(),
      password: this.tournamentService.getTournamentPassword(this.tournament.id) || ''
    };

    this.tournamentService.updateTournament(this.tournament.id, updateData).subscribe({
      next: (updatedTournament) => {
        this.tournament = updatedTournament;
        this.cancelNameEdit();
      },
      error: (error) => {
        if (error.status === 401) {
          this.handleAuthError(error, 'update tournament name');
          this.isSavingName = false;
        } else {
          this.error = error.error?.message || 'Failed to update tournament name';
          this.isSavingName = false;
        }
      },
    });
  }
}
