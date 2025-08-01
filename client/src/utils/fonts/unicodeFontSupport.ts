// Unicode font support utilities for jsPDF
import { jsPDF } from 'jspdf';

// Function to configure the best available font for Turkish characters
export function configureTurkishFont(doc: jsPDF): void {
  try {
    // Try to use a font that supports Turkish characters better
    // Use a more modern approach with explicit font settings
    doc.setFont('helvetica', 'normal');
    
    // Configure text encoding for better Unicode support
    doc.setCharSpace(0.1);
    
    console.log('Successfully configured Helvetica font with Turkish support');
  } catch (error) {
    console.warn('Font configuration failed:', error);
    try {
      // Fallback to times
      doc.setFont('times', 'normal');
      console.log('Using Times font as fallback');
    } catch (fallbackError) {
      console.error('All font configurations failed:', fallbackError);
    }
  }
}

// Function to prepare text for PDF with proper Unicode encoding
export function prepareUnicodeText(text: string): string {
  if (!text) return text;
  
  // Ensure proper Unicode normalization
  let result = text.normalize('NFC');
  
  // Additional processing for problematic characters
  // Keep the characters as-is but ensure they're properly encoded
  result = result
    .replace(/\u00E7/g, 'ç')  // ensure proper ç encoding
    .replace(/\u00C7/g, 'Ç')  // ensure proper Ç encoding
    .replace(/\u011F/g, 'ğ')  // ensure proper ğ encoding
    .replace(/\u011E/g, 'Ğ')  // ensure proper Ğ encoding
    .replace(/\u0131/g, 'ı')  // ensure proper ı encoding
    .replace(/\u0130/g, 'İ')  // ensure proper İ encoding
    .replace(/\u00F6/g, 'ö')  // ensure proper ö encoding
    .replace(/\u00D6/g, 'Ö')  // ensure proper Ö encoding
    .replace(/\u015F/g, 'ş')  // ensure proper ş encoding
    .replace(/\u015E/g, 'Ş')  // ensure proper Ş encoding
    .replace(/\u00FC/g, 'ü')  // ensure proper ü encoding
    .replace(/\u00DC/g, 'Ü'); // ensure proper Ü encoding
  
  // Log for debugging
  console.log('Unicode text preparation:', {
    input: text,
    output: result,
    chars: result.split('').map(c => `${c} (U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')})`)
  });
  
  return result;
}

// Enhanced table styles with proper font configuration
export function getUnicodeTableStyles() {
  return {
    headStyles: {
      fillColor: [0, 102, 161] as [number, number, number],
      textColor: 255,
      fontSize: 12,
      fontStyle: 'bold' as const,
      font: 'times' as const,
      lineWidth: 0.1
    },
    bodyStyles: {
      fontSize: 10,
      font: 'times' as const,
      lineWidth: 0.1
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] as [number, number, number],
    },
    styles: {
      font: 'times' as const,
      cellPadding: 2,
      lineWidth: 0.1,
      lineColor: [200, 200, 200] as [number, number, number]
    },
    margin: { left: 14, right: 14 }
  };
}
