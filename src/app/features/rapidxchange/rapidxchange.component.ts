import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RapidxchangeFormComponent } from './rapidxchange-form/rapidxchange-form.component';
import { RapidxchangeService } from './rapidxchange.service';

@Component({
  selector: 'app-rapidxchange',
  standalone: true,
  imports: [CommonModule, RapidxchangeFormComponent],
  templateUrl: './rapidxchange.component.html',
  styleUrls: ['./rapidxchange.component.css']
})
export class RapidxchangeComponent implements OnInit {
  // State management for card view and form submission
  showCardView: boolean = true;
  isFormFilled: boolean = false;
  showDataView: boolean = false;
  filledFormData: any = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  submissionId: number | null = null;
  successMessage: string = '';

  private backendApiUrl = 'http://localhost:3001/api/submit-form';

  constructor(private http: HttpClient, private router: Router, private rapidxchangeService: RapidxchangeService) { }

  ngOnInit(): void {
    // Restore form state from service
    const savedState = this.rapidxchangeService.getFormState();
    this.isFormFilled = savedState.isFormFilled;
    this.filledFormData = savedState.filledFormData;
    this.submissionId = savedState.submissionId;

    console.log('📍 Form state restored on init:', {
      isFormFilled: this.isFormFilled,
      hasFilledData: !!this.filledFormData,
      submissionId: this.submissionId
    });

    // Subscribe to router navigation events to detect route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateViewBasedOnRoute();
    });

    // Check initial route
    this.updateViewBasedOnRoute();
  }

  updateViewBasedOnRoute(): void {
    const urlPath = this.router.url;
    console.log('📍 Current URL:', urlPath);

    if (urlPath.includes('/form')) {
      this.showCardView = false;
      console.log('✅ Showing FORM view');
    } else {
      this.showCardView = true;
      console.log('✅ Showing CARD view');
    }
  }

  checkCurrentRoute(): void {
    this.updateViewBasedOnRoute();
  }

  // Show form when "Form Fill" button is clicked
  onFormFillClick(): void {
    this.showCardView = false;
    this.router.navigate(['/rapidxchange/form']);
  }

  // Handle form submission and data reception
  onFormSubmitted(formData: any): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Save form data to database
    this.http.post(this.backendApiUrl, formData).subscribe({
      next: (response: any) => {
        console.log('✅ Form data saved to database successfully');
        console.log('Submission ID:', response.submissionId);
        
        this.filledFormData = formData;
        this.isFormFilled = true;
        this.submissionId = response.submissionId;
        this.isLoading = false;
        this.successMessage = '✅ Form Submitted Successfully!';

        // Save state to service before navigating
        this.rapidxchangeService.setFormState(true, formData, response.submissionId);
        console.log('💾 Form state saved to service before redirect');
        
        // Navigate to card view after a short delay
        setTimeout(() => {
          this.successMessage = '';
          this.router.navigate(['/rapidxchange']);
          console.log('✅ Navigating to card view');
        }, 2000);
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('❌ Error saving form data:', error);
        
        // Parse error response
        if (error.error instanceof Blob) {
          error.error.text().then((text: string) => {
            try {
              const errorData = JSON.parse(text);
              this.errorMessage = errorData.error || 'Failed to save document';
            } catch {
              this.errorMessage = 'Failed to save document. Please try again.';
            }
          });
        } else {
          this.errorMessage = error.error?.error || 'Failed to save document. Please try again.';
        }
      }
    });
  }

  // Download PDF from backend
  private downloadPDF(): void {
    if (!this.submissionId) {
      this.isLoading = false;
      this.errorMessage = 'No submission ID found';
      return;
    }

    const pdfUrl = `http://localhost:3001/api/download-pdf/${this.submissionId}`;
    
    this.http.get(pdfUrl, { responseType: 'blob' }).subscribe({
      next: (pdfBlob: Blob) => {
        console.log('✅ PDF downloaded successfully');
        
        // Create download link and trigger download
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapidxchange-form-${this.submissionId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        // Redirect to data view after download
        this.isLoading = false;
        this.showDataView = true;
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('❌ Error downloading PDF:', error);
        this.errorMessage = 'Failed to download PDF. However, your form has been saved.';
        // Still redirect to data view even if PDF download fails
        this.showDataView = true;
      }
    });
  }

  // Show form data view when "View Document" is clicked
  onViewDocumentClick(): void {
    if (this.filledFormData) {
      this.showDataView = true;
      this.showCardView = false;
    }
  }

  // Go back to form if needed
  onBackToForm(): void {
    this.showCardView = true;
    this.showDataView = false;
    this.router.navigate(['/rapidxchange']);
  }

  // Close data view and go back to card
  onBackToCard(): void {
    this.showCardView = true;
    this.showDataView = false;
    this.router.navigate(['/rapidxchange']);
  }

  // Download PDF from backend
  onDownloadPDF(): void {
    if (!this.submissionId) {
      this.errorMessage = 'No submission ID found. Please submit the form first.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const pdfUrl = `http://localhost:3001/api/download-pdf/${this.submissionId}`;
    
    this.http.get(pdfUrl, { responseType: 'blob' }).subscribe({
      next: (pdfBlob: Blob) => {
        // Trigger PDF download
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapidxchange-form-${this.submissionId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.isLoading = false;
        console.log('✅ PDF downloaded successfully from backend');
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('❌ Error downloading PDF from backend:', error);
        this.errorMessage = 'Failed to download PDF. Please try again.';
      }
    });
  }
}
