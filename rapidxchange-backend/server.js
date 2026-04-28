const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rapidxchange_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test MySQL connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') console.error('Database connection was closed.');
    if (err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') console.error('Fatal error encountered prior to connection.');
    if (err.code === 'PROTOCOL_ENQUEUE_AFTER_PARSER_DESTROYED') console.error('Protocol parser was destroyed.');
  } else if (connection) {
    console.log('✅ MySQL connection pool established');
    connection.release();
  }
});

// MySQL Error Handler
pool.on('error', (err) => {
  console.error('❌ Unexpected MySQL error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Connection lost to database. Reconnecting...');
  }
  if (err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
    console.log('🔄 Fatal error encountered. Trying to reconnect...');
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// PDF Field Mapping - coordinates define where each field is positioned on the PDF template
// Field names MUST match the database column names exactly
const PRODUCTION_PDF_FIELD_MAPPING = {
  saasId: { x: 99, y: 582 },
  companyName: { x: 145, y: 568 },
  storeDetails: { x: 74, y: 545 },
  ein: { x: 104, y: 520 },
  taxId: { x: 433, y: 520 },
  storeAddress: { x: 140, y: 498 },
  storeContactName: { x: 410, y: 499 },
  storePhone: { x: 363, y: 480 },
  email: { x: 393, y: 454 },
  storeCity: { x: 63, y: 454 },
  storeState: { x: 186, y: 454 },
  storeZip: { x: 259, y: 454 },
  payableContactName: { x: 451, y: 426 },
  billingEmail: { x: 182, y: 407 },
  billingAddress: { x: 140, y: 390 },
  billingContactPhone: { x: 363, y: 389 },
  payableEmail: { x: 393, y: 372 },
  billingCity: { x: 63, y: 354 },
  billingState: { x: 188, y: 354 },
  billingZip: { x: 256, y: 354 },
  propaneServiceType: { x: 344, y: 354 },
  exchangePrice: { x: 308, y: 252 },
  purchasePrice: { x: 393, y: 252 },
  paymentMethod: { x: 560, y: 160 }
};

// Validation function
function validateFormData(data) {
  const errors = [];

  // Required fields
  const requiredFields = [
    'saasId', 'primaryUser', 'companyName', 'taxId', 'storeDetails', 'ein', 'email',
    'storeContactName', 'storePhone', 'storeAddress', 'storeCity', 'storeState', 'storeZip',
    'billingEmail', 'billingContactName', 'billingContactPhone', 'billingAddress', 'billingCity', 'billingState', 'billingZip',
    'payableEmail', 'payableContactName', 'payableContactPhone', 'payableAddress', 'payableCity', 'payableState', 'payableZip',
    'signHere', 'date', 'paymentMethod', 'propaneServiceType', 'exchangePrice', 'purchasePrice'
  ];

  requiredFields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      errors.push(`${field} is required`);
    }
  });

  // Email validation
  const emailFields = ['email', 'billingEmail', 'payableEmail'];
  emailFields.forEach(field => {
    if (data[field] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[field])) {
      errors.push(`${field} must be a valid email`);
    }
  });

  // Numeric validations
  if (data.saasId && (!/^\d+$/.test(data.saasId) || data.saasId.length !== 6)) {
    errors.push('saasId must be exactly 6 digits');
  }

  if (data.ein && (!/^\d+$/.test(data.ein) || data.ein.length !== 9)) {
    errors.push('ein must be exactly 9 digits');
  }

  // Terms agreement
  if (!data.agreeTerms) {
    errors.push('You must agree to the terms and conditions');
  }

  return errors;
}

// Save data to MySQL database
function saveFormData(data) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO submissions (
      saasId, primaryUser, companyName, taxId, storeDetails, ein, email,
      storeContactName, storePhone, storeAddress, storeCity, storeState, storeZip,
      billingEmail, billingContactName, billingContactPhone, billingAddress,
      billingCity, billingState, billingZip, payableUser, payableEmail, payableContactName,
      payableContactPhone, payableAddress, payableCity, payableState, payableZip,
      agreeTerms, signHere, date, paymentMethod, propaneServiceType,
      exchangePrice, purchasePrice, billingCheckbox, payableCheckbox
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      data.saasId, data.primaryUser, data.companyName, data.taxId, data.storeDetails,
      data.ein, data.email, data.storeContactName, data.storePhone, data.storeAddress,
      data.storeCity, data.storeState, data.storeZip, data.billingEmail, data.billingContactName,
      data.billingContactPhone, data.billingAddress, data.billingCity, data.billingState,
      data.billingZip, data.payableUser, data.payableEmail, data.payableContactName, data.payableContactPhone,
      data.payableAddress, data.payableCity, data.payableState, data.payableZip,
      data.agreeTerms, data.signHere, data.date, data.paymentMethod, data.propaneServiceType,
      data.exchangePrice, data.purchasePrice, data.billingCheckbox, data.payableCheckbox
    ];

    pool.execute(sql, values, (err, results) => {
      if (err) {
        console.error('❌ Error saving to MySQL:', err);
        reject(err);
      } else {
        console.log('💾 Form data saved to MySQL, Submission ID:', results.insertId);
        resolve(results.insertId);
      }
    });
  });
}

// Generate PDF with text overlay
async function generatePDF(formData) {
  // Load the PDF template
  const templatePath = path.join(__dirname, 'template.pdf');
  
  if (!fs.existsSync(templatePath)) {
    throw new Error('PDF template not found. Please place template.pdf in the backend directory.');
  }

  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);

  // Get the pages
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // Draw text elements on the first page
  Object.entries(PRODUCTION_PDF_FIELD_MAPPING).forEach(([fieldName, coords]) => {
    const value = formData[fieldName];
    if (value) {
      try {
        firstPage.drawText(String(value), {
          x: coords.x,
          y: coords.y,
          size: 11,
          color: rgb(0, 0, 0),
        });
      } catch (err) {
        console.warn(`⚠️ Error drawing field ${fieldName}:`, err.message);
      }
    }
  });

  // Tick mark checkboxes logic for payment method
  if (formData.paymentMethod) {
    const method = String(formData.paymentMethod).toLowerCase();
    const tickMark = '✓';
    
    if (method.includes('pod')) {
      firstPage.drawText(tickMark, { x: 323, y: 213, size: 14 });
    }
    if (method.includes('bank-draft') || method.includes('bank draft')) {
      firstPage.drawText(tickMark, { x: 458, y: 194, size: 14 });
    }
    if (method.includes('credit-card') || method.includes('credit card')) {
      firstPage.drawText(tickMark, { x: 95, y: 175, size: 14 });
    }
    if (method.includes('credit (')) {
      firstPage.drawText(tickMark, { x: 84, y: 161, size: 14 });
    }
  }

  // Signature and Date on the last page
  const lastPage = pages[pages.length - 1];
  if (formData.signHere) {
    lastPage.drawText(String(formData.signHere), { x: 68.49, y: 75.55, size: 11, color: rgb(0, 0, 0) });
  }
  if (formData.date) {
    lastPage.drawText(String(formData.date), { x: 116.22, y: 75.55, size: 11, color: rgb(0, 0, 0) });
  }

  return await pdfDoc.save();
}

// Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Health check failed - Database connection error');
      return res.status(503).json({
        status: 'ERROR',
        message: 'Database connection failed',
        database: 'disconnected',
        timestamp: new Date().toISOString()
      });
    }

    connection.query('SELECT 1', (err) => {
      connection.release();
      if (err) {
        console.error('❌ Health check failed - Database query error:', err);
        return res.status(503).json({
          status: 'ERROR',
          message: 'Database query failed',
          database: 'error',
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        status: 'OK',
        message: 'RapidXchange Backend is running',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    });
  });
});

// Submit form endpoint
app.post('/api/submit-form', async (req, res) => {
  try {
    const formData = req.body;

    console.log('\n📨 Form submission received at:', new Date().toISOString());
    console.log('Store Information:', {
      saasId: formData.saasId,
      companyName: formData.companyName,
      email: formData.email
    });

    // 1. Validate form data
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
      console.log('❌ Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }

    console.log('✅ Form validation passed');

    // 2. Save to MySQL database
    console.log('💾 Saving to MySQL...');
    const submissionId = await saveFormData(formData);
    console.log('✅ Data saved to MySQL with ID:', submissionId);

    // 3. Generate PDF (store in memory or temp file for later download)
    console.log('📄 Generating PDF...');
    const pdfBytes = await generatePDF(formData);
    console.log('✅ PDF generated successfully');

    // Return JSON response with submission ID
    res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
      submissionId: submissionId,
      pdfReady: true
    });

    console.log('✅ JSON response sent to client');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error processing form:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Download PDF by submission ID
app.get('/api/download-pdf/:id', async (req, res) => {
  try {
    const submissionId = req.params.id;

    console.log(`\n📄 PDF download request for submission ID: ${submissionId}`);

    // Fetch submission data from database
    const sql = 'SELECT * FROM submissions WHERE id = ?';
    pool.execute(sql, [submissionId], async (err, results) => {
      if (err) {
        console.error('❌ Error fetching submission:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch submission data'
        });
      }

      if (results.length === 0) {
        console.error('❌ Submission not found:', submissionId);
        return res.status(404).json({
          success: false,
          error: 'Submission not found'
        });
      }

      try {
        const submission = results[0];
        console.log('✅ Submission data retrieved');

        // Regenerate PDF from submission data
        console.log('📄 Regenerating PDF...');
        const pdfBytes = await generatePDF(submission);
        console.log('✅ PDF generated successfully');

        // Send PDF as response - open in browser instead of downloading
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', pdfBytes.length);
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.send(Buffer.from(pdfBytes));

        console.log('📥 PDF sent to client');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      } catch (pdfError) {
        console.error('❌ Error generating PDF:', pdfError.message);
        res.status(500).json({
          success: false,
          error: 'Failed to generate PDF'
        });
      }
    });
  } catch (error) {
    console.error('❌ Error processing PDF download:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Get submissions endpoint
app.get('/api/submissions', (req, res) => {
  const sql = 'SELECT * FROM submissions ORDER BY submittedAt DESC';

  pool.execute(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching submissions from MySQL:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch submissions from database'
      });
    }

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  });
});

// Start server with port conflict handling
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   RapidXchange Backend Server Running      ║
║   URL: http://localhost:${PORT}              ║
║   Health: http://localhost:${PORT}/api/health   ║
║   Database: MySQL (${process.env.DB_NAME})       ║
╚════════════════════════════════════════════╝
  `);
});

// Handle port conflict errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = parseInt(PORT) + 1;
    console.error(`❌ Port ${PORT} is already in use!`);
    console.log(`\n🔄 Attempting to use port ${nextPort} instead...`);
    console.log(`\nTo free up port ${PORT}, run:`);
    console.log(`  Windows: Get-Process node | Stop-Process -Force`);
    console.log(`  Linux/Mac: killall node`);
    console.log(`\nThen try starting the server again.\n`);
    
    // Try the next port
    const retryServer = app.listen(nextPort, () => {
      console.log(`
╔════════════════════════════════════════════╗
║   RapidXchange Backend Server Running      ║
║   URL: http://localhost:${nextPort}             ║
║   Health: http://localhost:${nextPort}/api/health  ║
║   Database: MySQL (${process.env.DB_NAME})        ║
╚════════════════════════════════════════════╝
      `);
    });
    
    retryServer.on('error', (retryErr) => {
      if (retryErr.code === 'EADDRINUSE') {
        console.error(`❌ Ports ${PORT} and ${nextPort} are both in use!`);
        console.error('Please kill the Node.js process and try again.');
        process.exit(1);
      }
    });
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📴 Shutting down gracefully...');
  pool.end((err) => {
    if (err) console.error('❌ Error closing pool:', err);
    console.log('✅ Database pool closed');
    process.exit(0);
  });
});
