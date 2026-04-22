import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RapidxchangeService {
  private formState = {
    isFormFilled: false,
    filledFormData: null as any,
    submissionId: null as number | null
  };

  constructor() { }

  setFormState(isFormFilled: boolean, formData: any, submissionId: number | null): void {
    this.formState = {
      isFormFilled,
      filledFormData: formData,
      submissionId
    };
    console.log('💾 Form state saved to service');
  }

  getFormState(): { isFormFilled: boolean; filledFormData: any; submissionId: number | null } {
    console.log('📖 Form state retrieved from service');
    return this.formState;
  }

  clearFormState(): void {
    this.formState = {
      isFormFilled: false,
      filledFormData: null,
      submissionId: null
    };
    console.log('🗑️ Form state cleared');
  }
}
