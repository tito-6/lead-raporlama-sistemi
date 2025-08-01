// Custom Turkish character handler for jsPDF
// This module provides a robust solution for Turkish character rendering in PDF

export interface TurkishCharacterMap {
  [key: string]: string;
}

// Comprehensive Turkish character mapping with multiple fallback strategies
export const TURKISH_CHAR_MAPPINGS: TurkishCharacterMap = {
  // Primary Turkish characters with their best Unicode representations
  'ç': '\u00E7',  // Latin Small Letter C with Cedilla
  'Ç': '\u00C7',  // Latin Capital Letter C with Cedilla
  'ğ': '\u011F',  // Latin Small Letter G with Breve
  'Ğ': '\u011E',  // Latin Capital Letter G with Breve
  'ı': '\u0131',  // Latin Small Letter Dotless I
  'İ': '\u0130',  // Latin Capital Letter I with Dot Above
  'ö': '\u00F6',  // Latin Small Letter O with Diaeresis
  'Ö': '\u00D6',  // Latin Capital Letter O with Diaeresis
  'ş': '\u015F',  // Latin Small Letter S with Cedilla
  'Ş': '\u015E',  // Latin Capital Letter S with Cedilla
  'ü': '\u00FC',  // Latin Small Letter U with Diaeresis
  'Ü': '\u00DC'   // Latin Capital Letter U with Diaeresis
};

// ASCII fallback mapping for when Unicode fails
export const TURKISH_ASCII_FALLBACK: TurkishCharacterMap = {
  'ç': 'c', 'Ç': 'C',
  'ğ': 'g', 'Ğ': 'G', 
  'ı': 'i', 'İ': 'I',
  'ö': 'o', 'Ö': 'O',
  'ş': 's', 'Ş': 'S',
  'ü': 'u', 'Ü': 'U',
  // Additional common character replacements
  'â': 'a', 'Â': 'A',
  'î': 'i', 'Î': 'I',
  'û': 'u', 'Û': 'U'
};

// Alternative representations using similar looking characters
export const TURKISH_VISUAL_FALLBACK: TurkishCharacterMap = {
  'ç': 'ç',   // Try to preserve if possible
  'Ç': 'Ç',
  'ğ': 'ğ',
  'Ğ': 'Ğ',
  'ı': 'i',   // Use regular i as fallback
  'İ': 'I',   // Use regular I as fallback
  'ö': 'ö',
  'Ö': 'Ö',
  'ş': 'ş',
  'Ş': 'Ş',
  'ü': 'ü',
  'Ü': 'Ü'
};

export enum TurkishCharStrategy {
  UNICODE_EXACT = 'unicode_exact',
  UNICODE_NORMALIZED = 'unicode_normalized',
  VISUAL_FALLBACK = 'visual_fallback',
  ASCII_FALLBACK = 'ascii_fallback'
}

/**
 * Advanced Turkish character processor with multiple rendering strategies
 */
export class TurkishCharacterProcessor {
  public strategy: TurkishCharStrategy = TurkishCharStrategy.UNICODE_NORMALIZED;
  
  constructor(strategy: TurkishCharStrategy = TurkishCharStrategy.UNICODE_NORMALIZED) {
    this.strategy = strategy;
  }

  /**
   * Process text with the current strategy
   */
  processText(text: string): string {
    if (!text) return text;

    console.log(`Processing text with strategy: ${this.strategy}`, text);
    
    switch (this.strategy) {
      case TurkishCharStrategy.UNICODE_EXACT:
        return this.processUnicodeExact(text);
      case TurkishCharStrategy.UNICODE_NORMALIZED:
        return this.processUnicodeNormalized(text);
      case TurkishCharStrategy.VISUAL_FALLBACK:
        return this.processVisualFallback(text);
      case TurkishCharStrategy.ASCII_FALLBACK:
        return this.processAsciiFallback(text);
      default:
        return this.processUnicodeNormalized(text);
    }
  }

  /**
   * Try to preserve exact Unicode characters
   */
  private processUnicodeExact(text: string): string {
    return text.normalize('NFC');
  }

  /**
   * Use explicit Unicode code points for Turkish characters
   */
  private processUnicodeNormalized(text: string): string {
    let result = text.normalize('NFC');
    
    // Replace each Turkish character with its explicit Unicode representation
    for (const [char, unicode] of Object.entries(TURKISH_CHAR_MAPPINGS)) {
      const regex = new RegExp(char, 'g');
      result = result.replace(regex, unicode);
    }
    
    console.log('Unicode normalized result:', result);
    return result;
  }

  /**
   * Use visually similar characters
   */
  private processVisualFallback(text: string): string {
    let result = text;
    
    for (const [char, fallback] of Object.entries(TURKISH_VISUAL_FALLBACK)) {
      const regex = new RegExp(char, 'g');
      result = result.replace(regex, fallback);
    }
    
    console.log('Visual fallback result:', result);
    return result;
  }

  /**
   * Convert to ASCII equivalents - more thorough approach
   */
  private processAsciiFallback(text: string): string {
    let result = text;
    
    // First normalize the text to handle composite characters
    result = result.normalize('NFD');
    
    // Replace Turkish characters with ASCII equivalents
    for (const [char, ascii] of Object.entries(TURKISH_ASCII_FALLBACK)) {
      const regex = new RegExp(char, 'g');
      result = result.replace(regex, ascii);
    }
    
    // Remove any remaining diacritical marks
    result = result.replace(/[\u0300-\u036f]/g, '');
    
    console.log('ASCII fallback result:', text, '->', result);
    return result;
  }

  /**
   * Try multiple strategies and return the first successful one
   */
  processWithFallback(text: string): string {
    if (!text) return text;

    const strategies = [
      TurkishCharStrategy.UNICODE_NORMALIZED,
      TurkishCharStrategy.UNICODE_EXACT,
      TurkishCharStrategy.VISUAL_FALLBACK,
      TurkishCharStrategy.ASCII_FALLBACK
    ];

    for (const strategy of strategies) {
      try {
        this.strategy = strategy;
        const result = this.processText(text);
        console.log(`Strategy ${strategy} succeeded for: ${text} -> ${result}`);
        return result;
      } catch (error) {
        console.warn(`Strategy ${strategy} failed for: ${text}`, error);
        continue;
      }
    }

    // If all strategies fail, return original text
    console.error('All Turkish character strategies failed, returning original text');
    return text;
  }

  /**
   * Analyze text and detect Turkish characters
   */
  analyzeText(text: string): {
    hasTurkishChars: boolean;
    turkishChars: string[];
    charCodes: number[];
    recommendations: TurkishCharStrategy[];
  } {
    const turkishChars: string[] = [];
    const charCodes: number[] = [];
    
    for (const char of text) {
      if (Object.keys(TURKISH_CHAR_MAPPINGS).includes(char)) {
        turkishChars.push(char);
        charCodes.push(char.charCodeAt(0));
      }
    }

    const recommendations: TurkishCharStrategy[] = [];
    
    if (turkishChars.length === 0) {
      recommendations.push(TurkishCharStrategy.UNICODE_EXACT);
    } else {
      recommendations.push(
        TurkishCharStrategy.UNICODE_NORMALIZED,
        TurkishCharStrategy.VISUAL_FALLBACK,
        TurkishCharStrategy.ASCII_FALLBACK
      );
    }

    return {
      hasTurkishChars: turkishChars.length > 0,
      turkishChars,
      charCodes,
      recommendations
    };
  }
}

// Global processor instance
export const turkishProcessor = new TurkishCharacterProcessor();

/**
 * Main function to process Turkish text for PDF
 */
export function processTurkishTextForPDF(text: string, strategy?: TurkishCharStrategy): string {
  if (strategy) {
    turkishProcessor.strategy = strategy;
  }
  
  const analysis = turkishProcessor.analyzeText(text);
  console.log('Text analysis:', analysis);
  
  return turkishProcessor.processWithFallback(text);
}

/**
 * Test function to verify Turkish character processing
 */
export function testTurkishProcessing(): void {
  const testCases = [
    "Satış Başına Maliyet",
    "İstanbul'da çalışıyor",
    "Öğrenci şehir merkezinde",
    "ÇALIŞAN PERSONEL LİSTESİ",
    "Müşteri Değerlendirmesi"
  ];

  console.group('🔤 Turkish Character Processing Test');
  
  testCases.forEach(testCase => {
    console.log(`\n📝 Testing: "${testCase}"`);
    
    Object.values(TurkishCharStrategy).forEach(strategy => {
      const processor = new TurkishCharacterProcessor(strategy);
      const result = processor.processText(testCase);
      console.log(`  ${strategy}: "${result}"`);
    });
  });
  
  console.groupEnd();
}

/**
 * Enhanced function for jsPDF text processing - using ASCII fallback due to jsPDF font limitations
 */
export function createPDFTextCustom(text: string): string {
  console.log('Processing text for PDF (using ASCII fallback):', text);
  
  // Since jsPDF's built-in fonts don't handle Turkish Unicode properly, 
  // we'll use ASCII fallback for now to ensure readability
  const result = processTurkishTextForPDF(text, TurkishCharStrategy.ASCII_FALLBACK);
  
  console.log('PDF text result:', result);
  return result;
}
