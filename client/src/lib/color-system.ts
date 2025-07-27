// Standardized color system for consistent theming across all tabs
export const STANDARD_COLORS = {
  // Sales personnel colors (consistent across all tabs)
  PERSONNEL: {
    "Alperen Yerlikaya": "#3b82f6", // Blue
    "Ahmet Kaya": "#10b981", // Green
    "Mehmet Özkan": "#f59e0b", // Amber
    "Ayşe Demir": "#8b5cf6", // Purple
    "Fatma Yılmaz": "#ef4444", // Red
    "Murat Şen": "#06b6d4", // Cyan
    "Zeynep Aktaş": "#ec4899", // Pink
    "Ali Vural": "#84cc16", // Lime
    "Elif Koç": "#f97316", // Orange
    "Burak Çelik": "#6366f1", // Indigo
    "Seda Polat": "#14b8a6", // Teal
    "Emre Kara": "#a855f7", // Violet
    Defaut: "#6b7280", // Gray for unassigned
  },

  // Lead status colors (consistent across all tabs)
  STATUS: {
    Takipte: "#fbbf24", // Yellow - Following up
    Takipde: "#fbbf24", // Yellow - Following up (alternative spelling)
    "Bilgi Verildi": "#8b5cf6", // Purple - Information given
    Olumsuz: "#ef4444", // Red - Negative
    Ulaşılamıyor: "#f97316", // Orange - Unreachable
    "Ulaşılamıyor - Cevap Vermiyor": "#f97316", // Orange - Not answering
    "Toplantı/Birebir Görüşme": "#3b82f6", // Blue - Meeting scheduled
    "Potansiyel Takipte": "#10b981", // Green - Potential following
    Satış: "#22c55e", // Bright Green - Sale
    Yeni: "#06b6d4", // Cyan - New lead
    Tanımsız: "#6b7280", // Gray - Undefined
    Bilinmiyor: "#9ca3af", // Light Gray - Unknown
    "Arandı - Geri Dönecek": "#f59e0b", // Amber - Will call back
    Tamamlandı: "#22c55e", // Green - Completed
    İptal: "#ef4444", // Red - Cancelled
  },

  // Lead type colors
  LEAD_TYPE: {
    satis: "#3b82f6", // Blue for sales
    kiralama: "#ef4444", // Red for rental
    kira: "#ef4444", // Red for rental (alternative)
    satılık: "#3b82f6", // Blue for sales (alternative)
    kiralık: "#ef4444", // Red for rental (alternative)
  },

  // Customer source colors (for marketing analysis)
  CUSTOMER_SOURCE: {
    Instagram: "#9b51e0", // Instagram purple
    Facebook: "#3498db", // Facebook blue
    Referans: "#2ecc71", // Green for referrals
    Website: "#e74c3c", // Red for website
    Google: "#4285f4", // Google blue
    Whatsapp: "#25d366", // WhatsApp green
    Telefon: "#f39c12", // Orange for phone
    Email: "#95a5a6", // Gray for email
    Diğer: "#34495e", // Dark gray for others
  },

  // Priority levels
  PRIORITY: {
    Yüksek: "#ef4444", // Red for high priority
    Orta: "#f59e0b", // Amber for medium priority
    Düşük: "#10b981", // Green for low priority
  },

  // Impact levels for analysis
  IMPACT: {
    High: "#ef4444", // Red for high impact (10%+)
    Medium: "#f59e0b", // Amber for medium impact (5-10%)
    Low: "#10b981", // Green for low impact (<5%)
  },
  
  // Negative reason analysis colors
  NEGATIVE: {
    "Fiyat": "#ef4444", // Red - Price issues
    "Bütçe": "#ef4444", // Red - Budget issues
    "Konum": "#f59e0b", // Orange - Location issues
    "Uzaklık": "#f59e0b", // Orange - Distance issues
    "Müşteri Vazgeçti": "#8b5cf6", // Purple - Customer changed mind
    "Alıcı Profili Uygun Değil": "#6366f1", // Indigo - Buyer profile not suitable
    "Proje Beğenilmedi": "#f97316", // Orange - Project not liked
    "Ödeme Planı": "#10b981", // Green - Payment plan issues
    "Ulaşılamıyor": "#6b7280", // Gray - Unreachable
    "Başka Yerden Aldı": "#ec4899", // Pink - Bought elsewhere
    "Başka Projeden Aldı": "#ec4899", // Pink - Bought from another project
    "Belirtilmemiş": "#6b7280", // Gray - Not specified
    Default: "#6b7280", // Gray - Default
  },

  // Office colors (for multi-office analysis)
  OFFICE: {
    Merkez: "#3b82f6", // Blue for main office
    "Şube 1": "#10b981", // Green for branch 1
    "Şube 2": "#f59e0b", // Amber for branch 2
    "Şube 3": "#8b5cf6", // Purple for branch 3
    Kapaklı: "#22c55e", // Green for Kapaklı office
    Diğer: "#6b7280", // Gray for others
  },

  // Source colors (mapping to CUSTOMER_SOURCE for compatibility)
  SOURCE: {
    Instagram: "#9b51e0", // Instagram purple
    Facebook: "#3498db", // Facebook blue
    Referans: "#2ecc71", // Green for referrals
    Website: "#e74c3c", // Red for website
    Google: "#4285f4", // Google blue
    Whatsapp: "#25d366", // WhatsApp green
    Telefon: "#f39c12", // Orange for phone
    Email: "#95a5a6", // Gray for email
    Diğer: "#34495e", // Dark gray for others
  },

  // Meeting type colors
  MEETING_TYPE: {
    "Giden Arama": "#3b82f6", // Blue for outgoing calls
    "Gelen Arama": "#10b981", // Green for incoming calls
    WhatsApp: "#25d366", // WhatsApp green
    Email: "#95a5a6", // Gray for email
    "Yüz Yüze": "#8b5cf6", // Purple for face-to-face
    Diğer: "#6b7280", // Gray for others
  },

  // Project colors (for project-based analysis)
  PROJECT: {
    "Proje A": "#3b82f6", // Blue
    "Proje B": "#10b981", // Green
    "Proje C": "#f59e0b", // Amber
    "Proje D": "#8b5cf6", // Purple
    "Proje E": "#ef4444", // Red
    "Proje F": "#06b6d4", // Cyan
    "Proje G": "#ec4899", // Pink
    "Proje H": "#84cc16", // Lime
    "Proje I": "#f97316", // Orange
    "Proje J": "#6366f1", // Indigo
    Belirtilmemiş: "#6b7280", // Gray for unspecified
  },
};

// Helper function to get color by category and value
export function getStandardColor(
  category: keyof typeof STANDARD_COLORS,
  value: string
): string {
  if (!category || !value || typeof value !== "string") {
    return "#6b7280"; // Default gray
  }

  const categoryColors = STANDARD_COLORS[category];
  if (!categoryColors) {
    return "#6b7280"; // Default gray
  }

  const typedCategoryColors = categoryColors as Record<string, string>;
  return (
    typedCategoryColors[value] ||
    typedCategoryColors["Defaut"] ||
    typedCategoryColors["Diğer"] ||
    "#6b7280"
  );
}

// Helper function to get personnel color
export function getPersonnelColor(personnel: string): string {
  return getStandardColor("PERSONNEL", personnel);
}

// Helper function to get status color
export function getStatusColor(status: string): string {
  return getStandardColor("STATUS", status);
}

// Helper function to get lead type color
export function getLeadTypeColor(leadType: string): string {
  return getStandardColor("LEAD_TYPE", leadType);
}

// Helper function to get source color
export function getSourceColor(source: string): string {
  return getStandardColor("CUSTOMER_SOURCE", source);
}

// Comprehensive unique color palette for chart elements
const UNIQUE_CHART_COLORS = [
  "#3B82F6", // Blue (1)
  "#EF4444", // Red (2)
  "#10B981", // Green (3)
  "#F59E0B", // Amber (4)
  "#8B5CF6", // Purple (5)
  "#06B6D4", // Cyan (6)
  "#F97316", // Orange (7)
  "#84CC16", // Lime (8)
  "#EC4899", // Pink (9)
  "#6366F1", // Indigo (10)
  "#14B8A6", // Teal (11)
  "#F472B6", // Rose (12)
  "#A855F7", // Violet (13)
  "#22C55E", // Emerald (14)
  "#FB923C", // Orange-alt (15)
  "#8B5A2B", // Brown (16)
  "#059669", // Green-alt (17)
  "#DC2626", // Red-alt (18)
  "#1D4ED8", // Blue-alt (19)
  "#7C2D12", // Brown-alt (20)
  "#701A75", // Purple-alt (21)
  "#92400E", // Yellow-alt (22)
  "#065F46", // Emerald-alt (23)
  "#1E40AF", // Blue-deep (24)
  "#BE123C", // Rose-alt (25)
  "#166534", // Green-deep (26)
  "#9333EA", // Violet-alt (27)
  "#C2410C", // Orange-deep (28)
  "#0891B2", // Cyan-alt (29)
  "#BE185D", // Pink-alt (30)
];

// Generate unique color array for charts with no duplicates
export function generateChartColors(count: number): string[] {
  if (count <= UNIQUE_CHART_COLORS.length) {
    return UNIQUE_CHART_COLORS.slice(0, count);
  }

  // If we need more colors than available, generate variations
  const colors = [...UNIQUE_CHART_COLORS];
  const baseColors = UNIQUE_CHART_COLORS;

  for (let i = baseColors.length; i < count; i++) {
    const baseColor = baseColors[i % baseColors.length];
    // Create darker/lighter variations
    const variation =
      i >= baseColors.length * 2
        ? adjustColorBrightness(baseColor, 0.3)
        : adjustColorBrightness(baseColor, -0.3);
    colors.push(variation);
  }

  return colors;
}

// Utility function to adjust color brightness
function adjustColorBrightness(hex: string, factor: number): string {
  // Remove # if present
  hex = hex.replace("#", "");

  // Parse RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Adjust brightness
  const newR = Math.max(0, Math.min(255, Math.round(r + (255 - r) * factor)));
  const newG = Math.max(0, Math.min(255, Math.round(g + (255 - g) * factor)));
  const newB = Math.max(0, Math.min(255, Math.round(b + (255 - b) * factor)));

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, "0")}${newG
    .toString(16)
    .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

// Smart color assignment for specific data categories
export function getSmartCategoryColors(
  categories: string[],
  categoryType:
    | "meeting"
    | "status"
    | "source"
    | "personnel"
    | "general" = "general"
): Record<string, string> {
  const colorMap: Record<string, string> = {};

  // First try to assign from predefined category colors
  categories.forEach((category, index) => {
    switch (categoryType) {
      case "meeting":
        colorMap[category] =
          getStandardColor("MEETING_TYPE", category) ||
          UNIQUE_CHART_COLORS[index % UNIQUE_CHART_COLORS.length];
        break;
      case "status":
        colorMap[category] =
          getStandardColor("STATUS", category) ||
          UNIQUE_CHART_COLORS[index % UNIQUE_CHART_COLORS.length];
        break;
      case "source":
        colorMap[category] =
          getStandardColor("CUSTOMER_SOURCE", category) ||
          UNIQUE_CHART_COLORS[index % UNIQUE_CHART_COLORS.length];
        break;
      case "personnel":
        colorMap[category] =
          getStandardColor("PERSONNEL", category) ||
          UNIQUE_CHART_COLORS[index % UNIQUE_CHART_COLORS.length];
        break;
      default:
        colorMap[category] =
          UNIQUE_CHART_COLORS[index % UNIQUE_CHART_COLORS.length];
    }
  });

  return colorMap;
}

// Project name detection patterns
export const PROJECT_PATTERNS = [
  // Common Turkish real estate project keywords
  /\b(proje|konut|residence|plaza|tower|city|park|garden|bahçe|villa|apart|sitesi|blok)\b/gi,
  /\b[A-ZÇĞIŞÖÜ][a-zçğışöü]+\s+(Residence|Plaza|Tower|City|Park|Konut|Proje|Sitesi)\b/g,
  /\b[A-ZÇĞIŞÖÜ][a-zçğışöü]*\s*[A-ZÇĞIŞÖÜ][a-zçğışöü]+\s+(Residence|Plaza|Tower)\b/g,
];

// Helper function to extract project name from WebForm Notu
export function extractProjectName(webFormNote: string): string | null {
  if (!webFormNote || typeof webFormNote !== "string") return null;

  const cleanNote = webFormNote.trim();

  // Try each pattern
  for (const pattern of PROJECT_PATTERNS) {
    const matches = cleanNote.match(pattern);
    if (matches && matches.length > 0) {
      return matches[0].trim();
    }
  }

  // If no pattern matches, check for specific keywords and extract surrounding text
  const keywords = [
    "proje",
    "konut",
    "residence",
    "plaza",
    "tower",
    "city",
    "park",
    "sitesi",
  ];
  for (const keyword of keywords) {
    const regex = new RegExp(`\\b\\w*${keyword}\\w*\\b`, "gi");
    const matches = cleanNote.match(regex);
    if (matches && matches.length > 0) {
      return matches[0].trim();
    }
  }

  return null;
}

// Default chart colors for different chart types
export const DEFAULT_CHART_COLORS = {
  pie: generateChartColors(10),
  bar: generateChartColors(10),
  line: generateChartColors(5),
};
