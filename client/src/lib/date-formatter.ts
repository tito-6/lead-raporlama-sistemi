/**
 * Format date filters into a readable string
 * @param dateFilters - The date filters object
 * @returns Formatted date range string
 */
export function formatDateFiltersToDisplayText(dateFilters: {
  startDate?: string;
  endDate?: string;
  month?: string;
  year?: string;
}): string {
  // If we have a month and year filter
  if (dateFilters.month && dateFilters.year) {
    const monthNames = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ];
    const monthIndex = parseInt(dateFilters.month) - 1;
    return `${monthNames[monthIndex]} ${dateFilters.year}`;
  }

  // If we have a start and end date filter
  if (dateFilters.startDate && dateFilters.endDate) {
    const startFormatted = formatDate(dateFilters.startDate);
    const endFormatted = formatDate(dateFilters.endDate);
    return `${startFormatted} - ${endFormatted}`;
  }

  // If we only have a year filter
  if (dateFilters.year) {
    return `${dateFilters.year} Yılı`;
  }

  // Default case
  return "Tüm Zamanlar";
}

/**
 * Format a date string to Turkish locale format
 * @param dateString - The date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "1 Ocak 2023")
 */
export function formatDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch (error) {
    return dateString;
  }
}
