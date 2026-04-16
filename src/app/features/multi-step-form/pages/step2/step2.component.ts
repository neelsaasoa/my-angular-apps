import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormService } from '../../../../core/services/form.service';

@Component({
  selector: 'app-step2',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.css']
})
export class Step2Component implements OnInit {
  @Output() prevStep = new EventEmitter<void>();
  @Output() nextStep = new EventEmitter<void>();

  itReadinessForm!: FormGroup;

  constructor(private fb: FormBuilder, private formService: FormService) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupValueChangeListeners();
  }

  initializeForm(): void {
    this.itReadinessForm = this.fb.group({
      // IT Person Info
      itName: ['', Validators.required],
      itPhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      itEmail: ['', [Validators.required, Validators.email]],

      // Router Location
      routerLocation: ['', Validators.required],
      customRouterLocation: [''],

      // Connection Type
      connectionType: ['', Validators.required],

      // Cable Options
      cableHole: [''],
      runCable: [''],
      counterHole: [''],

      // WiFi Transition
      wifiTransition: [''],

      // WiFi Questions
      seeWifi: [''],
      wifiName: [''],
      customWifiName: [''],
      wifiPassword: [''],
      customWifiPassword: [''],

      // Help Find Password
      findConnectedDevice: [''],
      attemptFindPassword: [''],
      foundWifiPassword: [''],

      // Technical Person
      technicalPersonKnows: [''],
      wifiTechnicalPersonContactInfo: [''],

      // Internet Right Away
      internetRightAway: [''],
      itContactInfo: ['']
    });
  }

  setupValueChangeListeners(): void {
    // Router Location conditional validation
    this.itReadinessForm.get('routerLocation')?.valueChanges.subscribe(value => {
      const customControl = this.itReadinessForm.get('customRouterLocation');
      if (value === 'Other') {
        customControl?.setValidators([Validators.required]);
      } else {
        customControl?.clearValidators();
        customControl?.setValue('');
      }
      customControl?.updateValueAndValidity();
    });

    // Connection Type changes
    this.itReadinessForm.get('connectionType')?.valueChanges.subscribe(value => {
      const cableHoleControl = this.itReadinessForm.get('cableHole');
      
      if (value === 'cable' || value === 'both') {
        cableHoleControl?.setValidators([Validators.required]);
      } else {
        cableHoleControl?.clearValidators();
        cableHoleControl?.setValue('');
      }
      cableHoleControl?.updateValueAndValidity();
    });

    // Cable Hole changes
    this.itReadinessForm.get('cableHole')?.valueChanges.subscribe(value => {
      const runCableControl = this.itReadinessForm.get('runCable');
      
      if (value === 'Yes') {
        runCableControl?.setValidators([Validators.required]);
      } else {
        runCableControl?.clearValidators();
        runCableControl?.setValue('');
      }
      runCableControl?.updateValueAndValidity();
    });

    // Run Cable changes
    this.itReadinessForm.get('runCable')?.valueChanges.subscribe(value => {
      const counterHoleControl = this.itReadinessForm.get('counterHole');
      
      if (value === 'No') {
        counterHoleControl?.setValidators([Validators.required]);
      } else {
        counterHoleControl?.clearValidators();
        counterHoleControl?.setValue('');
      }
      counterHoleControl?.updateValueAndValidity();
    });

    // WiFi Name changes
    this.itReadinessForm.get('wifiName')?.valueChanges.subscribe(value => {
      const customControl = this.itReadinessForm.get('customWifiName');
      
      if (value === '*Member will type in their answer here') {
        customControl?.setValidators([Validators.required]);
      } else {
        customControl?.clearValidators();
        customControl?.setValue('');
      }
      customControl?.updateValueAndValidity();
    });

    // WiFi Password changes
    this.itReadinessForm.get('wifiPassword')?.valueChanges.subscribe(value => {
      const customControl = this.itReadinessForm.get('customWifiPassword');
      
      if (value === '*Member will type in their answer here') {
        customControl?.setValidators([Validators.required]);
      } else {
        customControl?.clearValidators();
        customControl?.setValue('');
      }
      customControl?.updateValueAndValidity();
    });

    // Attempt Find Password changes
    this.itReadinessForm.get('attemptFindPassword')?.valueChanges.subscribe(value => {
      const foundPasswordControl = this.itReadinessForm.get('foundWifiPassword');
      
      if (value === 'I found the password') {
        foundPasswordControl?.setValidators([Validators.required]);
      } else {
        foundPasswordControl?.clearValidators();
        foundPasswordControl?.setValue('');
      }
      foundPasswordControl?.updateValueAndValidity();
    });

    // Technical Person Knows changes
    this.itReadinessForm.get('technicalPersonKnows')?.valueChanges.subscribe(value => {
      const contactControl = this.itReadinessForm.get('wifiTechnicalPersonContactInfo');
      
      if (value !== '') {
        contactControl?.setValidators([Validators.required]);
      } else {
        contactControl?.clearValidators();
        contactControl?.setValue('');
      }
      contactControl?.updateValueAndValidity();
    });

    // Internet Right Away changes
    this.itReadinessForm.get('internetRightAway')?.valueChanges.subscribe(value => {
      const contactControl = this.itReadinessForm.get('itContactInfo');
      
      if (value === 'No') {
        contactControl?.setValidators([Validators.required]);
      } else {
        contactControl?.clearValidators();
        contactControl?.setValue('');
      }
      contactControl?.updateValueAndValidity();
    });
  }

  // Getters for form controls
  get itName() { return this.itReadinessForm.get('itName'); }
  get itPhone() { return this.itReadinessForm.get('itPhone'); }
  get itEmail() { return this.itReadinessForm.get('itEmail'); }
  get routerLocation() { return this.itReadinessForm.get('routerLocation'); }
  get customRouterLocation() { return this.itReadinessForm.get('customRouterLocation'); }
  get connectionType() { return this.itReadinessForm.get('connectionType'); }
  get cableHole() { return this.itReadinessForm.get('cableHole'); }
  get runCable() { return this.itReadinessForm.get('runCable'); }
  get counterHole() { return this.itReadinessForm.get('counterHole'); }
  get wifiTransition() { return this.itReadinessForm.get('wifiTransition'); }
  get seeWifi() { return this.itReadinessForm.get('seeWifi'); }
  get wifiName() { return this.itReadinessForm.get('wifiName'); }
  get customWifiName() { return this.itReadinessForm.get('customWifiName'); }
  get wifiPassword() { return this.itReadinessForm.get('wifiPassword'); }
  get customWifiPassword() { return this.itReadinessForm.get('customWifiPassword'); }
  get findConnectedDevice() { return this.itReadinessForm.get('findConnectedDevice'); }
  get attemptFindPassword() { return this.itReadinessForm.get('attemptFindPassword'); }
  get foundWifiPassword() { return this.itReadinessForm.get('foundWifiPassword'); }
  get technicalPersonKnows() { return this.itReadinessForm.get('technicalPersonKnows'); }
  get wifiTechnicalPersonContactInfo() { return this.itReadinessForm.get('wifiTechnicalPersonContactInfo'); }
  get internetRightAway() { return this.itReadinessForm.get('internetRightAway'); }
  get itContactInfo() { return this.itReadinessForm.get('itContactInfo'); }

  // Helper methods for conditional logic
  get isWifiFallback(): boolean {
    const connectionType = this.connectionType?.value;
    const cableHole = this.cableHole?.value;
    const runCable = this.runCable?.value;
    const counterHole = this.counterHole?.value;

    if (connectionType === 'cable') {
      return cableHole === 'No';
    }
    if (connectionType === 'both') {
      return cableHole === 'No' || (cableHole === 'Yes' && (runCable === 'No' && (counterHole === 'No' || counterHole === 'Used')));
    }
    return false;
  }

  get showWifiQuestions(): boolean {
    const connectionType = this.connectionType?.value;
    const wifiTransition = this.wifiTransition?.value;

    if (connectionType === 'wifi') {
      return true;
    }
    if (this.isWifiFallback && wifiTransition === 'Continue') {
      return true;
    }
    return false;
  }

  get needsTechnicalPerson(): boolean {
    const findConnected = this.findConnectedDevice?.value;
    const attemptResult = this.attemptFindPassword?.value;

    return findConnected === 'No' || attemptResult === 'I was unable to get the password';
  }

  get showInternetRightAway(): boolean {
    const connectionType = this.connectionType?.value;
    const showWifi = this.showWifiQuestions;
    const wifiName = this.wifiName?.value;
    const wifiPassword = this.wifiPassword?.value;
    const customWifiName = this.customWifiName?.value;
    const customWifiPassword = this.customWifiPassword?.value;

    if (connectionType === 'cable') {
      return this.cableHole?.value === 'Yes' && this.runCable?.value === 'Yes';
    }

    if (showWifi) {
      const hasWifiName = wifiName === '*Member will type in their answer here' ? !!customWifiName : wifiName && wifiName !== 'I don\'t know';
      const hasWifiPassword = wifiPassword === '*Member will type in their answer here' ? !!customWifiPassword : wifiPassword && wifiPassword !== 'I don\'t know';
      const foundPasswordSet = this.attemptFindPassword?.value === 'I found the password' && this.foundWifiPassword?.value;
      const technicalPersonSet = this.needsTechnicalPerson && this.technicalPersonKnows?.value !== '';

      return hasWifiName && (hasWifiPassword || foundPasswordSet || technicalPersonSet || !this.needsTechnicalPerson);
    }

    return false;
  }

  onlyNumbers(event: KeyboardEvent): void {
    const char = String.fromCharCode(event.which);
    if (!/[0-9]/.test(char)) {
      event.preventDefault();
    }
  }

  goBack(): void {
    this.prevStep.emit();
  }

  onSubmit(): void {
    const formData = this.itReadinessForm.value;
    
    // Log complete form data
    console.log('=== STEP 2: IT AND NETWORK READINESS ===');
    console.log('');
    
    // IT Person Information
    console.log('📋 IT PERSON INFORMATION');
    console.log('Name:', formData.itName);
    console.log('Phone:', formData.itPhone);
    console.log('Email:', formData.itEmail);
    console.log('');
    
    // Router Location
    console.log('📍 ROUTER LOCATION');
    console.log('Location:', formData.routerLocation);
    if (formData.customRouterLocation) {
      console.log('Custom Location:', formData.customRouterLocation);
    }
    console.log('');
    
    // Connection Type
    console.log('🌐 CONNECTION TYPE');
    console.log('Type:', formData.connectionType);
    console.log('');
      
      // Cable Information (if applicable)
      if (formData.connectionType === 'cable' || formData.connectionType === 'both') {
        console.log('🔌 ETHERNET CABLE INFORMATION');
        console.log('Cable Hole Available:', formData.cableHole);
        if (formData.cableHole === 'Yes') {
          console.log('Can Run 6ft Cable:', formData.runCable);
          if (formData.runCable === 'No') {
            console.log('Counter Cable Hole:', formData.counterHole);
          }
        }
        console.log('');
      }
      
      // WiFi Information (if applicable)
      if (formData.connectionType === 'wifi' || formData.connectionType === 'both') {
        console.log('📡 WIFI INFORMATION');
        console.log('WiFi Visible:', formData.seeWifi);
        console.log('WiFi Name:', formData.wifiName === '*Member will type in their answer here' ? formData.customWifiName : formData.wifiName);
        
        if (formData.wifiName !== "I don't know") {
          console.log('WiFi Password:', formData.wifiPassword === '*Member will type in their answer here' ? formData.customWifiPassword : formData.wifiPassword);
        }
        console.log('');
      }
      
      // Password Recovery Information
      if (formData.wifiName === "I don't know" || formData.wifiPassword === "I don't know") {
        console.log('🔐 PASSWORD RECOVERY INFORMATION');
        console.log('Found Connected Device:', formData.findConnectedDevice);
        if (formData.findConnectedDevice === 'Yes') {
          console.log('Attempt Find Password Result:', formData.attemptFindPassword);
          if (formData.attemptFindPassword === 'I found the password') {
            console.log('Found WiFi Password:', formData.foundWifiPassword);
          }
        }
        console.log('');
      }
      
      // Technical Person Information
      if ((formData.findConnectedDevice === 'No' || formData.attemptFindPassword === 'I was unable to get the password') && formData.technicalPersonKnows) {
        console.log('👤 TECHNICAL PERSON INFORMATION');
        console.log('Someone Knows Password:', formData.technicalPersonKnows);
        if (formData.technicalPersonKnows !== '') {
          console.log('Contact Info:', formData.wifiTechnicalPersonContactInfo);
        }
        console.log('');
      }
      
      // WiFi Transition (if fallback occurred)
      if (formData.wifiTransition) {
        console.log('🔄 WiFi Transition:', formData.wifiTransition);
        console.log('');
      }
      
      // Internet Verification
      if (formData.internetRightAway) {
        console.log('✅ INTERNET VERIFICATION');
        console.log('Internet Access Right Away:', formData.internetRightAway);
        if (formData.internetRightAway === 'No') {
          console.log('IT Contact Info:', formData.itContactInfo);
        }
        console.log('');
      }
      
      // Complete Form Object
      console.log('=== COMPLETE FORM DATA ===');
      console.log(formData);
      console.log('============================');
      console.table(formData);
      
      // Store data for later submission
      console.log('=== STEP 2 SUBMIT STARTED ===');
      this.formService.setStepData(2, formData);
      console.log('✅ Step 2 data stored, proceeding to next step');
      
      this.nextStep.emit();
  }
}
