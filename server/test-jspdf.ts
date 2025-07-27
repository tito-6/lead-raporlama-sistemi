import { generateReportPDFWithJsPDF } from './pdfReportJsPDF';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test data
const testData = {
  projectName: 'Test Project',
  salesRep: 'Test Sales Rep',
  dateRange: '2024-01-01 - 2024-12-31',
  leadType: 'satis',
  status: [
    { name: 'Aktif', count: 25, percent: '50%' },
    { name: 'Bitti', count: 15, percent: '30%' },
    { name: 'İptal', count: 10, percent: '20%' }
  ],
  projects: [
    { name: 'Proje A', count: 20, percent: '40%' },
    { name: 'Proje B', count: 30, percent: '60%' }
  ],
  personnel: [
    { name: 'Ahmet Yılmaz', count: 25, percent: '50%' },
    { name: 'Ayşe Demir', count: 25, percent: '50%' }
  ]
};

function testJsPDFGeneration() {
  console.log('Starting jsPDF generation test...');
  
  try {
    const pdfBuffer = generateReportPDFWithJsPDF(testData);
    console.log('jsPDF generation successful!');
    console.log('Buffer size:', pdfBuffer.length, 'bytes');
    
    // Save to file for testing
    const outputPath = path.join(__dirname, '../test-jspdf-output.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log('PDF saved to:', outputPath);
    
    // Basic validation
    if (pdfBuffer.length < 1000) {
      console.warn('Warning: PDF buffer seems suspiciously small');
    }
    
    // Check if it starts with PDF header
    const pdfHeader = pdfBuffer.toString('ascii', 0, 4);
    if (pdfHeader === '%PDF') {
      console.log('✓ PDF header is correct');
    } else {
      console.error('✗ PDF header is incorrect:', pdfHeader);
    }
    
    console.log('✓ jsPDF test completed successfully');
    
  } catch (error) {
    console.error('jsPDF generation failed:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    process.exit(1);
  }
}

// Run the test
testJsPDFGeneration();
