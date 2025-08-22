import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  Match,
  Round,
  Tournament,
  TournamentStatus,
  TournamentType,
} from '../../models/tournament.model';
import { RealTimeTournamentService } from '../../services/real-time-tournament.service';
import { TournamentService } from '../../services/tournament.service';
import { PasswordInputComponent } from '../password-input/password-input';

@Component({
  selector: 'app-tournament-detail',
  imports: [FormsModule, CommonModule, RouterLink, PasswordInputComponent],
  templateUrl: './tournament-detail.html',
  styleUrl: './tournament-detail.css',
})
export class TournamentDetailComponent implements OnInit, OnDestroy {
  @ViewChild('playerNameInput') playerNameInput!: ElementRef<HTMLInputElement>;

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

  // Match management (for local winner selection only)

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

  // Management mode
  isInManagementMode = false;
  pendingAction: (() => void) | null = null;

  TournamentStatus = TournamentStatus;
  TournamentType = TournamentType;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private realTimeTournamentService: RealTimeTournamentService,
    private tournamentService: TournamentService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = +params['id'];
      if (id) {
        this.initializeTournament(id);
      }
    });

    // Subscribe to real-time updates
    this.realTimeTournamentService.currentTournament$.subscribe((tournament) => {
      this.tournament = tournament;
    });

    this.realTimeTournamentService.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });

    this.realTimeTournamentService.error$.subscribe((error) => {
      this.error = error || '';
    });
  }

  ngOnDestroy() {
    this.realTimeTournamentService.cleanup();
  }

  async initializeTournament(id: number) {
    try {
      await this.realTimeTournamentService.initializeTournament(id);
      this.resetUIState();

      // Check if we have a stored password and automatically enter management mode
      await this.checkAndEnterManagementMode(id);
    } catch (error) {
      console.error('Failed to initialize tournament:', error);
    }
  }

  private async checkAndEnterManagementMode(tournamentId: number) {
    if (this.realTimeTournamentService.hasTournamentPassword(tournamentId)) {
      try {
        const password = this.realTimeTournamentService.getTournamentPassword(tournamentId);
        if (password) {
          // Validate the stored password
          const result = await this.tournamentService
            .validatePassword(tournamentId, password)
            .toPromise();
          if (result?.isValid) {
            this.isInManagementMode = true;
          } else {
            // Clear invalid stored password
            this.realTimeTournamentService.clearTournamentPassword(tournamentId);
          }
        }
      } catch (error) {
        // Clear stored password on validation error
        this.realTimeTournamentService.clearTournamentPassword(tournamentId);
      }
    }
  }

  addPlayer() {
    if (!this.tournament || !this.newPlayerName.trim()) {
      this.addPlayerError = 'Player name is required';
      return;
    }

    this.executeWithPasswordCheck(() => this.doAddPlayer(), 'add player');
  }

  private async doAddPlayer() {
    if (!this.tournament || !this.newPlayerName.trim()) return;

    this.isAddingPlayer = true;
    this.addPlayerError = '';
    this.error = ''; // Clear any previous top-level errors

    try {
      await this.realTimeTournamentService.addPlayer(this.tournament.id, this.newPlayerName.trim());
      this.newPlayerName = '';
      this.isAddingPlayer = false;

      // Keep input focused for adding more players
      setTimeout(() => {
        if (this.playerNameInput) {
          this.playerNameInput.nativeElement.focus();
        }
      }, 0);
    } catch (error: any) {
      this.addPlayerError = error.error?.message || 'Failed to add player';
      this.isAddingPlayer = false;
      // Ensure top error is cleared for player addition errors
      this.error = '';
    }
  }

  startTournament() {
    if (!this.tournament) return;
    this.executeWithPasswordCheck(() => this.doStartTournament(), 'start tournament');
  }

  private async doStartTournament() {
    if (!this.tournament) return;

    this.isStartingTournament = true;
    this.error = '';

    try {
      await this.realTimeTournamentService.startTournament(this.tournament.id);
      this.isStartingTournament = false;
    } catch (error: any) {
      if (error.status === 401) {
        this.handleAuthError(error, 'start tournament');
        this.isStartingTournament = false;
      } else {
        this.error = error.error?.message || 'Failed to start tournament';
        this.isStartingTournament = false;
      }
    }
  }

  startNextRound() {
    if (!this.tournament) return;
    this.executeWithPasswordCheck(() => this.doStartNextRound(), 'start next round');
  }

  private async doStartNextRound() {
    if (!this.tournament) return;

    this.isStartingNextRound = true;
    this.error = '';

    try {
      // Collect all match winners from the current round
      const currentRound = this.getCurrentRound();
      if (!currentRound) {
        this.error = 'No current round found';
        this.isStartingNextRound = false;
        return;
      }

      const matchResults = currentRound.matches.map((match) => {
        if (!match.winnerId) {
          throw new Error(`Match ${match.id} does not have a winner selected`);
        }
        return {
          matchId: match.id,
          winnerId: match.winnerId,
        };
      });

      await this.realTimeTournamentService.startNextRound(this.tournament.id, matchResults);
      this.isStartingNextRound = false;
      this.resetUIState();
    } catch (error: any) {
      if (error.status === 401) {
        this.handleAuthError(error, 'start next round');
        this.isStartingNextRound = false;
      } else {
        this.error = error.error?.message || error.message || 'Failed to start next round';
        this.isStartingNextRound = false;
      }
    }
  }

  private resetUIState() {
    // Reset any form states or UI elements that might need clearing
    // (No longer need match winner setting state since it's local only)

    // Force a UI refresh by updating the DOM
    setTimeout(() => {
      // This timeout ensures the DOM has been updated with new data
      // before we potentially trigger any additional UI updates
    }, 0);
  }

  onWinnerSelectionChange(match: Match, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const winnerId = +selectElement.value;

    if (winnerId && this.tournament) {
      this.executeWithPasswordCheck(() => this.doWinnerSelection(match, winnerId), 'select winner');
    } else {
      // Clear the winner locally only (no password needed for clearing)
      this.updateMatchWinnerLocally(match, null);
    }
  }

  private doWinnerSelection(match: Match, winnerId: number) {
    if (!this.tournament) return;

    // Broadcast winner selection to other users (no DB update)
    this.realTimeTournamentService.broadcastWinnerSelection(this.tournament.id, match.id, winnerId);
  }

  private updateMatchWinnerLocally(match: Match, winnerId: number | null) {
    if (!this.tournament) return;

    // Find the winner player if winnerId is provided (but don't update their stats)
    const winner = winnerId ? match.players.find((p) => p.id === winnerId) : undefined;

    // Update ONLY the match winner fields locally, don't touch player statistics
    const updatedTournament = {
      ...this.tournament,
      rounds: this.tournament.rounds.map((round) => ({
        ...round,
        matches: round.matches.map((m) =>
          m.id === match.id
            ? {
                ...m,
                winnerId: winnerId || undefined,
                winner: winner ? { ...winner } : undefined, // Create a copy to avoid reference issues
              }
            : m
        ),
      })),
    };

    // Update the tournament subject to trigger UI refresh
    this.realTimeTournamentService['currentTournamentSubject'].next(updatedTournament);
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
      this.tournament?.status === TournamentStatus.InProgress && this.isCurrentRoundCompleted()
    );
  }

  isCurrentRoundFinal(): boolean {
    const currentRound = this.getCurrentRound();
    if (!currentRound) return false;

    // Use the actual roundType from the backend
    return currentRound.roundType === 'Final';
  }

  getFinalRoundTitle(): string {
    const currentRound = this.getCurrentRound();
    if (!currentRound || !this.tournament) {
      return `Round ${this.tournament?.currentRound}`;
    }

    // Use the actual roundType from the backend
    if (currentRound.roundType === 'Final') {
      return 'Final Round - Top 3 Championship';
    }
    if (currentRound.roundType === 'Tiebreaker') {
      return `Tiebreaker - Round ${this.tournament.currentRound}`;
    }

    return `Round ${this.tournament.currentRound}`;
  }

  isCurrentRoundTiebreaker(): boolean {
    if (!this.tournament || this.tournament.type !== TournamentType.Swiss) {
      return false;
    }

    // Check if all players have reached target matches (indicating we're in tiebreaker phase)
    const targetMatches = this.calculateTargetMatches(this.tournament.players.length);
    const allPlayersReachedTarget = this.tournament.players.every(
      (p) => p.wins + p.losses >= targetMatches
    );

    return allPlayersReachedTarget && !this.isCurrentRoundFinal();
  }

  getNextRoundButtonText(): string {
    if (!this.tournament) return 'Start Next Round';

    // If current round is final, show tournament winner selection
    if (this.isCurrentRoundFinal()) {
      return 'Select Tournament Winner';
    }

    // Check if next round would be the final round
    const targetMatches = this.calculateTargetMatches(this.tournament.players.length);
    const allPlayersReachedTarget = this.tournament.players.every(
      (p) => p.wins + p.losses >= targetMatches
    );

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

  getWinnerName(winnerId: number): string {
    if (!this.tournament) return 'Unknown';

    const winner = this.tournament.players.find((p) => p.id === winnerId);
    return winner ? winner.name : 'Unknown';
  }

  getPlayersSortedByPoints() {
    if (!this.tournament) return [];
    return [...this.tournament.players].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.losses - b.losses;
    });
  }

  // Password management methods
  private requiresPassword(): boolean {
    return this.tournament
      ? !this.realTimeTournamentService.hasTournamentPassword(this.tournament.id)
      : false;
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
    this.realTimeTournamentService.setTournamentPassword(this.tournament.id, password);

    // Execute the pending action (for management mode, this will handle hiding the modal)
    this.pendingAction();

    // Only hide modal immediately for non-management mode actions
    // Management mode will hide the modal after successful validation
    if (this.passwordModalTitle !== 'Enter Management Mode') {
      this.hidePasswordModal();
    }
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

  // Management mode methods
  enterManagementMode() {
    if (!this.tournament) return;
    this.showPasswordPrompt(
      'Enter Management Mode',
      'Enter the tournament password to access management features.',
      () => this.doEnterManagementMode()
    );
  }

  private async doEnterManagementMode() {
    if (!this.tournament) return;

    // Don't hide the modal yet - we need to validate first
    // The password was already stored by onPasswordSubmitted
    const password = this.realTimeTournamentService.getTournamentPassword(this.tournament.id);
    if (!password) {
      this.passwordModalError = 'Password is required.';
      this.passwordModalLoading = false;
      return;
    }

    try {
      // Validate password with dedicated API endpoint
      const result = await this.tournamentService
        .validatePassword(this.tournament.id, password)
        .toPromise();

      if (result?.isValid) {
        this.isInManagementMode = true;
        this.hidePasswordModal();
      } else {
        // Clear stored password and show error, keep modal open
        this.realTimeTournamentService.clearTournamentPassword(this.tournament.id);
        this.passwordModalError = 'Invalid password. Access denied.';
        this.passwordModalLoading = false;
        this.isInManagementMode = false;
      }
    } catch (error: any) {
      // Clear stored password on any error
      if (this.tournament) {
        this.realTimeTournamentService.clearTournamentPassword(this.tournament.id);
      }

      this.passwordModalLoading = false;

      if (error.status === 401) {
        this.passwordModalError = 'Invalid password. Access denied.';
      } else {
        this.passwordModalError = 'Failed to validate password. Please try again.';
      }
      this.isInManagementMode = false;
    }
  }

  exitManagementMode() {
    this.isInManagementMode = false;
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
        this.realTimeTournamentService.clearTournamentPassword(this.tournament.id);
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

    if (
      confirm(
        `Are you sure you want to delete the tournament "${this.tournament.name}"? This action cannot be undone.`
      )
    ) {
      this.executeWithPasswordCheck(() => this.doDeleteTournament(), 'delete tournament');
    }
  }

  private doDeleteTournament() {
    if (!this.tournament) return;

    this.isDeletingTournament = true;
    this.error = '';

    const deleteData = {
      password: this.realTimeTournamentService.getTournamentPassword(this.tournament.id) || '',
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
      password: this.realTimeTournamentService.getTournamentPassword(this.tournament.id) || '',
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

  removePlayer(playerId: number, playerName: string) {
    if (!this.tournament) return;

    if (confirm(`Are you sure you want to remove ${playerName} from the tournament?`)) {
      this.executeWithPasswordCheck(() => this.doRemovePlayer(playerId), 'remove player');
    }
  }

  private async doRemovePlayer(playerId: number) {
    if (!this.tournament) return;

    try {
      await this.realTimeTournamentService.removePlayer(this.tournament.id, playerId);
    } catch (error: any) {
      if (error.status === 401) {
        this.handleAuthError(error, 'remove player');
      } else {
        this.error = error.error?.message || 'Failed to remove player';
      }
    }
  }
}
