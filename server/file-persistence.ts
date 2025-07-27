import fs from "fs";
import path from "path";
import { LeadExpense } from "@shared/schema";

// File paths for persisted data
const DATA_DIR = path.join(process.cwd(), "data");
const EXPENSES_FILE = path.join(DATA_DIR, "lead-expenses.json");

// Ensure the data directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.error("Failed to create data directory:", err);
}

// Save expenses to file
export function saveExpenses(expenses: LeadExpense[]): void {
  try {
    fs.writeFileSync(EXPENSES_FILE, JSON.stringify(expenses, null, 2));
    console.log(`✅ Saved ${expenses.length} expenses to ${EXPENSES_FILE}`);
  } catch (err) {
    console.error("Failed to save expenses to file:", err);
  }
}

// Load expenses from file
export function loadExpenses(): LeadExpense[] {
  try {
    if (fs.existsSync(EXPENSES_FILE)) {
      const data = fs.readFileSync(EXPENSES_FILE, "utf8");
      const expenses = JSON.parse(data) as LeadExpense[];
      console.log(
        `✅ Loaded ${expenses.length} expenses from ${EXPENSES_FILE}`
      );
      return expenses;
    }
  } catch (err) {
    console.error("Failed to load expenses from file:", err);
  }
  return [];
}
