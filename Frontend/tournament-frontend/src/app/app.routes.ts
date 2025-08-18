import { Routes } from '@angular/router';
import { TournamentListComponent } from './components/tournament-list/tournament-list';
import { CreateTournamentComponent } from './components/create-tournament/create-tournament';
import { TournamentDetailComponent } from './components/tournament-detail/tournament-detail';

export const routes: Routes = [
  { path: '', redirectTo: '/tournaments', pathMatch: 'full' },
  { path: 'tournaments', component: TournamentListComponent },
  { path: 'create-tournament', component: CreateTournamentComponent },
  { path: 'tournament/:id', component: TournamentDetailComponent }
];
