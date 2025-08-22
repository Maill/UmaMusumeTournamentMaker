import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AddPlayer,
  CreateTournament,
  DeleteTournament,
  Match,
  MatchResult,
  Round,
  StartNextRound,
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

  removePlayer(tournamentId: number, playerId: number): Observable<void> {
    const requestBody = {
      tournamentId: tournamentId,
      playerId: playerId,
      password: this.passwordService.getPassword(tournamentId)
    };
    return this.http.delete<void>(
      `${this.apiUrl}/tournaments/players`,
      { body: requestBody }
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

  startNextRound(tournamentId: number, matchResults: MatchResult[]): Observable<Tournament> {
    const requestBody: StartNextRound = {
      password: this.passwordService.getPassword(tournamentId),
      matchResults: matchResults
    };
    return this.http.post<Tournament>(`${this.apiUrl}/tournaments/${tournamentId}/next-round`, requestBody);
  }

  // Note: setMatchWinner method removed - winners are now submitted in batch with Next Round

  updateTournament(tournamentId: number, updateData: UpdateTournament): Observable<Tournament> {
    return this.http.put<Tournament>(`${this.apiUrl}/tournaments/${tournamentId}`, updateData);
  }

  deleteTournament(tournamentId: number, deleteData: DeleteTournament): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tournaments/${tournamentId}`, {
      body: deleteData,
    });
  }

  broadcastWinnerSelection(tournamentId: number, matchId: number, winnerId: number): Observable<any> {
    const broadcastData = {
      tournamentId: tournamentId,
      matchId: matchId,
      winnerId: winnerId
    };
    return this.http.post<any>(`${this.apiUrl}/matches/broadcast-winner`, broadcastData);
  }

  validatePassword(tournamentId: number, password: string): Observable<{message: string, isValid: boolean}> {
    const validateData = { password: password };
    return this.http.post<{message: string, isValid: boolean}>(`${this.apiUrl}/tournaments/${tournamentId}/validate-password`, validateData);
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

}
