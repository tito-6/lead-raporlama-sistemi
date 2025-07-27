// Centralized color management system for customizable colors across the app

// Centralized color management system for customizable colors across the app

// Color configuration interface
export interface ColorConfig {
  [key: string]: string;
}

// Color categories that can be customized
export interface ColorSettings {
  PERSONNEL: ColorConfig;
  STATUS: ColorConfig;
  LEAD_TYPE: ColorConfig;
  CUSTOMER_SOURCE: ColorConfig;
  PROJECT: ColorConfig;
  OFFICE: ColorConfig;
  MEETING_TYPE: ColorConfig;
  PRIORITY: ColorConfig;
}

// Default color scheme - completely dynamic, no predefined values
export const DEFAULT_COLORS: ColorSettings = {
  PERSONNEL: {
    // No predefined personnel - will be populated from imported data
  },

  STATUS: {
    // No predefined statuses - will be populated from imported data
  },

  LEAD_TYPE: {
    // No predefined types - will be populated from imported data
  },

  CUSTOMER_SOURCE: {
    // No predefined sources - will be populated from imported data
  },

  PROJECT: {
    // No predefined projects - will be populated from imported data
  },

  OFFICE: {
    // No predefined offices - will be populated from imported data
  },

  MEETING_TYPE: {
    // No predefined meeting types - will be populated from imported data
  },

  PRIORITY: {
    // No predefined priorities - will be populated from imported data
  },
};

// Color management class
class ColorManager {
  private static instance: ColorManager;
  private colors: ColorSettings;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    // Load colors from localStorage or use defaults
    const savedColors = localStorage.getItem("leadtracker-colors");
    if (savedColors) {
      try {
        this.colors = { ...DEFAULT_COLORS, ...JSON.parse(savedColors) };
      } catch {
        this.colors = DEFAULT_COLORS;
      }
    } else {
      this.colors = DEFAULT_COLORS;
    }
  }

  static getInstance(): ColorManager {
    if (!ColorManager.instance) {
      ColorManager.instance = new ColorManager();
    }
    return ColorManager.instance;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  private saveToStorage(): void {
    localStorage.setItem("leadtracker-colors", JSON.stringify(this.colors));
  }

  getColor(category: keyof ColorSettings, key: string): string {
    const colors = this.colors[category];
    return colors[key] || colors["Default"] || colors["Diğer"] || "#6b7280";
  }

  updateColor(category: keyof ColorSettings, key: string, color: string): void {
    this.colors = {
      ...this.colors,
      [category]: {
        ...this.colors[category],
        [key]: color,
      },
    };
    this.saveToStorage();
    this.notify();
  }

  updateCategory(category: keyof ColorSettings, colors: ColorConfig): void {
    this.colors = {
      ...this.colors,
      [category]: colors,
    };
    this.saveToStorage();
    this.notify();
  }

  getAllColors(): ColorSettings {
    return { ...this.colors };
  }

  getCategoryColors(category: keyof ColorSettings): ColorConfig {
    return { ...this.colors[category] };
  }

  resetToDefaults(): void {
    this.colors = DEFAULT_COLORS;
    this.saveToStorage();
    this.notify();
  }

  // Fetch dynamic data from APIs and populate color categories
  async populateFromAPIData(): Promise<void> {
    try {
      // Fetch all required data from APIs
      const [leadsResponse, takipteResponse, salesRepsResponse] =
        await Promise.all([
          fetch("/api/leads").catch((err) => {
            console.error("Error fetching leads:", err);
            return new Response("[]", {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }),
          fetch("/api/takipte").catch((err) => {
            console.error("Error fetching takipte data:", err);
            return new Response("[]", {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }),
          fetch("/api/sales-reps").catch((err) => {
            console.error("Error fetching sales-reps:", err);
            return new Response("[]", {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }),
        ]);

      // Check if responses are valid before trying to parse JSON
      const [leadsData, takipteData, salesRepsData] = await Promise.all([
        leadsResponse.ok ? leadsResponse.json().catch(() => []) : [],
        takipteResponse.ok ? takipteResponse.json().catch(() => []) : [],
        salesRepsResponse.ok ? salesRepsResponse.json().catch(() => []) : [],
      ]);

      // Extract unique values from actual data
      const personnelSet = new Set<string>();
      const statusSet = new Set<string>();
      const leadTypeSet = new Set<string>();
      const customerSourceSet = new Set<string>();
      const officeSet = new Set<string>();
      const meetingTypeSet = new Set<string>();

      // Process leads data
      leadsData.forEach((lead: any) => {
        if (lead.assignedPersonnel) personnelSet.add(lead.assignedPersonnel);
        if (lead.status) statusSet.add(lead.status);
        if (lead.leadType) leadTypeSet.add(lead.leadType);
        if (lead.firstCustomerSource)
          customerSourceSet.add(lead.firstCustomerSource);
        if (lead.office) officeSet.add(lead.office);
      });

      // Process takipte data
      takipteData.forEach((takip: any) => {
        if (takip["Personel Adı(203)"])
          personnelSet.add(takip["Personel Adı(203)"]);
        if (takip["Hatırlatma Personeli"])
          personnelSet.add(takip["Hatırlatma Personeli"]);
        if (takip["Son Sonuç Adı"]) statusSet.add(takip["Son Sonuç Adı"]);
        if (takip["İrtibat Müşteri Kaynağı"])
          customerSourceSet.add(takip["İrtibat Müşteri Kaynağı"]);
        if (takip["İletişim Müşteri Kaynağı"])
          customerSourceSet.add(takip["İletişim Müşteri Kaynağı"]);
        if (takip["Ofis"]) officeSet.add(takip["Ofis"]);
        if (takip["Görüşme Tipi"]) meetingTypeSet.add(takip["Görüşme Tipi"]);
        if (takip["Müşteri Haberleşme Tipi"])
          meetingTypeSet.add(takip["Müşteri Haberleşme Tipi"]);
      });

      // Process sales reps data
      salesRepsData.forEach((rep: any) => {
        if (rep.name) personnelSet.add(rep.name);
      });

      // Generate colors for each category
      const newColors: ColorSettings = {
        PERSONNEL: this.generateColorsForSet(
          personnelSet,
          this.colors.PERSONNEL
        ),
        STATUS: this.generateColorsForSet(statusSet, this.colors.STATUS),
        LEAD_TYPE: this.generateColorsForSet(
          leadTypeSet,
          this.colors.LEAD_TYPE
        ),
        CUSTOMER_SOURCE: this.generateColorsForSet(
          customerSourceSet,
          this.colors.CUSTOMER_SOURCE
        ),
        PROJECT: this.generateColorsForSet(
          new Set(), // Will be populated from project names in data
          this.colors.PROJECT
        ),
        OFFICE: this.generateColorsForSet(officeSet, this.colors.OFFICE),
        MEETING_TYPE: this.generateColorsForSet(
          meetingTypeSet,
          this.colors.MEETING_TYPE
        ),
        PRIORITY: this.colors.PRIORITY, // Keep existing priority colors
      };

      // Update colors
      this.colors = newColors;
      this.saveToStorage();
      this.notify();
    } catch (error) {
      console.error("Error populating colors from API data:", error);
    }
  }

  // Generate colors for a set of values, preserving existing assignments
  private generateColorsForSet(
    valueSet: Set<string>,
    existingColors: ColorConfig
  ): ColorConfig {
    const colors: ColorConfig = { ...existingColors };
    const values = Array.from(valueSet);

    // Color palette for automatic assignment
    const colorPalette = [
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#ef4444",
      "#06b6d4",
      "#ec4899",
      "#84cc16",
      "#f97316",
      "#6366f1",
      "#14b8a6",
      "#a855f7",
      "#22c55e",
      "#fbbf24",
      "#9ca3af",
      "#64748b",
      "#dc2626",
      "#ea580c",
      "#ca8a04",
      "#65a30d",
      "#059669",
      "#0891b2",
      "#7c3aed",
      "#c2410c",
      "#dc2626",
    ];

    values.forEach((value, index) => {
      if (!colors[value]) {
        colors[value] = colorPalette[index % colorPalette.length];
      }
    });

    return colors;
  }

  exportColors(): string {
    return JSON.stringify(this.colors, null, 2);
  }

  importColors(jsonString: string): boolean {
    try {
      const importedColors = JSON.parse(jsonString);
      if (typeof importedColors === "object" && importedColors !== null) {
        this.colors = { ...DEFAULT_COLORS, ...importedColors };
        this.saveToStorage();
        this.notify();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const colorManager = ColorManager.getInstance();

// Helper functions
export const getItemColor = (
  category: keyof ColorSettings,
  itemName: string
): string => {
  return colorManager.getColor(category, itemName);
};

export const getCategoryColors = (
  category: keyof ColorSettings
): ColorConfig => {
  return colorManager.getCategoryColors(category);
};
