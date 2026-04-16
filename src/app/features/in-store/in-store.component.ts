import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiStepFormComponent } from '../multi-step-form/multi-step-form.component';

@Component({
  selector: 'app-in-store',
  standalone: true,
  imports: [CommonModule, MultiStepFormComponent],
  templateUrl: './in-store.component.html',
  styleUrls: ['./in-store.component.css']
})
export class InStoreComponent {
  constructor() { }

  ngOnInit(): void {
  }
}
