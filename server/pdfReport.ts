import path from 'path';
import fs from 'fs';
import puppeteer, { Browser } from 'puppeteer';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generateReportPDFWithJsPDF } from './pdfReportJsPDF';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper to generate the report HTML without JSX compilation
export function renderReportHTML(props: any) {
  console.log('Starting HTML render with props:', JSON.stringify(props, null, 2));
  
  try {
    // Create a simple HTML structure instead of using JSX
    const htmlContent = createReportHTML(props);
    console.log('HTML content generated successfully, length:', htmlContent.length);
    return htmlContent;
  } catch (error) {
    console.error('Error in renderReportHTML:', error);
    throw error;
  }
}

// Create HTML manually to avoid JSX compilation issues
function createReportHTML(props: any) {
  const {
    projectName = 'Tümü',
    salesRep = 'Tümü',
    dateRange = '- - -',
    leadType,
    status = [],
    projects = [],
    personnel = [],
  } = props;

  const createTableRows = (data: any[]) => {
    if (!data || data.length === 0) {
      return '<tr><td colspan="3" class="no-data">Veri bulunamadı</td></tr>';
    }
    
    return data.map((row, i) => {
      const name = (row.name || '').toString();
      const count = (row.count || 0).toString();
      const percent = (row.percent || '0%').toString();
      
      return `
        <tr ${i % 2 === 0 ? 'style="background: #f9fafb;"' : ''}>
          <td>${name}</td>
          <td>${count}</td>
          <td>${percent}</td>
        </tr>
      `;
    }).join('');
  };

  return `
    <!DOCTYPE html>
    <html lang="tr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Leads Statistics Report</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 40px;
            color: #1a1a1a;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .header {
            display: flex;
            align-items: center;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 2px solid #e5e7eb;
          }
          .logo { 
            width: 140px;
            height: auto;
            margin-right: 24px;
          }
          .title-section {
            flex: 1;
          }
          .meta { 
            margin-bottom: 32px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #0066A1;
          }
          .meta-row {
            display: flex;
            flex-wrap: wrap;
            gap: 24px;
            margin-bottom: 8px;
          }
          .meta-item {
            font-size: 14px;
            color: #374151;
            font-weight: 500;
          }
          .meta-value {
            color: #111827;
            font-weight: 600;
          }
          h1 { 
            color: #0066A1; 
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.025em;
          }
          .subtitle {
            color: #6b7280;
            font-size: 16px;
            font-weight: 400;
          }
          .section-header {
            font-size: 20px;
            font-weight: 600;
            margin: 40px 0 16px 0;
            color: #0066A1;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0 32px 0;
            font-size: 14px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          th {
            background: #0066A1;
            color: white;
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            letter-spacing: 0.025em;
          }
          td {
            padding: 12px 16px;
            border-bottom: 1px solid #f3f4f6;
          }
          tr:last-child td {
            border-bottom: none;
          }
          tr:nth-child(even) { 
            background: #f9fafb; 
          }
          tr:hover {
            background: #f3f4f6;
          }
          .no-data {
            text-align: center;
            color: #6b7280;
            font-style: italic;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="LOGO_PLACEHOLDER" alt="Company Logo" class="logo" />
          <div class="title-section">
            <h1>Leads İstatistik Raporu</h1>
            <p class="subtitle">Detaylı lead analiz raporu</p>
          </div>
        </div>
        
        <div class="meta">
          <div class="meta-row">
            <span class="meta-item">Proje: <span class="meta-value">${projectName}</span></span>
            <span class="meta-item">Personel: <span class="meta-value">${salesRep}</span></span>
          </div>
          <div class="meta-row">
            <span class="meta-item">Tarih: <span class="meta-value">${dateRange}</span></span>
            ${leadType ? `<span class="meta-item">Lead Tipi: <span class="meta-value">${leadType}</span></span>` : ''}
          </div>
        </div>
        
        <div class="section-header">Durum Dağılımı</div>
        <table>
          <thead>
            <tr>
              <th>Durum</th>
              <th>Adet</th>
              <th>Yüzde</th>
            </tr>
          </thead>
          <tbody>
            ${status.length > 0 ? createTableRows(status) : '<tr><td colspan="3" class="no-data">Veri bulunamadı</td></tr>'}
          </tbody>
        </table>
        
        <div class="section-header">Proje Dağılımı</div>
        <table>
          <thead>
            <tr>
              <th>Proje</th>
              <th>Adet</th>
              <th>Yüzde</th>
            </tr>
          </thead>
          <tbody>
            ${projects.length > 0 ? createTableRows(projects) : '<tr><td colspan="3" class="no-data">Veri bulunamadı</td></tr>'}
          </tbody>
        </table>
        
        <div class="section-header">Personel Dağılımı</div>
        <table>
          <thead>
            <tr>
              <th>Personel</th>
              <th>Adet</th>
              <th>Yüzde</th>
            </tr>
          </thead>
          <tbody>
            ${personnel.length > 0 ? createTableRows(personnel) : '<tr><td colspan="3" class="no-data">Veri bulunamadı</td></tr>'}
          </tbody>
        </table>
      </body>
    </html>
  `;
}

// Main function to generate PDF with fallback
export async function generateReportPDF(props: any): Promise<Buffer> {
  console.log('Starting PDF generation with props:', JSON.stringify(props, null, 2));
  
  // First try Puppeteer for better styling
  try {
    console.log('Attempting Puppeteer PDF generation...');
    return await generateReportPDFWithPuppeteer(props);
  } catch (puppeteerError) {
    console.warn('Puppeteer PDF generation failed, falling back to jsPDF');
    console.warn('Puppeteer error:', puppeteerError instanceof Error ? puppeteerError.message : 'Unknown error');
    
    // Fallback to jsPDF
    try {
      console.log('Attempting jsPDF generation...');
      return generateReportPDFWithJsPDF(props);
    } catch (jsPDFError) {
      console.error('Both Puppeteer and jsPDF failed');
      console.error('jsPDF error:', jsPDFError instanceof Error ? jsPDFError.message : 'Unknown error');
      throw new Error('PDF generation failed with both Puppeteer and jsPDF');
    }
  }
}

// Puppeteer-based PDF generation
async function generateReportPDFWithPuppeteer(props: any): Promise<Buffer> {
  console.log('Starting PDF generation with props:', JSON.stringify(props, null, 2));
  
  let browser: Browser | null = null;
  
  try {
    // Generate HTML content
    const html = renderReportHTML(props);
    console.log('HTML generated successfully');

    // Handle logo with multiple path attempts
    const logoPaths = [
      path.resolve(__dirname, '../attached_assets/innogylogo.png'),
      path.resolve(__dirname, '../client/public/innogylogo.webp'),
      path.resolve(__dirname, '../../attached_assets/innogylogo.png'),
      path.resolve(process.cwd(), 'attached_assets/innogylogo.png'),
      path.resolve(process.cwd(), 'client/public/innogylogo.webp'),
    ];
    
    let logoData = '';
    let logoFound = false;
    
    for (const logoPath of logoPaths) {
      console.log('Checking logo path:', logoPath);
      if (fs.existsSync(logoPath)) {
        try {
          const logoBuffer = fs.readFileSync(logoPath);
          const extension = path.extname(logoPath).toLowerCase();
          const mimeType = extension === '.png' ? 'image/png' : 'image/webp';
          logoData = `data:${mimeType};base64,${logoBuffer.toString('base64')}`;
          logoFound = true;
          console.log('Logo found and converted to base64, size:', logoBuffer.length, 'bytes');
          break;
        } catch (error) {
          console.error('Error reading logo file:', error);
        }
      }
    }
    
    if (!logoFound) {
      console.warn('Logo not found in any of the expected paths:', logoPaths);
    }

    // Replace logo placeholder or remove logo element if not found
    const htmlWithLogo = logoData 
      ? html.replace('LOGO_PLACEHOLDER', logoData)
      : html.replace('<img src="LOGO_PLACEHOLDER" alt="Company Logo" class="logo" />', 
          '<div style="width: 140px; height: 60px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; border-radius: 4px; color: #9ca3af; font-size: 12px;">Logo</div>');

    console.log('Logo replacement completed, logo found:', logoFound);

    // Launch Puppeteer with more stable configuration for Windows
    console.log('Launching Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-web-security',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--memory-pressure-off',
        '--max_old_space_size=4096'
      ],
      timeout: 30000,
    });
    console.log('Puppeteer launched successfully');

    const page = await browser.newPage();
    console.log('New page created');

    // Set viewport to ensure consistent rendering
    await page.setViewport({
      width: 1200,
      height: 800,
      deviceScaleFactor: 1,
    });

    // Set content with proper waiting and error handling
    try {
      await page.setContent(htmlWithLogo, { 
        waitUntil: ['domcontentloaded', 'networkidle0'],
        timeout: 30000 
      });
      console.log('Content set successfully');
      
      // Ensure all fonts are loaded
      await page.evaluateHandle(() => document.fonts.ready);
      console.log('Fonts loaded');
    } catch (contentError) {
      console.error('Error setting content:', contentError);
      throw contentError;
    }

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');
    console.log('Fonts loaded');

    // Additional wait for any remaining rendering
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Additional wait completed');

    // Generate PDF with more conservative settings
    console.log('Generating PDF...');
    try {
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '40px', bottom: '40px', left: '30px', right: '30px' },
        preferCSSPageSize: false,
        displayHeaderFooter: false,
        timeout: 30000,
      });

      console.log('PDF generated successfully, buffer size:', pdfBuffer.length, 'bytes');
      
      if (pdfBuffer.length === 0) {
        throw new Error('Generated PDF buffer is empty');
      }

      return Buffer.from(pdfBuffer);
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
      throw pdfError;
    }
  } catch (error) {
    console.error('Error in generateReportPDF:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('Browser closed successfully');
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
} 