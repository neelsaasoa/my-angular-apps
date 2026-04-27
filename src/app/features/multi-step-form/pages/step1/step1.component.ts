import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { FormService } from '../../../../core/services/form.service';

@Component({
  selector: 'app-step1',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.css'],
})
export class Step1Component implements OnInit {
  @Output() nextStep = new EventEmitter<void>();
  storeDetailsForm!: FormGroup;
  
  private fb = inject(FormBuilder);
  private formService = inject(FormService);

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.storeDetailsForm = this.fb.group({
      // Store Information
      storeName: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', Validators.required],
      zip: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],

      // Contact Information
      contactName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],

      // Chain Information
      chainName: ['', [Validators.required, Validators.minLength(2)]],

      // Store Hours
      storeHoursDocument: ['', Validators.required],
    });
  }

  get storeName() {
    return this.storeDetailsForm.get('storeName');
  }

  get address() {
    return this.storeDetailsForm.get('address');
  }

  get city() {
    return this.storeDetailsForm.get('city');
  }

  get state() {
    return this.storeDetailsForm.get('state');
  }

  get zip() {
    return this.storeDetailsForm.get('zip');
  }

  get contactName() {
    return this.storeDetailsForm.get('contactName');
  }

  get phone() {
    return this.storeDetailsForm.get('phone');
  }

  get email() {
    return this.storeDetailsForm.get('email');
  }

  get chainName() {
    return this.storeDetailsForm.get('chainName');
  }

  get storeHoursDocument() {
    return this.storeDetailsForm.get('storeHoursDocument');
  }

  onlyNumbers(event: KeyboardEvent): void {
    const char = String.fromCharCode(event.which);
    if (!/[0-9]/.test(char)) {
      event.preventDefault();
    }
  }

  onSubmit(): void {
    console.log('=== STEP 1 SUBMIT STARTED ===');
    console.log('Form Value:', this.storeDetailsForm.value);
    console.log('Form Valid:', this.storeDetailsForm.valid);

    // Store data for later submission
    this.formService.setStepData(1, this.storeDetailsForm.value);
    console.log('✅ Step 1 data stored, proceeding to next step');

    this.nextStep.emit();
  }
}
