const mysql = require('mysql2');
require('dotenv').config();

// Create connection to MySQL server (without selecting database)
const connection = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
  connectTimeout: 15000
});

console.log('🔄 Attempting to connect to MySQL...');
console.log(`   Host: ${connection.config.host}`);
console.log(`   User: ${connection.config.user}`);
console.log(`   Port: ${connection.config.port}`);
console.log(`   Connection timeout: 15000ms`);

connection.on('error', (err) => {
  console.error('❌ Connection error:', err.code, '-', err.message);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') console.error('Connection was closed.');
  if (err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') console.error('Fatal error encountered.');
  if (err.code === 'ECONNREFUSED') console.error('Connection refused - MySQL may not be running.');
  process.exit(1);
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Failed to connect to MySQL:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL server');

  // Create database
  connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`, (err) => {
    if (err) {
      console.error('❌ Failed to create database:', err.message);
      process.exit(1);
    }
    console.log(`✅ Database '${process.env.DB_NAME}' ready`);

    // Switch to the new database
    connection.query(`USE ${process.env.DB_NAME}`, (err) => {
      if (err) {
        console.error('❌ Failed to use database:', err.message);
        process.exit(1);
      }

      // Drop existing table if it exists (to ensure fresh schema)
      connection.query(`DROP TABLE IF EXISTS submissions`, (err) => {
        if (err) {
          console.error('❌ Failed to drop existing table:', err.message);
          process.exit(1);
        }

        // Create submissions table with new schema
        const createTableSQL = `
        CREATE TABLE IF NOT EXISTS submissions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          saasId VARCHAR(6) NOT NULL,
          primaryUser VARCHAR(50) NOT NULL,
          companyName VARCHAR(255) NOT NULL,
          taxId VARCHAR(20),
          storeDetails TEXT,
          ein VARCHAR(9) NOT NULL,
          email VARCHAR(255) NOT NULL,
          storeContactName VARCHAR(255) NOT NULL,
          storePhone VARCHAR(20) NOT NULL,
          storeAddress TEXT NOT NULL,
          storeCity VARCHAR(100) NOT NULL,
          storeState VARCHAR(50) NOT NULL,
          storeZip VARCHAR(10) NOT NULL,
          billingEmail VARCHAR(255) NOT NULL,
          billingContactName VARCHAR(255) NOT NULL,
          billingContactPhone VARCHAR(20) NOT NULL,
          billingAddress TEXT NOT NULL,
          billingCity VARCHAR(100) NOT NULL,
          billingState VARCHAR(50) NOT NULL,
          billingZip VARCHAR(10) NOT NULL,
          payableUser VARCHAR(50),
          payableEmail VARCHAR(255) NOT NULL,
          payableContactName VARCHAR(255) NOT NULL,
          payableContactPhone VARCHAR(20) NOT NULL,
          payableAddress TEXT NOT NULL,
          payableCity VARCHAR(100) NOT NULL,
          payableState VARCHAR(50) NOT NULL,
          payableZip VARCHAR(10) NOT NULL,
          agreeTerms BOOLEAN NOT NULL DEFAULT TRUE,
          signHere TEXT NOT NULL,
          date DATE NOT NULL,
          paymentMethod VARCHAR(50) NOT NULL,
          propaneServiceType VARCHAR(100) NOT NULL,
          exchangePrice DECIMAL(10,2) NOT NULL,
          purchasePrice DECIMAL(10,2) NOT NULL,
          billingCheckbox BOOLEAN DEFAULT TRUE,
          payableCheckbox BOOLEAN DEFAULT TRUE,
          submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_saasId (saasId),
          INDEX idx_email (email),
          INDEX idx_submittedAt (submittedAt)
        )
      `;

        connection.query(createTableSQL, (err) => {
          if (err) {
            console.error('❌ Failed to create table:', err.message);
            process.exit(1);
          }
          console.log('✅ Table "submissions" created successfully');
          console.log('\n🎉 Database initialization complete!');
          connection.end();
          process.exit(0);
        });
      });
    });
  });
});
