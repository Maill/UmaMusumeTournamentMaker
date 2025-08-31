import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface IdleState {
  isIdle: boolean;
  reason: 'tab-hidden' | 'user-inactive' | null;
}

@Injectable({
  providedIn: 'root'
})
export class IdleManagerService {
  private tabHiddenTimer: number | null = null;
  private userInactiveTimer: number | null = null;
  private idleStateSubject = new BehaviorSubject<IdleState>({ isIdle: false, reason: null });
  
  // Timeouts
  private readonly TAB_HIDDEN_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  private readonly USER_INACTIVE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  
  // Public observables
  idleState$ = this.idleStateSubject.asObservable();
  
  constructor() {
    this.setupIdleDetection();
  }

  // Public methods to control idle detection
  startIdleDetection(): void {
    this.resetUserInactiveTimer();
  }

  stopIdleDetection(): void {
    this.clearAllTimers();
    this.idleStateSubject.next({ isIdle: false, reason: null });
  }

  resetIdleState(): void {
    if (this.idleStateSubject.value.isIdle) {
      this.idleStateSubject.next({ isIdle: false, reason: null });
    }
    this.resetUserInactiveTimer();
  }

  private setupIdleDetection(): void {
    // Page Visibility API - handle tab switching
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handleTabHidden();
      } else {
        this.handleTabVisible();
      }
    });

    // User activity detection
    const activityEvents = ['click', 'keydown', 'scroll', 'mousemove', 'touchstart'];
    activityEvents.forEach((event) => {
      document.addEventListener(event, () => this.handleUserActivity(), { passive: true });
    });

    // Start user inactivity timer
    this.resetUserInactiveTimer();
  }

  private handleTabHidden(): void {
    console.log('Tab hidden - starting disconnect timer');
    this.clearTabHiddenTimer();
    
    this.tabHiddenTimer = setTimeout(() => {
      console.log('Idle due to tab being hidden for 5 minutes');
      this.idleStateSubject.next({ isIdle: true, reason: 'tab-hidden' });
    }, this.TAB_HIDDEN_TIMEOUT);
  }

  private handleTabVisible(): void {
    console.log('Tab visible - clearing disconnect timer');
    this.clearTabHiddenTimer();
    
    // Reset idle state if we were idle
    if (this.idleStateSubject.value.isIdle) {
      console.log('Tab became visible - resetting idle state');
      this.idleStateSubject.next({ isIdle: false, reason: null });
    }
    
    this.resetUserInactiveTimer();
  }

  private handleUserActivity(): void {
    // Only reset timer if tab is visible
    if (!document.hidden) {
      this.resetUserInactiveTimer();
    }
  }

  private resetUserInactiveTimer(): void {
    this.clearUserInactiveTimer();
    
    this.userInactiveTimer = setTimeout(() => {
      if (!document.hidden) {
        console.log('Idle due to user inactivity for 15 minutes');
        this.idleStateSubject.next({ isIdle: true, reason: 'user-inactive' });
      }
    }, this.USER_INACTIVE_TIMEOUT);
  }

  private clearTabHiddenTimer(): void {
    if (this.tabHiddenTimer) {
      clearTimeout(this.tabHiddenTimer);
      this.tabHiddenTimer = null;
    }
  }

  private clearUserInactiveTimer(): void {
    if (this.userInactiveTimer) {
      clearTimeout(this.userInactiveTimer);
      this.userInactiveTimer = null;
    }
  }

  private clearAllTimers(): void {
    this.clearTabHiddenTimer();
    this.clearUserInactiveTimer();
  }
}