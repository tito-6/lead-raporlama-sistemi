import * as XLSX from "xlsx";

// Helper function to find field value from multiple possible column names
function getFieldValue(row: any, possibleNames: string[]): string {
  for (const name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      return String(row[name]).trim();
    }
  }
  return '';
}

// Advanced WebForm Note parsing for project detection
function parseProjectFromWebFormNote(webFormNote: string): string | null {
  if (!webFormNote) return null;
  
  // Common project name patterns in Turkish real estate
  const projectPatterns = [
    /model\s+([^,.\n]+)/i,
    /proje[:\s]*([^,.\n]+)/i,
    /projesi[:\s]*([^,.\n]+)/i,
    /konut[:\s]*([^,.\n]+)/i,
    /site[:\s]*([^,.\n]+)/i,
    /residence[:\s]*([^,.\n]+)/i,
    /plaza[:\s]*([^,.\n]+)/i,
    /towers?[:\s]*([^,.\n]+)/i,
    /park[:\s]*([^,.\n]+)/i,
    /city[:\s]*([^,.\n]+)/i,
    /home[:\s]*([^,.\n]+)/i,
    /apartmanı?[:\s]*([^,.\n]+)/i,
    /kompleksi[:\s]*([^,.\n]+)/i,
    /merkezi[:\s]*([^,.\n]+)/i,
    /kuyum[:\s]*([^,.\n]+)/i,
    /sanayi[:\s]*([^,.\n]+)/i
  ];
  
  for (const pattern of projectPatterns) {
    const match = webFormNote.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Look for specific project mentions from examples
  const knownProjects = [
    'Model Sanayi Merkezi', 'Model Kuyum Merkezi', 'İstwest', 'Akasya', 
    'Maslak', 'Vadistanbul', 'Esenyurt', 'Beylikdüzü', 'Başakşehir',
    'Küçükçekmece', 'Avcılar', 'Beyoğlu', 'Şişli', 'Beşiktaş'
  ];
  
  for (const project of knownProjects) {
    if (webFormNote.toLowerCase().includes(project.toLowerCase())) {
      return project;
    }
  }
  
  return null;
}

// Advanced lead type detection from WebForm Note
function detectLeadTypeFromWebForm(webFormNote: string): string {
  if (!webFormNote) return 'kiralama'; // Default
  
  const text = webFormNote.toLowerCase();
  
  // Kiralık (rental) indicators
  if (text.includes('kiralık') || text.includes('kira') || text.includes('rental') || text.includes('rent')) {
    return 'kiralama';
  }
  
  // Satılık (sales) indicators  
  if (text.includes('satılık') || text.includes('satış') || text.includes('sale') || text.includes('buy')) {
    return 'satis';
  }
  
  return 'kiralama'; // Default to rental
}

// Comprehensive field mapping for Turkish real estate lead data
function mapRowToLead(row: any): ParsedLead {
  // Enhanced date parsing function to handle multiple formats
  const parseDate = (dateValue: any): string => {
    if (!dateValue || dateValue === '') return '';
    
    const dateStr = String(dateValue).trim();
    
    // Try DD.MM.YYYY format (Turkish standard)
    if (dateStr.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
      const [day, month, year] = dateStr.split('.');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Try DD/MM/YYYY format
    if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Try YYYY-MM-DD format (already correct)
    if (dateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
      return dateStr;
    }
    
    // Try parsing as Date object for other formats
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0];
    }
    
    return dateStr; // Return as-is if no format matches
  };

  // Define comprehensive column mappings for all Turkish fields
  const columnMappings = {
    customerId: ['Müşteri ID', 'Customer ID', 'customerId'],
    contactId: ['İletişim ID', 'Contact ID', 'contactId'],
    customerName: ['Müşteri Adı Soyadı', 'Müşteri Adı', 'Customer Name', 'customerName'],
    firstCustomerSource: ['İlk Müşteri Kaynağı', 'First Customer Source', 'firstCustomerSource'],
    formCustomerSource: ['Form Müşteri Kaynağı', 'Form Customer Source', 'formCustomerSource'],
    webFormNote: ['WebForm Notu', 'Web Form Note', 'webFormNote'],
    requestDate: ['Talep Geliş Tarihi', 'Request Date', 'requestDate'],
    infoFormLocation1: ['İnfo Form Geliş Yeri', 'Info Form Location 1', 'infoFormLocation1'],
    infoFormLocation2: ['İnfo Form Geliş Yeri 2', 'Info Form Location 2', 'infoFormLocation2'],
    infoFormLocation3: ['İnfo Form Geliş Yeri 3', 'Info Form Location 3', 'infoFormLocation3'],
    infoFormLocation4: ['İnfo Form Geliş Yeri 4', 'Info Form Location 4', 'infoFormLocation4'],
    assignedPersonnel: ['Atanan Personel', 'Assigned Personnel', 'assignedPersonnel'],
    reminderPersonnel: ['Hatırlatma Personeli', 'Reminder Personnel', 'reminderPersonnel'],
    wasCalledBack: ['GERİ DÖNÜŞ YAPILDI MI? (Müşteri Arandı mı?)', 'Was Called Back', 'wasCalledBack'],
    webFormPoolDate: ['Web Form Havuz Oluşturma Tarihi', 'Web Form Pool Date', 'webFormPoolDate'],
    formSystemDate: ['Form Sistem Oluşturma Tarihi', 'Form System Date', 'formSystemDate'],
    assignmentTimeDiff: ['Atama Saat Farkı', 'Assignment Time Diff', 'assignmentTimeDiff'],
    responseTimeDiff: ['Dönüş Saat Farkı', 'Response Time Diff', 'responseTimeDiff'],
    outgoingCallSystemDate: ['Giden Arama Sistem Oluşturma Tarihi', 'Outgoing Call System Date', 'outgoingCallSystemDate'],
    customerResponseDate: ['Müşteri Geri Dönüş Tarihi (Giden Arama)', 'Customer Response Date', 'customerResponseDate'],
    wasEmailSent: ['GERİ DÖNÜŞ YAPILDI MI? (Müşteriye Mail Gönderildi mi?)', 'Was Email Sent', 'wasEmailSent'],
    customerEmailResponseDate: ['Müşteri Mail Geri Dönüş Tarihi', 'Customer Email Response Date', 'customerEmailResponseDate'],
    unreachableByPhone: ['Telefonla Ulaşılamayan Müşteriler', 'Unreachable By Phone', 'unreachableByPhone'],
    daysWaitingResponse: ['Kaç Gündür Geri Dönüş Bekliyor', 'Days Waiting Response', 'daysWaitingResponse'],
    daysToResponse: ['Kaç Günde Geri Dönüş Yapılmış (Süre)', 'Days To Response', 'daysToResponse'],
    callNote: ['GERİ DÖNÜŞ NOTU (Giden Arama Notu)', 'Call Note', 'callNote'],
    emailNote: ['GERİ DÖNÜŞ NOTU (Giden Mail Notu)', 'Email Note', 'emailNote'],
    oneOnOneMeeting: ['Birebir Görüşme Yapıldı mı ?', 'One On One Meeting', 'oneOnOneMeeting'],
    meetingDate: ['Birebir Görüşme Tarihi', 'Meeting Date', 'meetingDate'],
    responseResult: ['Dönüş Görüşme Sonucu', 'Response Result', 'responseResult'],
    negativeReason: ['Dönüş Olumsuzluk Nedeni', 'Negative Reason', 'negativeReason'],
    wasSaleMade: ['Müşteriye Satış Yapıldı Mı ?', 'Was Sale Made', 'wasSaleMade'],
    saleCount: ['Satış Adedi', 'Sale Count', 'saleCount'],
    appointmentDate: ['Randevu Tarihi', 'Appointment Date', 'appointmentDate'],
    lastMeetingNote: ['SON GORUSME NOTU', 'SON GÖRÜŞME NOTU', 'Last Meeting Note', 'lastMeetingNote'],
    lastMeetingResult: ['SON GORUSME SONUCU', 'SON GÖRÜŞME SONUCU', 'Last Meeting Result', 'lastMeetingResult']
  };

  // Extract values using the mapping
  const webFormNote = getFieldValue(row, columnMappings.webFormNote);
  const lastMeetingResult = getFieldValue(row, columnMappings.lastMeetingResult);
  
  // Advanced parsing: Lead type detection from WebForm Note
  const leadType = detectLeadTypeFromWebForm(webFormNote);
  
  // Advanced parsing: Project name detection from WebForm Note  
  const projectName = parseProjectFromWebFormNote(webFormNote);
  
  // Dynamic status from SON GORUSME SONUCU - avoid defaulting to "Yeni"
  const status = lastMeetingResult || (getFieldValue(row, columnMappings.responseResult)) || '';

  return {
    customerName: getFieldValue(row, columnMappings.customerName),
    requestDate: parseDate(getFieldValue(row, columnMappings.requestDate)),
    leadType,
    assignedPersonnel: getFieldValue(row, columnMappings.assignedPersonnel),
    status,
    
    // Comprehensive fields with all Turkish column support
    customerId: getFieldValue(row, columnMappings.customerId),
    contactId: getFieldValue(row, columnMappings.contactId),
    projectName,
    firstCustomerSource: getFieldValue(row, columnMappings.firstCustomerSource),
    formCustomerSource: getFieldValue(row, columnMappings.formCustomerSource),
    webFormNote,
    infoFormLocation1: getFieldValue(row, columnMappings.infoFormLocation1),
    infoFormLocation2: getFieldValue(row, columnMappings.infoFormLocation2),
    infoFormLocation3: getFieldValue(row, columnMappings.infoFormLocation3),
    infoFormLocation4: getFieldValue(row, columnMappings.infoFormLocation4),
    reminderPersonnel: getFieldValue(row, columnMappings.reminderPersonnel),
    wasCalledBack: getFieldValue(row, columnMappings.wasCalledBack),
    webFormPoolDate: parseDate(getFieldValue(row, columnMappings.webFormPoolDate)),
    formSystemDate: parseDate(getFieldValue(row, columnMappings.formSystemDate)),
    assignmentTimeDiff: getFieldValue(row, columnMappings.assignmentTimeDiff),
    responseTimeDiff: getFieldValue(row, columnMappings.responseTimeDiff),
    outgoingCallSystemDate: parseDate(getFieldValue(row, columnMappings.outgoingCallSystemDate)),
    customerResponseDate: parseDate(getFieldValue(row, columnMappings.customerResponseDate)),
    wasEmailSent: getFieldValue(row, columnMappings.wasEmailSent),
    customerEmailResponseDate: parseDate(getFieldValue(row, columnMappings.customerEmailResponseDate)),
    unreachableByPhone: getFieldValue(row, columnMappings.unreachableByPhone),
    daysWaitingResponse: parseInt(getFieldValue(row, columnMappings.daysWaitingResponse)) || undefined,
    daysToResponse: parseInt(getFieldValue(row, columnMappings.daysToResponse)) || undefined,
    callNote: getFieldValue(row, columnMappings.callNote),
    emailNote: getFieldValue(row, columnMappings.emailNote),
    oneOnOneMeeting: getFieldValue(row, columnMappings.oneOnOneMeeting),
    meetingDate: parseDate(getFieldValue(row, columnMappings.meetingDate)),
    responseResult: getFieldValue(row, columnMappings.responseResult),
    negativeReason: getFieldValue(row, columnMappings.negativeReason),
    wasSaleMade: getFieldValue(row, columnMappings.wasSaleMade),
    saleCount: parseInt(getFieldValue(row, columnMappings.saleCount)) || undefined,
    appointmentDate: parseDate(getFieldValue(row, columnMappings.appointmentDate)),
    lastMeetingNote: getFieldValue(row, columnMappings.lastMeetingNote),
    lastMeetingResult
  };
}

export interface ParsedLead {
  customerName: string;
  requestDate: string;
  leadType: string;
  assignedPersonnel: string;
  status: string;
  // Optional comprehensive fields
  customerId?: string;
  contactId?: string;
  projectName?: string;
  firstCustomerSource?: string;
  formCustomerSource?: string;
  webFormNote?: string;
  infoFormLocation1?: string;
  infoFormLocation2?: string;
  infoFormLocation3?: string;
  infoFormLocation4?: string;
  reminderPersonnel?: string;
  wasCalledBack?: string;
  webFormPoolDate?: string;
  formSystemDate?: string;
  assignmentTimeDiff?: string;
  responseTimeDiff?: string;
  outgoingCallSystemDate?: string;
  customerResponseDate?: string;
  wasEmailSent?: string;
  customerEmailResponseDate?: string;
  unreachableByPhone?: string;
  daysWaitingResponse?: number;
  daysToResponse?: number;
  callNote?: string;
  emailNote?: string;
  oneOnOneMeeting?: string;
  meetingDate?: string;
  responseResult?: string;
  negativeReason?: string;
  wasSaleMade?: string;
  saleCount?: number;
  appointmentDate?: string;
  lastMeetingNote?: string;
  lastMeetingResult?: string;
}

export function parseExcelFile(file: File): Promise<ParsedLead[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const leads = jsonData.map(mapRowToLead);
        resolve(leads);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsArrayBuffer(file);
  });
}

export function parseCSVFile(file: File): Promise<ParsedLead[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        if (lines.length < 2) {
          reject(new Error('CSV file must have at least a header and one data row'));
          return;
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const leads: ParsedLead[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          leads.push(mapRowToLead(row));
        }
        
        resolve(leads);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsText(file);
  });
}

export function parseJSONFile(file: File): Promise<ParsedLead[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const jsonData = JSON.parse(text);
        
        if (!Array.isArray(jsonData)) {
          reject(new Error('JSON file must contain an array of objects'));
          return;
        }
        
        const leads = jsonData.map(mapRowToLead);
        resolve(leads);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsText(file);
  });
}

export function parseFile(file: File): Promise<ParsedLead[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'xlsx':
    case 'xls':
      return parseExcelFile(file);
    case 'csv':
      return parseCSVFile(file);
    case 'json':
      return parseJSONFile(file);
    default:
      return Promise.reject(new Error('Unsupported file type. Please use Excel (.xlsx), CSV (.csv), or JSON (.json) files.'));
  }
}