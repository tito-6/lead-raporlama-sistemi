import { DOMParser } from '@xmldom/xmldom';

interface ExchangeRate {
  buyingRate: number;
  sellingRate: number;
  lastUpdated: string;
}

interface ExchangeRateCache {
  usdToTry: ExchangeRate;
  lastFetch: Date;
}

class USDExchangeService {
  private cache: ExchangeRateCache | null = null;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

  /**
   * Fetches USD/TRY exchange rate from Turkey's Central Bank (TCMB)
   * Returns cached data if fresh, otherwise fetches new data
   */
  async getUSDToTRYRate(): Promise<ExchangeRate> {
    // Return cached data if it's still fresh
    if (this.cache && this.isCacheValid()) {
      console.log('Returning cached USD/TRY rate');
      return this.cache.usdToTry;
    }

    try {
      console.log('Fetching fresh USD/TRY rate from TCMB...');
      const rate = await this.fetchFromTCMB();
      
      // Update cache
      this.cache = {
        usdToTry: rate,
        lastFetch: new Date()
      };
      
      return rate;
    } catch (error) {
      console.error('Error fetching USD rate from TCMB:', error);
      
      // Return cached data if available, even if stale
      if (this.cache) {
        console.log('Returning stale cached rate due to fetch error');
        return this.cache.usdToTry;
      }
      
      // Fallback rate if no cache available
      console.log('Using fallback USD rate');
      return {
        buyingRate: 34.50, // Approximate fallback rate
        sellingRate: 34.70,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Converts Turkish Lira to USD using current exchange rate
   */
  async convertTLToUSD(tlAmount: number): Promise<number> {
    const rate = await this.getUSDToTRYRate();
    // Use selling rate (bank sells USD for TL) for TL to USD conversion
    return tlAmount / rate.sellingRate;
  }

  /**
   * Gets current USD/TRY rate as a simple number for display
   */
  async getCurrentRate(): Promise<number> {
    const rate = await this.getUSDToTRYRate();
    return rate.sellingRate;
  }

  private isCacheValid(): boolean {
    if (!this.cache) return false;
    const now = new Date();
    const timeDiff = now.getTime() - this.cache.lastFetch.getTime();
    return timeDiff < this.CACHE_DURATION;
  }

  private async fetchFromTCMB(): Promise<ExchangeRate> {
    // Try multiple TCMB endpoint strategies
    const urls = [
      // Current date XML
      this.getCurrentDateUrl(),
      // Yesterday XML  
      this.getYesterdayUrl(),
      // Alternative TCMB endpoint with HTTPS
      'https://www.tcmb.gov.tr/kurlar/today.xml',
      // TCMB main endpoint
      'https://www.tcmb.gov.tr/kurlar/kurlar.xml'
    ];
    
    for (const url of urls) {
      try {
        console.log(`Trying TCMB URL: ${url}`);
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (!response.ok) {
          console.log(`TCMB URL ${url} returned ${response.status}`);
          continue;
        }
        
        const xmlText = await response.text();
        if (xmlText.includes('Currency') || xmlText.includes('Tarih_Date')) {
          return this.parseXMLResponse(xmlText);
        }
      } catch (error) {
        console.log(`Error with TCMB URL ${url}:`, error);
        continue;
      }
    }
    
    // Try alternative rate source as fallback
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (response.ok) {
        const data = await response.json();
        const rate = data.rates?.TRY || 34.5;
        return {
          buyingRate: rate * 0.995,
          sellingRate: rate * 1.005,
          lastUpdated: new Date().toISOString()
        };
      }
    } catch (error) {
      console.log('Alternative exchange API failed:', error);
    }
    
    throw new Error('Failed to fetch from TCMB: All endpoints returned errors');
  }

  private getCurrentDateUrl(): string {
    const now = new Date();
    return this.formatDateUrl(now);
  }

  private getYesterdayUrl(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.formatDateUrl(yesterday);
  }

  private formatDateUrl(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    const yearMonth = date.getFullYear().toString().slice(-2) + month;
    
    // Use HTTPS for TCMB URLs
    return `https://www.tcmb.gov.tr/kurlar/${yearMonth}/${day}${month}${year}.xml`;
  }

  private parseXMLResponse(xmlText: string): ExchangeRate {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      // Look for USD currency
      const currencies = xmlDoc.getElementsByTagName('Currency');
      
      for (let i = 0; i < currencies.length; i++) {
        const currency = currencies[i];
        const code = currency.getAttribute('Kod') || currency.getAttribute('CurrencyCode');
        
        if (code === 'USD') {
          const forexBuying = currency.getElementsByTagName('ForexBuying')[0]?.textContent;
          const forexSelling = currency.getElementsByTagName('ForexSelling')[0]?.textContent;
          
          if (forexBuying && forexSelling) {
            return {
              buyingRate: parseFloat(forexBuying),
              sellingRate: parseFloat(forexSelling),
              lastUpdated: new Date().toISOString()
            };
          }
        }
      }
      
      throw new Error('USD rate not found in XML response');
    } catch (error) {
      throw new Error(`Failed to parse TCMB XML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const usdExchangeService = new USDExchangeService();