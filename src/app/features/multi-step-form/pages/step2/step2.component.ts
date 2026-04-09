import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-step2',
  standalone: false,
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.css']
})
export class Step2Component implements OnInit {
  @Output() prevStep = new EventEmitter<void>();
  @Output() nextStep = new EventEmitter<void>();

  itReadinessForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    
    // Subscribe to modemLocation changes to manage the 'otherLocation' field validators
    this.itReadinessForm.get('modemLocation')?.valueChanges.subscribe(value => {
      const otherLocationControl = this.itReadinessForm.get('otherLocation');
      if (value === 'other') {
        otherLocationControl?.setValidators([Validators.required]);
      } else {
        otherLocationControl?.clearValidators();
      }
      otherLocationControl?.updateValueAndValidity();
    });
  }

  initializeForm(): void {
    this.itReadinessForm = this.fb.group({
      // IT Person Info
      itName: ['', Validators.required],
      itPhone: ['', [Validators.required, Validators.pattern(/^[\d\-\+\(\)\s]+$/)]],
      itEmail: ['', [Validators.required, Validators.email]],

      // Modem Location
      modemLocation: ['', Validators.required],
      otherLocation: [''],

      // Connection Type
      connectionType: ['', Validators.required]
    });
  }

  // Getters for form controls
  get itName() { return this.itReadinessForm.get('itName'); }
  get itPhone() { return this.itReadinessForm.get('itPhone'); }
  get itEmail() { return this.itReadinessForm.get('itEmail'); }
  get modemLocation() { return this.itReadinessForm.get('modemLocation'); }
  get otherLocation() { return this.itReadinessForm.get('otherLocation'); }
  get connectionType() { return this.itReadinessForm.get('connectionType'); }

  goBack(): void {
    this.prevStep.emit();
  }

  onSubmit(): void {
    console.log('Step 2 Form Value:', this.itReadinessForm.value);
    this.nextStep.emit();
  }
}
