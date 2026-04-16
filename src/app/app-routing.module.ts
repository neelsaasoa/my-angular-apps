import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MultiStepFormComponent } from './features/multi-step-form/multi-step-form.component';
import { RapidxchangeComponent } from './features/rapidxchange/rapidxchange.component';
import { InStoreComponent } from './features/in-store/in-store.component';

const routes: Routes = [
  { path: '', redirectTo: '/in-store', pathMatch: 'full' },
  { path: 'in-store', component: InStoreComponent },
  { path: 'rapidxchange', component: RapidxchangeComponent },
  { path: 'form', component: MultiStepFormComponent },
  { path: '**', redirectTo: '/in-store' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
