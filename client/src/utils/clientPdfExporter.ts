import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { normalizeTurkishText, normalizeDataForPDF, testDataNormalization, createPDFText, testTurkishCharacters } from './turkishTextUtils';
import { configureTurkishFont, prepareUnicodeText, getUnicodeTableStyles } from './fonts/unicodeFontSupport';
import { processTurkishTextForPDF, testTurkishProcessing, TurkishCharStrategy, createPDFTextCustom } from './customTurkishHandler';

// Helper function to get consistent table styles with Turkish character support
const getTableStyles = () => getUnicodeTableStyles();

// Add Turkish font support for jsPDF
declare module 'jspdf' {
  interface jsPDF {
    addFileToVFS(filename: string, filecontent: string): void;
    addFont(filename: string, fontName: string, fontStyle: string): void;
  }
}

interface ReportData {
  status: { name: string; count: number; percent: string }[];
  projects: { name: string; count: number; percent: string }[];
  personnel: { name: string; count: number; percent: string }[];
  leadTypes: { name: string; count: number; percent: string }[];
  costMetrics: { name: string; value: string | number }[];
  leadData?: any[];
  includeLeadData?: boolean;
  chartTypes?: {
    projects: string;
    status: string;
    personnel: string;
    leadTypes: string;
  };
}

interface ExportOptions {
  projectName: string;
  salesRep: string;
  leadType: string;
  dateRange: string;
}

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
      return chartType || 'Pasta';
  }
}

// Function to format date with proper Turkish locale
function formatReportDate(): string {
  const now = new Date();
  return now.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', '');
}

// Helper function to format metric values for display
function formatMetricValue(name: string, value: string | number, processText: (text: string) => string): string {
  // Special handling for Satış Başına Maliyet when there are no sales
  // Check for both original and ASCII versions of the text
  if ((name === 'Satış Başına Maliyet (TL)' || name === 'Satis Basina Maliyet (TL)') && 
      (value === '0.00' || value === 0 || value === '0' || 
       value === 'NaN' || value === 'Infinity' || 
       (typeof value === 'string' && parseFloat(value) === 0))) {
    return processText('Hesaplanamıyor (Satış yok)');
  }
  return processText(value.toString());
}

// Function to capture chart as image with better error handling and waiting
async function captureChartAsImage(canvasId: string): Promise<string | null> {
  try {
    console.log(`Attempting to capture chart: ${canvasId}`);
    
    // Wait for chart to be fully rendered
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Try multiple selectors to find the chart
    let chartElement = document.getElementById(canvasId);
    
    if (!chartElement) {
      // Try finding by data attribute
      chartElement = document.querySelector(`[data-chart-id="${canvasId}"]`) as HTMLElement;
    }
    
    if (!chartElement) {
      // Try finding the canvas inside the chart container
      const containerSelectors = [
        `#${canvasId.replace('-canvas', '-section-pdf')}`,
        `#${canvasId.replace('-chart-canvas', '-section-pdf')}`,
        `.recharts-wrapper`,
        `[id*="${canvasId.split('-')[0]}"]`
      ];
      
      for (const selector of containerSelectors) {
        const container = document.querySelector(selector);
        if (container) {
          const rechartsWrapper = container.querySelector('.recharts-wrapper') as HTMLElement;
          const svgElement = container.querySelector('svg') as unknown as HTMLElement;
          chartElement = rechartsWrapper || svgElement || (container as HTMLElement);
          break;
        }
      }
    }
    
    if (!chartElement) {
      console.warn(`Chart element with id ${canvasId} not found`);
      return null;
    }

    console.log(`Found chart element for: ${canvasId}`, chartElement);

    // Enhanced html2canvas options for better chart capture
    const canvas = await html2canvas(chartElement as HTMLElement, {
      backgroundColor: '#ffffff',
      scale: 3, // Higher resolution for better quality
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: Math.max(chartElement.clientWidth || 600, 600),
      height: Math.max(chartElement.clientHeight || 400, 400),
      onclone: (clonedDoc) => {
        // Ensure all SVG elements are visible in the clone
        const svgElements = clonedDoc.querySelectorAll('svg');
        svgElements.forEach(svg => {
          svg.style.display = 'block';
          svg.style.visibility = 'visible';
          svg.setAttribute('width', '600');
          svg.setAttribute('height', '400');
        });
        
        // Make sure recharts elements are visible
        const rechartElements = clonedDoc.querySelectorAll('.recharts-wrapper, .recharts-surface');
        rechartElements.forEach(el => {
          (el as HTMLElement).style.display = 'block';
          (el as HTMLElement).style.visibility = 'visible';
        });
      }
    });

    const imageData = canvas.toDataURL('image/png', 1.0);
    console.log(`Successfully captured chart: ${canvasId}, data length: ${imageData.length}`);
    
    if (imageData.length < 1000) {
      console.warn(`Chart image seems too small for ${canvasId}, might be empty`);
      return null;
    }
    
    return imageData;
  } catch (error) {
    console.error(`Error capturing chart ${canvasId}:`, error);
    return null;
  }
}

// Function to load and encode logo
async function loadLogo(): Promise<string | null> {
  try {
    const response = await fetch('/innogylogo.webp');
    if (!response.ok) {
      console.warn('Logo file not found, skipping logo');
      return null;
    }
    
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading logo:', error);
    return null;
  }
}

export async function exportLeadReportToPDF(data: ReportData, options: ExportOptions): Promise<void> {
  try {
    console.log('Starting PDF export with original data:', data);
    console.log('Original options:', options);
    
    // Test our direct conversion
    const testText = 'Satış Başına Maliyet';
    console.log('🔤 Testing direct conversion:', testText);
    
    // Use Unicode-preserving text processor that keeps Turkish characters
    const processText = (text: string) => {
      if (!text) return text;
      
      // Keep the original Turkish characters - don't convert them
      console.log(`Preserving Turkish text: "${text}"`);
      return text.toString();
    };
    
    console.log('Using custom Turkish character processor...');
    
    // Process all data with custom Turkish character handler
    const processDataRecursively = (obj: any): any => {
      if (typeof obj === 'string') {
        return processText(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(processDataRecursively);
      }
      if (obj && typeof obj === 'object') {
        const processed: any = {};
        for (const [key, value] of Object.entries(obj)) {
          processed[key] = processDataRecursively(value);
        }
        return processed;
      }
      return obj;
    };
    
    // Process all data and options
    const normalizedData = processDataRecursively(data);
    const normalizedOptions = processDataRecursively(options);
    
    console.log('Proceeding with custom Turkish processed data...');
    
    // Wait for all charts to be fully rendered before capturing
    console.log('Waiting for charts to render...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Capture charts as images first
    console.log('Capturing chart images...');
    const projectChartImage = await captureChartAsImage('project-chart-canvas');
    const statusChartImage = await captureChartAsImage('status-chart-canvas');
    const personnelChartImage = await captureChartAsImage('salesrep-chart-canvas');
    const leadTypeChartImage = await captureChartAsImage('leadtype-chart-canvas');
    
    console.log('Chart capture results:', {
      project: !!projectChartImage,
      status: !!statusChartImage,
      personnel: !!personnelChartImage,
      leadType: !!leadTypeChartImage
    });
    
    // Load logo
    const logoImage = await loadLogo();
    
    // Create PDF document with A4 format and enhanced Unicode support
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm', 
      format: 'a4',
      putOnlyUsedFonts: true,
      compress: true
    });
    
    // Configure font for Turkish character support
    configureTurkishFont(doc);
    
    // Test Turkish character rendering
    testTurkishCharacters();
    
    // Set document properties with Turkish language support
    doc.setProperties({
      title: processText('Lead Raporu'),
      creator: 'Lead Tracker Pro'
    });

    // Add logo if available
    if (logoImage) {
      try {
        doc.addImage(logoImage, 'WEBP', 150, 10, 40, 20);
      } catch (logoError) {
        console.warn('Could not add logo to PDF:', logoError);
      }
    }

    // Add header
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 161); // #0066A1
    doc.text(processText('INNO Gayrimenkul Lead Raporu'), 14, 25);
    
    // Add metadata
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    let yPosition = 35;
    
    doc.text(processText(`Rapor Tarihi: ${formatReportDate()}`), 14, yPosition);
    yPosition += 7;
    doc.text(processText(`Proje Filtresi: ${normalizedOptions.projectName}`), 14, yPosition);
    yPosition += 7;
    doc.text(processText(`Personel Filtresi: ${normalizedOptions.salesRep}`), 14, yPosition);
    yPosition += 7;
    doc.text(processText(`Lead Tipi Filtresi: ${normalizedOptions.leadType}`), 14, yPosition);
    yPosition += 7;
    doc.text(processText(`Tarih Aralığı: ${normalizedOptions.dateRange}`), 14, yPosition);
    yPosition += 7;
    
    // Add chart types if available
    if (data.chartTypes) {
      doc.setFontSize(10);
      doc.text(processText(`Grafik Tipleri - Proje: ${getChartTypeName(data.chartTypes.projects)}`), 14, yPosition);
      yPosition += 5;
      doc.text(processText(`Durum: ${getChartTypeName(data.chartTypes.status)}`), 14, yPosition);
      yPosition += 5;
      doc.text(processText(`Personel: ${getChartTypeName(data.chartTypes.personnel)}`), 14, yPosition);
      yPosition += 5;
      doc.text(processText(`Lead Tipleri: ${getChartTypeName(data.chartTypes.leadTypes)}`), 14, yPosition);
      yPosition += 10;
    }

    // Add summary metrics
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 161);
    doc.text(processText('Ozet Metrikler'), 14, yPosition);
    yPosition += 5;
    
    // Process metrics data with proper formatting and Turkish character normalization
    const metricsTableData = normalizedData.costMetrics.map((item: any) => [
      processText(item.name), 
      formatMetricValue(item.name, item.value, processText)
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [[processText('Metrik'), processText('Deger')]],
      body: metricsTableData,
      ...getTableStyles()
    });

    // Status distribution with chart
    let currentY = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page (accounting for larger chart size)
    if (currentY > 150) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 161);
    doc.text(processText('Durum Dagilimi'), 14, currentY);
    currentY += 5;
    
    // Add status chart image if available
    if (statusChartImage) {
      try {
        doc.addImage(statusChartImage, 'PNG', 14, currentY, 140, 90);
        currentY += 95;
      } catch (chartError) {
        console.warn('Could not add status chart image:', chartError);
        currentY += 5;
      }
    }
    
    const statusTableData = normalizedData.status.map((item: any) => [
      processText(item.name), 
      item.count.toString(), 
      item.percent
    ]);
    
    autoTable(doc, {
      startY: currentY,
      head: [[processText('Durum'), processText('Adet'), processText('Yuzde')]],
      body: statusTableData,
      ...getTableStyles()
    });

    // Project distribution with chart
    currentY = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page (accounting for larger chart size)
    if (currentY > 150) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 161);
    doc.text(processText('Proje Dagilimi'), 14, currentY);
    currentY += 5;
    
    // Add project chart image if available
    if (projectChartImage) {
      try {
        doc.addImage(projectChartImage, 'PNG', 14, currentY, 140, 90);
        currentY += 95;
      } catch (chartError) {
        console.warn('Could not add project chart image:', chartError);
        currentY += 5;
      }
    }
    
    const projectTableData = normalizedData.projects.map((item: any) => [
      processText(item.name), 
      item.count.toString(), 
      item.percent
    ]);
    
    autoTable(doc, {
      startY: currentY,
      head: [[processText('Proje'), processText('Adet'), processText('Yuzde')]],
      body: projectTableData,
      ...getTableStyles()
    });

    // Personnel distribution with chart
    currentY = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page (accounting for larger chart size)
    if (currentY > 150) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 161);
    doc.text(processText('Personel Dagilimi'), 14, currentY);
    currentY += 5;
    
    // Add personnel chart image if available
    if (personnelChartImage) {
      try {
        doc.addImage(personnelChartImage, 'PNG', 14, currentY, 140, 90);
        currentY += 95;
      } catch (chartError) {
        console.warn('Could not add personnel chart image:', chartError);
        currentY += 5;
      }
    }
    
    const personnelTableData = normalizedData.personnel.map((item: any) => [
      processText(item.name), 
      item.count.toString(), 
      item.percent
    ]);
    
    autoTable(doc, {
      startY: currentY,
      head: [[processText('Personel'), processText('Adet'), processText('Yuzde')]],
      body: personnelTableData,
      ...getTableStyles()
    });

    // Lead types distribution with chart
    currentY = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page (accounting for larger chart size)
    if (currentY > 150) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 161);
    doc.text(processText('Lead Tip Dagilimi'), 14, currentY);
    currentY += 5;
    
    // Add lead type chart image if available
    if (leadTypeChartImage) {
      try {
        doc.addImage(leadTypeChartImage, 'PNG', 14, currentY, 140, 90);
        currentY += 95;
      } catch (chartError) {
        console.warn('Could not add lead type chart image:', chartError);
        currentY += 5;
      }
    }
    
    const leadTypeTableData = normalizedData.leadTypes.map((item: any) => [
      processText(item.name), 
      item.count.toString(), 
      item.percent
    ]);
    
    autoTable(doc, {
      startY: currentY,
      head: [[processText('Tip'), processText('Adet'), processText('Yuzde')]],
      body: leadTypeTableData,
      ...getTableStyles()
    });

    // Include lead data if requested
    if (normalizedData.includeLeadData && normalizedData.leadData && normalizedData.leadData.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 161);
      doc.text(processText('Lead Verileri'), 14, 20);
      
      // Transform lead data for the table - data is already normalized
      const leadTableData = normalizedData.leadData.map((lead: any) => [
        processText(lead.customerName || '-'),
        processText(lead.projectName || '-'),
        processText(lead.assignedPersonnel || '-'),
        processText(lead.leadType || '-'),
        processText(lead.status || '-'),
        processText(lead.requestDate || '-'),
        processText((lead.wasSaleMade?.toLowerCase() === 'evet' || 
         lead.wasSaleMade === true || 
         lead.wasSaleMade === 1) ? 'Evet' : 'Hayir')
      ]);
      
      autoTable(doc, {
        startY: 25,
        head: [[processText('Musteri'), processText('Proje'), processText('Personel'), processText('Lead Tipi'), processText('Durum'), processText('Tarih'), processText('Satis')]],
        body: leadTableData,
        ...getTableStyles()
      });
    }

    // Generate filename with timestamp
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const filename = `lead-report-${normalizedOptions.projectName.toLowerCase().replace(/\s+/g, '-')}-${dateStr}.pdf`;

    // Save the PDF with UTF-8 encoding support
    doc.save(filename);
    
    console.log('PDF export completed successfully');
    
  } catch (error) {
    console.error('PDF export error:', error);
    alert('PDF oluşturma sırasında bir hata oluştu. Lütfen tekrar deneyin.');
  }
}
