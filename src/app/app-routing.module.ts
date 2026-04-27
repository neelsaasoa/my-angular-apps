import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MultiStepFormComponent } from './features/multi-step-form/multi-step-form.component';
import { RapidxchangeComponent } from './features/rapidxchange/rapidxchange.component';

export const routes: Routes = [
  { path: '', redirectTo: '/rapidxchange', pathMatch: 'full' },
  { path: 'rapidxchange', component: RapidxchangeComponent },
  { path: 'rapidxchange/form', component: RapidxchangeComponent },
  { path: 'rapidxchange/card', component: RapidxchangeComponent },
  { path: 'form', component: MultiStepFormComponent },
  { path: '**', redirectTo: '/rapidxchange' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
