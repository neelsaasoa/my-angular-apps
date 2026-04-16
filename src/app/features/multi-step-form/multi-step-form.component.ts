import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Step1Component } from './pages/step1/step1.component';
import { Step2Component } from './pages/step2/step2.component';
import { Step3Component } from './pages/step3/step3.component';

@Component({
  selector: 'app-multi-step-form',
  standalone: true,
  imports: [CommonModule, Step1Component, Step2Component, Step3Component],
  templateUrl: './multi-step-form.component.html',
  styleUrls: ['./multi-step-form.component.css']
})
export class MultiStepFormComponent {
  currentStep = 1;

  goToStep(step: number): void {
    this.currentStep = step;
  }
}
