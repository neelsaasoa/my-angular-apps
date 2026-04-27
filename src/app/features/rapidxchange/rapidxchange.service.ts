import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RapidxchangeService {
  private formState = {
    isFormFilled: false,
    filledFormData: null as unknown,
    submissionId: null as number | null
  };

  setFormState(isFormFilled: boolean, formData: unknown, submissionId: number | null): void {
    this.formState = {
      isFormFilled,
      filledFormData: formData,
      submissionId
    };
    console.log('💾 Form state saved to service');
  }

  getFormState(): { isFormFilled: boolean; filledFormData: unknown; submissionId: number | null } {
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
