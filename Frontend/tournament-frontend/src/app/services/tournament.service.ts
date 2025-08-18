import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AddPlayer,
  CreateTournament,
  DeleteTournament,
  Match,
  Round,
  SetWinner,
  StartTournament,
  Tournament,
  UpdateTournament,
} from '../models/tournament.model';
import { PasswordService } from './password.service';

@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private passwordService: PasswordService) {}

  getAllTournaments(): Observable<Tournament[]> {
    return this.http.get<Tournament[]>(`${this.apiUrl}/tournaments`);
  }

  getTournament(id: number): Observable<Tournament> {
    return this.http.get<Tournament>(`${this.apiUrl}/tournaments/${id}`);
  }

  getTournamentWithCurrentRound(id: number): Observable<Tournament> {
    return this.http.get<Tournament>(`${this.apiUrl}/tournaments/${id}/current-round`);
  }

  createTournament(tournament: CreateTournament): Observable<Tournament> {
    return this.http.post<Tournament>(`${this.apiUrl}/tournaments`, tournament);
  }

  addPlayer(tournamentId: number, player: AddPlayer): Observable<Tournament> {
    const playerWithPassword = {
      ...player,
      password: player.password || this.passwordService.getPassword(tournamentId),
    };
    return this.http.post<Tournament>(
      `${this.apiUrl}/tournaments/${tournamentId}/players`,
      playerWithPassword
    );
  }

  startTournament(tournamentId: number, startTournament?: StartTournament): Observable<Tournament> {
    const requestBody: StartTournament = {
      password: startTournament?.password || this.passwordService.getPassword(tournamentId),
    };
    return this.http.post<Tournament>(
      `${this.apiUrl}/tournaments/${tournamentId}/start`,
      requestBody
    );
  }

  startNextRound(tournamentId: number): Observable<Round> {
    return this.http.post<Round>(`${this.apiUrl}/tournaments/${tournamentId}/next-round`, {});
  }

  setMatchWinner(matchId: number, setWinner: SetWinner, tournamentId?: number): Observable<Match> {
    const setWinnerWithPassword = {
      ...setWinner,
      password:
        setWinner.password ||
        (tournamentId ? this.passwordService.getPassword(tournamentId) : undefined),
    };
    return this.http.put<Match>(`${this.apiUrl}/matches/${matchId}/winner`, setWinnerWithPassword);
  }

  updateTournament(tournamentId: number, updateData: UpdateTournament): Observable<Tournament> {
    return this.http.put<Tournament>(`${this.apiUrl}/tournaments/${tournamentId}`, updateData);
  }

  deleteTournament(tournamentId: number, deleteData: DeleteTournament): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tournaments/${tournamentId}`, {
      body: deleteData,
    });
  }

  // Password management helper methods
  setTournamentPassword(tournamentId: number, password: string): void {
    this.passwordService.setPassword(tournamentId, password);
  }

  getTournamentPassword(tournamentId: number): string | undefined {
    return this.passwordService.getPassword(tournamentId);
  }

  hasTournamentPassword(tournamentId: number): boolean {
    return this.passwordService.hasPassword(tournamentId);
  }

  clearTournamentPassword(tournamentId: number): void {
    this.passwordService.clearPassword(tournamentId);
  }

  private addPasswordToSetWinner(setWinner: SetWinner, tournamentId?: number): SetWinner {
    return {
      ...setWinner,
      password:
        setWinner.password ||
        (tournamentId ? this.passwordService.getPassword(tournamentId) : undefined),
    };
  }
}
