import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MultiStepFormComponent } from './features/multi-step-form/multi-step-form.component';
import { Step1Component } from './features/multi-step-form/pages/step1/step1.component';
import { Step2Component } from './features/multi-step-form/pages/step2/step2.component';
import { Step3Component } from './features/multi-step-form/pages/step3/step3.component';

@NgModule({
  declarations: [
    AppComponent,
    MultiStepFormComponent,
    Step1Component,
    Step2Component,
    Step3Component
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
