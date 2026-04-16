import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormService } from '../../../../core/services/form.service';

@Component({
  selector: 'app-step3',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step3.component.html',
  styleUrls: ['./step3.component.css']
})
export class Step3Component implements OnInit {
  @Output() prevStep = new EventEmitter<void>();
  @Output() nextStep = new EventEmitter<void>();

  installationForm!: FormGroup;
  selectedFileName: string = '';

  constructor(private fb: FormBuilder, private formService: FormService) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.installationForm = this.fb.group({
      // Device Space Questions
      spaceForDevice: ['', Validators.required],
      spaceUncluttered: ['', Validators.required],
      deviceInPublicArea: ['', Validators.required],

      // Outlet and Cables
      outletWithin5ft: ['', Validators.required],
      cablesConcealable: ['', Validators.required],

      // Mounting
      mountingAllowed: ['', Validators.required],

      // Image Upload
      layoutImage: ['', Validators.required]
    });
  }

  // Getters for form controls
  get spaceForDevice() { return this.installationForm.get('spaceForDevice'); }
  get spaceUncluttered() { return this.installationForm.get('spaceUncluttered'); }
  get deviceInPublicArea() { return this.installationForm.get('deviceInPublicArea'); }
  get outletWithin5ft() { return this.installationForm.get('outletWithin5ft'); }
  get cablesConcealable() { return this.installationForm.get('cablesConcealable'); }
  get mountingAllowed() { return this.installationForm.get('mountingAllowed'); }
  get layoutImage() { return this.installationForm.get('layoutImage'); }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      this.installationForm.patchValue({
        layoutImage: file
      });
      this.layoutImage?.markAsTouched();
    }
  }

  goBack(): void {
    this.prevStep.emit();
  }

  onSubmit(): void {
    console.log('=== STEP 3 SUBMIT STARTED ===');
    console.log('Form Valid:', this.installationForm.valid);
    console.log('Form Value:', this.installationForm.value);
    
    if (this.installationForm.valid) {
      // Store Step 3 data
      this.formService.setStepData(3, this.installationForm.value);
      console.log('✅ Step 3 data stored');
      
      // Check if form is complete
      if (this.formService.isFormComplete()) {
        console.log('🎉 All steps completed! Making final API call...');
        
        // Make the final API call with all collected data
        this.formService.submitCompleteForm().subscribe({
          next: (response: any) => {
            console.log('✅ COMPLETE FORM SUBMISSION SUCCESS:', response);
            console.log('📊 All form data has been sent to Pipedream in one request!');
          },
          error: (error: any) => {
            console.error('❌ COMPLETE FORM SUBMISSION ERROR:', error);
          }
        });
      } else {
        console.warn('⚠️ Form not complete - missing data from previous steps');
      }
      
      console.log('Step 3 submit completed, emitting nextStep');
      this.nextStep.emit();
    } else {
      console.log('❌ Step 3 form is invalid, not submitting');
    }
  }
}
