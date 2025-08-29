import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectivePreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Only preload specific routes that are commonly accessed
    if (route.path === 'tournaments') {
      // Always preload the main tournaments page
      return load();
    }
    
    // Don't preload detail pages and create forms initially
    // These will be loaded on-demand
    return of(null);
  }
}