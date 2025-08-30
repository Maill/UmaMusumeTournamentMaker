import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/tournaments', pathMatch: 'full' },
  { 
    path: 'tournaments', 
    loadComponent: () => import('./pages/tournament-list/tournament-list.page').then(m => m.TournamentListPageComponent)
  },
  { 
    path: 'tournaments/create', 
    loadComponent: () => import('./pages/create-tournament/create-tournament.page').then(m => m.CreateTournamentPageComponent)
  },
  { 
    path: 'tournaments/:id', 
    loadComponent: () => import('./pages/tournament-detail/tournament-detail.page').then(m => m.TournamentDetailPageComponent)
  },
];
