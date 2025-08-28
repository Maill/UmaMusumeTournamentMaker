import { Routes } from '@angular/router';
import { CreateTournamentPageComponent } from './pages/create-tournament/create-tournament.page';
import { Testingpage } from './pages/test/testingpage/testingpage';
import { TournamentDetailPageComponent } from './pages/tournament-detail/tournament-detail.page';
import { TournamentListPageComponent } from './pages/tournament-list/tournament-list.page';

export const routes: Routes = [
  { path: '', redirectTo: '/tournaments', pathMatch: 'full' },
  { path: 'tournaments', component: TournamentListPageComponent },
  { path: 'tournaments/create', component: CreateTournamentPageComponent },
  { path: 'tournaments/:id', component: TournamentDetailPageComponent },
  { path: 'testing/testing', component: Testingpage },
];
