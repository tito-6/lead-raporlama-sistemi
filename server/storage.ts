import {
  leads,
  salesReps,
  settings,
  leadExpenses,
  leadSources,
  type Lead,
  type InsertLead,
  type SalesRep,
  type InsertSalesRep,
  type Settings,
  type InsertSettings,
  type LeadExpense,
  type InsertLeadExpense,
  type LeadSource,
  type InsertLeadSource,
} from "@shared/schema";
import { saveExpenses, loadExpenses, saveLeads, loadLeads } from "./file-persistence";

export interface IStorage {
  // Leads
  getLeads(): Promise<Lead[]>;
  getLeadById(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;
  clearAllLeads(): Promise<void>;
  getLeadsByFilter(filters: {
    startDate?: string;
    endDate?: string;
    month?: string;
    year?: string;
    salesRep?: string;
    leadType?: string;
    status?: string;
    project?: string;
  }): Promise<Lead[]>;
  
  // Pagination support for leads
  getLeadsWithPagination(page: number, limit: number, filters?: {
    search?: string;
    status?: string;
    salesRep?: string;
    project?: string;
  }): Promise<{
    leads: Lead[];
    total: number;
    page: number;
    totalPages: number;
  }>;

  // Sales Reps
  getSalesReps(): Promise<SalesRep[]>;
  getSalesRepById(id: number): Promise<SalesRep | undefined>;
  createSalesRep(salesRep: InsertSalesRep): Promise<SalesRep>;
  createSalesRepByName(name: string): Promise<SalesRep>;
  updateSalesRep(
    id: number,
    salesRep: Partial<InsertSalesRep>
  ): Promise<SalesRep | undefined>;
  deleteSalesRep(id: number): Promise<boolean>;

  // Settings
  getSettings(): Promise<Settings[]>;
  getSetting(key: string): Promise<Settings | undefined>;
  setSetting(setting: InsertSettings): Promise<Settings>;

  // Lead Expenses
  getLeadExpenses(): Promise<LeadExpense[]>;
  getLeadExpenseById(id: number): Promise<LeadExpense | undefined>;
  createLeadExpense(expense: InsertLeadExpense): Promise<LeadExpense>;
  updateLeadExpense(
    id: number,
    expense: Partial<InsertLeadExpense>
  ): Promise<LeadExpense | undefined>;
  deleteLeadExpense(id: number): Promise<boolean>;
  getLeadExpensesByMonth(month: string): Promise<LeadExpense[]>;

  // Lead Sources
  getLeadSources(): Promise<LeadSource[]>;
  getLeadSourceById(id: number): Promise<LeadSource | undefined>;
  createLeadSource(source: InsertLeadSource): Promise<LeadSource>;
  updateLeadSource(
    id: number,
    source: Partial<InsertLeadSource>
  ): Promise<LeadSource | undefined>;
  deleteLeadSource(id: number): Promise<boolean>;

  // Methods defined earlier
  // No need to duplicate getLeads and getLeadsByFilter declarations
}

export class MemStorage implements IStorage {
  private leads: Map<number, Lead>;
  private salesReps: Map<number, SalesRep>;
  private settings: Map<string, Settings>;
  private leadExpenses: Map<number, LeadExpense>;
  private leadSources: Map<number, LeadSource>;
  private takipteData: any[]; // Store takipte/follow-up data
  private currentLeadId: number;
  private currentSalesRepId: number;
  private currentSettingsId: number;
  private currentExpenseId: number;
  private currentLeadSourceId: number;

  // Performance caching
  private leadsCache: Lead[] | null = null;
  private leadsCacheTimestamp: number = 0;
  private salesRepsCache: SalesRep[] | null = null;
  private salesRepsCacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.leads = new Map();
    this.salesReps = new Map();
    this.settings = new Map();
    this.leadExpenses = new Map();
    this.leadSources = new Map();
    this.takipteData = [];
    this.currentLeadId = 1;
    this.currentSalesRepId = 1;
    this.currentSettingsId = 1;
    this.currentExpenseId = 1;
    this.currentLeadSourceId = 1;

    // Initialize cache variables
    this.leadsCache = null;
    this.leadsCacheTimestamp = 0;
    this.salesRepsCache = null;
    this.salesRepsCacheTimestamp = 0;

    // Initialize with some default sales reps
    this.initializeDefaults();

    // Load expenses from file
    this.loadExpensesFromFile();

    // Load leads from file  
    this.loadLeadsFromFile();
  }

  // Load expenses from file
  private loadExpensesFromFile(): void {
    try {
      const expenses = loadExpenses();
      let maxId = 0;

      // Add each expense to the Map
      expenses.forEach((expense) => {
        this.leadExpenses.set(expense.id, expense);
        if (expense.id > maxId) {
          maxId = expense.id;
        }
      });

      // Update the current ID counter
      if (maxId > 0) {
        this.currentExpenseId = maxId + 1;
      }

      console.log(
        `Loaded ${expenses.length} expenses from file, next ID: ${this.currentExpenseId}`
      );
    } catch (err) {
      console.error("Failed to load expenses from file:", err);
    }
  }

  // Save expenses to file
  private saveExpensesToFile(): void {
    try {
      const expenses = Array.from(this.leadExpenses.values());
      saveExpenses(expenses);
    } catch (err) {
      console.error("Failed to save expenses to file:", err);
    }
  }

  // Load leads from file
  private loadLeadsFromFile(): void {
    try {
      const leads = loadLeads();
      let maxId = 0;

      // Add each lead to the Map
      leads.forEach((lead) => {
        this.leads.set(lead.id, lead);
        if (lead.id > maxId) {
          maxId = lead.id;
        }
      });

      // Update the current ID counter
      if (maxId > 0) {
        this.currentLeadId = maxId + 1;
      }

      console.log(
        `Loaded ${leads.length} leads from file, next ID: ${this.currentLeadId}`
      );
    } catch (err) {
      console.error("Failed to load leads from file:", err);
    }
  }

  // Save leads to file
  private saveLeadsToFile(): void {
    try {
      const leads = Array.from(this.leads.values());
      saveLeads(leads);
    } catch (err) {
      console.error("Failed to save leads to file:", err);
    }
  }

  // Takipte data methods for local storage
  async getTakipteData(): Promise<any[]> {
    return this.takipteData;
  }

  async setTakipteData(data: any[]): Promise<void> {
    this.takipteData = data;
  }

  async clearTakipteData(): Promise<void> {
    this.takipteData = [];
  }

  private initializeDefaults() {
    // No default sales reps - all data should come from imported files

    // Default settings only
    const defaultSettings = [
      { key: "companyName", value: "" },
      { key: "currency", value: "TRY" },
      { key: "language", value: "tr" },
      { key: "darkMode", value: "false" },
      { key: "notifications", value: "true" },
      { key: "autoSave", value: "true" },
      { key: "colors.success", value: "#4CAF50" },
      { key: "colors.error", value: "#F44336" },
      { key: "colors.primary", value: "#1976D2" },
      { key: "colors.warning", value: "#FF9800" },
    ];

    defaultSettings.forEach((setting) => {
      const settingObj: Settings = { ...setting, id: this.currentSettingsId++ };
      this.settings.set(setting.key, settingObj);
    });

    // Initialize default lead sources
    const defaultLeadSources = [
      {
        name: "meta",
        displayName: "Meta (Facebook/Instagram)",
        icon: "Facebook",
        color: "#1877F2",
        totalBudget: "0",
        totalLeads: 0,
        cpl: "0",
        isActive: true,
      },
      {
        name: "google",
        displayName: "Google Ads",
        icon: "Chrome",
        color: "#4285F4",
        totalBudget: "0",
        totalLeads: 0,
        cpl: "0",
        isActive: true,
      },
      {
        name: "tiktok",
        displayName: "TikTok Ads",
        icon: "Music",
        color: "#000000",
        totalBudget: "0",
        totalLeads: 0,
        cpl: "0",
        isActive: true,
      },
      {
        name: "linkedin",
        displayName: "LinkedIn Ads",
        icon: "Linkedin",
        color: "#0A66C2",
        totalBudget: "0",
        totalLeads: 0,
        cpl: "0",
        isActive: true,
      },
      {
        name: "webform",
        displayName: "Web Form",
        icon: "Globe",
        color: "#16A085",
        totalBudget: "0",
        totalLeads: 0,
        cpl: "0",
        isActive: true,
      },
      {
        name: "landline",
        displayName: "Landline/Phone",
        icon: "Phone",
        color: "#E74C3C",
        totalBudget: "0",
        totalLeads: 0,
        cpl: "0",
        isActive: true,
      },
      {
        name: "referral",
        displayName: "Referral",
        icon: "Users",
        color: "#9B59B6",
        totalBudget: "0",
        totalLeads: 0,
        cpl: "0",
        isActive: true,
      },
    ];

    defaultLeadSources.forEach((source) => {
      const sourceObj: LeadSource = {
        ...source,
        id: this.currentLeadSourceId++,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.leadSources.set(sourceObj.id, sourceObj);
    });
  }

  // Leads
  async getLeads(): Promise<Lead[]> {
    // Check if cache is valid
    const now = Date.now();
    if (this.leadsCache && (now - this.leadsCacheTimestamp) < this.CACHE_DURATION) {
      return this.leadsCache;
    }

    // Refresh cache
    this.leadsCache = Array.from(this.leads.values());
    this.leadsCacheTimestamp = now;
    return this.leadsCache;
  }

  // Clear leads cache when data is modified
  private clearLeadsCache(): void {
    this.leadsCache = null;
  }

  async getLeadById(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = this.currentLeadId++;
    const lead: Lead = {
      ...insertLead,
      id,
      // Ensure all nullable fields have proper null values
      customerId: insertLead.customerId || null,
      contactId: insertLead.contactId || null,
      firstCustomerSource: insertLead.firstCustomerSource || null,
      formCustomerSource: insertLead.formCustomerSource || null,
      webFormNote: insertLead.webFormNote || null,
      infoFormLocation1: insertLead.infoFormLocation1 || null,
      infoFormLocation2: insertLead.infoFormLocation2 || null,
      infoFormLocation3: insertLead.infoFormLocation3 || null,
      infoFormLocation4: insertLead.infoFormLocation4 || null,
      reminderPersonnel: insertLead.reminderPersonnel || null,
      wasCalledBack: insertLead.wasCalledBack || null,
      webFormPoolDate: insertLead.webFormPoolDate || null,
      formSystemDate: insertLead.formSystemDate || null,
      assignmentTimeDiff: insertLead.assignmentTimeDiff || null,
      responseTimeDiff: insertLead.responseTimeDiff || null,
      outgoingCallSystemDate: insertLead.outgoingCallSystemDate || null,
      customerResponseDate: insertLead.customerResponseDate || null,
      wasEmailSent: insertLead.wasEmailSent || null,
      customerEmailResponseDate: insertLead.customerEmailResponseDate || null,
      unreachableByPhone: insertLead.unreachableByPhone || null,
      daysWaitingResponse: insertLead.daysWaitingResponse || null,
      daysToResponse: insertLead.daysToResponse || null,
      callNote: insertLead.callNote || null,
      emailNote: insertLead.emailNote || null,
      oneOnOneMeeting: insertLead.oneOnOneMeeting || null,
      meetingDate: insertLead.meetingDate || null,
      responseResult: insertLead.responseResult || null,
      negativeReason: insertLead.negativeReason || null,
      wasSaleMade: insertLead.wasSaleMade || null,
      saleCount: insertLead.saleCount || null,
      appointmentDate: insertLead.appointmentDate || null,
      lastMeetingNote: insertLead.lastMeetingNote || null,
      lastMeetingResult: insertLead.lastMeetingResult || null,
      projectName: insertLead.projectName || null,
      agencyMonthlyFees: insertLead.agencyMonthlyFees || null,
      adsExpenses: insertLead.adsExpenses || null,
      createdAt: new Date(),
    };
    this.leads.set(id, lead);
    this.clearLeadsCache(); // Clear cache after creating
    this.saveLeadsToFile(); // Save to file after creating
    return lead;
  }

  async updateLead(
    id: number,
    updateData: Partial<InsertLead>
  ): Promise<Lead | undefined> {
    const existingLead = this.leads.get(id);
    if (!existingLead) return undefined;

    const updatedLead: Lead = { ...existingLead, ...updateData };
    this.leads.set(id, updatedLead);
    this.clearLeadsCache(); // Clear cache after updating
    this.saveLeadsToFile(); // Save to file after updating
    return updatedLead;
  }

  async deleteLead(id: number): Promise<boolean> {
    const deleted = this.leads.delete(id);
    if (deleted) {
      this.clearLeadsCache(); // Clear cache after deleting
      this.saveLeadsToFile(); // Save to file after deleting
    }
    return deleted;
  }

  // Add pagination support for large datasets
  async getLeadsWithPagination(page: number = 1, limit: number = 50, filters?: {
    search?: string;
    status?: string;
    salesRep?: string;
    project?: string;
  }): Promise<{
    leads: Lead[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    let allLeads = await this.getLeads();
    
    // Apply filters
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      allLeads = allLeads.filter(lead => 
        lead.customerName?.toLowerCase().includes(searchLower) ||
        lead.contactId?.toLowerCase().includes(searchLower) ||
        lead.customerId?.toLowerCase().includes(searchLower) ||
        lead.webFormNote?.toLowerCase().includes(searchLower) ||
        lead.assignedPersonnel?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters?.status && filters.status !== 'all') {
      allLeads = allLeads.filter(lead => lead.status === filters.status);
    }
    
    if (filters?.salesRep && filters.salesRep !== 'all') {
      allLeads = allLeads.filter(lead => lead.assignedPersonnel === filters.salesRep);
    }
    
    if (filters?.project && filters.project !== 'all') {
      allLeads = allLeads.filter(lead => lead.projectName === filters.project);
    }

    const total = allLeads.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const leads = allLeads.slice(offset, offset + limit);

    return {
      leads,
      total,
      page,
      totalPages
    };
  }

  async clearAllLeads(): Promise<void> {
    this.leads.clear();
    this.currentLeadId = 1;
    this.clearLeadsCache(); // Clear cache after clearing
    this.saveLeadsToFile(); // Save to file after clearing
  }

  // Implemented above

  async getLeadsByFilter(filters: {
    startDate?: string;
    endDate?: string;
    month?: string;
    year?: string;
    salesRep?: string;
    leadType?: string;
    status?: string;
    project?: string;
  }): Promise<Lead[]> {
    let filteredLeads = Array.from(this.leads.values());

    // Date filtering
    if (filters.startDate || filters.endDate || filters.month || filters.year) {
      filteredLeads = filteredLeads.filter((lead) => {
        if (!lead.requestDate) return true; // Include leads without dates

        const leadDate = new Date(lead.requestDate);
        if (isNaN(leadDate.getTime())) return true; // Include leads with invalid dates

        // Year filter
        if (filters.year && leadDate.getFullYear().toString() !== filters.year)
          return false;

        // Month filter (1-12 to 01-12)
        if (
          filters.month &&
          (leadDate.getMonth() + 1).toString().padStart(2, "0") !==
            filters.month
        )
          return false;

        // Date range filter
        if (filters.startDate && leadDate < new Date(filters.startDate))
          return false;
        if (filters.endDate && leadDate > new Date(filters.endDate))
          return false;

        return true;
      });
    }

    if (filters.salesRep) {
      filteredLeads = filteredLeads.filter(
        (lead) => lead.assignedPersonnel === filters.salesRep
      );
    }

    if (filters.leadType) {
      filteredLeads = filteredLeads.filter(
        (lead) => lead.leadType === filters.leadType
      );
    }

    if (filters.status) {
      filteredLeads = filteredLeads.filter(
        (lead) => lead.status === filters.status
      );
    }

    // Project filtering (normalize for robust match)
    if (filters.project && filters.project !== "all") {
      const normalize = (name: string) =>
        (name || "").toLocaleLowerCase("tr-TR").replace(/\s+/g, " ").trim();
      const normalizedProject = normalize(filters.project);
      filteredLeads = filteredLeads.filter((lead) => {
        const projectField = normalize(
          lead.projectName || (lead as any)?.["Proje"] || ""
        );
        return projectField === normalizedProject;
      });
    }

    return filteredLeads;
  }

  // Sales Reps
  async getSalesReps(): Promise<SalesRep[]> {
    return Array.from(this.salesReps.values()).filter((rep) => rep.isActive);
  }

  async getSalesRepById(id: number): Promise<SalesRep | undefined> {
    return this.salesReps.get(id);
  }

  async createSalesRep(insertSalesRep: InsertSalesRep): Promise<SalesRep> {
    const id = this.currentSalesRepId++;
    const salesRep: SalesRep = {
      ...insertSalesRep,
      id,
      monthlyTarget: insertSalesRep.monthlyTarget ?? 10,
      isActive: insertSalesRep.isActive ?? true,
    };
    this.salesReps.set(id, salesRep);
    return salesRep;
  }

  async createSalesRepByName(name: string): Promise<SalesRep> {
    // Check if salesperson already exists
    const existing = Array.from(this.salesReps.values()).find(
      (rep) => rep.name === name
    );
    if (existing) return existing;

    // Create new salesperson with default target
    return this.createSalesRep({
      name,
      monthlyTarget: 50,
      isActive: true,
    });
  }

  async updateSalesRep(
    id: number,
    updateData: Partial<InsertSalesRep>
  ): Promise<SalesRep | undefined> {
    const existingSalesRep = this.salesReps.get(id);
    if (!existingSalesRep) return undefined;

    const updatedSalesRep: SalesRep = { ...existingSalesRep, ...updateData };
    this.salesReps.set(id, updatedSalesRep);
    return updatedSalesRep;
  }

  async deleteSalesRep(id: number): Promise<boolean> {
    const salesRep = this.salesReps.get(id);
    if (!salesRep) return false;

    const updatedSalesRep = { ...salesRep, isActive: false };
    this.salesReps.set(id, updatedSalesRep);
    return true;
  }

  // Settings
  async getSettings(): Promise<Settings[]> {
    return Array.from(this.settings.values());
  }

  async getSetting(key: string): Promise<Settings | undefined> {
    return this.settings.get(key);
  }

  async setSetting(insertSetting: InsertSettings): Promise<Settings> {
    const existing = this.settings.get(insertSetting.key);
    if (existing) {
      const updated: Settings = { ...existing, value: insertSetting.value };
      this.settings.set(insertSetting.key, updated);
      return updated;
    } else {
      const id = this.currentSettingsId++;
      const setting: Settings = { ...insertSetting, id };
      this.settings.set(insertSetting.key, setting);
      return setting;
    }
  }

  // Lead Expenses CRUD Methods
  async getLeadExpenses(): Promise<LeadExpense[]> {
    return Array.from(this.leadExpenses.values());
  }

  async getLeadExpenseById(id: number): Promise<LeadExpense | undefined> {
    return this.leadExpenses.get(id);
  }

  async createLeadExpense(
    insertExpense: InsertLeadExpense
  ): Promise<LeadExpense> {
    const id = this.currentExpenseId++;
    const now = new Date();
    const expense: LeadExpense = {
      ...insertExpense,
      id,
      description: insertExpense.description || null,
      projectName: insertExpense.projectName || null,
      createdAt: now,
      updatedAt: now,
    };
    this.leadExpenses.set(id, expense);

    // Save all expenses to file
    this.saveExpensesToFile();

    return expense;
  }

  async updateLeadExpense(
    id: number,
    updateData: Partial<InsertLeadExpense>
  ): Promise<LeadExpense | undefined> {
    const existingExpense = this.leadExpenses.get(id);
    if (!existingExpense) return undefined;

    const updatedExpense: LeadExpense = {
      ...existingExpense,
      ...updateData,
      updatedAt: new Date(),
    };
    this.leadExpenses.set(id, updatedExpense);

    // Save all expenses to file
    this.saveExpensesToFile();

    return updatedExpense;
  }

  async deleteLeadExpense(id: number): Promise<boolean> {
    const result = this.leadExpenses.delete(id);

    // Save changes to file if deletion was successful
    if (result) {
      this.saveExpensesToFile();
    }

    return result;
  }

  async getLeadExpensesByMonth(month: string): Promise<LeadExpense[]> {
    return Array.from(this.leadExpenses.values()).filter(
      (expense) => expense.month === month
    );
  }

  // Lead Sources CRUD
  async getLeadSources(): Promise<LeadSource[]> {
    return Array.from(this.leadSources.values());
  }

  async getLeadSourceById(id: number): Promise<LeadSource | undefined> {
    return this.leadSources.get(id);
  }

  async createLeadSource(source: InsertLeadSource): Promise<LeadSource> {
    const newSource: LeadSource = {
      id: this.currentLeadSourceId++,
      name: source.name,
      displayName: source.displayName,
      icon: source.icon,
      color: source.color,
      totalBudget: source.totalBudget || "0",
      totalLeads: source.totalLeads || 0,
      cpl: source.cpl || "0",
      isActive: source.isActive !== undefined ? source.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.leadSources.set(newSource.id, newSource);
    return newSource;
  }

  async updateLeadSource(
    id: number,
    source: Partial<InsertLeadSource>
  ): Promise<LeadSource | undefined> {
    const existing = this.leadSources.get(id);
    if (!existing) return undefined;

    const updated: LeadSource = {
      ...existing,
      ...source,
      updatedAt: new Date(),
    };
    this.leadSources.set(id, updated);
    return updated;
  }

  async deleteLeadSource(id: number): Promise<boolean> {
    return this.leadSources.delete(id);
  }
}

export const storage = new MemStorage();
