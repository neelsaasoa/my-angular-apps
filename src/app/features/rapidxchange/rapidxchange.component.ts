import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RapidxchangeFormComponent } from './rapidxchange-form/rapidxchange-form.component';
import { PdfService } from '../../core/services/pdf.service';

@Component({
  selector: 'app-rapidxchange',
  standalone: true,
  imports: [CommonModule, RapidxchangeFormComponent],
  templateUrl: './rapidxchange.component.html',
  styleUrls: ['./rapidxchange.component.css']
})
export class RapidxchangeComponent {
  // State management for card view and form submission
  showCardView: boolean = true;
  isFormFilled: boolean = false;
  showDataView: boolean = false;
  filledFormData: any = null;

  constructor(private pdfService: PdfService) { }

  ngOnInit(): void {
  }

  // Show form when "Form Fill" button is clicked
  onFormFillClick(): void {
    this.showCardView = false;
  }

  // Handle form submission and data reception
  onFormSubmitted(formData: any): void {
    this.filledFormData = formData;
    this.isFormFilled = true;
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
  }

  // Close data view and go back to card
  onBackToCard(): void {
    this.showCardView = true;
    this.showDataView = false;
  }

  // Download PDF with form data
  onDownloadPDF(): void {
    if (this.filledFormData) {
      this.pdfService.generateAndDownloadPDF(this.filledFormData);
      console.log('PDF generated with form data:', this.filledFormData);
    }
  }
}
