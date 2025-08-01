// Export service for Excel, Word, and other formats
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to convert chart type codes to human-readable names
function getChartTypeName(chartType: string): string {
  switch (chartType) {
    case 'bar':
      return 'Çubuk';
    case 'pie':
      return 'Pasta';
    case 'line':
      return 'Çizgi';
    default:
      return chartType;
  }
}

// Function to generate Excel report
export async function generateExcelReport(reportProps: any) {
  try {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Generate sheets for each data category
    
    // Status data
    if (reportProps.data.status && reportProps.data.status.length > 0) {
      const statusWS = XLSX.utils.json_to_sheet(reportProps.data.status.map((item: any) => ({
        'Durum': item.name,
        'Adet': item.count,
        'Yüzde': item.percent
      })));
      XLSX.utils.book_append_sheet(wb, statusWS, 'Durum Dağılımı');
    }
    
    // Project data
    if (reportProps.data.projects && reportProps.data.projects.length > 0) {
      const projectsWS = XLSX.utils.json_to_sheet(reportProps.data.projects.map((item: any) => ({
        'Proje': item.name,
        'Adet': item.count,
        'Yüzde': item.percent
      })));
      XLSX.utils.book_append_sheet(wb, projectsWS, 'Proje Dağılımı');
    }
    
    // Personnel data
    if (reportProps.data.personnel && reportProps.data.personnel.length > 0) {
      const personnelWS = XLSX.utils.json_to_sheet(reportProps.data.personnel.map((item: any) => ({
        'Personel': item.name,
        'Adet': item.count,
        'Yüzde': item.percent
      })));
      XLSX.utils.book_append_sheet(wb, personnelWS, 'Personel Dağılımı');
    }
    
    // Lead Types data
    if (reportProps.data.leadTypes && reportProps.data.leadTypes.length > 0) {
      const leadTypesWS = XLSX.utils.json_to_sheet(reportProps.data.leadTypes.map((item: any) => ({
        'Lead Tipi': item.name,
        'Adet': item.count,
        'Yüzde': item.percent
      })));
      XLSX.utils.book_append_sheet(wb, leadTypesWS, 'Lead Tipleri');
    }
    
    // Cost metrics data
    if (reportProps.data.costMetrics && reportProps.data.costMetrics.length > 0) {
      const costMetricsWS = XLSX.utils.json_to_sheet(reportProps.data.costMetrics.map((item: any) => ({
        'Metrik': item.name,
        'Değer': item.value
      })));
      XLSX.utils.book_append_sheet(wb, costMetricsWS, 'Maliyet Metrikleri');
    }
    
    // Lead data if includeLeadData is true
    if (reportProps.includeLeadData && reportProps.data.leadData && reportProps.data.leadData.length > 0) {
      // Transform lead data into a format suitable for Excel
      const leadData = reportProps.data.leadData.map((lead: any) => ({
        'Müşteri': lead.customerName,
        'Proje': lead.projectName,
        'Personel': lead.assignedPersonnel,
        'Lead Tipi': lead.leadType,
        'Durum': lead.status,
        'Tarih': lead.requestDate,
        'Satış': lead.wasSaleMade === 'evet' ? 'Evet' : 'Hayır',
        'Telefon': lead.phone,
        'Email': lead.email,
        'Not': lead.notes
      }));
      
      const leadsWS = XLSX.utils.json_to_sheet(leadData);
      XLSX.utils.book_append_sheet(wb, leadsWS, 'Lead Verileri');
    }
    
    // Report information
    const reportInfo = [
      { 'Bilgi': 'Rapor Tarihi', 'Değer': new Date().toLocaleDateString('tr-TR') },
      { 'Bilgi': 'Proje Filtresi', 'Değer': reportProps.projectName || 'Tümü' },
      { 'Bilgi': 'Personel Filtresi', 'Değer': reportProps.salesRep || 'Tümü' },
      { 'Bilgi': 'Lead Tipi Filtresi', 'Değer': reportProps.leadType || 'Tümü' },
      { 'Bilgi': 'Tarih Aralığı', 'Değer': reportProps.dateRange || '- - -' }
    ];
    
    const infoWS = XLSX.utils.json_to_sheet(reportInfo);
    XLSX.utils.book_append_sheet(wb, infoWS, 'Rapor Bilgisi');
    
    // Chart settings information if available
    if (reportProps.data.chartTypes) {
      const chartTypeInfo = [
        { 'Grafik': 'Proje Grafiği', 'Tip': getChartTypeName(reportProps.data.chartTypes.projects) },
        { 'Grafik': 'Durum Grafiği', 'Tip': getChartTypeName(reportProps.data.chartTypes.status) },
        { 'Grafik': 'Personel Grafiği', 'Tip': getChartTypeName(reportProps.data.chartTypes.personnel) },
        { 'Grafik': 'Lead Tip Grafiği', 'Tip': getChartTypeName(reportProps.data.chartTypes.leadTypes) },
      ];
      
      const chartTypeWS = XLSX.utils.json_to_sheet(chartTypeInfo);
      XLSX.utils.book_append_sheet(wb, chartTypeWS, 'Grafik Ayarları');
    }
    
    // Write workbook to buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    return buffer;
  } catch (error) {
    console.error('Excel report generation error:', error);
    throw error;
  }
}

// Function to generate Word report (docx)
export async function generateWordReport(reportProps: any) {
  try {
    // For Word, we'll create a simple HTML file and convert it to .docx format
    // Since we don't have a direct docx generation library, we'll return a JSON object
    // that can be parsed on the client side or converted to HTML
    
    // Create a simple HTML template
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Lead Raporu</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1, h2 { color: #0066A1; }
        table { border-collapse: collapse; width: 100%; margin: 15px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .header { margin-bottom: 30px; }
        .section { margin-bottom: 20px; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Lead Tracker Raporu</h1>
        <p>Proje: ${reportProps.projectName || 'Tümü'}</p>
        <p>Personel: ${reportProps.salesRep || 'Tümü'}</p>
        <p>Lead Tipi: ${reportProps.leadType || 'Tümü'}</p>
        <p>Tarih Aralığı: ${reportProps.dateRange || '- - -'}</p>
        <p>Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}</p>
        ${reportProps.data.chartTypes ? `
        <div class="chart-settings">
          <h3>Grafik Ayarları</h3>
          <ul>
            <li>Proje Grafiği: ${getChartTypeName(reportProps.data.chartTypes.projects)}</li>
            <li>Durum Grafiği: ${getChartTypeName(reportProps.data.chartTypes.status)}</li>
            <li>Personel Grafiği: ${getChartTypeName(reportProps.data.chartTypes.personnel)}</li>
            <li>Lead Tip Grafiği: ${getChartTypeName(reportProps.data.chartTypes.leadTypes)}</li>
          </ul>
        </div>
        ` : ''}
      </div>
      
      <div class="section">
        <h2>Durum Dağılımı</h2>
        <table>
          <tr>
            <th>Durum</th>
            <th>Adet</th>
            <th>Yüzde</th>
          </tr>
          ${reportProps.data.status.map((item: any) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.count}</td>
              <td>${item.percent}</td>
            </tr>
          `).join('')}
        </table>
      </div>
      
      <div class="section">
        <h2>Proje Dağılımı</h2>
        <table>
          <tr>
            <th>Proje</th>
            <th>Adet</th>
            <th>Yüzde</th>
          </tr>
          ${reportProps.data.projects.map((item: any) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.count}</td>
              <td>${item.percent}</td>
            </tr>
          `).join('')}
        </table>
      </div>
      
      <div class="section">
        <h2>Personel Dağılımı</h2>
        <table>
          <tr>
            <th>Personel</th>
            <th>Adet</th>
            <th>Yüzde</th>
          </tr>
          ${reportProps.data.personnel.map((item: any) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.count}</td>
              <td>${item.percent}</td>
            </tr>
          `).join('')}
        </table>
      </div>
      
      <div class="section">
        <h2>Lead Tip Dağılımı</h2>
        <table>
          <tr>
            <th>Lead Tipi</th>
            <th>Adet</th>
            <th>Yüzde</th>
          </tr>
          ${reportProps.data.leadTypes.map((item: any) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.count}</td>
              <td>${item.percent}</td>
            </tr>
          `).join('')}
        </table>
      </div>
      
      <div class="section">
        <h2>Maliyet Metrikleri</h2>
        <table>
          <tr>
            <th>Metrik</th>
            <th>Değer</th>
          </tr>
          ${reportProps.data.costMetrics.map((item: any) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.value}</td>
            </tr>
          `).join('')}
        </table>
      </div>
      
      ${reportProps.includeLeadData && reportProps.data.leadData && reportProps.data.leadData.length > 0 ? `
        <div class="section">
          <h2>Lead Verileri</h2>
          <table>
            <tr>
              <th>Müşteri</th>
              <th>Proje</th>
              <th>Personel</th>
              <th>Lead Tipi</th>
              <th>Durum</th>
              <th>Tarih</th>
              <th>Satış</th>
            </tr>
            ${reportProps.data.leadData.map((lead: any) => `
              <tr>
                <td>${lead.customerName || ''}</td>
                <td>${lead.projectName || ''}</td>
                <td>${lead.assignedPersonnel || ''}</td>
                <td>${lead.leadType || ''}</td>
                <td>${lead.status || ''}</td>
                <td>${lead.requestDate || ''}</td>
                <td>${lead.wasSaleMade === 'evet' ? 'Evet' : 'Hayır'}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      ` : ''}
      
      <div class="footer">
        <p>Lead Tracker Pro - Otomatik Oluşturulmuş Rapor</p>
      </div>
    </body>
    </html>
    `;
    
    // For now, we return the HTML content as a buffer
    // In a production environment, you might want to use a library like docx-templates
    // to generate proper .docx files
    const buffer = Buffer.from(htmlContent, 'utf-8');
    return buffer;
  } catch (error) {
    console.error('Word report generation error:', error);
    throw error;
  }
}
