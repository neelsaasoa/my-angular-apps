import { Component } from '@angular/core';

@Component({
  selector: 'app-multi-step-form',
  standalone: false,
  templateUrl: './multi-step-form.component.html',
  styleUrls: ['./multi-step-form.component.css']
})
export class MultiStepFormComponent {
  currentStep = 1;

  goToStep(step: number): void {
    this.currentStep = step;
  }
}
