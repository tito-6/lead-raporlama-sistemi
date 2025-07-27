import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";
import {
  leads,
  leadExpenses,
  salesReps,
  settings,
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
import { IStorage } from "./storage";

export class DbStorage implements IStorage {
  // Memory storage for in-memory operations
  private memStorage: IStorage;

  constructor(memStorage: IStorage) {
    this.memStorage = memStorage;
  }

  // Leads
  async getLeads(): Promise<Lead[]> {
    try {
      return await db.select().from(leads);
    } catch (error) {
      console.error("DB error in getLeads:", error);
      return this.memStorage.getLeads();
    }
  }

  async getLeadById(id: number): Promise<Lead | undefined> {
    try {
      const result = await db.select().from(leads).where(eq(leads.id, id));
      return result[0];
    } catch (error) {
      console.error(`DB error in getLeadById(${id}):`, error);
      return this.memStorage.getLeadById(id);
    }
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    try {
      const result = await db.insert(leads).values(lead).returning();
      return result[0];
    } catch (error) {
      console.error("DB error in createLead:", error);
      return this.memStorage.createLead(lead);
    }
  }

  async updateLead(
    id: number,
    lead: Partial<InsertLead>
  ): Promise<Lead | undefined> {
    try {
      const result = await db
        .update(leads)
        .set(lead)
        .where(eq(leads.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error(`DB error in updateLead(${id}):`, error);
      return this.memStorage.updateLead(id, lead);
    }
  }

  async deleteLead(id: number): Promise<boolean> {
    try {
      await db.delete(leads).where(eq(leads.id, id));
      return true;
    } catch (error) {
      console.error(`DB error in deleteLead(${id}):`, error);
      return this.memStorage.deleteLead(id);
    }
  }

  async clearAllLeads(): Promise<void> {
    try {
      await db.delete(leads);
    } catch (error) {
      console.error("DB error in clearAllLeads:", error);
      return this.memStorage.clearAllLeads();
    }
  }

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
    try {
      // This will need a more sophisticated implementation based on your filters
      // For now, we'll fall back to the memory implementation that has this logic
      return this.memStorage.getLeadsByFilter(filters);
    } catch (error) {
      console.error("DB error in getLeadsByFilter:", error);
      return this.memStorage.getLeadsByFilter(filters);
    }
  }

  // Lead Expenses - With persistent database storage
  async getLeadExpenses(): Promise<LeadExpense[]> {
    try {
      return await db.select().from(leadExpenses);
    } catch (error) {
      console.error("DB error in getLeadExpenses:", error);
      return this.memStorage.getLeadExpenses();
    }
  }

  async getLeadExpenseById(id: number): Promise<LeadExpense | undefined> {
    try {
      const result = await db
        .select()
        .from(leadExpenses)
        .where(eq(leadExpenses.id, id));
      return result[0];
    } catch (error) {
      console.error(`DB error in getLeadExpenseById(${id}):`, error);
      return this.memStorage.getLeadExpenseById(id);
    }
  }

  async createLeadExpense(expense: InsertLeadExpense): Promise<LeadExpense> {
    try {
      const now = new Date();
      const result = await db
        .insert(leadExpenses)
        .values({
          ...expense,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error("DB error in createLeadExpense:", error);
      return this.memStorage.createLeadExpense(expense);
    }
  }

  async updateLeadExpense(
    id: number,
    expense: Partial<InsertLeadExpense>
  ): Promise<LeadExpense | undefined> {
    try {
      const result = await db
        .update(leadExpenses)
        .set({
          ...expense,
          updatedAt: new Date(),
        })
        .where(eq(leadExpenses.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error(`DB error in updateLeadExpense(${id}):`, error);
      return this.memStorage.updateLeadExpense(id, expense);
    }
  }

  async deleteLeadExpense(id: number): Promise<boolean> {
    try {
      await db.delete(leadExpenses).where(eq(leadExpenses.id, id));
      return true;
    } catch (error) {
      console.error(`DB error in deleteLeadExpense(${id}):`, error);
      return this.memStorage.deleteLeadExpense(id);
    }
  }

  async getLeadExpensesByMonth(month: string): Promise<LeadExpense[]> {
    try {
      return await db
        .select()
        .from(leadExpenses)
        .where(eq(leadExpenses.month, month));
    } catch (error) {
      console.error(`DB error in getLeadExpensesByMonth(${month}):`, error);
      return this.memStorage.getLeadExpensesByMonth(month);
    }
  }

  // Implement other required methods by delegating to memStorage
  // Sales Reps
  async getSalesReps(): Promise<SalesRep[]> {
    return this.memStorage.getSalesReps();
  }
  async getSalesRepById(id: number): Promise<SalesRep | undefined> {
    return this.memStorage.getSalesRepById(id);
  }
  async createSalesRep(salesRep: InsertSalesRep): Promise<SalesRep> {
    return this.memStorage.createSalesRep(salesRep);
  }
  async createSalesRepByName(name: string): Promise<SalesRep> {
    return this.memStorage.createSalesRepByName(name);
  }
  async updateSalesRep(
    id: number,
    salesRep: Partial<InsertSalesRep>
  ): Promise<SalesRep | undefined> {
    return this.memStorage.updateSalesRep(id, salesRep);
  }
  async deleteSalesRep(id: number): Promise<boolean> {
    return this.memStorage.deleteSalesRep(id);
  }

  // Settings
  async getSettings(): Promise<Settings[]> {
    return this.memStorage.getSettings();
  }
  async getSetting(key: string): Promise<Settings | undefined> {
    return this.memStorage.getSetting(key);
  }
  async setSetting(setting: InsertSettings): Promise<Settings> {
    return this.memStorage.setSetting(setting);
  }

  // Lead Sources
  async getLeadSources(): Promise<LeadSource[]> {
    return this.memStorage.getLeadSources();
  }
  async getLeadSourceById(id: number): Promise<LeadSource | undefined> {
    return this.memStorage.getLeadSourceById(id);
  }
  async createLeadSource(source: InsertLeadSource): Promise<LeadSource> {
    return this.memStorage.createLeadSource(source);
  }
  async updateLeadSource(
    id: number,
    source: Partial<InsertLeadSource>
  ): Promise<LeadSource | undefined> {
    return this.memStorage.updateLeadSource(id, source);
  }
  async deleteLeadSource(id: number): Promise<boolean> {
    return this.memStorage.deleteLeadSource(id);
  }

  // Google Sheets integration for expense data import
  async importExpensesFromGoogleSheet(sheetUrl: string): Promise<{
    success: boolean;
    imported: number;
    errors: string[];
    data?: LeadExpense[];
  }> {
    try {
      // Extract the sheet ID from the URL
      const sheetId = this.extractGoogleSheetId(sheetUrl);
      if (!sheetId) {
        return {
          success: false,
          imported: 0,
          errors: ["Invalid Google Sheet URL format"],
        };
      }

      // Fetch the sheet data using the Google Sheets API
      // The URL format to export as CSV: https://docs.google.com/spreadsheets/d/{sheetId}/export?format=csv
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

      const response = await fetch(exportUrl);

      if (!response.ok) {
        return {
          success: false,
          imported: 0,
          errors: [`Failed to fetch sheet: ${response.statusText}`],
        };
      }

      const csvText = await response.text();

      // Parse CSV and map to expense objects
      const { expenses, errors } = this.parseExpensesFromCSV(csvText);

      if (expenses.length === 0) {
        return {
          success: false,
          imported: 0,
          errors: ["No valid expense data found in the sheet", ...errors],
        };
      }

      // Insert expenses into the database
      let importedCount = 0;
      const importErrors: string[] = [];

      for (const expense of expenses) {
        try {
          await this.createLeadExpense(expense);
          importedCount++;
        } catch (error) {
          importErrors.push(
            `Error importing expense for ${expense.month}: ${error}`
          );
        }
      }

      return {
        success: importedCount > 0,
        imported: importedCount,
        errors: importErrors.concat(errors),
        data: expenses,
      };
    } catch (error) {
      console.error("Error importing expenses from Google Sheet:", error);
      return {
        success: false,
        imported: 0,
        errors: [
          `Error processing Google Sheet: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ],
      };
    }
  }

  // Helper to extract Google Sheet ID from various URL formats
  private extractGoogleSheetId(url: string): string | null {
    // Handle various Google Sheet URL formats
    const patterns = [
      /https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/, // Standard URL
      /https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/, // Drive open URL
      /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/, // Drive file URL
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  // Parse CSV data into expense objects
  private parseExpensesFromCSV(csvData: string): {
    expenses: InsertLeadExpense[];
    errors: string[];
  } {
    const errors: string[] = [];
    const expenses: InsertLeadExpense[] = [];

    // Parse CSV
    const lines = csvData.split("\n");

    // Check if we have a header and at least one data row
    if (lines.length < 2) {
      return { expenses, errors: ["CSV file has insufficient data"] };
    }

    // Expected headers: Month, ExpenseType, AmountTL, Description
    const headerLine = lines[0].trim().toLowerCase();
    const headers = headerLine.split(",");

    // Verify headers
    const requiredHeaders = ["month", "expensetype", "amounttl"];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

    if (missingHeaders.length > 0) {
      return {
        expenses,
        errors: [`Missing required columns: ${missingHeaders.join(", ")}`],
      };
    }

    // Process data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = this.parseCSVLine(line);

      // Map values to expense object
      try {
        const monthIdx = headers.indexOf("month");
        const typeIdx = headers.indexOf("expensetype");
        const amountIdx = headers.indexOf("amounttl");
        const descIdx = headers.indexOf("description");

        // Validate month format (YYYY-MM)
        const month = values[monthIdx];
        if (!month || !month.match(/^\d{4}-\d{2}$/)) {
          errors.push(
            `Line ${i + 1}: Invalid month format (should be YYYY-MM): ${month}`
          );
          continue;
        }

        // Validate expense type
        const expenseType = values[typeIdx].toLowerCase();
        if (!["agency_fee", "ads_expense"].includes(expenseType)) {
          errors.push(
            `Line ${
              i + 1
            }: Invalid expense type (should be agency_fee or ads_expense): ${expenseType}`
          );
          continue;
        }

        // Validate amount
        const amountStr = values[amountIdx]
          .replace(/[^0-9.,]/g, "")
          .replace(",", ".");
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount < 0) {
          errors.push(`Line ${i + 1}: Invalid amount: ${values[amountIdx]}`);
          continue;
        }

        // Create expense object
        const expense: InsertLeadExpense = {
          month,
          expenseType: expenseType as "agency_fee" | "ads_expense",
          amountTL: amount.toString(),
          description:
            descIdx >= 0 && values[descIdx] ? values[descIdx] : undefined,
        };

        expenses.push(expense);
      } catch (error) {
        errors.push(`Error parsing line ${i + 1}: ${error}`);
      }
    }

    return { expenses, errors };
  }

  // Handle CSV parsing with potential quotes
  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let currentValue = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(currentValue);
        currentValue = "";
      } else {
        currentValue += char;
      }
    }

    // Add the last value
    values.push(currentValue);
    return values;
  }

  // The following methods are for backward compatibility with MemStorage
  // and are not part of the IStorage interface, but used in existing code
  async getTakipteData(): Promise<any[]> {
    if (typeof this.memStorage["getTakipteData"] === "function") {
      return (this.memStorage as any).getTakipteData();
    }
    return [];
  }
  async setTakipteData(data: any[]): Promise<void> {
    if (typeof this.memStorage["setTakipteData"] === "function") {
      return (this.memStorage as any).setTakipteData(data);
    }
  }
  async clearTakipteData(): Promise<void> {
    if (typeof this.memStorage["clearTakipteData"] === "function") {
      return (this.memStorage as any).clearTakipteData();
    }
  }
}
