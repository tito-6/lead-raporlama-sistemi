# Google Sheets Import for Lead Data

## Overview

LeadTrackerPro now supports importing lead data directly from Google Sheets. This feature allows you to prepare your lead information in Google Sheets and import it into the application with a single click, without requiring API keys.

## How to Use

### Step 1: Prepare your Google Sheet

Create a Google Sheets document with the following columns:

| customerName | requestDate | assignedPersonnel | customerId | contactId | leadType | status        | projectName |
| ------------ | ----------- | ----------------- | ---------- | --------- | -------- | ------------- | ----------- |
| Ahmet Yılmaz | 10.07.2025  | Reçber Kaya       | C12345     | L67890    | satis    | yeni          | Park Villa  |
| Ayşe Demir   | 15.07.2025  | Yasemin Kaya      |            |           | kiralama | bilgi-verildi |             |

#### Required Columns:

- **customerName** (Müşteri Adı Soyadı): The customer's name and surname
- **requestDate** (Talep Geliş Tarihi): The date of the request (any valid date format)
- **assignedPersonnel** (Atanan Personel): The name of the personnel assigned to the lead

#### Optional Columns:

- **customerId** (Müşteri ID): Customer ID if available
- **contactId** (İletişim ID): Contact ID if available
- **leadType** (Lead Tipi): "satis" (sales) or "kiralama" (rental) - defaults to "satis" if not provided
- **status** (Durum): The status of the lead (e.g., "yeni", "bilgi-verildi", "olumsuz", etc.) - defaults to "yeni" if not provided
- **projectName** (Proje Adı): The project name if applicable
- **firstCustomerSource** (İlk Müşteri Kaynağı): Where the customer came from initially
- **formCustomerSource** (Form Müşteri Kaynağı): Source from the form submission
- **webFormNote** (Web Form Notu): Notes from web form submission

### Step 2: Share your Google Sheet

Make sure your Google Sheet is shared with proper permissions:

1. Click on the "Share" button in the top right corner of your Google Sheet
2. Select "Anyone with the link can view"
3. Copy the link provided

### Step 3: Import into LeadTrackerPro

1. Navigate to the "Veri Girişi" (Data Entry) tab in LeadTrackerPro
2. Click on "Google Sheets'ten İçe Aktar" button
3. Paste the Google Sheet link you copied
4. Click "İçe Aktar" (Import)
5. The system will process your data and show results

## Supported Column Names

The system recognizes both English and Turkish column names:

| English             | Turkish              |
| ------------------- | -------------------- |
| customerName        | Müşteri Adı Soyadı   |
| requestDate         | Talep Geliş Tarihi   |
| assignedPersonnel   | Atanan Personel      |
| customerId          | Müşteri ID           |
| contactId           | İletişim ID          |
| leadType            | Lead Tipi            |
| status              | Durum                |
| projectName         | Proje Adı            |
| firstCustomerSource | İlk Müşteri Kaynağı  |
| formCustomerSource  | Form Müşteri Kaynağı |
| webFormNote         | Web Form Notu        |

## Troubleshooting

If you encounter issues during import:

1. **Invalid Format**: Ensure your sheet contains the required columns (column order doesn't matter)
2. **Permission Error**: Make sure your sheet is properly shared with "Anyone with the link" view permissions
3. **Invalid Data**: Check that your data matches the required formats
4. **Empty Sheet**: Ensure your sheet contains data and that the first row contains headers
5. **Missing Required Fields**: Ensure the required columns (customerName/Müşteri Adı Soyadı, requestDate/Talep Geliş Tarihi, assignedPersonnel/Atanan Personel) are present and contain valid data

## Technical Notes

The import system:

- Validates all data before importing
- Provides detailed error messages for invalid entries
- Supports both full and partial imports (will import valid rows even if some rows have errors)
- Uses the Google Sheets public export feature (no API key required)
- Supports both English and Turkish column names
- Handles multiple date formats

For developers: The import functionality is implemented using the `/api/import-leads-from-sheets` endpoint.
