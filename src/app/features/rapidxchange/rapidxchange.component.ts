import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RapidxchangeFormComponent } from './rapidxchange-form/rapidxchange-form.component';
import { RapidxchangeService } from './rapidxchange.service';

// Submission interface for type safety
interface Submission {
  id: number;
  saasId: string;
  primaryUser: string;
  companyName: string;
  taxId: string;
  storeDetails: string;
  ein: string;
  email: string;
  storeContactName: string;
  storePhone: string;
  storeAddress: string;
  storeCity: string;
  storeState: string;
  storeZip: string;
  billingEmail: string;
  billingContactName: string;
  billingContactPhone: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  payableUser: string;
  payableEmail: string;
  payableContactName: string;
  payableContactPhone: string;
  payableAddress: string;
  payableCity: string;
  payableState: string;
  payableZip: string;
  agreeTerms: number;
  signHere: string;
  date: string;
  paymentMethod: string;
  propaneServiceType: string;
  exchangePrice: string;
  purchasePrice: string;
  billingCheckbox: number;
  payableCheckbox: number;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-rapidxchange',
  standalone: true,
  imports: [CommonModule, RapidxchangeFormComponent],
  templateUrl: './rapidxchange.component.html',
  styleUrls: ['./rapidxchange.component.css']
})
export class RapidxchangeComponent implements OnInit {
  // State management for card view and form submission
  showCardView = true;
  isFormFilled = false;
  showDataView = false;
  filledFormData: Partial<Submission> | null = null;
  isLoading = false;
  errorMessage = '';
  submissionId: number | null = null;
  successMessage = '';

  // Submissions table
  submissions: Submission[] = [];
  isLoadingSubmissions = false;

  private backendApiUrl = 'http://localhost:3001/api/submit-form';
  private submissionsApiUrl = 'http://localhost:3001/api/submissions';

  http = inject(HttpClient);
  router = inject(Router);
  rapidxchangeService = inject(RapidxchangeService);
  cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    // Restore form state from service
    const savedState = this.rapidxchangeService.getFormState();
    this.isFormFilled = savedState.isFormFilled;
    this.filledFormData = savedState.filledFormData as Partial<Submission> | null;
    this.submissionId = savedState.submissionId;

    console.log('📍 Form state restored on init:', {
      isFormFilled: this.isFormFilled,
      hasFilledData: !!this.filledFormData,
      submissionId: this.submissionId
    });

    // Fetch submissions on init
    console.log('🔄 Fetching submissions...');
    this.fetchSubmissions();

    // Subscribe to router navigation events to detect route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      console.log('📍 Route changed to:', event.url);
      this.updateViewBasedOnRoute();
      // Refresh submissions when returning to card view
      if (event.url === '/rapidxchange') {
        console.log('🔄 Refreshing submissions on return to card view');
        this.fetchSubmissions();
      }
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
  onFormSubmitted(formData: Partial<Submission>): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Save form data to database
    this.http.post<{ submissionId: number }>(this.backendApiUrl, formData).subscribe({
      next: (response) => {
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
      error: (error: HttpErrorResponse) => {
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

  // Fetch all submissions from backend
  fetchSubmissions(): void {
    this.isLoadingSubmissions = true;
    console.log('📡 Making HTTP GET request to:', this.submissionsApiUrl);
    
    this.http.get<{ success: boolean; count: number; data: Submission[] }>(this.submissionsApiUrl).subscribe({
      next: (response) => {
        console.log('✅ Response received:', response);
        this.submissions = response.data || [];
        this.isLoadingSubmissions = false;
        this.cdr.detectChanges(); // Force change detection
        console.log('✅ Submissions loaded successfully:', this.submissions.length, 'entries');
        console.log('Submissions data:', this.submissions);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoadingSubmissions = false;
        this.cdr.detectChanges(); // Force change detection
        console.error('❌ Error fetching submissions:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
      }
    });
  }

  // View PDF in new tab
  viewPDF(submissionId: number): void {
    const pdfUrl = `http://localhost:3001/api/download-pdf/${submissionId}`;
    
    console.log('🔄 Fetching PDF from:', pdfUrl);
    
    this.http.get(pdfUrl, {
      responseType: 'blob'
    }).subscribe({
      next: (pdfBlob: Blob) => {
        console.log('✅ PDF blob received, size:', pdfBlob.size);
        
        // Check if response is actually a PDF
        if (pdfBlob.type !== 'application/pdf') {
          console.error('❌ Invalid response type:', pdfBlob.type);
          // Try to parse as JSON error
          pdfBlob.text().then((text) => {
            try {
              const error = JSON.parse(text);
              alert(`Error: ${error.error || 'Failed to generate PDF'}`);
            } catch {
              alert('Failed to load PDF. Please try again.');
            }
          });
          return;
        }
        
        const blobUrl = URL.createObjectURL(pdfBlob);
        console.log('📄 Opening PDF in new tab...');
        const pdfWindow = window.open(blobUrl, '_blank');
        
        if (!pdfWindow) {
          alert('Could not open PDF. Please enable popups for this site.');
          return;
        }
        
        // Clean up the object URL after a delay to allow the browser to open the tab
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
          console.log('🧹 Cleaned up blob URL');
        }, 2000);
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Error fetching PDF:', error);
        
        // Parse error response for better error message
        if (error.error instanceof Blob) {
          error.error.text().then((text: string) => {
            try {
              const errorData = JSON.parse(text);
              alert(`Error: ${errorData.error || 'Failed to generate PDF'}`);
            } catch {
              alert(`Network Error: ${error.status} ${error.statusText}`);
            }
          });
        } else {
          const errorMsg = error.error?.error || error.message || 'Network error occurred';
          alert(`Failed to load PDF: ${errorMsg}`);
        }
      }
    });
  }
}
