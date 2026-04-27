import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private apiUrl = 'https://eo5n8nvlzu57q6s.m.pipedream.net';
  
  // Store data from each step
  private formData: Record<string, unknown> = {
    step1: null,
    step2: null,
    step3: null
  };

  private http = inject(HttpClient);

  // Store data for a specific step
  setStepData(step: number, data: unknown): void {
    this.formData[`step${step}`] = data;
    console.log(`📝 Step ${step} data stored:`, data);
  }

  // Get data for a specific step
  getStepData(step: number): unknown {
    return this.formData[`step${step}`];
  }

  // Get all collected data
  getAllFormData(): Record<string, unknown> {
    return {
      ...this.formData,
      completedAt: new Date().toISOString(),
      source: 'Angular Multi-Step Form - Complete Submission'
    };
  }

  // Check if all steps are completed
  isFormComplete(): boolean {
    return this.formData['step1'] !== null && 
           this.formData['step2'] !== null && 
           this.formData['step3'] !== null;
  }

  // Submit complete form data (only called once at the end)
  submitCompleteForm(): Observable<unknown> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    const payload = this.getAllFormData();

    console.log('🚀 SENDING COMPLETE FORM DATA TO PIPEDREAM:', payload);
    console.log('Target URL:', this.apiUrl);

    return this.http.post(this.apiUrl, payload, {
      headers,
      observe: 'response'
    });
  }

  // Legacy method for individual step submissions (no longer used)
  submitFormData(formData: unknown, step: string): Observable<unknown> {
    console.log(`⚠️ Legacy API call attempted for ${step} - this should not happen anymore`);
    return this.submitCompleteForm();
  }
}
