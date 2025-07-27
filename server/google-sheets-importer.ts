import { URL } from "url";
import axios from "axios";
import { z } from "zod";
import { LeadExpense, InsertLeadExpense } from "@shared/schema";

interface GoogleSheetsImportOptions {
  sheetUrl: string;
  requirePublicSharing?: boolean;
}

/**
 * Validates and fixes a Google Sheet URL
 * @param sheetUrl - The user-provided Google Sheet URL
 * @returns A properly formatted URL with protocol included
 */
export function fixSheetUrl(sheetUrl: string): string {
  if (!sheetUrl) {
    throw new Error("Google Sheets URL is required");
  }

  let normalizedUrl = sheetUrl.trim();

  // Add https:// if missing
  if (
    !normalizedUrl.startsWith("http://") &&
    !normalizedUrl.startsWith("https://")
  ) {
    // If it starts with docs.google.com, add https://
    if (normalizedUrl.startsWith("docs.google.com")) {
      normalizedUrl = "https://" + normalizedUrl;
    } else {
      // Default to https
      normalizedUrl = "https://" + normalizedUrl;
    }
  }

  // Validate that it's a Google Sheets URL
  if (!normalizedUrl.includes("docs.google.com/spreadsheets")) {
    throw new Error(
      "URL must be a valid Google Sheets URL (docs.google.com/spreadsheets)"
    );
  }

  return normalizedUrl;
}

/**
 * Extract spreadsheet ID from a Google Sheet URL
 * @param sheetUrl - The Google Sheet URL
 * @returns The spreadsheet ID
 */
export function extractSpreadsheetId(sheetUrl: string): string {
  try {
    const fixedUrl = fixSheetUrl(sheetUrl);
    const url = new URL(fixedUrl);
    const urlPathParts = url.pathname.split("/");
    // Google Sheets URL format: https://docs.google.com/spreadsheets/d/{spreadsheetId}/edit...
    const spreadsheetId = urlPathParts[3]; // /d/{spreadsheetId}/edit

    if (!spreadsheetId) {
      throw new Error("Invalid Google Sheets URL format");
    }

    return spreadsheetId;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error("Invalid Google Sheets URL: " + errorMessage);
  }
}

/**
 * Validate expense data from Google Sheets
 */
const ExpenseRowSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
  expenseType: z.enum(["agency_fee", "ads_expense"], {
    errorMap: () => ({
      message: 'Expense type must be "agency_fee" or "ads_expense"',
    }),
  }),
  amountTL: z
    .string()
    .or(z.number())
    .transform((val) => String(val)),
  description: z.string().optional().nullable(),
});

/**
 * Imports expenses from a Google Sheet
 * @param sheetUrl - The URL of the Google Sheet
 * @returns Array of valid expense records
 */
export async function importExpensesFromGoogleSheet({
  sheetUrl,
  requirePublicSharing = true,
}: GoogleSheetsImportOptions): Promise<{
  validExpenses: InsertLeadExpense[];
  invalidRows: Array<{ row: number; errors: string[] }>;
  totalRows: number;
}> {
  try {
    // Validate and fix the URL
    const fixedUrl = fixSheetUrl(sheetUrl);

    // Extract spreadsheet ID
    const spreadsheetId = extractSpreadsheetId(fixedUrl);

    // Construct API URL for public Google Sheets API
    // This uses the public sheets API which doesn't require auth for public sheets
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:Z1000`;

    // Fetch sheet data
    const response = await axios.get(apiUrl, {
      params: {
        key: "AIzaSyAcwrZaZ_SlX_BZv4li0XrWoDpdlOUnMX0", // Public key for demo purposes only
        valueRenderOption: "UNFORMATTED_VALUE",
      },
    });

    if (!response.data || !response.data.values) {
      throw new Error(
        "No data found in Google Sheet. Make sure the sheet is publicly accessible."
      );
    }

    const rows = response.data.values as any[][];

    // Check if there are at least 2 rows (header + data)
    if (rows.length < 2) {
      throw new Error(
        "Sheet must contain at least a header row and one data row"
      );
    }

    // Extract headers (first row)
    const headers = rows[0].map((h: any) => String(h).toLowerCase().trim());

    // Check for required columns
    const requiredColumns = ["month", "expensetype", "amounttl"];
    const missingColumns = requiredColumns.filter(
      (col) => !headers.some((h: string) => h === col)
    );

    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(", ")}`);
    }

    // Map column indices
    const columnIndices = {
      month: headers.findIndex((h: string) => h === "month"),
      expenseType: headers.findIndex((h: string) => h === "expensetype"),
      amountTL: headers.findIndex((h: string) => h === "amounttl"),
      description: headers.findIndex((h: string) => h === "description"),
    };

    // Process data rows
    const validExpenses: InsertLeadExpense[] = [];
    const invalidRows: Array<{ row: number; errors: string[] }> = [];

    // Skip header row (start from index 1)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      // Skip empty rows
      if (!row || !row.length) continue;

      try {
        // Extract data from row
        const expenseData = {
          month: row[columnIndices.month] || "",
          expenseType: row[columnIndices.expenseType] || "",
          amountTL: row[columnIndices.amountTL] || "",
          description:
            columnIndices.description >= 0
              ? row[columnIndices.description] || ""
              : "",
        };

        // Validate row data
        const validatedData = ExpenseRowSchema.parse(expenseData);

        // Add to valid expenses
        validExpenses.push(validatedData);
      } catch (error: unknown) {
        // Collect validation errors
        const validationError = error as {
          errors?: Array<{ path: string[]; message: string }>;
        };
        const errors = validationError.errors?.map(
          (err) => `${err.path.join(".")}: ${err.message}`
        ) || ["Invalid data format"];

        invalidRows.push({
          row: i + 1, // 1-indexed for user-friendly row numbers
          errors,
        });
      }
    }

    return {
      validExpenses,
      invalidRows,
      totalRows: rows.length - 1, // Exclude header row
    };
  } catch (error: unknown) {
    // Re-throw with clear message
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to import from Google Sheets: ${errorMessage}`);
  }
}
