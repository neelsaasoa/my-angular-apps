import { Component, OnInit, Output, EventEmitter, Input, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// User Interface
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
}

@Component({
  selector: 'app-rapidxchange-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './rapidxchange-form.component.html',
  styleUrls: ['./rapidxchange-form.component.css'],
})
export class RapidxchangeFormComponent implements OnInit {
  rapidxchangeForm!: FormGroup;
  billingCheckboxValue = true;
  payableCheckboxValue = true;
  termsExpanded = false;
  todayDate = '';

  // Input for loading state
  @Input() isLoading = false;

  // Event emitter to notify parent when form is submitted
  @Output() formSubmitted = new EventEmitter<Record<string, unknown>>();

  // Users array
  users: User[] = [
    {
      id: 'Roy Patel',
      name: 'Roy Patel',
      email: 'roy.patel@example.com',
      phone: '2225525666',
      address: '123 Main St',
      city: 'Atlanta',
      state: 'GA',
      zipcode: '30301',
    },
    {
      id: 'Keri Patel',
      name: 'Keri Patel',
      email: 'keri.patel@example.com',
      phone: '4561257855',
      address: '456 Oak Ave',
      city: 'Dallas',
      state: 'TX',
      zipcode: '75001',
    },
    {
      id: 'Mary Patel',
      name: 'Mary Patel',
      email: 'mary.patel@example.com',
      phone: '5412325647',
      address: '789 Pine Ln',
      city: 'Chicago',
      state: 'IL',
      zipcode: '60601',
    },
    {
      id: 'Robert Patel',
      name: 'Robert Patel',
      email: 'robert.patel@example.com',
      phone: '2541562347',
      address: '321 Elm St',
      city: 'Seattle',
      state: 'WA',
      zipcode: '98101',
    },
  ];

  paymentMethodOptions = [
    'POD (Check or Money Orders Only. No Cash)',
    'Bank Draft (Complete Additional Form)',
    'Credit Card on File (Complete Additional Form)',
    'Credit (Application Required)'
  ];

  propaneServiceTypeOptions = ['New Application', 'Change Service'];

  fb = inject(FormBuilder);

  ngOnInit(): void {
    this.setTodayDate();
    this.initializeForm();
    this.setupCheckboxListeners();
    this.setupUserSelectionListener();
    this.setupPayableUserSelectionListener();
  }

  /**
   * Setup listener for user selection dropdown
   * When a user is selected, populate the store details and email fields
   * Billing and Payable fields are controlled by their respective checkboxes
   */
  private setupUserSelectionListener(): void {
    const primaryUserControl = this.rapidxchangeForm.get('primaryUser');

    if (primaryUserControl) {
      primaryUserControl.valueChanges.subscribe((userId) => {
        if (userId) {
          const selectedUser = this.users.find((user) => user.id === userId);

          if (selectedUser) {
            // Populate Email and Store Details fields from selected user
            this.rapidxchangeForm.patchValue(
              {
                email: selectedUser.email,
                storeContactName: selectedUser.name,
                storePhone: selectedUser.phone,
                storeAddress: selectedUser.address,
                storeCity: selectedUser.city,
                storeState: selectedUser.state,
                storeZip: selectedUser.zipcode,
              },
              { emitEvent: false }, // Prevent infinite loops
            );

            // If checkboxes are checked, also populate their respective fields
            if (this.rapidxchangeForm.get('billingCheckbox')?.value) {
              this.copyToBillingFields();
            }
            if (this.rapidxchangeForm.get('payableCheckbox')?.value) {
              this.copyToPayableFields();
            }
          }
        }
      });
    }
  }

  /**
   * Setup listener for payable user selection dropdown
   * When a payable user is selected, populate the payable contact fields
   */
  private setupPayableUserSelectionListener(): void {
    const payableUserControl = this.rapidxchangeForm.get('payableUser');

    if (payableUserControl) {
      payableUserControl.valueChanges.subscribe((userId) => {
        if (userId) {
          const selectedUser = this.users.find((user) => user.id === userId);

          if (selectedUser) {
            // Populate all payable contact fields from selected user
            this.rapidxchangeForm.patchValue(
              {
                payableContactName: selectedUser.name,
                payableContactPhone: selectedUser.phone,
                payableEmail: selectedUser.email,
                payableAddress: selectedUser.address,
                payableCity: selectedUser.city,
                payableState: selectedUser.state,
                payableZip: selectedUser.zipcode,
              },
              { emitEvent: false }, // Prevent infinite loops
            );
          }
        }
      });
    }
  }

  /**
   * Setup listeners for billing and payable checkboxes
   * This ensures data is only copied when user explicitly checks the "same as above" checkbox
   * NOT continuously on field changes to prevent unwanted clearing
   */
  private setupCheckboxListeners(): void {
    const billingCheckbox = this.rapidxchangeForm.get('billingCheckbox');
    const payableCheckbox = this.rapidxchangeForm.get('payableCheckbox');

    // Listen to billing checkbox changes - copy from primary fields when checked
    if (billingCheckbox) {
      billingCheckbox.valueChanges.subscribe((isChecked) => {
        this.billingCheckboxValue = isChecked;

        if (isChecked) {
          // Copy data from primary fields to billing fields using patchValue
          // patchValue only updates specified fields, doesn't clear others
          this.copyToBillingFields();
        } else {
          // Clear billing fields when unchecked
          this.clearBillingFields();
        }
      });

      // Handle initial checkbox state - if checkbox is already true, populate fields
      if (billingCheckbox.value === true) {
        this.billingCheckboxValue = true;
        // Use setTimeout to ensure form has fully initialized
        setTimeout(() => {
          this.copyToBillingFields();
        }, 100);
      }
    }

    // Listen to payable checkbox changes - copy from primary fields when checked
    if (payableCheckbox) {
      payableCheckbox.valueChanges.subscribe((isChecked) => {
        this.payableCheckboxValue = isChecked;

        if (isChecked) {
          // Copy data from primary fields to payable fields using patchValue
          this.copyToPayableFields();
        } else {
          // Clear payable fields when unchecked
          this.clearPayableFields();
        }
      });

      // Handle initial checkbox state - if checkbox is already true, populate fields
      if (payableCheckbox.value === true) {
        this.payableCheckboxValue = true;
        // Use setTimeout to ensure form has fully initialized
        setTimeout(() => {
          this.copyToPayableFields();
        }, 100);
      }
    }
  }

  /**
   * Copy data from selected user to billing fields
   * Fetches the currently selected user and copies all their data to billing section
   * Uses patchValue with { emitEvent: false } to prevent triggering valueChanges
   */
  private copyToBillingFields(): void {
    // Get the selected user ID from the form
    const selectedUserId = this.rapidxchangeForm.get('primaryUser')?.value;

    if (selectedUserId) {
      // Find the user object that matches the selected ID
      const selectedUser = this.users.find((user) => user.id === selectedUserId);

      if (selectedUser) {
        // Copy ALL billing information from the selected user
        // This includes email, name, phone, address, city, state, and zipcode
        this.rapidxchangeForm.patchValue(
          {
            billingEmail: selectedUser.email,
            billingContactName: selectedUser.name,
            billingContactPhone: selectedUser.phone,
            billingAddress: selectedUser.address,
            billingCity: selectedUser.city,
            billingState: selectedUser.state,
            billingZip: selectedUser.zipcode,
          },
          { emitEvent: false }, // Prevent triggering valueChanges to avoid loops
        );
      }
    }
  }

  /**
   * Copy data from selected user to payable contact fields
   * Fetches the currently selected user and copies all their data to payable section
   * Uses patchValue with { emitEvent: false } for clean data flow
   */
  private copyToPayableFields(): void {
    // Get the selected user ID from the form
    const selectedUserId = this.rapidxchangeForm.get('primaryUser')?.value;

    if (selectedUserId) {
      // Find the user object that matches the selected ID
      const selectedUser = this.users.find((user) => user.id === selectedUserId);

      if (selectedUser) {
        // Copy ALL payable contact information from the selected user
        this.rapidxchangeForm.patchValue(
          {
            payableContactName: selectedUser.name,
            payableContactPhone: selectedUser.phone,
            payableEmail: selectedUser.email,
            payableAddress: selectedUser.address,
            payableCity: selectedUser.city,
            payableState: selectedUser.state,
            payableZip: selectedUser.zipcode,
          },
          { emitEvent: false }, // Prevent triggering valueChanges to avoid loops
        );
      }
    }
  }

  /**
   * Clear billing fields when checkbox is unchecked
   * Clears all billing information fields
   */
  private clearBillingFields(): void {
    this.rapidxchangeForm.patchValue(
      {
        billingEmail: '',
        billingContactName: '',
        billingContactPhone: '',
        billingAddress: '',
        billingCity: '',
        billingState: '',
        billingZip: '',
      },
      { emitEvent: false },
    );
  }

  /**
   * Clear payable fields when checkbox is unchecked
   * Clears all payable contact information fields
   */
  private clearPayableFields(): void {
    this.rapidxchangeForm.patchValue(
      {
        payableContactName: '',
        payableContactPhone: '',
        payableEmail: '',
        payableAddress: '',
        payableCity: '',
        payableState: '',
        payableZip: '',
      },
      { emitEvent: false },
    );
  }

  setTodayDate(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.todayDate = `${year}-${month}-${day}`;
  }

  initializeForm(): void {
    this.rapidxchangeForm = this.fb.group({
      // Store Information
      saasId: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d+$/),
          Validators.minLength(6),
          Validators.maxLength(6),
        ],
      ],
      primaryUser: ['', [Validators.required]],
      companyName: ['', [Validators.required]],
      taxId: ['', [Validators.required]],
      storeDetails: ['', [Validators.required]],
      ein: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d+$/),
          Validators.minLength(9),
          Validators.maxLength(9),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],

      // Store Details Information
      storeContactName: ['', [Validators.required]],
      storePhone: ['', [Validators.required]],
      storeAddress: ['', [Validators.required]],
      storeCity: ['', [Validators.required]],
      storeState: ['', [Validators.required]],
      storeZip: ['', [Validators.required]],

      // Billing Information
      billingEmail: ['', [Validators.required, Validators.email]],
      billingContactName: ['', [Validators.required]],
      billingContactPhone: ['', [Validators.required]],
      billingAddress: ['', [Validators.required]],
      billingCity: ['', [Validators.required]],
      billingState: ['', [Validators.required]],
      billingZip: ['', [Validators.required]],

      // Payable Contact Information
      payableEmail: ['', [Validators.required, Validators.email]],
      payableContactName: ['', [Validators.required]],
      payableContactPhone: ['', [Validators.required]],
      payableAddress: ['', [Validators.required]],
      payableCity: ['', [Validators.required]],
      payableState: ['', [Validators.required]],
      payableZip: ['', [Validators.required]],
      payableUser: [''],

      // Terms & Conditions
      agreeTerms: [false, [Validators.requiredTrue]],

      // Signature and Date
      signHere: ['', [Validators.required]],
      date: ['', [Validators.required]],

      // Payment and Service Info
      paymentMethod: ['', [Validators.required]],
      propaneServiceType: ['', [Validators.required]],
      exchangePrice: ['', [Validators.required]],
      purchasePrice: ['', [Validators.required]],
      billingCheckbox: [true],
      payableCheckbox: [true],
    });
  }

  onSubmit(): void {
    if (this.rapidxchangeForm.valid) {
      const formData = this.rapidxchangeForm.value;
      console.log('==== RapidXchange Form Submitted ====');
      console.log('Store Information:', {
        saasId: formData.saasId,
        primaryUser: formData.primaryUser,
        companyName: formData.companyName,
        storeDetails: formData.storeDetails,
        taxId: formData.taxId,
        ein: formData.ein,
        email: formData.email,
      });
      console.log('Store Details:', {
        storeContactName: formData.storeContactName,
        storePhone: formData.storePhone,
        storeAddress: formData.storeAddress,
        storeCity: formData.storeCity,
        storeState: formData.storeState,
        storeZip: formData.storeZip,
      });
      console.log('Billing Information:', {
        billingEmail: formData.billingEmail,
        billingContactName: formData.billingContactName,
        billingContactPhone: formData.billingContactPhone,
        billingAddress: formData.billingAddress,
        billingCity: formData.billingCity,
        billingState: formData.billingState,
        billingZip: formData.billingZip,
      });
      console.log('Payable Contact Information:', {
        payableContactName: formData.payableContactName,
        payableContactPhone: formData.payableContactPhone,
        payableEmail: formData.payableEmail,
      });
      console.log('Terms & Conditions:', {
        agreeTerms: formData.agreeTerms,
      });
      console.log('Signature & Date:', {
        signHere: formData.signHere,
        date: formData.date,
      });
      console.log('Payment Details:', {
        paymentMethod: formData.paymentMethod,
        propaneServiceType: formData.propaneServiceType,
        exchangePrice: formData.exchangePrice,
        purchasePrice: formData.purchasePrice,
      });
      console.log('Checkboxes:', {
        billingCheckbox: formData.billingCheckbox,
        payableCheckbox: formData.payableCheckbox,
      });
      console.log('Complete Form Data:', formData);
      console.log('====================================');

      // Emit form data to parent component
      this.formSubmitted.emit(formData);

      // Handle form submission
    } else {
      console.warn('Form is invalid. Please fill all required fields.');
    }
  }

  toggleTerms(): void {
    this.termsExpanded = !this.termsExpanded;
  }

  onlyNumbers(event: KeyboardEvent): void {
    const char = String.fromCharCode(event.which);
    if (!/[0-9]/.test(char)) {
      event.preventDefault();
    }
  }
}
