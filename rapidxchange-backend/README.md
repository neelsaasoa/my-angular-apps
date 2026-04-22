# RapidXchange Backend Server

A Node.js/Express backend server that handles RapidXchange form submissions, validates data, and generates filled PDF documents.

## Features

- ✅ Form data validation (client and server-side)
- 📄 PDF generation from template
- 💾 Form submission storage (JSON database)
- 🔒 CORS enabled for cross-origin requests
- 📊 Submissions tracking and retrieval
- 🏥 Health check endpoint

## Prerequisites

- Node.js 14+ installed
- npm or yarn
- PDF template file (`template.pdf`)

## Installation

1. Navigate to the backend directory:
   ```bash
   cd rapidxchange-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. **IMPORTANT**: Place your PDF template in this directory
   - File name: `template.pdf`
   - The PDF should have fillable form fields
   - Field names must match the mapping in `server.js`

## Running the Server

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on **http://localhost:3000**

## API Endpoints

### 1. Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "OK",
  "message": "RapidXchange Backend is running",
  "timestamp": "2026-04-22T10:30:00.000Z"
}
```

### 2. Submit Form (Generate PDF)
```http
POST /api/submit-form
Content-Type: application/json

{
  "saasId": "123456",
  "primaryUser": "neel",
  "companyName": "XYZ Corp",
  "email": "user@example.com",
  "billingEmail": "billing@example.com",
  "billingContactName": "John Doe",
  "billingContactPhone": "5551234567",
  "billingAddress": "123 Main St",
  "billingCity": "New York",
  "billingState": "NY",
  "billingZip": "10001",
  "payableEmail": "payable@example.com",
  "payableContactName": "Jane Doe",
  "payableContactPhone": "5559876543",
  "payableAddress": "456 Oak Ave",
  "payableCity": "Los Angeles",
  "payableState": "CA",
  "payableZip": "90001",
  "taxId": "98-7654321",
  "storeDetails": "Store #1",
  "ein": "123456789",
  "agreeTerms": true,
  "signHere": "John Signature",
  "date": "2026-04-22",
  "paymentMethod": "Credit Card",
  "propaneServiceType": "Delivery",
  "exchangePrice": "2.50",
  "purchasePrice": "3.00",
  "billingCheckbox": true,
  "payableCheckbox": true
}
```

**Success Response (PDF):**
- Status: 200 OK
- Content-Type: application/pdf
- Body: Binary PDF file

**Error Response:**
```json
{
  "success": false,
  "errors": [
    "saasId is required",
    "email must be a valid email"
  ]
}
```

### 3. Get All Submissions
```http
GET /api/submissions
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "submissions": [
    {
      "id": 1713433922000,
      "submittedAt": "2026-04-22T10:32:02.000Z",
      "data": { /* form data */ }
    },
    {
      "id": 1713433923000,
      "submittedAt": "2026-04-22T10:32:03.000Z",
      "data": { /* form data */ }
    }
  ]
}
```

## Data Storage

### Submissions File
- **Location**: `rapidxchange-backend/submissions.json`
- **Format**: JSON array
- **Contains**: All form submissions with timestamp and unique ID

Example structure:
```json
[
  {
    "id": 1713433922000,
    "submittedAt": "2026-04-22T10:32:02.000Z",
    "data": {
      "saasId": "123456",
      "companyName": "XYZ Corp",
      /* ... other form fields ... */
    }
  }
]
```

## Validation Rules

### Required Fields
All these fields must be provided:
- `saasId`, `primaryUser`, `companyName`, `taxId`, `storeDetails`, `ein`, `email`
- `billingEmail`, `billingContactName`, `billingContactPhone`, `billingAddress`, `billingCity`, `billingState`, `billingZip`
- `payableEmail`, `payableContactName`, `payableContactPhone`, `payableAddress`, `payableCity`, `payableState`, `payableZip`
- `signHere`, `date`, `paymentMethod`, `propaneServiceType`, `exchangePrice`, `purchasePrice`

### Format Validation
- **SAASID**: Exactly 6 digits
- **EIN**: Exactly 9 digits
- **Email fields**: Valid email format
- **Terms**: Must agree (`agreeTerms: true`)

## Testing the Backend

### Using curl
```bash
# Health check
curl http://localhost:3000/api/health

# Get submissions
curl http://localhost:3000/api/submissions

# Submit a form (example)
curl -X POST http://localhost:3000/api/submit-form \
  -H "Content-Type: application/json" \
  -d '{
    "saasId": "123456",
    "primaryUser": "neel",
    "companyName": "Test Corp",
    "email": "test@example.com",
    "billingEmail": "billing@example.com",
    "billingContactName": "John Doe",
    "billingContactPhone": "5551234567",
    "billingAddress": "123 Main St",
    "billingCity": "New York",
    "billingState": "NY",
    "billingZip": "10001",
    "payableEmail": "payable@example.com",
    "payableContactName": "Jane Doe",
    "payableContactPhone": "5559876543",
    "payableAddress": "456 Oak Ave",
    "payableCity": "Los Angeles",
    "payableState": "CA",
    "payableZip": "90001",
    "taxId": "98-7654321",
    "storeDetails": "Store #1",
    "ein": "123456789",
    "agreeTerms": true,
    "signHere": "Test Signature",
    "date": "2026-04-22",
    "paymentMethod": "Credit Card",
    "propaneServiceType": "Delivery",
    "exchangePrice": "2.50",
    "purchasePrice": "3.00",
    "billingCheckbox": true,
    "payableCheckbox": true
  }' -o rapidxchange-form.pdf
```

### Using Postman
1. Create a new POST request to `http://localhost:3000/api/submit-form`
2. Set Content-Type header to `application/json`
3. Paste the JSON payload in the body
4. Send the request
5. PDF will be downloaded

## Frontend Integration

The frontend (Angular) sends form data to this backend:

```typescript
// In Angular component
this.http.post('http://localhost:3000/api/submit-form', formData, {
  responseType: 'blob'
}).subscribe({
  next: (pdfBlob: Blob) => {
    // Download PDF
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rapidxchange-form.pdf';
    link.click();
  },
  error: (error) => {
    console.error('Error:', error);
  }
});
```

## Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
# Find the process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or use a different port
# Edit PORT variable in server.js and restart
```

### PDF Template Not Found
- Ensure `template.pdf` is in the `rapidxchange-backend/` directory
- Check file path in error message
- Verify the PDF has fillable form fields

### CORS Issues
- Backend already has CORS enabled for all origins
- If needed, restrict to frontend URL:
  ```javascript
  app.use(cors({
    origin: 'http://localhost:4200'
  }));
  ```

### Form Validation Errors
- Check that all required fields are provided
- Ensure email fields are in valid format (test@example.com)
- Verify SAASID is exactly 6 digits
- Verify EIN is exactly 9 digits

## Architecture

```
Frontend (Angular)
    ↓
Form Validation
    ↓
POST /api/submit-form with formData
    ↓
Backend (Node.js/Express)
    ↓
Server-side Validation
    ↓
Save to submissions.json
    ↓
Load PDF Template
    ↓
Fill PDF Fields with Form Data
    ↓
Return PDF as Binary Response
    ↓
Frontend Downloads PDF
```

## Dependencies

- **express**: Web framework
- **cors**: Enable CORS
- **pdf-lib**: PDF manipulation and form filling
- **nodemon**: Auto-restart during development (dev only)

## License

MIT

## Support

For issues or questions, check the main project documentation or contact the development team.
