import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-step3',
  standalone: false,
  templateUrl: './step3.component.html',
  styleUrls: ['./step3.component.css']
})
export class Step3Component implements OnInit {
  @Output() prevStep = new EventEmitter<void>();
  @Output() nextStep = new EventEmitter<void>();

  installationForm!: FormGroup;
  selectedFileName: string = '';

  constructor(private fb: FormBuilder) {}

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
    if (this.installationForm.valid) {
      console.log('Step 3 Form Value:', this.installationForm.value);
      this.nextStep.emit();
    }
  }
}
