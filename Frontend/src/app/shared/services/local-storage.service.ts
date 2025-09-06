import { Injectable } from '@angular/core';
import { LocalStorageError } from '../types/service.types';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private readonly PASSWORD_KEY_PREFIX = 'tournament_password_';

  setPassword(tournamentId: number, password: string): void {
    localStorage.setItem(`${this.PASSWORD_KEY_PREFIX}${tournamentId}`, password);
  }

  getPassword(tournamentId: number): string {
    let password = localStorage.getItem(`${this.PASSWORD_KEY_PREFIX}${tournamentId}`);
    if (password === null)
      throw new LocalStorageError(
        `Password not found in Local Storage. Local Storage may have been reset. Please re-enter the password.`
      );

    return password!;
  }

  hasPassword(tournamentId: number): boolean {
    return localStorage.getItem(`${this.PASSWORD_KEY_PREFIX}${tournamentId}`) !== null;
  }

  clearPassword(tournamentId: number): void {
    localStorage.removeItem(`${this.PASSWORD_KEY_PREFIX}${tournamentId}`);
  }

  clearAllPasswords(): void {
    for (let index = 0; index < localStorage.length; index++) {
      let localStorageKey: string | null = localStorage.key(index);

      if (localStorageKey && localStorageKey.startsWith(this.PASSWORD_KEY_PREFIX))
        localStorage.removeItem(localStorageKey);
    }
  }

  setSetting<T>(key: string, value: T): void {
    throw new Error('Method not implemented.');
  }

  getSetting<T>(key: string, defaultValue?: T): T | null {
    throw new Error('Method not implemented.');
  }

  removeSetting(key: string): void {
    throw new Error('Method not implemented.');
  }
}
