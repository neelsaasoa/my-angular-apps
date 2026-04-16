import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rapidxchange-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rapidxchange-form.component.html',
  styleUrls: ['./rapidxchange-form.component.css']
})
export class RapidxchangeFormComponent implements OnInit {
  rapidxchangeForm!: FormGroup;
  billingCheckboxValue: boolean = true;
  payableCheckboxValue: boolean = true;
  termsExpanded: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.rapidxchangeForm = this.fb.group({
      // Store Information
      saasId: ['', [Validators.required]],
      companyName: ['', [Validators.required]],
      taxId: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],

      // Billing Information
      billingEmail: ['', [Validators.required, Validators.email]],
      billingContactName: ['', [Validators.required]],
      billingContactPhone: ['', [Validators.required]],
      billingAddress: ['', [Validators.required]],
      billingCity: ['', [Validators.required]],
      billingState: ['', [Validators.required]],
      billingZip: ['', [Validators.required]],

      // Payable Contact Information
      payableEmail: ['', [Validators.required, Validators.email]],
      payableContactName: ['', [Validators.required]],
      payableContactPhone: ['', [Validators.required]],
      payableAddress: ['', [Validators.required]],
      payableCity: ['', [Validators.required]],
      payableState: ['', [Validators.required]],
      payableZip: ['', [Validators.required]],

      // Terms & Conditions
      agreeTerms: [false, [Validators.requiredTrue]],

      // Payment Info
      serviceType: ['', [Validators.required]],
      exchangePrice: ['', [Validators.required]],
      purchasePrice: ['', [Validators.required]],
      billingCheckbox: [true],
      payableCheckbox: [true]
    });

    // Subscribe to checkbox changes
    this.rapidxchangeForm.get('billingCheckbox')?.valueChanges.subscribe(value => {
      this.billingCheckboxValue = value;
    });

    this.rapidxchangeForm.get('payableCheckbox')?.valueChanges.subscribe(value => {
      this.payableCheckboxValue = value;
    });
  }

  onSubmit(): void {
    if (this.rapidxchangeForm.valid) {
      console.log('Form Data:', this.rapidxchangeForm.value);
      // Handle form submission
    }
  }

  toggleTerms(): void {
    this.termsExpanded = !this.termsExpanded;
  }
}
