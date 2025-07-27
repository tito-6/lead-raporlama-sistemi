import { URL } from "url";
import axios from "axios";
import { z } from "zod";
import { InsertLead } from "@shared/schema";

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
    console.log("Fixed URL for extraction:", fixedUrl);

    const url = new URL(fixedUrl);
    console.log("URL parsing successful, pathname:", url.pathname);

    const urlPathParts = url.pathname.split("/");
    console.log("URL path parts:", urlPathParts);

    // Google Sheets URL format: https://docs.google.com/spreadsheets/d/{spreadsheetId}/edit...
    const spreadsheetId = urlPathParts[3]; // /d/{spreadsheetId}/edit
    console.log("Extracted spreadsheetId:", spreadsheetId);

    if (!spreadsheetId) {
      throw new Error(
        "Invalid Google Sheets URL format - missing spreadsheet ID"
      );
    }

    return spreadsheetId;
  } catch (error) {
    console.error("Error extracting spreadsheet ID:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error("Invalid Google Sheets URL: " + errorMessage);
  }
}

/**
 * Validate lead data from Google Sheets
 */
const LeadRowSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  requestDate: z.string().min(1, "Request date is required"),
  assignedPersonnel: z.string().min(1, "Assigned personnel is required"),
  leadType: z.string().default("satis"),
  status: z.string().default("yeni"),

  // Optional fields
  customerId: z.string().optional().nullable(),
  contactId: z.string().optional().nullable(),
  firstCustomerSource: z.string().optional().nullable(),
  formCustomerSource: z.string().optional().nullable(),
  webFormNote: z.string().optional().nullable(),
  infoFormLocation1: z.string().optional().nullable(),
  infoFormLocation2: z.string().optional().nullable(),
  infoFormLocation3: z.string().optional().nullable(),
  infoFormLocation4: z.string().optional().nullable(),
  reminderPersonnel: z.string().optional().nullable(),
  wasCalledBack: z.string().optional().nullable(),
  webFormPoolDate: z.string().optional().nullable(),
  formSystemDate: z.string().optional().nullable(),
  projectName: z.string().optional().nullable(),
});

/**
 * Imports leads from a Google Sheet
 * @param sheetUrl - The URL of the Google Sheet
 * @returns Array of valid lead records
 */
// @ts-ignore (The function does have a proper return)
export async function importLeadsFromGoogleSheet({
  sheetUrl,
  requirePublicSharing = true,
}: GoogleSheetsImportOptions): Promise<{
  validLeads: InsertLead[];
  invalidRows: Array<{ row: number; errors: string[] }>;
  totalRows: number;
}> {
  try {
    // Validate and fix the URL
    const fixedUrl = fixSheetUrl(sheetUrl);

    // Extract spreadsheet ID
    const spreadsheetId = extractSpreadsheetId(fixedUrl);

    // Try to get information about the spreadsheet first to determine sheet names
    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
    console.log(
      `Attempting to fetch spreadsheet metadata for ID: ${spreadsheetId}`
    );
    console.log(`Metadata URL: ${metadataUrl}`);

    let sheetName = "Sheet1"; // Default sheet name
    try {
      // Try to get the metadata without using an API key
      // Export format=csv is more reliable for public access without API key
      const publicUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv`;
      console.log("Trying to access sheet with public URL:", publicUrl);

      // We won't actually get sheet names this way, just checking if we can access the sheet
      await axios.head(publicUrl);
      console.log("Public access to sheet confirmed");

      // We'll continue with Sheet1, but we can try other common sheet names if it fails
      const commonSheetNames = ["Sheet1", "Sheet", "Sayfa1", "Data", "Veri"];
      console.log("Will try these sheet names:", commonSheetNames.join(", "));

      // For now, we'll stick with Sheet1 as the default
      // We'll adjust the sheet name if needed in the main data fetch

      // Since we're not using the API approach, we'll just try common sheet names
      console.log("Will proceed with default sheet name:", sheetName);

      // Check if the URL contains a gid parameter (indicates a specific sheet)
      if (fixedUrl.includes("gid=")) {
        const gidMatch = /gid=(\d+)/.exec(fixedUrl);
        if (gidMatch && gidMatch[1]) {
          console.log("Found sheet gid in URL:", gidMatch[1]);
          // We can't directly convert gid to sheet name without API access
          // But we know this sheet exists, so we'll try to access it differently
        }
      }
    } catch (metadataError: any) {
      console.log(
        "Could not get sheet names, using default 'Sheet1':",
        metadataError.message
      );
      // Continue with default Sheet1
    }

    // Use a different approach - public export to CSV/TSV which doesn't require API key
    // This approach works for publicly shared sheets
    const publicUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;

    console.log(
      `Attempting to fetch spreadsheet data with ID: ${spreadsheetId}`
    );
    console.log(`Public URL: ${publicUrl}`);

    // Fetch sheet data
    let response: any = null;
    let sheetData: any = null;

    try {
      response = await axios.get(publicUrl, {
        timeout: 10000, // 10 second timeout
      });

      // The response comes in a pseudo-JSON format that needs cleaning
      // It starts with "/*O_o*/" and ends with some extra characters
      const jsonData = response.data
        .toString()
        .replace(/^.*?(\{.*\}).*?$/, "$1"); // Extract JSON part

      try {
        sheetData = JSON.parse(jsonData);
        response.data = sheetData;
        console.log("Successfully parsed JSON data");
      } catch (parseError) {
        console.error("Failed to parse JSON data:", parseError);
        throw new Error("Failed to parse spreadsheet data");
      }
      console.log("Google Sheets API response status:", response.status);
    } catch (apiError) {
      console.error("Google Sheets data fetch failed:");
      console.error("Status:", (apiError as any).response?.status);
      console.error("Status Text:", (apiError as any).response?.statusText);
      console.error("Response Data:", (apiError as any).response?.data);
      console.error(
        "Error Message:",
        apiError instanceof Error ? apiError.message : String(apiError)
      );

      // Try alternative approach with CSV export which often works better
      console.log("Attempting alternative approach with CSV export...");
      try {
        const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
        console.log("CSV URL:", csvUrl);

        const csvResponse = await axios.get(csvUrl, {
          timeout: 10000,
        });

        console.log("CSV approach successful, parsing data");

        // Parse CSV data
        const csvData = csvResponse.data;
        const lines = csvData.split("\n");

        if (lines.length < 2) {
          throw new Error("Not enough data in CSV response");
        }

        // Process CSV header row
        const csvHeaders = lines[0].split(",").map((header: string) =>
          header
            .replace(/^"(.*)"$/, "$1")
            .toLowerCase()
            .trim()
        );

        console.log("CSV Headers:", csvHeaders);

        // Create rows from CSV data
        const csvRows = lines.slice(1).map((line: string) => {
          const values = line
            .split(",")
            .map((val: string) => val.replace(/^"(.*)"$/, "$1"));
          return values;
        });

        // Use this data instead
        response.data = {
          table: {
            cols: csvHeaders.map((h: string) => ({ label: h })),
            rows: csvRows.map((row: string[]) => ({
              c: row.map((cell: string) => ({ v: cell })),
            })),
          },
        };

        console.log("Successfully converted CSV data to table format");
      } catch (csvError) {
        console.error("CSV approach also failed:", csvError);

        const apiErrorTyped = apiError as any;

        // Add specific error handling based on status codes
        if (apiErrorTyped.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (apiErrorTyped.response.status === 403) {
            throw new Error(
              "Access denied to the Google Sheet. Please make sure the sheet is shared with anyone who has the link (viewable by anyone)."
            );
          } else if (apiErrorTyped.response.status === 404) {
            throw new Error(
              "Google Sheet not found. Please check the URL and make sure the spreadsheet exists and is shared properly."
            );
          } else if (apiErrorTyped.response.status === 400) {
            // Check for specific error messages from Google API
            if (
              apiErrorTyped.response.data &&
              apiErrorTyped.response.data.error
            ) {
              if (
                apiErrorTyped.response.data.error.message.includes(
                  "Unable to parse range"
                )
              ) {
                throw new Error(
                  "Cannot read the spreadsheet. The sheet name might be different from 'Sheet1'. Please rename your sheet to 'Sheet1' or check the console logs for more details."
                );
              } else if (
                apiErrorTyped.response.data.error.message.includes(
                  "API key not valid"
                )
              ) {
                throw new Error(
                  "API key is invalid or expired. Please contact the developer."
                );
              } else {
                throw new Error(
                  `Google Sheets API error: ${
                    apiErrorTyped.response.data.error.message ||
                    JSON.stringify(apiErrorTyped.response.data.error)
                  }`
                );
              }
            } else {
              throw new Error(
                "Bad request to Google Sheets API. Please check the spreadsheet format."
              );
            }
          } else {
            // Generic error with response data
            throw new Error(
              `Google Sheets API error (${apiErrorTyped.response.status}): ${
                apiErrorTyped.response.data?.error?.message || "Unknown error"
              }`
            );
          }
        } else if (apiErrorTyped.request) {
          // The request was made but no response was received
          throw new Error(
            "No response received from Google Sheets API. Please check your internet connection."
          );
        } else {
          // Something happened in setting up the request that triggered an Error
          throw new Error(
            `Error setting up request: ${
              apiErrorTyped instanceof Error
                ? apiErrorTyped.message
                : String(apiErrorTyped)
            }`
          );
        }
      }
    }

    if (!response.data || !response.data.table || !response.data.table.rows) {
      throw new Error(
        "No data found in Google Sheet. Make sure the sheet is publicly accessible."
      );
    }

    const tableRows = response.data.table.rows;
    const tableColumns = response.data.table.cols;

    console.log(`Found ${tableRows.length} rows in the spreadsheet`);
    console.log(`Found ${tableColumns.length} columns in the spreadsheet`);

    // Check if we have column labels
    if (tableColumns.length === 0) {
      throw new Error("No columns found in the spreadsheet");
    }

    // Get column labels from the table columns
    const columnLabels = tableColumns.map((col: any) =>
      col.label ? String(col.label).toLowerCase().trim() : ""
    );

    console.log("Column labels:", columnLabels);

    // Check if there are at least 2 rows (header + data)
    if (tableRows.length < 1) {
      throw new Error("Sheet must contain at least one data row");
    }

    // Transform the data into a more workable format
    const rows: any[][] = tableRows.map((row: any) => {
      if (!row.c) return [];
      return row.c.map((cell: any) =>
        cell ? (cell.v !== undefined ? cell.v : "") : ""
      );
    });

    console.log(`Transformed ${rows.length} rows of data`);

    // Use column labels as headers
    const headers = columnLabels;

    console.log("Mapping column headers to our required fields");
    console.log("Available headers:", headers);

    // We need to be more flexible with column names based on the example data
    // Create mappings for Turkish and English column variations
    const headerMappings = {
      // Required fields
      customerName: [
        "customername",
        "müşteri adı soyadı",
        "musteri adi soyadi",
        "customer name",
      ],
      requestDate: [
        "requestdate",
        "talep geliş tarihi",
        "talep gelis tarihi",
        "request date",
      ],
      assignedPersonnel: [
        "assignedpersonnel",
        "atanan personel",
        "assigned personnel",
      ],

      // Optional fields
      customerId: ["customerid", "müşteri id", "musteri id", "customer id"],
      contactId: ["contactid", "iletişim id", "iletisim id", "contact id"],
      leadType: ["leadtype", "lead tipi", "lead type"],
      status: ["status", "durum"],
      projectName: ["projectname", "proje adı", "proje adi", "project name"],
      firstCustomerSource: [
        "firstcustomersource",
        "ilk müşteri kaynağı",
        "ilk musteri kaynagi",
        "first customer source",
      ],
      formCustomerSource: [
        "formcustomersource",
        "form müşteri kaynağı",
        "form musteri kaynagi",
        "form customer source",
      ],
      webFormNote: [
        "webformnote",
        "webform notu",
        "web form notu",
        "web form note",
      ],
    };

    // Map column indices using our flexible mappings
    const columnMap: Record<string, number> = {};

    // Helper function to find column index using multiple possible header names
    const findColumnIndex = (possibleNames: string[], headers: string[]) => {
      for (const name of possibleNames) {
        const index = headers.findIndex((h) =>
          h.toLowerCase().includes(name.toLowerCase())
        );
        if (index !== -1) return index;
      }
      return -1;
    };

    // Map required fields
    columnMap.customerName = findColumnIndex(
      headerMappings.customerName,
      headers
    );
    columnMap.requestDate = findColumnIndex(
      headerMappings.requestDate,
      headers
    );
    columnMap.assignedPersonnel = findColumnIndex(
      headerMappings.assignedPersonnel,
      headers
    );

    // Check if we found all required columns
    const missingRequiredFields = [];
    if (columnMap.customerName === -1)
      missingRequiredFields.push("Customer Name");
    if (columnMap.requestDate === -1)
      missingRequiredFields.push("Request Date");
    if (columnMap.assignedPersonnel === -1)
      missingRequiredFields.push("Assigned Personnel");

    if (missingRequiredFields.length > 0) {
      console.error("Missing required fields:", missingRequiredFields);
      throw new Error(
        `Missing required columns: ${missingRequiredFields.join(", ")}`
      );
    }

    // Map optional fields
    columnMap.customerId = findColumnIndex(headerMappings.customerId, headers);
    columnMap.contactId = findColumnIndex(headerMappings.contactId, headers);
    columnMap.firstCustomerSource = findColumnIndex(
      headerMappings.firstCustomerSource,
      headers
    );
    columnMap.formCustomerSource = findColumnIndex(
      headerMappings.formCustomerSource,
      headers
    );
    columnMap.webFormNote = findColumnIndex(
      headerMappings.webFormNote,
      headers
    );
    columnMap.leadType = findColumnIndex(headerMappings.leadType, headers);
    columnMap.status = findColumnIndex(headerMappings.status, headers);
    columnMap.projectName = findColumnIndex(
      headerMappings.projectName,
      headers
    );

    console.log("Column mappings:", columnMap);

    // Try to extract lead type from webFormNote if it's present and leadType is not
    const hasWebFormNote = columnMap.webFormNote !== -1;
    const hasLeadType = columnMap.leadType !== -1;

    if (hasWebFormNote && !hasLeadType) {
      console.log(
        "Will try to extract lead type from WebForm Note if available"
      );
    }

    // Process data rows
    const validLeads: InsertLead[] = [];
    const invalidRows: Array<{ row: number; errors: string[] }> = [];

    // Skip header row (start from index 1)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      // Skip empty rows
      if (!row || !row.length) continue;

      try {
        // Extract data from row using column indices
        const leadData: Record<string, any> = {};

        // Set required fields
        leadData.customerName = row[columnMap.customerName] || "";
        leadData.requestDate = row[columnMap.requestDate] || "";
        leadData.assignedPersonnel = row[columnMap.assignedPersonnel] || "";

        // Set optional fields if they exist in the sheet
        if (columnMap.customerId >= 0)
          leadData.customerId = row[columnMap.customerId];
        if (columnMap.contactId >= 0)
          leadData.contactId = row[columnMap.contactId];
        if (columnMap.firstCustomerSource >= 0)
          leadData.firstCustomerSource = row[columnMap.firstCustomerSource];
        if (columnMap.formCustomerSource >= 0)
          leadData.formCustomerSource = row[columnMap.formCustomerSource];
        if (columnMap.webFormNote >= 0)
          leadData.webFormNote = row[columnMap.webFormNote];
        if (columnMap.leadType >= 0)
          leadData.leadType = row[columnMap.leadType] || "satis";
        if (columnMap.status >= 0)
          leadData.status = row[columnMap.status] || "yeni";
        if (columnMap.projectName >= 0)
          leadData.projectName = row[columnMap.projectName];

        // Default values for leadType and status if not provided
        if (!leadData.leadType) leadData.leadType = "satis";
        if (!leadData.status) leadData.status = "yeni";

        // Validate row data
        const validatedData = LeadRowSchema.parse(leadData);

        // Add to valid leads
        validLeads.push(validatedData as InsertLead);
      } catch (error) {
        // Collect validation errors
        const errors: string[] = [];

        if ((error as any).errors) {
          (error as any).errors.forEach((err: any) => {
            errors.push(`${err.path.join(".")}: ${err.message}`);
          });
        } else {
          errors.push(
            error instanceof Error ? error.message : "Invalid data format"
          );
        }

        invalidRows.push({
          row: i + 1, // 1-indexed for user-friendly row numbers
          errors,
        });
      }
    }

    return {
      validLeads,
      invalidRows,
      totalRows: rows.length - 1, // Exclude header row
    };
  } catch (error) {
    // Re-throw with clear message
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to import from Google Sheets: ${errorMessage}`);
  }
}
