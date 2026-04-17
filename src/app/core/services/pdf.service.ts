import { Injectable } from '@angular/core';
import * as PDFLib from 'pdf-lib';

export type PdfFieldKey =
  | 'saasId'
  | 'companyName'
  | 'storeDetails'
  | 'ein'
  | 'taxId'
  | 'primaryUserAddress'
  | 'primaryUserName'
  | 'primaryUserPhone'
  | 'primaryUserCity'
  | 'primaryUserState'
  | 'primaryUserZip'
  | 'email'
  | 'payableContactName'
  | 'payableEmail'
  | 'billingAddress'
  | 'billingContactPhone'
  | 'billingEmail'
  | 'billingCity'
  | 'billingState'
  | 'billingZip'
  | 'exchangePrice'
  | 'purchasePrice'
  | 'serviceTypeLabel'
  | 'paymentMethodLabel'
  | 'signHere'
  | 'date';

export interface PdfFieldPosition {
  x: number;
  y: number;
  page?: number; // 0-indexed page number
}

// ---------------------------------------------------------
// PASTE YOUR FINAL COORDINATES FROM THE MAPPER HERE
export const PRODUCTION_PDF_FIELD_MAPPING: Record<PdfFieldKey, PdfFieldPosition> = {
  saasId: { x: 88.16, y: 591.65 },
  companyName: { x: 120.94, y: 568.34 },
  storeDetails: { x: 53.19, y: 544.3 },
  ein: { x: 85.97, y: 520.26 },
  taxId: { x: 413.1, y: 518.8 },
  primaryUserAddress: { x: 83.79, y: 499.13 },
  primaryUserName: { x: 383.96, y: 498.4 },
  primaryUserPhone: { x: 343.16, y: 480.91 },
  primaryUserCity: { x: 47.36, y: 453.96 },
  primaryUserState: { x: 182.87, y: 454.69 },
  primaryUserZip: { x: 249.9, y: 453.96 },
  email: { x: 343.16, y: 454.69 },
  payableContactName: { x: 424.39, y: 426.59 },
  payableEmail: { x: 340.97, y: 373.09 },
  billingAddress: { x: 91.8, y: 389.85 },
  billingContactPhone: { x: 342.43, y: 389.85 },
  billingEmail: { x: 130.41, y: 408.06 },
  billingCity: { x: 47.36, y: 354.88 },
  billingState: { x: 182.14, y: 354.15 },
  billingZip: { x: 248.44, y: 354.15 },
  exchangePrice: { x: 274.31, y: 251.74 },
  purchasePrice: { x: 357.36, y: 252.47 },
  serviceTypeLabel: { x: 314.01, y: 354.15 },
  paymentMethodLabel: { x: 560.64, y: 159.95 },
  // NOTE: If the signature belongs on the second page, add `page: 1` to it:
  signHere: { x: 24.41, y: 64.59, page: 1 },
  date: { x: 228.41, y: 63.13, page: 1 }
};


@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  /**
   * Generate PDF with filled form data using coordinates
   * 
   * @param formData - Form data object to fill into PDF
   */
  async generateAndDownloadPDF(formData: any): Promise<void> {
    try {
      // Load the PDF document
      const pdfUrl = '/SaasoaPropane2025_V2.pdf';
      const pdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
      const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
      const [firstPage] = pdfDoc.getPages();
      const { width, height } = firstPage.getSize();
      console.log(`📄 PDF Loaded. Size: ${width}x${height}`);

      const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

      const drawValue = (
        value: unknown,
        x: number,
        y: number,
        pageIndex: number,
        options?: {
          size?: number;
          maxWidth?: number;
          bold?: boolean;
        }
      ) => {
        if (value === undefined || value === null) return;
        const text = String(value).trim();
        if (!text) return;

        const targetPage = pdfDoc.getPages()[pageIndex] || firstPage;
        targetPage.drawText(text, {
          x,
          y: y - (options?.size ?? 9) * 0.35, // Adjust for baseline to match marker center
          size: options?.size ?? 9,
          maxWidth: options?.maxWidth,
          font: options?.bold ? boldFont : font,
          color: PDFLib.rgb(0, 0, 0)
        });
      };

      const drawMark = (x: number, y: number, pageIndex: number) => {
        const targetPage = pdfDoc.getPages()[pageIndex] || firstPage;
        targetPage.drawText('✓', {
          x,
          y: y - 4, // Check mark is roughly size 11, so 4 points down centers it
          size: 11,
          font: boldFont,
          color: PDFLib.rgb(0, 0, 0)
        });
      };

      const paymentMethodLabel = this.getPaymentMethodLabel(formData.paymentMethod);
      const serviceTypeLabel = this.getServiceTypeLabel(formData.propaneServiceType);
      const formattedDate = this.formatDate(formData.date);

      // Header fields
      this.drawMappedValue(drawValue, 'saasId', formData.saasId, { size: 10, maxWidth: 70 });
      this.drawMappedValue(drawValue, 'companyName', formData.companyName, { maxWidth: 360 });
      this.drawMappedValue(drawValue, 'storeDetails', formData.storeDetails, { maxWidth: 290 });
      this.drawMappedValue(drawValue, 'ein', formData.ein, { maxWidth: 125 });
      this.drawMappedValue(drawValue, 'taxId', formData.taxId, { maxWidth: 130 });

      // Store contact line
      this.drawMappedValue(drawValue, 'primaryUserAddress', formData.primaryUserAddress || formData.billingAddress, { maxWidth: 220 });
      this.drawMappedValue(drawValue, 'primaryUserName', formData.primaryUserName || formData.billingContactName, { maxWidth: 130 });
      this.drawMappedValue(drawValue, 'primaryUserPhone', formData.primaryUserPhone || formData.billingContactPhone, { maxWidth: 85 });
      this.drawMappedValue(drawValue, 'primaryUserCity', formData.primaryUserCity || formData.billingCity, { maxWidth: 210 });
      this.drawMappedValue(drawValue, 'primaryUserState', formData.primaryUserState || formData.billingState, { maxWidth: 50 });
      this.drawMappedValue(drawValue, 'primaryUserZip', formData.primaryUserZip || formData.billingZip, { maxWidth: 70 });
      this.drawMappedValue(drawValue, 'email', formData.email, { maxWidth: 200 });

      // Accounts payable / billing area
      this.drawMappedValue(drawValue, 'payableContactName', formData.payableContactName, { maxWidth: 170 });
      this.drawMappedValue(drawValue, 'payableEmail', formData.payableEmail, { maxWidth: 178 });
      this.drawMappedValue(drawValue, 'billingAddress', formData.billingAddress, { maxWidth: 215 });
      this.drawMappedValue(drawValue, 'billingContactPhone', formData.billingContactPhone, { maxWidth: 93 });
      this.drawMappedValue(drawValue, 'billingEmail', formData.billingEmail, { maxWidth: 105 });
      this.drawMappedValue(drawValue, 'billingCity', formData.billingCity, { maxWidth: 120 });
      this.drawMappedValue(drawValue, 'billingState', formData.billingState, { maxWidth: 40 });
      this.drawMappedValue(drawValue, 'billingZip', formData.billingZip, { maxWidth: 45 });

      // Pricing and program section
      this.drawMappedValue(drawValue, 'exchangePrice', formData.exchangePrice, { maxWidth: 70, bold: true });
      this.drawMappedValue(drawValue, 'purchasePrice', formData.purchasePrice, { maxWidth: 70, bold: true });
      this.drawMappedValue(drawValue, 'serviceTypeLabel', serviceTypeLabel, { size: 8, maxWidth: 100 });
      this.drawMappedValue(drawValue, 'paymentMethodLabel', paymentMethodLabel, { size: 8.5, maxWidth: 220 });

      // Service type marks handling for new options
      // Update as needed for new-application and service-type

      // Signature block
      this.drawMappedValue(drawValue, 'signHere', formData.signHere, { maxWidth: 205, bold: true });
      this.drawMappedValue(drawValue, 'date', formattedDate, { maxWidth: 95, bold: true });

      let dynamicFilename = 'RapidXchange.pdf';
      if (formData.saasId) {
        dynamicFilename = `RapidXchange_${formData.saasId}.pdf`;
      }

      // Save and download the filled PDF
      const filledPdfBytes = await pdfDoc.save();
      
      console.log('✅ PDF filled, triggering download.');
      this.downloadPDF(filledPdfBytes, dynamicFilename);
      
    } catch (error) {
      console.error('Error filling PDF:', error);
      // Fallback: open PDF in new tab
      this.openPDFFallback();
    }
  }

  private getPaymentMethodLabel(paymentMethod: string): string {
    switch (paymentMethod) {
      case 'pod':
        return 'POD';
      case 'bank-draft':
        return 'Bank Draft';
      case 'credit-card-on-file':
        return 'Credit Card on File';
      case 'credit':
        return 'Credit';
      default:
        return '';
    }
  }

  private getServiceTypeLabel(serviceType: string): string {
    switch (serviceType) {
      case 'new-application':
        return 'New Application';
      case 'service-type':
        return 'Service Type';
      default:
        return '';
    }
  }

  private formatDate(value: string): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  private drawMappedValue(
    drawText: (
      value: unknown,
      x: number,
      y: number,
      pageIndex: number,
      options?: {
        size?: number;
        maxWidth?: number;
        bold?: boolean;
      }
    ) => void,
    field: PdfFieldKey,
    value: unknown,
    options?: {
      size?: number;
      maxWidth?: number;
      bold?: boolean;
    }
  ): void {
    const position = PRODUCTION_PDF_FIELD_MAPPING[field];
    if (position) {
      drawText(value, position.x, position.y, position.page || 0, options);
    }
  }

  private drawMappedMark(
    drawMark: (x: number, y: number, pageIndex: number) => void,
    field: PdfFieldKey
  ): void {
    const position = PRODUCTION_PDF_FIELD_MAPPING[field];
    if (position) {
      drawMark(position.x, position.y, position.page || 0);
    }
  }

  /**
   * Download PDF file
   */
  private downloadPDF(pdfBytes: Uint8Array, filename: string): void {
    // Generate blob and url
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    // Create hidden anchor
    const link = document.createElement('a');
    link.href = url;
    
    // Enforce explicit .pdf extension on the incoming filename
    let finalFilename = filename;
    if (!finalFilename.toLowerCase().endsWith('.pdf')) {
      finalFilename += '.pdf';
    }
    
    link.download = finalFilename;
    document.body.appendChild(link);
    
    // Force the browser to trigger download
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
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
