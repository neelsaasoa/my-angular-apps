const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rapidxchange_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
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

// PDF Field Mapping
const PRODUCTION_PDF_FIELD_MAPPING = {
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
  primaryUserZip: { x: 283.38, y: 454.69 },
  email: { x: 383.96, y: 480.91 },
  payableContactName: { x: 383.96, y: 437.33 },
  payableEmail: { x: 383.96, y: 419.84 },
  billingAddress: { x: 83.79, y: 396.63 },
  billingContactPhone: { x: 343.16, y: 379.14 },
  billingEmail: { x: 383.96, y: 379.14 },
  billingCity: { x: 47.36, y: 352.19 },
  billingState: { x: 182.87, y: 352.92 },
  billingZip: { x: 283.38, y: 352.92 },
  exchangePrice: { x: 413.1, y: 330.61 },
  purchasePrice: { x: 413.1, y: 307.3 },
  serviceTypeLabel: { x: 53.19, y: 284.99 },
  paymentMethodLabel: { x: 53.19, y: 261.68 },
  signHere: { x: 383.96, y: 239.37 },
  date: { x: 383.96, y: 216.06 }
};

// Validation function
function validateFormData(data) {
  const errors = [];

  // Required fields
  const requiredFields = [
    'saasId', 'primaryUser', 'companyName', 'taxId', 'storeDetails', 'ein', 'email',
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
      billingEmail, billingContactName, billingContactPhone, billingAddress,
      billingCity, billingState, billingZip, payableEmail, payableContactName,
      payableContactPhone, payableAddress, payableCity, payableState, payableZip,
      agreeTerms, signHere, date, paymentMethod, propaneServiceType,
      exchangePrice, purchasePrice, billingCheckbox, payableCheckbox
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      data.saasId, data.primaryUser, data.companyName, data.taxId, data.storeDetails,
      data.ein, data.email, data.billingEmail, data.billingContactName,
      data.billingContactPhone, data.billingAddress, data.billingCity, data.billingState,
      data.billingZip, data.payableEmail, data.payableContactName, data.payableContactPhone,
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

  // Get the first page
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { height, width } = firstPage.getSize();

  console.log(`📏 PDF Page Size: ${width}x${height}`);

  // Text positioning data with form values
  const textData = [
    { value: formData.saasId, x: 88.16, y: 591.65 },
    { value: formData.companyName, x: 120.94, y: 568.34 },
    { value: formData.storeDetails, x: 53.19, y: 544.3 },
    { value: formData.ein, x: 85.97, y: 520.26 },
    { value: formData.taxId, x: 413.1, y: 518.8 },
    { value: formData.payableAddress, x: 83.79, y: 499.13 },
    { value: formData.payableContactName, x: 383.96, y: 498.4 },
    { value: formData.payableContactPhone, x: 343.16, y: 480.91 },
    { value: formData.payableCity, x: 47.36, y: 453.96 },
    { value: formData.payableState, x: 182.87, y: 454.69 },
    { value: formData.payableZip, x: 283.38, y: 454.69 },
    { value: formData.email, x: 383.96, y: 480.91 },
    { value: formData.payableContactName, x: 383.96, y: 437.33 },
    { value: formData.payableEmail, x: 383.96, y: 419.84 },
    { value: formData.billingAddress, x: 83.79, y: 396.63 },
    { value: formData.billingContactPhone, x: 343.16, y: 379.14 },
    { value: formData.billingEmail, x: 383.96, y: 379.14 },
    { value: formData.billingCity, x: 47.36, y: 352.19 },
    { value: formData.billingState, x: 182.87, y: 352.92 },
    { value: formData.billingZip, x: 283.38, y: 352.92 },
    { value: formData.exchangePrice, x: 413.1, y: 330.61 },
    { value: formData.purchasePrice, x: 413.1, y: 307.3 },
    { value: formData.propaneServiceType, x: 53.19, y: 284.99 },
    { value: formData.paymentMethod, x: 53.19, y: 261.68 },
    { value: formData.signHere, x: 383.96, y: 239.37 },
    { value: formData.date, x: 383.96, y: 216.06 }
  ];

  // Draw text on the PDF at specified coordinates
  textData.forEach(item => {
    if (item.value) {
      try {
        const textValue = String(item.value).substring(0, 50); // Limit text length
        firstPage.drawText(textValue, {
          x: item.x,
          y: item.y,
          size: 10,
          color: rgb(0, 0, 0),
          maxWidth: 200,
          lineHeight: 14
        });
      } catch (err) {
        console.warn(`⚠️ Error drawing text at position (${item.x}, ${item.y}):`, err.message);
      }
    }
  });

  console.log('✅ All form data drawn on PDF');

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

        // Send PDF as response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="rapidxchange-form-${submissionId}.pdf"`);
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
      submissions: results
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
