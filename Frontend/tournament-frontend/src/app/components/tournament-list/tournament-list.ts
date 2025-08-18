import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TournamentService } from '../../services/tournament.service';
import { Tournament, TournamentStatus, TournamentType } from '../../models/tournament.model';

@Component({
  selector: 'app-tournament-list',
  imports: [CommonModule],
  templateUrl: './tournament-list.html',
  styleUrl: './tournament-list.css'
})
export class TournamentListComponent implements OnInit {
  tournaments: Tournament[] = [];
  isLoading = false;
  error = '';

  TournamentStatus = TournamentStatus;
  TournamentType = TournamentType;

  constructor(
    private tournamentService: TournamentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTournaments();
  }

  loadTournaments() {
    this.isLoading = true;
    this.error = '';

    this.tournamentService.getAllTournaments().subscribe({
      next: (tournaments) => {
        this.tournaments = tournaments;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load tournaments';
        this.isLoading = false;
      }
    });
  }

  getStatusText(status: TournamentStatus): string {
    switch (status) {
      case TournamentStatus.Created:
        return 'Created';
      case TournamentStatus.InProgress:
        return 'Ongoing';
      case TournamentStatus.Completed:
        return 'Finished';
      default:
        return 'Unknown';
    }
  }

  getStatusClass(status: TournamentStatus): string {
    switch (status) {
      case TournamentStatus.Created:
        return 'status-created';
      case TournamentStatus.InProgress:
        return 'status-ongoing';
      case TournamentStatus.Completed:
        return 'status-finished';
      default:
        return '';
    }
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

  onTournamentClick(tournament: Tournament) {
    this.router.navigate(['/tournament', tournament.id]);
  }

  onCreateTournament() {
    this.router.navigate(['/create-tournament']);
  }
}
