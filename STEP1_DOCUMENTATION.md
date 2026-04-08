# Step 1: Store Details Form - Documentation

## Overview
The Step 1 component is the first page of a multi-step form used for store registration. It collects comprehensive store information including store details, contact information, chain information, and store hours. The form uses Angular's Reactive Forms with comprehensive validation and custom CSS styling.

---

## Project Structure

```
src/app/features/multi-step-form/pages/step1/
├── step1.component.ts          # Component logic
├── step1.component.html        # Template markup
└── step1.component.css         # Styling
```

---

## Component: step1.component.ts

### Class Definition
```typescript
export class Step1Component implements OnInit {
  storeDetailsForm!: FormGroup;
  
  constructor(private fb: FormBuilder) {}
  
  ngOnInit(): void {
    this.initializeForm();
  }
}
```

### Form Structure & Validation

The form is initialized using Angular's `FormBuilder` with the following fields:

#### **1. Store Information Section**

| Field | Type | Validators | Purpose |
|-------|------|-----------|---------|
| `storeName` | Text Input | Required, Min Length: 2 | Store's business name |
| `address` | Text Input | Required, Min Length: 5 | Street address |
| `city` | Text Input | Required, Min Length: 2 | City name |
| `state` | Text Input | Required | State abbreviation |
| `zip` | Text Input | Required, Pattern: `/^\d{5}(-\d{4})?$/` | US Zip code format |

#### **2. Contact Information Section**

| Field | Type | Validators | Purpose |
|-------|------|-----------|---------|
| `contactName` | Text Input | Required, Min Length: 2 | Contact person name |
| `phone` | Tel Input | Required, Pattern: `/^[\d\-\+\(\)\s]+$/` | Phone number with special chars |
| `email` | Email Input | Required, Email Format | Contact email address |

#### **3. Chain Information Section**

| Field | Type | Validators | Purpose |
|-------|------|-----------|---------|
| `chainName` | Text Input | Required, Min Length: 2 | Name of the store chain |

#### **4. Store Hours Section**

| Field | Type | Validators | Purpose |
|-------|------|-----------|---------|
| `storeHoursDocument` | Textarea | Required | Store operating hours |

### Validation Patterns

```typescript
initializeForm(): void {
  this.storeDetailsForm = this.fb.group({
    // Store Information
    storeName: ['', [Validators.required, Validators.minLength(2)]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    city: ['', [Validators.required, Validators.minLength(2)]],
    state: ['', Validators.required],
    zip: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
    
    // Contact Information
    contactName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^[\d\-\+\(\)\s]+$/)]],
    email: ['', [Validators.required, Validators.email]],
    
    // Chain Information
    chainName: ['', [Validators.required, Validators.minLength(2)]],
    
    // Store Hours
    storeHoursDocument: ['', Validators.required]
  });
}
```

### Validation Types Used

1. **Required Validator**: Ensures field is not empty
   ```typescript
   Validators.required
   ```

2. **Min Length Validator**: Ensures minimum character count
   ```typescript
   Validators.minLength(2)  // Minimum 2 characters
   Validators.minLength(5)  // Minimum 5 characters
   ```

3. **Email Validator**: Validates email format
   ```typescript
   Validators.email  // RFC 5322 compliant
   ```

4. **Pattern Validator**: Uses regex for specific formats
   ```typescript
   // Phone: digits, hyphens, plus, parentheses, spaces
   Validators.pattern(/^[\d\-\+\(\)\s]+$/)
   
   // Zip Code: 5 digits or 5 digits + 4 (12345 or 12345-6789)
   Validators.pattern(/^\d{5}(-\d{4})?$/)
   ```

### Getter Methods

Getter methods provide easy access to form controls for template validation display:

```typescript
get storeName() { return this.storeDetailsForm.get('storeName'); }
get address() { return this.storeDetailsForm.get('address'); }
get city() { return this.storeDetailsForm.get('city'); }
get state() { return this.storeDetailsForm.get('state'); }
get zip() { return this.storeDetailsForm.get('zip'); }
get contactName() { return this.storeDetailsForm.get('contactName'); }
get phone() { return this.storeDetailsForm.get('phone'); }
get email() { return this.storeDetailsForm.get('email'); }
get chainName() { return this.storeDetailsForm.get('chainName'); }
get storeHoursDocument() { return this.storeDetailsForm.get('storeHoursDocument'); }
```

### Form Submission

```typescript
onSubmit(): void {
  if (this.storeDetailsForm.valid) {
    console.log('Form Value:', this.storeDetailsForm.value);
    // Handle form submission (navigate to next step, etc.)
  }
}
```

---

## Template: step1.component.html

### Structure Overview

The template is organized into logical sections with form groups for different categories of information:

```html
<div class="step-container">
  <h2>Store Details</h2>
  <form [formGroup]="storeDetailsForm" (ngSubmit)="onSubmit()">
    <!-- 4 Form Sections Below -->
  </form>
</div>
```

### 1. Store Information Section

```html
<div class="form-section">
  <h3>Store Information</h3>
  
  <!-- Store Name Field -->
  <div class="form-group">
    <label for="storeName">Store Name *</label>
    <input 
      id="storeName" 
      type="text" 
      formControlName="storeName" 
      class="form-input"
      placeholder="Enter store name"
    />
    <div class="error-message" *ngIf="storeName?.invalid && storeName?.touched">
      <span *ngIf="storeName?.errors?.['required']">Store name is required</span>
      <span *ngIf="storeName?.errors?.['minlength']">Store name must be at least 2 characters</span>
    </div>
  </div>

  <!-- Address Field -->
  <div class="form-group">
    <label for="address">Address *</label>
    <input 
      id="address" 
      type="text" 
      formControlName="address" 
      class="form-input"
      placeholder="Enter street address"
    />
    <div class="error-message" *ngIf="address?.invalid && address?.touched">
      <span *ngIf="address?.errors?.['required']">Address is required</span>
      <span *ngIf="address?.errors?.['minlength']">Address must be at least 5 characters</span>
    </div>
  </div>

  <!-- City, State, Zip in Row -->
  <div class="form-row">
    <div class="form-group">
      <label for="city">City *</label>
      <input 
        id="city" 
        type="text" 
        formControlName="city" 
        class="form-input"
        placeholder="Enter city"
      />
      <div class="error-message" *ngIf="city?.invalid && city?.touched">
        <span *ngIf="city?.errors?.['required']">City is required</span>
        <span *ngIf="city?.errors?.['minlength']">City must be at least 2 characters</span>
      </div>
    </div>

    <div class="form-group">
      <label for="state">State *</label>
      <input 
        id="state" 
        type="text" 
        formControlName="state" 
        class="form-input"
        placeholder="Enter state"
        maxlength="2"
      />
      <div class="error-message" *ngIf="state?.invalid && state?.touched">
        <span *ngIf="state?.errors?.['required']">State is required</span>
      </div>
    </div>

    <div class="form-group">
      <label for="zip">Zip Code *</label>
      <input 
        id="zip" 
        type="text" 
        formControlName="zip" 
        class="form-input"
        placeholder="12345"
      />
      <div class="error-message" *ngIf="zip?.invalid && zip?.touched">
        <span *ngIf="zip?.errors?.['required']">Zip code is required</span>
        <span *ngIf="zip?.errors?.['pattern']">Invalid zip code format</span>
      </div>
    </div>
  </div>
</div>
```

### 2. Contact Information Section

```html
<div class="form-section">
  <h3>Contact Information</h3>
  
  <!-- Contact Name -->
  <div class="form-group">
    <label for="contactName">Contact Name *</label>
    <input 
      id="contactName" 
      type="text" 
      formControlName="contactName" 
      class="form-input"
      placeholder="Enter contact person name"
    />
    <div class="error-message" *ngIf="contactName?.invalid && contactName?.touched">
      <span *ngIf="contactName?.errors?.['required']">Contact name is required</span>
      <span *ngIf="contactName?.errors?.['minlength']">Contact name must be at least 2 characters</span>
    </div>
  </div>

  <!-- Phone & Email in Row -->
  <div class="form-row">
    <div class="form-group">
      <label for="phone">Phone *</label>
      <input 
        id="phone" 
        type="tel" 
        formControlName="phone" 
        class="form-input"
        placeholder="(123) 456-7890"
      />
      <div class="error-message" *ngIf="phone?.invalid && phone?.touched">
        <span *ngIf="phone?.errors?.['required']">Phone number is required</span>
        <span *ngIf="phone?.errors?.['pattern']">Invalid phone number format</span>
      </div>
    </div>

    <div class="form-group">
      <label for="email">Email *</label>
      <input 
        id="email" 
        type="email" 
        formControlName="email" 
        class="form-input"
        placeholder="email@example.com"
      />
      <div class="error-message" *ngIf="email?.invalid && email?.touched">
        <span *ngIf="email?.errors?.['required']">Email is required</span>
        <span *ngIf="email?.errors?.['email']">Invalid email format</span>
      </div>
    </div>
  </div>
</div>
```

### 3. Chain Information Section

```html
<div class="form-section">
  <h3>Chain Information</h3>
  
  <div class="form-group">
    <label for="chainName">Chain Name *</label>
    <input 
      id="chainName" 
      type="text" 
      formControlName="chainName" 
      class="form-input"
      placeholder="Enter chain name"
    />
    <div class="error-message" *ngIf="chainName?.invalid && chainName?.touched">
      <span *ngIf="chainName?.errors?.['required']">Chain name is required</span>
      <span *ngIf="chainName?.errors?.['minlength']">Chain name must be at least 2 characters</span>
    </div>
  </div>
</div>
```

### 4. Store Hours Section

```html
<div class="form-section">
  <h3>Store Hours</h3>
  
  <div class="form-group">
    <label for="storeHoursDocument">Store Hours *</label>
    <textarea 
      id="storeHoursDocument" 
      formControlName="storeHoursDocument" 
      class="form-textarea"
      placeholder="Enter store hours (e.g., Mon-Fri: 9AM-5PM, Sat: 10AM-4PM)"
      rows="4"
    ></textarea>
    <div class="error-message" *ngIf="storeHoursDocument?.invalid && storeHoursDocument?.touched">
      <span *ngIf="storeHoursDocument?.errors?.['required']">Store hours are required</span>
    </div>
  </div>
</div>
```

### Form Actions

```html
<div class="form-actions">
  <button type="submit" [disabled]="!storeDetailsForm.valid" class="btn-submit">
    Next Step
  </button>
</div>
```

---

## Styling: step1.component.css

### CSS Architecture

The styling is organized using custom CSS (not Tailwind CSS) with a modular, scalable approach. Styles are organized by functional areas:

### 1. Container & Layout

```css
.step-container {
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 600;
}

form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}
```

**Key Features:**
- Max-width constraint for better readability
- Centered container for responsive design
- Flexbox for vertical layout
- 30px gap between form sections

### 2. Form Sections

```css
.form-section {
  border: 1px solid #e0e0e0;
  padding: 20px;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.form-section h3 {
  color: #555;
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}
```

**Design Elements:**
- Light gray background (#f9f9f9)
- Subtle border (#e0e0e0)
- Rounded corners (8px)
- Blue underline for section headers (#007bff)
- Clear visual separation between sections

### 3. Form Groups & Labels

```css
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
}
```

**Styling Details:**
- Flexbox column layout for label + input spacing
- 8px gap between label and input
- Bold labels for accessibility
- Consistent font size

### 4. Input Fields

```css
.form-input,
.time-input {
  padding: 10px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s ease;
}

.form-textarea {
  padding: 10px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s ease;
  resize: vertical;
  min-height: 80px;
}
```

**Features:**
- Consistent padding across all input types
- Light gray borders (#d0d0d0)
- Smooth transitions for interactive feedback
- Font inheritance for consistency
- Textarea restricted to vertical resize only

### 5. Input Focus States

```css
.form-input:focus,
.time-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}
```

**Interaction Design:**
- Blue border on focus (#007bff)
- Subtle blue shadow for visual feedback
- Removes default browser outline
- 0.3s smooth transition

### 6. Validation States

```css
.form-input.ng-invalid.ng-touched,
.time-input.ng-invalid.ng-touched,
.form-textarea.ng-invalid.ng-touched {
  border-color: #dc3545;
}
```

**Error Indication:**
- Red border (#dc3545) for invalid fields
- Only shows after user interaction (.ng-touched)
- Clear visual feedback for form errors

### 7. Error Messages

```css
.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
}
```

**Message Styling:**
- Small font size (12px) for subtle indication
- Red color matching error border
- Tight spacing below input

### 8. Responsive Layout

```css
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}
```

**Features:**
- CSS Grid for multi-column layout
- Auto-fit with minimum 150px columns
- Responsive columns on smaller screens
- 15px gap between columns

### 9. Button Styles

```css
.form-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.btn-submit {
  padding: 12px 30px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #007bff;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

.btn-submit:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}
```

**Button Features:**
- Blue primary color (#007bff)
- Hover effect: darker shade + slight lift
- Disabled state with gray color
- Drop shadow on hover for depth

### 10. Mobile Responsiveness

```css
@media (max-width: 600px) {
  .step-container {
    padding: 15px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  h2 {
    font-size: 20px;
  }

  .form-section h3 {
    font-size: 14px;
  }
}
```

**Mobile Adjustments:**
- Reduced padding on small screens
- Single column layout for form rows
- Smaller header fonts
- Maintains readability on mobile devices

---

## CSS Color Palette

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary Blue | #007bff | Focus state, buttons, accents |
| Dark Blue | #0056b3 | Hover state, active states |
| Dark Gray | #333 | Primary text, headings |
| Medium Gray | #555 | Section headings |
| Light Gray | #f9f9f9 | Section backgrounds |
| Border Gray | #d0d0d0 | Input borders |
| Subtle Gray | #e0e0e0 | Section borders |
| Error Red | #dc3545 | Error messages, invalid borders |
| Disabled Gray | #ccc | Disabled button background |

---

## Form Validation Flow

### User Interaction Flow

1. **User Enters Data**
   - User types into form field
   - Form control updates in real-time

2. **Validation Triggers**
   - Validators check field value
   - Form control state updates

3. **Field Touch Detection**
   - `.ng-touched` class added after user interaction
   - Error messages display only after touching field

4. **Error Display**
   - Error message appears below field
   - Input border turns red (#dc3545)
   - Specific error message shows based on violation type

5. **Submit Disabled**
   - Submit button disabled while form invalid
   - Button text shows both style changes

### Error Message Examples

```
Field: Store Name
- Empty: "Store name is required"
- Too Short: "Store name must be at least 2 characters"

Field: Email
- Empty: "Email is required"
- Invalid Format: "Invalid email format"

Field: Zip Code
- Empty: "Zip code is required"
- Invalid Format: "Invalid zip code format"
```

---

## Module Integration

### app.module.ts Configuration

```typescript
import { ReactiveFormsModule } from '@angular/forms';
import { Step1Component } from './features/multi-step-form/pages/step1/step1.component';
import { MultiStepFormComponent } from './features/multi-step-form/multi-step-form.component';

@NgModule({
  declarations: [
    Step1Component,
    MultiStepFormComponent,
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule  // ← Required for Reactive Forms
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

---

## Key Features

✅ **Comprehensive Validation**
- Required field validation
- Minimum length validation
- Email format validation
- Phone number format validation
- Zip code format validation

✅ **User Experience**
- Real-time form validation
- Clear error messages
- Visual feedback (colors, shadows, transforms)
- Disabled submit until form valid
- Responsive design

✅ **Accessibility**
- Proper label associations
- Error messages linked to fields
- Semantic HTML structure
- Keyboard navigation support

✅ **Code Organization**
- Separated concerns (TS, HTML, CSS)
- Reusable CSS classes
- Clear variable naming
- DRY principles

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

---

## Future Enhancements

1. **Custom Validators**
   - Business hours format validation
   - Phone number region validation
   - Store name uniqueness check

2. **Enhanced UX**
   - Auto-formatting for phone/zip
   - Field suggestions/autocomplete
   - Step-by-step validation feedback

3. **Accessibility**
   - ARIA labels for screen readers
   - Focus management
   - Keyboard shortcuts

4. **Styling Updates**
   - Dark mode support
   - Animations for error display
   - Custom input styling per browser

---

## Troubleshooting

### Issue: Validation not triggering
**Solution**: Ensure `ReactiveFormsModule` is imported in `app.module.ts`

### Issue: Styles not applying
**Solution**: Check that CSS file path in component decorator matches actual file location

### Issue: Error messages not showing
**Solution**: Verify `*ngIf` condition includes both `invalid` and `touched` checks

### Issue: Form submit button stays disabled
**Solution**: Check all required fields are filled per validation rules

---

## File Summary

| File | Lines | Purpose |
|------|-------|---------|
| step1.component.ts | ~95 | Component logic, form initialization |
| step1.component.html | ~185 | Template with form sections |
| step1.component.css | ~250+ | Styling, responsiveness, animations |

**Total Lines of Code**: ~530+ lines

---

## Conclusion

The Step 1 form component provides a robust, user-friendly interface for collecting store details. It combines Angular's Reactive Forms with custom CSS styling to create a professional, responsive experience while maintaining code organization and accessibility standards.
