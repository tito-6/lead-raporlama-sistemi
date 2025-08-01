import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Define types for our report data
interface ReportRow {
  name: string;
  count: number;
  percent: string;
}

interface CostMetricRow {
  name: string;
  value: string;
}

interface ReportData {
  status: ReportRow[];
  projects: ReportRow[];
  personnel: ReportRow[];
  leadTypes: ReportRow[];
  costMetrics: CostMetricRow[];
  includeLeadData: boolean;
  leadData: any[];
  chartTypes?: {
    projects: string;
    status: string;
    personnel: string;
    leadTypes: string;
  };
}

interface ReportProps {
  data: ReportData;
  projectName?: string;
  salesRep?: string;
  dateRange?: string;
  leadType?: string;
  includeLeadData?: boolean;
}

// Define the jsPDF extensions
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

// Helper function to convert hex colors to RGB array for jsPDF
const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255,
  ];
};

// Theme colors
const colors = {
  primary: '#0066A1',
  secondary: '#2b579a',
  success: '#217346',
  warning: '#FFC107',
  background: {
    light: '#f8fafc',
    dark: '#1a1a1a'
  },
  text: {
    light: '#1a1a1a',
    dark: '#f8fafc'
  },
  charts: {
    status: ['#e3fcec', '#ffe3e3', '#e3e8fc', '#fffbe3', '#e3f0fc', '#fce3f3'],
    projects: ['#e3e8fc', '#e3fcec', '#fffbe3', '#ffe3e3', '#fce3f3'],
    personnel: ['#e3fcec', '#e3e8fc', '#ffe3e3', '#fffbe3', '#fce3f3'],
    leadTypes: ['#e3fcec', '#ffe3e3', '#e3e8fc', '#fffbe3']
  }
};

// Common functions
function getChartTypeName(chartType) {
  switch (chartType) {
    case 'bar': return 'Çubuk';
    case 'pie': return 'Pasta';
    case 'line': return 'Çizgi';
    default: return chartType || 'Pasta';
  }
}

function formatReportDate() {
  const now = new Date();
  return now.toLocaleString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// PDF Export
export async function exportToPDF(reportData) {
  try {
    const {
      data,
      projectName = 'Tümü',
      salesRep = 'Tümü',
      leadType = 'Tümü',
      dateRange = '- - -',
    } = reportData;

    // Create PDF document
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(20);
    doc.setTextColor(...hexToRgb(colors.primary));
    doc.text('İNNO Gayrimenkul Lead Raporu', 14, 20);
    
    // Add metadata
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Rapor Tarihi: ${formatReportDate()}`, 14, 30);
    doc.text(`Proje Filtresi: ${projectName}`, 14, 37);
    doc.text(`Personel Filtresi: ${salesRep}`, 14, 44);
    doc.text(`Lead Tipi Filtresi: ${leadType}`, 14, 51);
    doc.text(`Tarih Aralığı: ${dateRange}`, 14, 58);
    
    if (data.chartTypes) {
      doc.setFontSize(10);
      doc.text(`Grafik Tipleri: Proje: ${getChartTypeName(data.chartTypes.projects)}, ` +
        `Durum: ${getChartTypeName(data.chartTypes.status)}, ` +
        `Personel: ${getChartTypeName(data.chartTypes.personnel)}, ` +
        `Lead Tipleri: ${getChartTypeName(data.chartTypes.leadTypes)}`, 14, 65);
    }

    // Add summary metrics
    doc.setFontSize(14);
    doc.setTextColor(...hexToRgb(colors.primary));
    doc.text('Özet Metrikler', 14, 75);
    
    const metricsData = data.costMetrics.map(item => [item.name, item.value]);
    
    autoTable(doc, {
      startY: 80,
      head: [['Metrik', 'Değer']],
      body: metricsData,
      headStyles: {
        fillColor: hexToRgb(colors.primary),
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    // Status distribution
    let currentY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(...hexToRgb(colors.primary));
    doc.text('Durum Dağılımı', 14, currentY);
    
    const statusData = data.status.map(item => [item.name, item.count, item.percent]);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Durum', 'Adet', 'Yüzde']],
      body: statusData,
      headStyles: {
        fillColor: hexToRgb(colors.primary),
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });
    
    // Project distribution
    currentY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(...hexToRgb(colors.primary));
    doc.text('Proje Dağılımı', 14, currentY);
    
    const projectData = data.projects.map(item => [item.name, item.count, item.percent]);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Proje', 'Adet', 'Yüzde']],
      body: projectData,
      headStyles: {
        fillColor: hexToRgb(colors.primary),
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    // Personnel distribution
    currentY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(...hexToRgb(colors.primary));
    doc.text('Personel Dağılımı', 14, currentY);
    
    const personnelData = data.personnel.map(item => [item.name, item.count, item.percent]);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Personel', 'Adet', 'Yüzde']],
      body: personnelData,
      headStyles: {
        fillColor: hexToRgb(colors.primary),
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    // Lead types distribution
    currentY = doc.lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(...hexToRgb(colors.primary));
    doc.text('Lead Tip Dağılımı', 14, currentY);
    
    const leadTypeData = data.leadTypes.map(item => [item.name, item.count, item.percent]);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Tip', 'Adet', 'Yüzde']],
      body: leadTypeData,
      headStyles: {
        fillColor: hexToRgb(colors.primary),
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    // Include lead data if requested
    if (data.includeLeadData && data.leadData?.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(...hexToRgb(colors.primary));
      doc.text('Lead Verileri', 14, 20);
      
      // Transform lead data for the table
      const leadTableData = data.leadData.map(lead => [
        lead.customerName || '-',
        lead.projectName || '-',
        lead.assignedPersonnel || '-',
        lead.leadType || '-',
        lead.status || '-',
        lead.requestDate || '-',
        lead.wasSaleMade === 'evet' ? '✓' : '✗'
      ]);
      
      autoTable(doc, {
        startY: 25,
        head: [['Müşteri', 'Proje', 'Personel', 'Lead Tipi', 'Durum', 'Tarih', 'Satış']],
        body: leadTableData,
        headStyles: {
          fillColor: hexToRgb(colors.primary),
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        styles: {
          fontSize: 8
        },
      });
    }

    // Return PDF as buffer
    return doc.output('arraybuffer');
  } catch (error) {
    console.error('PDF export error:', error);
    throw error;
  }
}

// Excel Export
export async function exportToExcel(reportData) {
  try {
    const {
      data,
      projectName = 'Tümü',
      salesRep = 'Tümü',
      leadType = 'Tümü',
      dateRange = '- - -',
    } = reportData;

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Report information sheet
    const reportInfo = [
      { 'Bilgi': 'Rapor Tarihi', 'Değer': formatReportDate() },
      { 'Bilgi': 'Proje Filtresi', 'Değer': projectName },
      { 'Bilgi': 'Personel Filtresi', 'Değer': salesRep },
      { 'Bilgi': 'Lead Tipi Filtresi', 'Değer': leadType },
      { 'Bilgi': 'Tarih Aralığı', 'Değer': dateRange }
    ];
    
    // Add chart settings if available
    if (data.chartTypes) {
      reportInfo.push(
        { 'Bilgi': 'Proje Grafik Tipi', 'Değer': getChartTypeName(data.chartTypes.projects) },
        { 'Bilgi': 'Durum Grafik Tipi', 'Değer': getChartTypeName(data.chartTypes.status) },
        { 'Bilgi': 'Personel Grafik Tipi', 'Değer': getChartTypeName(data.chartTypes.personnel) },
        { 'Bilgi': 'Lead Tip Grafik Tipi', 'Değer': getChartTypeName(data.chartTypes.leadTypes) }
      );
    }
    
    const infoWS = XLSX.utils.json_to_sheet(reportInfo);
    XLSX.utils.book_append_sheet(wb, infoWS, 'Rapor Bilgisi');
    
    // Summary metrics
    const costMetricsWS = XLSX.utils.json_to_sheet(data.costMetrics.map(item => ({
      'Metrik': item.name,
      'Değer': item.value
    })));
    XLSX.utils.book_append_sheet(wb, costMetricsWS, 'Özet Metrikler');
    
    // Status data
    if (data.status && data.status.length > 0) {
      const statusWS = XLSX.utils.json_to_sheet(data.status.map(item => ({
        'Durum': item.name,
        'Adet': item.count,
        'Yüzde': item.percent
      })));
      XLSX.utils.book_append_sheet(wb, statusWS, 'Durum Dağılımı');
    }
    
    // Project data
    if (data.projects && data.projects.length > 0) {
      const projectsWS = XLSX.utils.json_to_sheet(data.projects.map(item => ({
        'Proje': item.name,
        'Adet': item.count,
        'Yüzde': item.percent
      })));
      XLSX.utils.book_append_sheet(wb, projectsWS, 'Proje Dağılımı');
    }
    
    // Personnel data
    if (data.personnel && data.personnel.length > 0) {
      const personnelWS = XLSX.utils.json_to_sheet(data.personnel.map(item => ({
        'Personel': item.name,
        'Adet': item.count,
        'Yüzde': item.percent
      })));
      XLSX.utils.book_append_sheet(wb, personnelWS, 'Personel Dağılımı');
    }
    
    // Lead types data
    if (data.leadTypes && data.leadTypes.length > 0) {
      const leadTypesWS = XLSX.utils.json_to_sheet(data.leadTypes.map(item => ({
        'Lead Tipi': item.name,
        'Adet': item.count,
        'Yüzde': item.percent
      })));
      XLSX.utils.book_append_sheet(wb, leadTypesWS, 'Lead Tipleri');
    }
    
    // Lead data if includeLeadData is true
    if (data.includeLeadData && data.leadData && data.leadData.length > 0) {
      const leadData = data.leadData.map(lead => ({
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
    
    // Write workbook to buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    return buffer;
  } catch (error) {
    console.error('Excel export error:', error);
    throw error;
  }
}

// Word Export
export async function exportToWord(reportData) {
  try {
    const {
      data,
      projectName = 'Tümü',
      salesRep = 'Tümü',
      leadType = 'Tümü',
      dateRange = '- - -',
    } = reportData;

    // Create document
    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: "Heading1",
            name: "Heading 1",
            run: {
              size: 36,
              color: colors.primary.replace('#', ''),
              bold: true,
            },
            paragraph: {
              spacing: {
                after: 300,
              },
            },
          },
          {
            id: "Heading2",
            name: "Heading 2",
            run: {
              size: 28,
              color: colors.primary.replace('#', ''),
              bold: true,
            },
            paragraph: {
              spacing: {
                before: 400,
                after: 200,
              },
            },
          },
          {
            id: "Normal",
            name: "Normal",
            run: {
              size: 24,
            },
            paragraph: {
              spacing: {
                line: 276,
              },
            },
          },
        ],
      },
    });

    // Create sections
    const sections = [];

    // Report title
    sections.push(
      new Paragraph({
        text: "İNNO Gayrimenkul Lead Raporu",
        heading: HeadingLevel.HEADING_1,
      })
    );

    // Report metadata
    sections.push(
      new Paragraph({
        text: `Rapor Tarihi: ${formatReportDate()}`,
      })
    );
    sections.push(
      new Paragraph({
        text: `Proje Filtresi: ${projectName}`,
      })
    );
    sections.push(
      new Paragraph({
        text: `Personel Filtresi: ${salesRep}`,
      })
    );
    sections.push(
      new Paragraph({
        text: `Lead Tipi Filtresi: ${leadType}`,
      })
    );
    sections.push(
      new Paragraph({
        text: `Tarih Aralığı: ${dateRange}`,
      })
    );

    // Chart settings if available
    if (data.chartTypes) {
      sections.push(
        new Paragraph({
          text: `Grafik Tipleri: Proje: ${getChartTypeName(data.chartTypes.projects)}, ` +
            `Durum: ${getChartTypeName(data.chartTypes.status)}, ` +
            `Personel: ${getChartTypeName(data.chartTypes.personnel)}, ` +
            `Lead Tipleri: ${getChartTypeName(data.chartTypes.leadTypes)}`,
        })
      );
    }

    // Summary metrics heading
    sections.push(
      new Paragraph({
        text: "Özet Metrikler",
        heading: HeadingLevel.HEADING_2,
      })
    );

    // Summary metrics table
    const metricsRows = data.costMetrics.map(metric => {
      return new TableRow({
        children: [
          new TableCell({ 
            children: [new Paragraph({ text: metric.name })],
            width: { size: 50, type: "percentage" },
          }),
          new TableCell({ 
            children: [new Paragraph({ text: metric.value })],
            width: { size: 50, type: "percentage" },
          })
        ],
      });
    });
    
    const metricsTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ 
              children: [new Paragraph({ text: "Metrik", style: "strong" })],
              width: { size: 50, type: "percentage" },
            }),
            new TableCell({ 
              children: [new Paragraph({ text: "Değer", style: "strong" })],
              width: { size: 50, type: "percentage" },
            }),
          ],
        }),
        ...metricsRows
      ],
      width: { size: 100, type: "percentage" },
    });
    
    sections.push(metricsTable);

    // Status distribution
    sections.push(
      new Paragraph({
        text: "Durum Dağılımı",
        heading: HeadingLevel.HEADING_2,
      })
    );
    
    const statusRows = data.status.map(status => {
      return new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: status.name })] }),
          new TableCell({ children: [new Paragraph({ text: status.count.toString() })] }),
          new TableCell({ children: [new Paragraph({ text: status.percent })] }),
        ],
      });
    });
    
    const statusTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "Durum", style: "strong" })] }),
            new TableCell({ children: [new Paragraph({ text: "Adet", style: "strong" })] }),
            new TableCell({ children: [new Paragraph({ text: "Yüzde", style: "strong" })] }),
          ],
        }),
        ...statusRows
      ],
      width: { size: 100, type: "percentage" },
    });
    
    sections.push(statusTable);

    // Project distribution
    sections.push(
      new Paragraph({
        text: "Proje Dağılımı",
        heading: HeadingLevel.HEADING_2,
      })
    );
    
    const projectRows = data.projects.map(project => {
      return new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: project.name })] }),
          new TableCell({ children: [new Paragraph({ text: project.count.toString() })] }),
          new TableCell({ children: [new Paragraph({ text: project.percent })] }),
        ],
      });
    });
    
    const projectTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "Proje", style: "strong" })] }),
            new TableCell({ children: [new Paragraph({ text: "Adet", style: "strong" })] }),
            new TableCell({ children: [new Paragraph({ text: "Yüzde", style: "strong" })] }),
          ],
        }),
        ...projectRows
      ],
      width: { size: 100, type: "percentage" },
    });
    
    sections.push(projectTable);

    // Personnel distribution
    sections.push(
      new Paragraph({
        text: "Personel Dağılımı",
        heading: HeadingLevel.HEADING_2,
      })
    );
    
    const personnelRows = data.personnel.map(person => {
      return new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: person.name })] }),
          new TableCell({ children: [new Paragraph({ text: person.count.toString() })] }),
          new TableCell({ children: [new Paragraph({ text: person.percent })] }),
        ],
      });
    });
    
    const personnelTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "Personel", style: "strong" })] }),
            new TableCell({ children: [new Paragraph({ text: "Adet", style: "strong" })] }),
            new TableCell({ children: [new Paragraph({ text: "Yüzde", style: "strong" })] }),
          ],
        }),
        ...personnelRows
      ],
      width: { size: 100, type: "percentage" },
    });
    
    sections.push(personnelTable);

    // Lead types distribution
    sections.push(
      new Paragraph({
        text: "Lead Tip Dağılımı",
        heading: HeadingLevel.HEADING_2,
      })
    );
    
    const leadTypeRows = data.leadTypes.map(type => {
      return new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: type.name })] }),
          new TableCell({ children: [new Paragraph({ text: type.count.toString() })] }),
          new TableCell({ children: [new Paragraph({ text: type.percent })] }),
        ],
      });
    });
    
    const leadTypeTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "Tip", style: "strong" })] }),
            new TableCell({ children: [new Paragraph({ text: "Adet", style: "strong" })] }),
            new TableCell({ children: [new Paragraph({ text: "Yüzde", style: "strong" })] }),
          ],
        }),
        ...leadTypeRows
      ],
      width: { size: 100, type: "percentage" },
    });
    
    sections.push(leadTypeTable);

    // Lead data if includeLeadData is true
    if (data.includeLeadData && data.leadData?.length > 0) {
      sections.push(
        new Paragraph({
          text: "Lead Verileri",
          heading: HeadingLevel.HEADING_2,
        })
      );
      
      const leadDataRows = data.leadData.map(lead => {
        return new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: lead.customerName || '-' })] }),
            new TableCell({ children: [new Paragraph({ text: lead.projectName || '-' })] }),
            new TableCell({ children: [new Paragraph({ text: lead.assignedPersonnel || '-' })] }),
            new TableCell({ children: [new Paragraph({ text: lead.status || '-' })] }),
            new TableCell({ children: [new Paragraph({ text: lead.requestDate || '-' })] }),
            new TableCell({ children: [new Paragraph({ text: lead.wasSaleMade === 'evet' ? '✓' : '✗' })] }),
          ],
        });
      });
      
      const leadTable = new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: "Müşteri", style: "strong" })] }),
              new TableCell({ children: [new Paragraph({ text: "Proje", style: "strong" })] }),
              new TableCell({ children: [new Paragraph({ text: "Personel", style: "strong" })] }),
              new TableCell({ children: [new Paragraph({ text: "Durum", style: "strong" })] }),
              new TableCell({ children: [new Paragraph({ text: "Tarih", style: "strong" })] }),
              new TableCell({ children: [new Paragraph({ text: "Satış", style: "strong" })] }),
            ],
          }),
          ...leadDataRows
        ],
        width: { size: 100, type: "percentage" },
      });
      
      sections.push(leadTable);
    }

    // Add all sections to document
    doc.addSection({
      children: sections,
    });

    // Generate and return the document as buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  } catch (error) {
    console.error('Word export error:', error);
    throw error;
  }
}
