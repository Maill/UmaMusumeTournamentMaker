import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {
  private passwords: Map<number, string> = new Map();
  private sessionStorage = typeof window !== 'undefined' ? window.sessionStorage : null;

  constructor() {
    this.loadPasswordsFromSession();
  }

  setPassword(tournamentId: number, password: string): void {
    this.passwords.set(tournamentId, password);
    this.savePasswordsToSession();
  }

  getPassword(tournamentId: number): string | undefined {
    return this.passwords.get(tournamentId);
  }

  hasPassword(tournamentId: number): boolean {
    return this.passwords.has(tournamentId);
  }

  clearPassword(tournamentId: number): void {
    this.passwords.delete(tournamentId);
    this.savePasswordsToSession();
  }

  clearAllPasswords(): void {
    this.passwords.clear();
    this.savePasswordsToSession();
  }

  private savePasswordsToSession(): void {
    if (this.sessionStorage) {
      const passwordsObj = Object.fromEntries(this.passwords);
      this.sessionStorage.setItem('tournamentPasswords', JSON.stringify(passwordsObj));
    }
  }

  private loadPasswordsFromSession(): void {
    if (this.sessionStorage) {
      const stored = this.sessionStorage.getItem('tournamentPasswords');
      if (stored) {
        try {
          const passwordsObj = JSON.parse(stored);
          this.passwords = new Map(Object.entries(passwordsObj).map(([key, value]) => [+key, value as string]));
        } catch (error) {
          console.warn('Failed to load tournament passwords from session storage:', error);
          this.passwords = new Map();
        }
      }
    }
  }
}