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

    // Subscribe to connectionType changes to manage the 'ethernetCableHole' field validators
    this.itReadinessForm.get('connectionType')?.valueChanges.subscribe(value => {
      const ethernetCableHoleControl = this.itReadinessForm.get('ethernetCableHole');
      const wifiVisibleControl = this.itReadinessForm.get('wifiVisible');
      const wifiNameControl = this.itReadinessForm.get('wifiName');

      // Handle ethernet/both options
      if (value === 'Through a cable connected to the internet box (ethernet)' || value === 'Both') {
        ethernetCableHoleControl?.setValidators([Validators.required]);
      } else {
        ethernetCableHoleControl?.clearValidators();
      }
      ethernetCableHoleControl?.updateValueAndValidity();

      // Handle WiFi/both options
      if (value === 'Through WiFi (wireless)' || value === 'Both') {
        wifiVisibleControl?.setValidators([Validators.required]);
        wifiNameControl?.setValidators([Validators.required]);
      } else {
        wifiVisibleControl?.clearValidators();
        wifiNameControl?.clearValidators();
      }
      wifiVisibleControl?.updateValueAndValidity();
      wifiNameControl?.updateValueAndValidity();
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
      connectionType: ['', Validators.required],
      ethernetCableHole: [''],

      // WiFi Options
      wifiVisible: [''],
      wifiName: [''],
      wifiPassword: [''],
      passwordAttemptResult: [''],
      foundPassword: ['']
    });
  }

  // Getters for form controls
  get itName() { return this.itReadinessForm.get('itName'); }
  get itPhone() { return this.itReadinessForm.get('itPhone'); }
  get itEmail() { return this.itReadinessForm.get('itEmail'); }
  get wifiVisible() { return this.itReadinessForm.get('wifiVisible'); }
  get wifiName() { return this.itReadinessForm.get('wifiName'); }
  get wifiPassword() { return this.itReadinessForm.get('wifiPassword'); }
  get passwordAttemptResult() { return this.itReadinessForm.get('passwordAttemptResult'); }
  get foundPassword() { return this.itReadinessForm.get('foundPassword'); }
  get modemLocation() { return this.itReadinessForm.get('modemLocation'); }
  get otherLocation() { return this.itReadinessForm.get('otherLocation'); }
  get ethernetCableHole() { return this.itReadinessForm.get('ethernetCableHole'); }
  get connectionType() { return this.itReadinessForm.get('connectionType'); }

  goBack(): void {
    this.prevStep.emit();
  }

  onDontKnowWifi(event: any): void {
    const isChecked = event.target.checked;
    const wifiNameControl = this.itReadinessForm.get('wifiName');

    if (isChecked) {
      wifiNameControl?.clearValidators();
      wifiNameControl?.setValue("I don't know");
    } else {
      wifiNameControl?.setValidators([Validators.required]);
      wifiNameControl?.setValue('');
    }
    wifiNameControl?.updateValueAndValidity();
  }

  onDontKnowPassword(event: any): void {
    const isChecked = event.target.checked;
    const wifiPasswordControl = this.itReadinessForm.get('wifiPassword');
    const wifiPasswordAttemptControl = this.itReadinessForm.get('wifiPasswordAttempt');
    const passwordAttemptResultControl = this.itReadinessForm.get('passwordAttemptResult');

    if (isChecked) {
      wifiPasswordControl?.setValue("I don't know");
      passwordAttemptResultControl?.setValidators([Validators.required]);
    } else {
      wifiPasswordControl?.setValue('');
      passwordAttemptResultControl?.clearValidators();
      passwordAttemptResultControl?.setValue('');
    }
    wifiPasswordControl?.updateValueAndValidity();
    passwordAttemptResultControl?.updateValueAndValidity();
  }

  isPasswordDontKnown(): boolean {
    return this.wifiPassword?.value === "I don't know";
  }

  onPasswordAttemptResultChange(value: string): void {
    const foundPasswordControl = this.itReadinessForm.get('foundPassword');

    if (value === 'I found the password') {
      foundPasswordControl?.setValidators([Validators.required]);
      foundPasswordControl?.setValue('');
    } else if (value === 'I was unable to get the password') {
      foundPasswordControl?.clearValidators();
      foundPasswordControl?.setValue('I was unable to get the password');
    } else {
      foundPasswordControl?.clearValidators();
      foundPasswordControl?.setValue('');
    }
    foundPasswordControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    console.log('Step 2 Form Value:', this.itReadinessForm.value);
    this.nextStep.emit();
  }
}
