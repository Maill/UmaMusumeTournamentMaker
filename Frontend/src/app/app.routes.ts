import { Routes } from '@angular/router';
import { TournamentListPageComponent } from './pages/tournament-list/tournament-list.page';
import { CreateTournamentPageComponent } from './pages/create-tournament/create-tournament.page';
import { TournamentDetailPageComponent } from './pages/tournament-detail/tournament-detail.page';

export const routes: Routes = [
  { path: '', redirectTo: '/tournaments', pathMatch: 'full' },
  { path: 'tournaments', component: TournamentListPageComponent },
  { path: 'tournaments/create', component: CreateTournamentPageComponent },
  { path: 'tournaments/:id', component: TournamentDetailPageComponent }
];
