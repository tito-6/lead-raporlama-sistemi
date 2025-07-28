import fs from 'fs';
import path from 'path';

const TARGETS_FILE = path.join(process.cwd(), 'data', 'sales-targets.json');

export interface SalesTarget {
  target: number;
  period: 'monthly' | 'bimonthly';
  description: string;
}

export interface SalesTargetData {
  salesTargets: {
    default: Record<string, SalesTarget>;
    personnel: Record<string, Record<string, SalesTarget>>;
    lastUpdated: string;
  };
}

// Initialize default targets data
const initDefaultTargets = (): SalesTargetData => ({
  salesTargets: {
    default: {
      "Model Sanayi Merkezi": {
        target: 1,
        period: "monthly",
        description: "MSM default target: 1 sale per month"
      },
      "Model Kuyum Merkezi": {
        target: 1,
        period: "bimonthly",
        description: "MKM default target: 1 sale per 2 months"
      }
    },
    personnel: {},
    lastUpdated: new Date().toISOString()
  }
});

// Load targets from JSON file
export const loadSalesTargets = (): SalesTargetData => {
  try {
    if (fs.existsSync(TARGETS_FILE)) {
      const data = fs.readFileSync(TARGETS_FILE, 'utf8');
      const parsed = JSON.parse(data) as SalesTargetData;
      
      // Ensure structure is valid
      if (!parsed.salesTargets || !parsed.salesTargets.default || !parsed.salesTargets.personnel) {
        console.log('Invalid sales targets structure, initializing defaults...');
        return initDefaultTargets();
      }
      
      console.log('✅ Loaded sales targets from file');
      return parsed;
    } else {
      console.log('📊 Sales targets file not found, creating with defaults...');
      const defaultData = initDefaultTargets();
      saveSalesTargets(defaultData);
      return defaultData;
    }
  } catch (error) {
    console.error('❌ Error loading sales targets:', error);
    return initDefaultTargets();
  }
};

// Save targets to JSON file
export const saveSalesTargets = (data: SalesTargetData): void => {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(TARGETS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Update last modified timestamp
    data.salesTargets.lastUpdated = new Date().toISOString();
    
    // Write to file with pretty formatting
    fs.writeFileSync(TARGETS_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log('✅ Sales targets saved to file');
  } catch (error) {
    console.error('❌ Error saving sales targets:', error);
  }
};

// Get target for a specific personnel and project
export const getPersonnelTarget = (
  personnelName: string, 
  projectName: string, 
  targetsData: SalesTargetData
): SalesTarget => {
  // Check if personnel has custom target for this project
  const personnelTargets = targetsData.salesTargets.personnel[personnelName];
  if (personnelTargets && personnelTargets[projectName]) {
    return personnelTargets[projectName];
  }
  
  // Fall back to default project target
  const defaultTargets = targetsData.salesTargets.default;
  
  // Try exact match first
  if (defaultTargets[projectName]) {
    return defaultTargets[projectName];
  }
  
  // Try partial matches for common project names
  for (const [defaultProject, target] of Object.entries(defaultTargets)) {
    if (projectName.includes(defaultProject) || defaultProject.includes(projectName)) {
      return target;
    }
  }
  
  // Default fallback - monthly target of 1
  return {
    target: 1,
    period: 'monthly',
    description: 'Default target'
  };
};

// Set custom target for personnel and project
export const setPersonnelTarget = (
  personnelName: string,
  projectName: string,
  target: SalesTarget,
  targetsData: SalesTargetData
): SalesTargetData => {
  // Initialize personnel targets if not exists
  if (!targetsData.salesTargets.personnel[personnelName]) {
    targetsData.salesTargets.personnel[personnelName] = {};
  }
  
  // Set the target
  targetsData.salesTargets.personnel[personnelName][projectName] = target;
  
  return targetsData;
};

// Update default project target
export const setDefaultTarget = (
  projectName: string,
  target: SalesTarget,
  targetsData: SalesTargetData
): SalesTargetData => {
  targetsData.salesTargets.default[projectName] = target;
  return targetsData;
};

// Get all targets for a personnel
export const getPersonnelAllTargets = (
  personnelName: string,
  targetsData: SalesTargetData
): Record<string, SalesTarget> => {
  const personnelTargets = targetsData.salesTargets.personnel[personnelName] || {};
  const defaultTargets = targetsData.salesTargets.default;
  
  // Merge default and custom targets (custom takes precedence)
  return { ...defaultTargets, ...personnelTargets };
};

// Calculate effective target for current time period
export const calculateEffectiveTarget = (
  target: SalesTarget,
  dateFilters?: {
    dateFilterType?: string;
    selectedMonth?: string;
    selectedYear?: string;
    startDate?: string;
    endDate?: string;
  }
): number => {
  if (!dateFilters || dateFilters.dateFilterType === 'none') {
    return target.target;
  }
  
  // For monthly filters with bimonthly targets, calculate proportional target
  if (target.period === 'bimonthly' && dateFilters.dateFilterType === 'month') {
    return Math.round(target.target / 2); // Half target for single month
  }
  
  // For yearly filters, multiply appropriately
  if (dateFilters.dateFilterType === 'year') {
    return target.period === 'monthly' ? target.target * 12 : target.target * 6;
  }
  
  // For custom date ranges, calculate based on duration
  if (dateFilters.dateFilterType === 'custom' && dateFilters.startDate && dateFilters.endDate) {
    const startDate = new Date(dateFilters.startDate);
    const endDate = new Date(dateFilters.endDate);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const monthsInRange = daysDiff / 30; // Approximate months
    
    if (target.period === 'monthly') {
      return Math.round(target.target * monthsInRange);
    } else {
      return Math.round(target.target * (monthsInRange / 2));
    }
  }
  
  return target.target;
};
