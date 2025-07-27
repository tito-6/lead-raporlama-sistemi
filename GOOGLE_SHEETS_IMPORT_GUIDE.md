# Google Sheets Import for Expense Data

## Overview

LeadTrackerPro now supports importing expense data directly from Google Sheets. This feature allows you to prepare your expense data in Google Sheets and import it into the application with a single click.

## How to Use

### Step 1: Prepare your Google Sheet

Create a Google Sheets document with the following columns:

| Month   | ExpenseType | AmountTL | Description           |
| ------- | ----------- | -------- | --------------------- |
| 2025-07 | agency_fee  | 5000     | July agency retainer  |
| 2025-07 | ads_expense | 3500     | Facebook ads campaign |

- **Month**: Must be in YYYY-MM format (e.g., 2025-07 for July 2025)
- **ExpenseType**: Must be one of: `agency_fee` or `ads_expense`
- **AmountTL**: The expense amount in Turkish Lira (use numbers only)
- **Description**: Optional description of the expense

### Step 2: Share your Google Sheet

Make sure your Google Sheet is shared with proper permissions:

1. Click on the "Share" button in the top right corner of your Google Sheet
2. Select "Anyone with the link can view"
3. Copy the link provided

### Step 3: Import into LeadTrackerPro

1. In the Expense Management page, click on "Google Sheets'ten İçe Aktar" button
2. Paste the Google Sheet link you copied
3. Click "İçe Aktar" (Import)
4. The system will process your data and show results

## Troubleshooting

If you encounter issues during import:

1. **Invalid Format**: Ensure your sheet follows the exact column structure shown above
2. **Permission Error**: Make sure your sheet is properly shared with "Anyone with the link" view permissions
3. **Invalid Data**: Check that your data matches the required formats (especially dates and expense types)
4. **Empty Sheet**: Ensure your sheet contains data and that the first row contains the required headers

## Example Google Sheet Template

You can use this template to get started:
https://docs.google.com/spreadsheets/d/1ncp8bJyZH4cLhcG_Pw-YhB7JzDxF7s6iVjP5ZmEnjPo/edit?usp=sharing

## Technical Notes

The import system:

- Validates all data before importing
- Provides detailed error messages for invalid entries
- Supports both full and partial imports (will import valid rows even if some rows have errors)
- Uses the Google Sheets public export feature (no API key required)

For developers: The import functionality is implemented in the `DbStorage` class with the `importExpensesFromGoogleSheet` method and exposed via the `/api/lead-expenses/import/google-sheet` endpoint.
