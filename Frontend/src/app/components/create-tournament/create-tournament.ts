import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TournamentService } from '../../services/tournament.service';
import { TournamentType, CreateTournament } from '../../models/tournament.model';

@Component({
  selector: 'app-create-tournament',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './create-tournament.html',
  styleUrl: './create-tournament.css'
})
export class CreateTournamentComponent {
  tournament: CreateTournament = {
    name: '',
    type: TournamentType.Swiss,
    password: ''
  };

  TournamentType = TournamentType;
  isLoading = false;
  error = '';

  constructor(
    private tournamentService: TournamentService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.tournament.name.trim()) {
      this.error = 'Tournament name is required';
      return;
    }

    this.isLoading = true;
    this.error = '';

    // Clean up password if empty
    const tournamentData = {
      ...this.tournament,
      password: this.tournament.password?.trim() || undefined
    };

    this.tournamentService.createTournament(tournamentData).subscribe({
      next: (createdTournament) => {
        this.isLoading = false;
        
        // Store password if provided
        if (tournamentData.password) {
          this.tournamentService.setTournamentPassword(createdTournament.id, tournamentData.password);
        }
        
        this.router.navigate(['/tournament', createdTournament.id]);
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.message || 'Failed to create tournament';
      }
    });
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
}
