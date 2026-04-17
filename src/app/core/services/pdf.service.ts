import { Injectable } from '@angular/core';
import * as PDFLib from 'pdf-lib';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  /**
   * Generate PDF with filled form data
   * Fills the PDF with form data automatically using pdf-lib
   * 
   * @param formData - Form data object to fill into PDF
   */
  async generateAndDownloadPDF(formData: any): Promise<void> {
    try {
      // Load the PDF document
      const pdfUrl = '/SaasoaPropane2025_V2.pdf';
      const pdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
      const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
      
      const form = pdfDoc.getForm();
      
      // Map form fields to PDF fields
      const fieldMappings: { [key: string]: string } = {
        'saasId': 'SAASOA_ID',
        'ein': 'EIN',
        'companyName': 'COMPANY_NAME',
        'email': 'EMAIL',
        'billingEmail': 'BILLING_EMAIL',
        'billingAddress': 'BILLING_ADDRESS',
        'billingCity': 'BILLING_CITY',
        'billingState': 'BILLING_STATE',
        'billingZip': 'BILLING_ZIP',
        'billingContactName': 'BILLING_CONTACT_NAME',
        'billingContactPhone': 'BILLING_CONTACT_PHONE',
        'payableEmail': 'PAYABLE_EMAIL',
        'payableContactName': 'PAYABLE_CONTACT_NAME',
        'payableContactPhone': 'PAYABLE_CONTACT_PHONE',
        'payableAddress': 'PAYABLE_ADDRESS',
        'payableCity': 'PAYABLE_CITY',
        'payableState': 'PAYABLE_STATE',
        'payableZip': 'PAYABLE_ZIP',
        'signHere': 'SIGNATURE',
        'date': 'DATE',
        'paymentMethod': 'PAYMENT_METHOD',
        'propaneServiceType': 'PROPANE_SERVICE_TYPE',
        'exchangePrice': 'EXCHANGE_PRICE',
        'purchasePrice': 'PURCHASE_PRICE'
      };
      
      // Fill each field in the PDF
      Object.entries(fieldMappings).forEach(([formKey, pdfKey]) => {
        try {
          const field = form.getField(pdfKey);
          if (field && formData[formKey]) {
            const fieldValue = String(formData[formKey]);
            if (field instanceof PDFLib.PDFTextField) {
              field.setText(fieldValue);
            } else if (field instanceof PDFLib.PDFCheckBox) {
              (field as any).check();
            } else {
              // Fallback for other field types
              (field as any).setText?.(fieldValue) || (field as any).setValue?.(fieldValue);
            }
          }
        } catch (e) {
          console.warn(`Could not fill field: ${pdfKey}`, e);
        }
      });
      
      // Flatten the form so it can't be edited
      form.flatten();
      
      // Save and download the filled PDF
      const filledPdfBytes = await pdfDoc.save();
      this.downloadPDF(filledPdfBytes, 'RapidXchange_Filled.pdf');
      
      console.log('✅ PDF filled and downloaded successfully');
    } catch (error) {
      console.error('Error filling PDF:', error);
      // Fallback: open PDF in new tab
      this.openPDFFallback();
    }
  }

  /**
   * Download PDF file
   */
  private downloadPDF(pdfBytes: Uint8Array, filename: string): void {
    // Convert Uint8Array to Blob by wrapping in a new Uint8Array
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Fallback: Open PDF in new tab if pdf-lib fails
   */
  private openPDFFallback(): void {
    const pdfPath = '/SaasoaPropane2025_V2.pdf';
    const pdfWindow = window.open(pdfPath, '_blank');
    
    if (pdfWindow) {
      console.log('%c📄 PDF opened in new tab', 'font-size: 14px; color: #28a745; font-weight: bold;');
    } else {
      alert('Could not open PDF. Please enable popups for this site.');
    }
  }
}
