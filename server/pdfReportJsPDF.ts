import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define the autotable plugin for TypeScript
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

export function generateReportPDFWithJsPDF(props: any): Buffer {
  console.log('Starting jsPDF generation with props:', JSON.stringify(props, null, 2));
  
  try {
    const {
      projectName = 'Tümü',
      salesRep = 'Tümü',
      dateRange = '- - -',
      leadType,
      status = [],
      projects = [],
      personnel = [],
    } = props;

    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 161); // #0066A1
    doc.text('Leads Statistics Report', 20, 30);
    
    // Add metadata
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    let yPosition = 50;
    
    doc.text(`Proje: ${projectName}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Personel: ${salesRep}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Tarih: ${dateRange}`, 20, yPosition);
    yPosition += 10;
    
    if (leadType) {
      doc.text(`Lead Tipi: ${leadType}`, 20, yPosition);
      yPosition += 10;
    }
    
    yPosition += 10;
    
    // Status Distribution Table
    doc.setFontSize(16);
    doc.setTextColor(0, 102, 161);
    doc.text('Durum Dağılımı', 20, yPosition);
    yPosition += 10;
    
    if (status.length > 0) {
      const statusTableData = status.map((item: any) => [
        item.name || '',
        (item.count || 0).toString(),
        item.percent || '0%'
      ]);
      
      autoTable(doc, {
        head: [['Durum', 'Adet', '%']],
        body: statusTableData,
        startY: yPosition,
        theme: 'grid',
        headStyles: {
          fillColor: [0, 102, 161],
          textColor: 255,
          fontSize: 12,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 10
        },
        alternateRowStyles: {
          fillColor: [246, 250, 253]
        },
        margin: { left: 20, right: 20 }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }
    
    // Project Distribution Table
    doc.setFontSize(16);
    doc.setTextColor(0, 102, 161);
    doc.text('Proje Dağılımı', 20, yPosition);
    yPosition += 10;
    
    if (projects.length > 0) {
      const projectTableData = projects.map((item: any) => [
        item.name || '',
        (item.count || 0).toString(),
        item.percent || '0%'
      ]);
      
      autoTable(doc, {
        head: [['Proje', 'Adet', '%']],
        body: projectTableData,
        startY: yPosition,
        theme: 'grid',
        headStyles: {
          fillColor: [0, 102, 161],
          textColor: 255,
          fontSize: 12,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 10
        },
        alternateRowStyles: {
          fillColor: [246, 250, 253]
        },
        margin: { left: 20, right: 20 }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }
    
    // Personnel Distribution Table
    doc.setFontSize(16);
    doc.setTextColor(0, 102, 161);
    doc.text('Personel Dağılımı', 20, yPosition);
    yPosition += 10;
    
    if (personnel.length > 0) {
      const personnelTableData = personnel.map((item: any) => [
        item.name || '',
        (item.count || 0).toString(),
        item.percent || '0%'
      ]);
      
      autoTable(doc, {
        head: [['Personel', 'Adet', '%']],
        body: personnelTableData,
        startY: yPosition,
        theme: 'grid',
        headStyles: {
          fillColor: [0, 102, 161],
          textColor: 255,
          fontSize: 12,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 10
        },
        alternateRowStyles: {
          fillColor: [246, 250, 253]
        },
        margin: { left: 20, right: 20 }
      });
    }
    
    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    console.log('jsPDF generation successful, buffer size:', pdfBuffer.length, 'bytes');
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error in generateReportPDFWithJsPDF:', error);
    throw error;
  }
}
