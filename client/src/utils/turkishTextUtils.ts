// Türkçe karakterleri ASCII karşılıklarına dönüştüren harita
export const turkishCharMap: { [key: string]: string } = {
  'ç': 'c',
  'Ç': 'C',
  'ğ': 'g',
  'Ğ': 'G',
  'ı': 'i',
  'İ': 'I',
  'ö': 'o',
  'Ö': 'O',
  'ş': 's',
  'Ş': 'S',
  'ü': 'u',
  'Ü': 'U',
};

// Türkçe karakterleri PDF export’te uyumlu hale getirmek için dönüştürür
export function convertTurkishText(text: string): string {
  if (!text) return text;

  return text
    .split('')
    .map((char) => turkishCharMap[char] || char)
    .join('');
}

// PDF içeriğinde Türkçe karakterlerin görünmesini korumak için normalize eder
export function preserveTurkishText(text: string): string {
  if (!text) return text;

  // First normalize the text and ensure we're working with proper Unicode
  let result = text.normalize('NFC');
  
  // Log the original text for debugging
  console.log('preserveTurkishText input:', text);
  console.log('preserveTurkishText chars:', text.split('').map(c => `${c} (${c.charCodeAt(0)})`));
  
  // Apply specific character mappings for jsPDF compatibility
  // These replacements ensure characters render correctly in PDF
  result = result
    .replace(/ç/g, 'ç')   // Ensure proper encoding
    .replace(/Ç/g, 'Ç')   
    .replace(/ğ/g, 'ğ')   
    .replace(/Ğ/g, 'Ğ')   
    .replace(/ı/g, 'ı')   
    .replace(/İ/g, 'İ')   
    .replace(/ö/g, 'ö')   
    .replace(/Ö/g, 'Ö')   
    .replace(/ş/g, 'ş')   
    .replace(/Ş/g, 'Ş')   
    .replace(/ü/g, 'ü')   
    .replace(/Ü/g, 'Ü');
  
  console.log('preserveTurkishText output:', result);
  return result;
}

// Bir metinde Türkçe karakter olup olmadığını kontrol eder
export function containsTurkishChars(text: string): boolean {
  return /[çğıöşüÇĞİÖŞÜ]/.test(text);
}

// Objeleri (string içerikler dahil) normalize etmek için yardımcı fonksiyon
export const normalizeDataForPDF = (data: any): any => {
  if (typeof data === 'string') return preserveTurkishText(data);

  if (Array.isArray(data)) {
    return data.map(normalizeDataForPDF);
  }

  if (data && typeof data === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = normalizeDataForPDF(value);
    }
    return result;
  }

  return data;
};

// Enhanced function to handle Turkish characters in PDF with fallback
export function createPDFText(text: string): string {
  if (!text) return text;
  
  console.log('createPDFText input:', text);
  
  // Use proper Unicode normalization
  let result = text.normalize('NFC');
  
  // Ensure all Turkish characters are in their standard Unicode form
  result = result
    .replace(/ç/g, '\u00E7')  // ç
    .replace(/Ç/g, '\u00C7')  // Ç
    .replace(/ğ/g, '\u011F')  // ğ
    .replace(/Ğ/g, '\u011E')  // Ğ
    .replace(/ı/g, '\u0131')  // ı
    .replace(/İ/g, '\u0130')  // İ
    .replace(/ö/g, '\u00F6')  // ö
    .replace(/Ö/g, '\u00D6')  // Ö
    .replace(/ş/g, '\u015F')  // ş
    .replace(/Ş/g, '\u015E')  // Ş
    .replace(/ü/g, '\u00FC')  // ü
    .replace(/Ü/g, '\u00DC'); // Ü
  
  console.log('createPDFText output (Unicode proper):', result);
  console.log('Character codes:', result.split('').map(c => `${c}(${c.charCodeAt(0)})`));
  
  return result;
}

// PDF için Türkçe karakterleri normalize etmek için kullanılır
export function normalizeTurkishText(text: string): string {
  return preserveTurkishText(text);
}

// Test fonksiyonu - veri normalizasyonunu kontrol etmek için
export const testDataNormalization = (data: any, label: string = 'Data'): any => {
  const normalized = normalizeDataForPDF(data);
  console.log(`${label} - Original:`, JSON.stringify(data, null, 2));
  console.log(`${label} - Normalized:`, JSON.stringify(normalized, null, 2));
  return normalized;
};

// Türkçe karakter testi
export function testTurkishCharacters(): void {
  const testText = "Çalışanlar şirket için öğüt alıyor. ŞEHİR İÇİNDE GÖREV YAPTI.";
  console.log("Orijinal:", testText);
  console.log("convertTurkishText:", convertTurkishText(testText));
  console.log("preserveTurkishText:", preserveTurkishText(testText));
  
  // Test specific problematic characters
  const problemChars = "ç Ç ğ Ğ ı İ ö Ö ş Ş ü Ü";
  console.log("Problem chars:", problemChars);
  console.log("Problem chars preserved:", preserveTurkishText(problemChars));
}

// Function to extract text exactly as it appears in the DOM
export function extractWebpageText(element: HTMLElement): string {
  if (!element) return '';
  
  // Get the actual text content as it appears in the browser
  const text = element.textContent || element.innerText || '';
  console.log('Extracted webpage text:', text);
  console.log('Extracted chars:', text.split('').map(c => `${c} (${c.charCodeAt(0)})`));
  
  return preserveTurkishText(text);
}
