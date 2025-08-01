import fs from "fs";
import path from "path";
import { LeadExpense, Lead } from "@shared/schema";

// Determine environment and set appropriate data paths
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

// For Vercel deployment, we'll use /tmp for writes and public for initial reads
const DATA_DIR = isVercel ? "/tmp/data" : path.join(process.cwd(), "data");
const PUBLIC_DATA_DIR = path.join(process.cwd(), "client", "public", "data");

// File paths
const EXPENSES_FILE = path.join(DATA_DIR, "lead-expenses.json");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

// Public file paths (for initial data loading in production)
const PUBLIC_EXPENSES_FILE = path.join(PUBLIC_DATA_DIR, "lead-expenses.json");
const PUBLIC_LEADS_FILE = path.join(PUBLIC_DATA_DIR, "leads.json");

// Ensure the data directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  // In Vercel, copy initial data from public to tmp on first run (only if demo files exist)
  if (isVercel) {
    if (fs.existsSync(PUBLIC_EXPENSES_FILE) && !fs.existsSync(EXPENSES_FILE)) {
      fs.copyFileSync(PUBLIC_EXPENSES_FILE, EXPENSES_FILE);
      console.log("✅ Copied initial expenses data from public to tmp");
    } else if (!fs.existsSync(EXPENSES_FILE)) {
      // Create empty expenses file if no demo data exists
      fs.writeFileSync(EXPENSES_FILE, JSON.stringify([], null, 2));
      console.log("✅ Created empty expenses file");
    }
    
    if (fs.existsSync(PUBLIC_LEADS_FILE) && !fs.existsSync(LEADS_FILE)) {
      fs.copyFileSync(PUBLIC_LEADS_FILE, LEADS_FILE);
      console.log("✅ Copied initial leads data from public to tmp");
    } else if (!fs.existsSync(LEADS_FILE)) {
      // Create empty leads file if no demo data exists
      fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
      console.log("✅ Created empty leads file");
    }
  }
} catch (err) {
  console.error("Failed to create data directory or copy initial data:", err);
}

// Save expenses to file
export function saveExpenses(expenses: LeadExpense[]): void {
  try {
    fs.writeFileSync(EXPENSES_FILE, JSON.stringify(expenses, null, 2));
    console.log(`✅ Saved ${expenses.length} expenses to ${EXPENSES_FILE}`);
  } catch (err) {
    console.error("Failed to save expenses to file:", err);
    if (isVercel) {
      console.warn("⚠️ File persistence not available in Vercel production - data will be lost on restart");
    }
  }
}

// Load expenses from file
export function loadExpenses(): LeadExpense[] {
  try {
    let filePath = EXPENSES_FILE;
    
    // In production, try tmp first, then fallback to public
    if (isVercel && !fs.existsSync(EXPENSES_FILE) && fs.existsSync(PUBLIC_EXPENSES_FILE)) {
      filePath = PUBLIC_EXPENSES_FILE;
      console.log("📂 Loading expenses from public directory (fallback)");
    }
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      
      // Remove BOM if present
      const cleanData = data.replace(/^\uFEFF/, '');
      
      // Check if file is empty or contains only whitespace
      if (!cleanData.trim()) {
        console.log("📂 Expenses file is empty, returning empty array");
        return [];
      }
      
      const expenses = JSON.parse(cleanData) as LeadExpense[];
      console.log(
        `✅ Loaded ${expenses.length} expenses from ${filePath}`
      );
      return expenses;
    }
  } catch (err) {
    console.error("Failed to load expenses from file:", err);
    // Create empty file if parsing fails
    try {
      fs.writeFileSync(EXPENSES_FILE, JSON.stringify([], null, 2));
      console.log("🔧 Created new empty expenses file after error");
    } catch (writeErr) {
      console.error("Failed to create new expenses file:", writeErr);
    }
  }
  return [];
}

// Save leads to file
export function saveLeads(leads: Lead[]): void {
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
    console.log(`✅ Saved ${leads.length} leads to ${LEADS_FILE}`);
  } catch (err) {
    console.error("Failed to save leads to file:", err);
    if (isVercel) {
      console.warn("⚠️ File persistence not available in Vercel production - data will be lost on restart");
    }
  }
}

// Load leads from file
export function loadLeads(): Lead[] {
  try {
    let filePath = LEADS_FILE;
    
    // In production, try tmp first, then fallback to public
    if (isVercel && !fs.existsSync(LEADS_FILE) && fs.existsSync(PUBLIC_LEADS_FILE)) {
      filePath = PUBLIC_LEADS_FILE;
      console.log("📂 Loading leads from public directory (fallback)");
    }
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      
      // Remove BOM if present
      const cleanData = data.replace(/^\uFEFF/, '');
      
      // Check if file is empty or contains only whitespace
      if (!cleanData.trim()) {
        console.log("📂 Leads file is empty, returning empty array");
        return [];
      }
      
      const leads = JSON.parse(cleanData) as Lead[];
      console.log(`✅ Loaded ${leads.length} leads from ${filePath}`);
      return leads;
    }
  } catch (err) {
    console.error("Failed to load leads from file:", err);
    // Create empty file if parsing fails
    try {
      fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
      console.log("🔧 Created new empty leads file after error");
    } catch (writeErr) {
      console.error("Failed to create new leads file:", writeErr);
    }
  }
  return [];
}

// Check for duplicate leads based on key fields
export function detectDuplicateLeads(existingLeads: Lead[], newLeads: Lead[]): {
  duplicates: Lead[];
  newUniqueLeads: Lead[];
  summary: {
    total: number;
    duplicates: number;
    newUnique: number;
  };
} {
  const duplicates: Lead[] = [];
  const newUniqueLeads: Lead[] = [];

  for (const newLead of newLeads) {
    // Check for duplicates based on key identifying fields
    const isDuplicate = existingLeads.some(existingLead => 
      existingLead.customerName === newLead.customerName &&
      existingLead.customerId === newLead.customerId &&
      existingLead.projectName === newLead.projectName &&
      existingLead.requestDate === newLead.requestDate &&
      existingLead.webFormNote === newLead.webFormNote
    );

    if (isDuplicate) {
      duplicates.push(newLead);
    } else {
      newUniqueLeads.push(newLead);
    }
  }

  return {
    duplicates,
    newUniqueLeads,
    summary: {
      total: newLeads.length,
      duplicates: duplicates.length,
      newUnique: newUniqueLeads.length
    }
  };
}

// Import leads with duplicate detection
export function importLeadsWithDuplicateDetection(newLeads: Lead[]): {
  duplicates: Lead[];
  imported: Lead[];
  summary: {
    total: number;
    duplicates: number;
    imported: number;
  };
} {
  try {
    // Load existing leads
    const existingLeads = loadLeads();
    
    // Detect duplicates
    const detectionResult = detectDuplicateLeads(existingLeads, newLeads);
    
    // Combine existing leads with new unique leads
    const allLeads = [...existingLeads, ...detectionResult.newUniqueLeads];
    
    // Save updated leads back to file
    saveLeads(allLeads);
    
    console.log(`Import completed: ${detectionResult.summary.newUnique} new leads imported, ${detectionResult.summary.duplicates} duplicates detected`);
    
    return {
      duplicates: detectionResult.duplicates,
      imported: detectionResult.newUniqueLeads,
      summary: {
        total: detectionResult.summary.total,
        duplicates: detectionResult.summary.duplicates,
        imported: detectionResult.summary.newUnique
      }
    };
  } catch (error) {
    console.error('Error importing leads with duplicate detection:', error);
    throw error;
  }
}
