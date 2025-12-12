import { Routes } from '@angular/router';
import { TicketListComponent } from './pages/ticket-list/ticket-list';
import { TicketFormComponent } from './pages/ticket-form/ticket-form';
import { CriteriaListComponent } from './pages/criteria-list/criteria-list';
import { CriteriaFormComponent } from './pages/criteria-form/criteria-form';
import { EvaluationResultComponent } from './pages/evaluation-result/evaluation-result';
import { RankingComponent } from './pages/ranking/ranking';

export const routes: Routes = [
  { path: '', redirectTo: 'tickets', pathMatch: 'full' },

  { path: 'tickets', component: TicketListComponent },
  { path: 'tickets/new', component: TicketFormComponent },

  { path: 'criteria', component: CriteriaListComponent },
  { path: 'criteria/new', component: CriteriaFormComponent },

  { path: 'evaluation', component: RankingComponent },
  { path: 'result', component: EvaluationResultComponent },
  { path: 'ranking', component: RankingComponent },
];
