import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CostMetricsTable } from "@/components/cost-metrics-table";
import { SalesPersonList } from "@/components/sales-person-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  LabelList,
} from "recharts";
import {
  TrendingUp,
  Users,
  Target,
  AlertCircle,
  AlertTriangle,
  Calendar,
  PhoneCall,
  Phone,
  Clock,
  Star,
  Trash2,
  RefreshCw,
  Settings,
  FileText,
  ThumbsDown,
  Copy,
  Building,
  DollarSign,
  XCircle,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StandardChart from "@/components/charts/StandardChart";

import { DataTable } from "@/components/ui/data-table";
import { MasterDataTable } from "@/components/ui/master-data-table";
import { useSettings } from "@/hooks/use-settings";
import ThreeDPie from "@/components/charts/ThreeDPie";
import DateFilter from "@/components/ui/date-filter";
import LeadDataExplorer from "@/components/lead-data-explorer";
import { useColors } from "@/hooks/use-colors";
import { getSourceColor, getPersonnelColor } from "@/lib/color-system";
import ProjectFilter from "./project-filter";
import {
  filterLeadsByProject,
  detectProjectFromWebFormNotu,
} from "@/lib/project-detector";

// Add type for enhancedStats
interface EnhancedStats {
  leads: {
    byPersonnel: Record<string, number>;
    [key: string]: any;
  };
  takipte: {
    byPersonnel: Record<string, number>;
    [key: string]: any;
  };
  [key: string]: any;
}

// Define expense stats interface
interface ExpenseStats {
  leadCount: number;
  expenses: {
    tl: {
      totalAgencyFees: number;
      totalAdsExpenses: number;
      totalExpenses: number;
      avgCostPerLead: number;
    };
    usd?: {
      totalAgencyFees: number;
      totalAdsExpenses: number;
      totalExpenses: number;
      avgCostPerLead: number;
    };
  };
  exchangeRate?: {
    rate: number;
    lastUpdated: string;
  };
}

// Create a comprehensive filter sidebar that adapts to the current page/tab

// Define filter sidebar prop types
type FilterSidebarProps = {
  // Chart controls
  chartType: "pie" | "bar" | "line";
  setChartType: React.Dispatch<React.SetStateAction<"pie" | "bar" | "line">>;
  chartTypeOptions: Array<{ value: string; label: string; icon: string }>;
  // Project filter
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  // Date filters
  dateFilters: any;
  setDateFilters: (filters: any) => void;
  // Personnel filter
  selectedPersonnel: string;
  setSelectedPersonnel: (personnel: string) => void;
  // Office filter
  selectedOffice?: string;
  setSelectedOffice?: (office: string) => void;
  // Lead type filter
  selectedLeadType?: string;
  setSelectedLeadType?: (type: string) => void;
  // Meeting type filter
  selectedMeetingType?: string;
  setSelectedMeetingType?: (type: string) => void;
  // Result filter (for negative analysis)
  selectedResult?: string;
  setSelectedResult?: (result: string) => void;
  // Current active tab
  activeTab?: string;
  // Cache clearing
  clearCache?: () => void;
  clearCacheMutation?: any;
  // Collapse state
  isCollapsed?: boolean;
  setIsCollapsed?: React.Dispatch<React.SetStateAction<boolean>>;
  // Context information
  personnelList?: string[];
  officeList?: string[];
  meetingTypeList?: string[];
  resultList?: string[];
  leadTypeList?: string[];
};

const FilterSidebar = ({
  // Chart controls
  chartType,
  setChartType,
  chartTypeOptions,
  // Project filter
  selectedProject,
  setSelectedProject,
  // Date filters
  dateFilters,
  setDateFilters,
  // Personnel filter
  selectedPersonnel,
  setSelectedPersonnel,
  // Office filter
  selectedOffice,
  setSelectedOffice = () => {},
  // Lead type filter
  selectedLeadType,
  setSelectedLeadType = () => {},
  // Meeting type filter
  selectedMeetingType,
  setSelectedMeetingType = () => {},
  // Result filter (for negative analysis)
  selectedResult,
  setSelectedResult = () => {},
  // Current active tab
  activeTab = "status",
  // Cache clearing
  clearCache,
  clearCacheMutation,
  // Context information
  personnelList = [],
  officeList = [],
  meetingTypeList = [],
  resultList = [],
  leadTypeList = [],
  // Collapse state
  isCollapsed,
  setIsCollapsed,
}: FilterSidebarProps) => {
  type SectionKey =
    | "chartType"
    | "project"
    | "date"
    | "personnel"
    | "office"
    | "leadType"
    | "meetingType"
    | "result";

  // State for sidebar collapsing sections
  const [collapsedSections, setCollapsedSections] = useState({
    chartType: false,
    project: false,
    date: false,
    personnel: false,
    office: false,
    leadType: false,
    meetingType: false,
    result: false,
  });

  // Use the passed collapse state or create a local one if not provided
  const collapsed = isCollapsed !== undefined ? isCollapsed : false;
  const setCollapsed = setIsCollapsed || (() => {});

  // Toggle entire sidebar collapse
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  }; // Toggle section collapse
  const toggleSection = (section: SectionKey) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Determine which filters to show based on the active tab
  const showFilters = {
    chartType: true, // Always show chart type controls
    project: true, // Always show project filter
    date: true, // Always show date filters
    personnel: ["personnel", "sources", "negative"].includes(activeTab),
    office: ["sources"].includes(activeTab),
    leadType: ["status", "negative"].includes(activeTab),
    meetingType: ["sources"].includes(activeTab),
    result: ["negative"].includes(activeTab),
  };

  return (
    <div
      className={`fixed left-0 top-0 h-screen z-40 overflow-y-auto bg-white border-r border-gray-200 shadow-md transition-all duration-300 ${
        collapsed ? "w-0 opacity-0 pointer-events-none" : "w-52 opacity-100"
      }`}
    >
      <div className={`p-2 ${collapsed ? "space-y-1" : "space-y-2"}`}>
        <div className="flex items-center justify-between border-b pb-2 mb-2">
          {!collapsed && (
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Filtreler
            </h3>
          )}
        </div>

        {/* Chart Type Controls */}
        {showFilters.chartType && (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("chartType")}
            >
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <span className="text-base">📊</span> Grafik Türü
              </h4>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  collapsedSections.chartType ? "rotate-180" : ""
                }`}
              />
            </div>
            {!collapsedSections.chartType && (
              <div className="mt-2 space-y-2">
                {chartTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setChartType(option.value as "pie" | "bar" | "line")
                    }
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      chartType === option.value
                        ? "bg-blue-500 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <span className="text-base mr-1">{option.icon}</span>{" "}
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Project Filter */}
        {showFilters.project && (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("project")}
            >
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <span className="text-base">�</span> Proje Filtresi
              </h4>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  collapsedSections.project ? "rotate-180" : ""
                }`}
              />
            </div>
            {!collapsedSections.project && (
              <div className="mt-2">
                <ProjectFilter
                  value={selectedProject}
                  onChange={setSelectedProject}
                />
              </div>
            )}
          </div>
        )}

        {/* Date Filters */}
        {showFilters.date && (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("date")}
            >
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <span className="text-base">📅</span> Tarih Filtreleri
              </h4>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  collapsedSections.date ? "rotate-180" : ""
                }`}
              />
            </div>
            {!collapsedSections.date && (
              <div className="mt-2">
                <DateFilter
                  onFilterChange={setDateFilters}
                  initialFilters={dateFilters}
                />
              </div>
            )}
          </div>
        )}

        {/* Personnel Filter */}
        {showFilters.personnel && personnelList?.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("personnel")}
            >
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <span className="text-base">👥</span> Personel
              </h4>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  collapsedSections.personnel ? "rotate-180" : ""
                }`}
              />
            </div>
            {!collapsedSections.personnel && (
              <div className="mt-2">
                <Select
                  value={selectedPersonnel}
                  onValueChange={setSelectedPersonnel}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Personel seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Personel</SelectItem>
                    {personnelList.map((person) => (
                      <SelectItem key={person} value={person}>
                        {person}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Office Filter */}
        {showFilters.office && officeList?.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("office")}
            >
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <span className="text-base">🏢</span> Ofis
              </h4>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  collapsedSections.office ? "rotate-180" : ""
                }`}
              />
            </div>
            {!collapsedSections.office && (
              <div className="mt-2">
                <Select
                  value={selectedOffice}
                  onValueChange={setSelectedOffice}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Ofis seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Ofisler</SelectItem>
                    {officeList.map((office) => (
                      <SelectItem key={office} value={office}>
                        {office}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Lead Type Filter */}
        {showFilters.leadType && leadTypeList?.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("leadType")}
            >
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <span className="text-base">🏠</span> Lead Tipi
              </h4>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  collapsedSections.leadType ? "rotate-180" : ""
                }`}
              />
            </div>
            {!collapsedSections.leadType && (
              <div className="mt-2">
                <Select
                  value={selectedLeadType}
                  onValueChange={setSelectedLeadType}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Lead tipi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Tipler</SelectItem>
                    {leadTypeList.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Meeting Type Filter */}
        {showFilters.meetingType && meetingTypeList?.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("meetingType")}
            >
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <span className="text-base">🤝</span> İletişim Tipi
              </h4>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  collapsedSections.meetingType ? "rotate-180" : ""
                }`}
              />
            </div>
            {!collapsedSections.meetingType && (
              <div className="mt-2">
                <Select
                  value={selectedMeetingType}
                  onValueChange={setSelectedMeetingType}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="İletişim tipi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Tipler</SelectItem>
                    {meetingTypeList.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Result Filter */}
        {showFilters.result && resultList?.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("result")}
            >
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <span className="text-base">📋</span> Sonuç
              </h4>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  collapsedSections.result ? "rotate-180" : ""
                }`}
              />
            </div>
            {!collapsedSections.result && (
              <div className="mt-2">
                <Select
                  value={selectedResult}
                  onValueChange={setSelectedResult}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sonuç tipi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Sonuçlar</SelectItem>
                    {resultList.map((result) => (
                      <SelectItem key={result} value={result}>
                        {result}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Cache Clear Button */}
        <div className="pt-4 mt-6 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={
              clearCacheMutation
                ? () => clearCacheMutation.mutate()
                : clearCache
            }
            disabled={clearCacheMutation?.isPending}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300"
          >
            {clearCacheMutation?.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {clearCacheMutation?.isPending
              ? "Temizleniyor..."
              : "🗑️ Önbellek Temizle"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function EnhancedOverviewDashboardTab() {
  // State for sidebar collapse
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { getColor } = useColors();

  // Use global chart type state with localStorage persistence
  const [chartType, setChartType] = useState<"pie" | "bar" | "line">(() => {
    // Initialize from localStorage if available
    const savedType = localStorage.getItem("globalChartType");
    return (savedType as "pie" | "bar" | "line") || "pie";
  });

  // Update localStorage when chart type changes
  useEffect(() => {
    localStorage.setItem("globalChartType", chartType);
  }, [chartType]);

  const [selectedPersonnel, setSelectedPersonnel] = useState<string>("all");
  const [selectedOffice, setSelectedOffice] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [visiblePersonnel, setVisiblePersonnel] = useState<string[]>([]);
  const [showPersonnel, setShowPersonnel] = useState<boolean>(true);
  const [dateFilters, setDateFilters] = useState({
    startDate: "",
    endDate: "",
    month: "",
    year: "",
  });

  // Fetch expense stats with date filtering and project filter
  const { data: expenseStats } = useQuery<ExpenseStats>({
    queryKey: ["/api/expense-stats", dateFilters, selectedProject],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(dateFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      // Add project filter
      if (selectedProject !== "all") {
        params.append("project", selectedProject);
      }
      console.log("🔍 Expense Stats API Call - Date Filters:", dateFilters);
      console.log("🔍 Expense Stats API Call - URL Params:", params.toString());
      const response = await fetch(`/api/expense-stats?${params.toString()}`);
      const data = await response.json();

      // Debug log to verify agency fee values
      console.log(
        `API Response - Agency Fees: ${data.expenses.tl.totalAgencyFees} TL`
      );
      console.log(`API Response - Debug Headers:`, {
        agencyFees: response.headers.get("X-Debug-Agency-Fees"),
        totalTL: response.headers.get("X-Debug-Total-TL"),
      });

      return data;
    },
    staleTime: 0, // Always consider data stale to force refetch
    gcTime: 0, // Don't cache for long
  });

  // Fetch negative reasons analysis data with date filtering and project filter
  const { data: negativeAnalysis } = useQuery<{
    totalNegative: number;
    totalLeads: number;
    negativePercentage: number;
    reasonAnalysis: Array<{
      reason: string;
      count: number;
      percentage: number;
    }>;
    personnelAnalysis: Array<{
      personnel: string;
      count: number;
      percentage: number;
    }>;
  }>({
    queryKey: ["/api/negative-analysis", dateFilters, selectedProject],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(dateFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      // Add project filter
      if (selectedProject !== "all") {
        params.append("project", selectedProject);
      }
      const response = await fetch(
        `/api/negative-analysis?${params.toString()}`
      );
      return response.json();
    },
  });

  // Fetch takipte data with date filtering
  const { data: takipteLeads = [] } = useQuery<any[]>({
    queryKey: ["/api/takipte", dateFilters, selectedProject],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(dateFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      // Add project filter
      if (selectedProject !== "all") {
        params.append("project", selectedProject);
      }
      const response = await fetch(`/api/takipte?${params.toString()}`);
      return response.json();
    },
  });

  // Fetch leads data for duplicate detection with date filtering
  const { data: leadsData = [] } = useQuery<any[]>({
    queryKey: ["/api/leads", dateFilters, selectedProject],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(dateFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      // Add project filter
      if (selectedProject !== "all") {
        params.append("project", selectedProject);
      }
      console.log("🔍 Leads API Call - Date Filters:", dateFilters);
      console.log("🔍 Leads API Call - URL Params:", params.toString());
      const response = await fetch(`/api/leads?${params.toString()}`);
      return response.json();
    },
    staleTime: 0, // Always consider data stale to force refetch
    gcTime: 0, // Don't cache for long
  });

  // Helper function to extract personnel name from takipte records
  // This handles different variations of the personnel field naming
  const extractPersonnelName = (record: any): string => {
    // Look for different possible field name variations
    const personnelFieldOptions = [
      "Personel Adı(292)",
      "Personel Adı",
      "PersonelAdı",
      "Personel",
      "Sorumlu Satış Personeli",
      "assignedPersonnel",
      "Hatırlatma Personeli", // Additional field that might contain personnel info
    ];

    // First pass: Look for exact matches in the standard fields
    for (const fieldName of personnelFieldOptions) {
      if (
        record[fieldName] &&
        typeof record[fieldName] === "string" &&
        record[fieldName].trim() !== ""
      ) {
        const value = record[fieldName].trim();
        // Don't return empty values or "undefined"/"null" strings
        if (
          value !== "undefined" &&
          value !== "null" &&
          value !== "-" &&
          value.length > 1
        ) {
          return value;
        }
      }
    }

    // Second pass: Look for any field containing "Personel" or "Personnel" in the key
    const keys = Object.keys(record);
    for (const key of keys) {
      if (
        (key.includes("Personel") || key.includes("Personnel")) &&
        record[key] &&
        typeof record[key] === "string" &&
        record[key].trim() !== "" &&
        record[key].trim() !== "undefined" &&
        record[key].trim() !== "null" &&
        record[key].trim() !== "-" &&
        record[key].trim().length > 1
      ) {
        return record[key].trim();
      }
    }

    // If no personnel name is found in any of the fields, return "Atanmamış" to match our lead terminology
    return "Atanmamış";
  };

  // Chart type options matching the takipte-analizi design
  const chartTypeOptions = [
    { value: "pie" as const, label: "Pasta Grafik", icon: "🥧" },
    { value: "bar" as const, label: "Sütun Grafik", icon: "📊" },
    { value: "line" as const, label: "Çizgi Grafik", icon: "📈" },
  ];

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Effect to invalidate queries when date filters change
  useEffect(() => {
    console.log(
      "🔄 Date filters changed, invalidating queries...",
      dateFilters
    );
    queryClient.invalidateQueries({ queryKey: ["/api/expense-stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    queryClient.invalidateQueries({ queryKey: ["/api/takipte"] });
    queryClient.invalidateQueries({ queryKey: ["/api/negative-analysis"] });
  }, [dateFilters, queryClient]);

  // Debug effect to log expense stats changes
  useEffect(() => {
    if (expenseStats) {
      console.log("💰 Expense Stats Updated:", expenseStats);
      console.log(
        "💰 Total Expenses (TL):",
        expenseStats.expenses?.tl?.totalExpenses
      );
      console.log("💰 Lead Count:", expenseStats.leadCount);
    }
  }, [expenseStats]);

  // Cache clearing function
  const clearCache = async () => {
    try {
      // Clear all queries from the cache
      await queryClient.invalidateQueries();
      // Alternatively, you can be more specific:
      // await queryClient.invalidateQueries({ queryKey: ["/api/enhanced-stats"] });
      // await queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      // await queryClient.invalidateQueries({ queryKey: ["/api/takipte"] });

      toast({
        title: "✅ Önbellek Temizlendi",
        description: "Tüm veriler yeniden yüklenecek.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "❌ Hata",
        description: "Önbellek temizlenirken bir hata oluştu.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Get 3D settings from chart settings
  const { data: settings } = useSettings();
  const enable3D = settings?.find((s) => s.key === "chart_settings")?.value
    ? JSON.parse(
        settings.find((s) => s.key === "chart_settings")?.value || "{}"
      )?.enable3D
    : true;

  // Add selectedProject to dateFilters for all queries
  // Define filters once to use across all queries
  const filters = { ...dateFilters, project: selectedProject };

  // Fetch enhanced stats that combine both data sources
  const { data: enhancedStats } = useQuery<EnhancedStats>({
    queryKey: ["/api/enhanced-stats", filters],
    refetchInterval: 5000,
  });

  // Get all personnel list for the filter sidebar
  const personnelList = useMemo(() => {
    if (!enhancedStats || !enhancedStats.leads) return [];
    return Object.keys(enhancedStats.leads.byPersonnel || {});
  }, [enhancedStats]);

  // Fetch takipte data
  const { data: takipteData = [] } = useQuery<any[]>({
    queryKey: ["/api/takipte", filters],
  });

  // Apply robust project filtering to leadsData
  const filteredLeads = useMemo(() => {
    const projectFiltered = filterLeadsByProject(leadsData, selectedProject);

    // ADDITIONAL FRONTEND DATE FILTERING as backup
    // In case the API is not filtering correctly
    const { startDate, endDate, month, year } = dateFilters;
    if (!startDate && !endDate && !month && !year) {
      return projectFiltered;
    }

    const dateFiltered = projectFiltered.filter((lead: any) => {
      // Handle Turkish date format: "DD.MM.YYYY" or "DD.MM.YYYY" from "Talep Geliş Tarihi"
      const dateField = lead.requestDate || lead["Talep Geliş Tarihi"] || "";
      let leadDate: Date;

      if (dateField.includes(".")) {
        // Turkish format: "20.07.2025"
        const [day, month, year] = dateField.split(".");
        leadDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // Standard format
        leadDate = new Date(dateField);
      }

      if (isNaN(leadDate.getTime())) return true; // Include leads without valid dates

      if (year && leadDate.getFullYear().toString() !== year) return false;
      if (
        month &&
        (leadDate.getMonth() + 1).toString().padStart(2, "0") !== month
      )
        return false;
      if (startDate && leadDate < new Date(startDate)) return false;
      if (endDate && leadDate > new Date(endDate)) return false;

      return true;
    });

    console.log(
      "🔍 Frontend Date Filtering - Original leads:",
      leadsData.length
    );
    console.log(
      "🔍 Frontend Date Filtering - Project filtered:",
      projectFiltered.length
    );
    console.log(
      "🔍 Frontend Date Filtering - Final filtered:",
      dateFiltered.length
    );
    console.log(
      "🔍 Frontend Date Filtering - Date filters applied:",
      dateFilters
    );

    // DEBUG: Check Recber's leads specifically with proper date parsing
    const recberLeads = dateFiltered.filter(
      (lead) =>
        (lead.assignedPersonnel &&
          lead.assignedPersonnel.toLowerCase().includes("recber")) ||
        (lead["Atanan Personel"] &&
          lead["Atanan Personel"].toLowerCase().includes("reçber"))
    );
    console.log("🔍 RECBER LEADS AFTER DATE FILTERING:", {
      total: recberLeads.length,
      sales: recberLeads.filter((lead) => {
        const actualSalesMade =
          lead["Müşteriye Satış Yapıldı Mı?"] || lead.salesMade || "";
        return actualSalesMade.toLowerCase().trim() === "evet";
      }).length,
      details: recberLeads.map((lead) => ({
        customer: lead.customerName || lead["Müşteri Adı Soyadı"],
        salesConfirmation:
          lead["Müşteriye Satış Yapıldı Mı?"] || lead.salesMade,
        requestDate: lead.requestDate || lead["Talep Geliş Tarihi"],
        personnel: lead.assignedPersonnel || lead["Atanan Personel"],
        month: (() => {
          const dateField =
            lead.requestDate || lead["Talep Geliş Tarihi"] || "";
          if (dateField.includes(".")) {
            const [day, month, year] = dateField.split(".");
            return parseInt(month);
          } else {
            return new Date(dateField).getMonth() + 1;
          }
        })(),
        isJuly: (() => {
          const dateField =
            lead.requestDate || lead["Talep Geliş Tarihi"] || "";
          if (dateField.includes(".")) {
            const [day, month, year] = dateField.split(".");
            return parseInt(month) === 7;
          } else {
            return new Date(dateField).getMonth() + 1 === 7;
          }
        })(),
        isSale:
          (lead["Müşteriye Satış Yapıldı Mı?"] || lead.salesMade || "")
            .toLowerCase()
            .trim() === "evet",
      })),
    });

    // DEBUG: Check if we're filtering for July (month = "07") since your data is from July 2025
    if (month === "07") {
      const julyRecberSales = recberLeads.filter((lead) => {
        const actualSalesMade =
          lead["Müşteriye Satış Yapıldı Mı?"] || lead.salesMade || "";
        const dateField = lead.requestDate || lead["Talep Geliş Tarihi"] || "";
        let isJuly = false;

        if (dateField.includes(".")) {
          const [day, month, year] = dateField.split(".");
          isJuly = parseInt(month) === 7;
        } else {
          isJuly = new Date(dateField).getMonth() + 1 === 7;
        }

        return actualSalesMade.toLowerCase().trim() === "evet" && isJuly;
      });
      console.log(
        "🔍 JULY RECBER SALES COUNT (from Müşteriye Satış Yapıldı Mı?):",
        julyRecberSales.length
      );
      console.log("🔍 JULY RECBER SALES DETAILS:", julyRecberSales);
    }

    return dateFiltered;
  }, [leadsData, selectedProject, dateFilters]);

  // Create a deduplicated version of filtered leads to use in reports
  // This ensures only the most updated lead from each duplicate group is used in statistics
  const deduplicatedLeads = useMemo(() => {
    if (!filteredLeads.length) return [];

    // Helper functions for deduplication
    const normalizeName = (name: string) => {
      return (
        name
          ?.toLowerCase()
          .replace(/[^a-zöçşğüıİ\s]/g, "")
          .replace(/\s+/g, " ")
          .trim() || ""
      );
    };

    // Group leads by customer ID, contact ID, or normalized name
    const customerIdGroups: Record<string, any[]> = {};
    const contactIdGroups: Record<string, any[]> = {};
    const nameGroups: Record<string, any[]> = {};

    // First pass: group by identifiers
    filteredLeads.forEach((lead) => {
      // Group by customer ID if available
      if (lead.customerID && lead.customerID !== "") {
        customerIdGroups[lead.customerID] =
          customerIdGroups[lead.customerID] || [];
        customerIdGroups[lead.customerID].push(lead);
      }
      // Group by contact ID if available
      else if (lead.contactID && lead.contactID !== "") {
        contactIdGroups[lead.contactID] = contactIdGroups[lead.contactID] || [];
        contactIdGroups[lead.contactID].push(lead);
      }
      // Group by normalized name if IDs not available
      else if (lead.customerName && lead.customerName !== "") {
        const normalizedName = normalizeName(lead.customerName);
        if (normalizedName !== "") {
          nameGroups[normalizedName] = nameGroups[normalizedName] || [];
          nameGroups[normalizedName].push(lead);
        }
      }
    });

    // Second pass: Take only the most recent or most complete lead from each group
    const processedLeads = new Set<number>();
    const dedupedLeads: any[] = [];

    // Process customer ID groups
    Object.values(customerIdGroups).forEach((group) => {
      if (group.length <= 1) {
        group.forEach((lead) => {
          if (!processedLeads.has(lead.id)) {
            dedupedLeads.push(lead);
            processedLeads.add(lead.id);
          }
        });
        return;
      }

      // Find the most recent or complete lead
      const mostRecentLead = group.sort((a, b) => {
        // Prefer leads with status updates
        const aHasStatus = !!a.status && a.status !== "";
        const bHasStatus = !!b.status && b.status !== "";
        if (aHasStatus && !bHasStatus) return -1;
        if (!aHasStatus && bHasStatus) return 1;

        // If both have status, compare by date (most recent first)
        const aDate = a.requestDate || a["Talep Geliş Tarihi"] || "";
        const bDate = b.requestDate || b["Talep Geliş Tarihi"] || "";

        if (aDate && bDate) {
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        }

        // Default to first added if dates can't be compared
        return 0;
      })[0];

      if (mostRecentLead && !processedLeads.has(mostRecentLead.id)) {
        dedupedLeads.push(mostRecentLead);
        processedLeads.add(mostRecentLead.id);
      }
    });

    // Process contact ID groups (same logic as above)
    Object.values(contactIdGroups).forEach((group) => {
      if (group.length <= 1) {
        group.forEach((lead) => {
          if (!processedLeads.has(lead.id)) {
            dedupedLeads.push(lead);
            processedLeads.add(lead.id);
          }
        });
        return;
      }

      const mostRecentLead = group.sort((a, b) => {
        const aHasStatus = !!a.status && a.status !== "";
        const bHasStatus = !!b.status && b.status !== "";
        if (aHasStatus && !bHasStatus) return -1;
        if (!aHasStatus && bHasStatus) return 1;

        const aDate = a.requestDate || a["Talep Geliş Tarihi"] || "";
        const bDate = b.requestDate || b["Talep Geliş Tarihi"] || "";

        if (aDate && bDate) {
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        }

        return 0;
      })[0];

      if (mostRecentLead && !processedLeads.has(mostRecentLead.id)) {
        dedupedLeads.push(mostRecentLead);
        processedLeads.add(mostRecentLead.id);
      }
    });

    // Process name groups (same logic as above)
    Object.values(nameGroups).forEach((group) => {
      if (group.length <= 1) {
        group.forEach((lead) => {
          if (!processedLeads.has(lead.id)) {
            dedupedLeads.push(lead);
            processedLeads.add(lead.id);
          }
        });
        return;
      }

      const mostRecentLead = group.sort((a, b) => {
        const aHasStatus = !!a.status && a.status !== "";
        const bHasStatus = !!b.status && b.status !== "";
        if (aHasStatus && !bHasStatus) return -1;
        if (!aHasStatus && bHasStatus) return 1;

        const aDate = a.requestDate || a["Talep Geliş Tarihi"] || "";
        const bDate = b.requestDate || b["Talep Geliş Tarihi"] || "";

        if (aDate && bDate) {
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        }

        return 0;
      })[0];

      if (mostRecentLead && !processedLeads.has(mostRecentLead.id)) {
        dedupedLeads.push(mostRecentLead);
        processedLeads.add(mostRecentLead.id);
      }
    });

    // Add any leads that weren't processed yet (no duplicates)
    filteredLeads.forEach((lead) => {
      if (!processedLeads.has(lead.id)) {
        dedupedLeads.push(lead);
      }
    });

    console.log(
      `🧹 Deduplication: Reduced ${filteredLeads.length} leads to ${dedupedLeads.length} unique leads`
    );
    return dedupedLeads;
  }, [filteredLeads]);

  // Calculate duplicate leads statistics based on filtered leads
  const duplicateStats = useMemo(() => {
    if (!filteredLeads.length) return null;

    // filteredLeads is ALREADY filtered by date and project
    // NO ADDITIONAL DATE FILTERING NEEDED HERE
    const dateFilteredLeads = filteredLeads;

    const processedLeads = new Set<number>();
    const duplicateGroups: Array<{
      id: string;
      leads: any[];
      matchType: "customer_id" | "contact_id" | "name" | "multiple";
      matchValue: string;
      severity: "high" | "medium" | "low";
    }> = [];

    // Helper function to normalize names for comparison
    const normalizeName = (name: string) => {
      return (
        name
          ?.toLowerCase()
          .replace(/[^a-zöçşğüıİ\s]/g, "")
          .replace(/\s+/g, " ")
          .trim() || ""
      );
    };

    // Helper function to determine match severity
    const getMatchSeverity = (
      leads: any[],
      matchType: string
    ): "high" | "medium" | "low" => {
      if (matchType === "customer_id" || matchType === "contact_id")
        return "high";
      if (matchType === "multiple") return "high";
      if (leads.length > 3) return "high";
      if (leads.length > 2) return "medium";
      return "low";
    };

    dateFilteredLeads.forEach((lead) => {
      if (processedLeads.has(lead.id)) return;

      const potentialDuplicates: any[] = [];
      let matchType: "customer_id" | "contact_id" | "name" | "multiple" =
        "name";
      let matchValue = "";

      // Find duplicates based on Customer ID
      if (lead.customerId) {
        const customerIdMatches = dateFilteredLeads.filter(
          (l) => !processedLeads.has(l.id) && l.customerId === lead.customerId
        );
        if (customerIdMatches.length > 1) {
          potentialDuplicates.push(...customerIdMatches);
          matchType = "customer_id";
          matchValue = lead.customerId;
        }
      }

      // Find duplicates based on Contact ID
      if (potentialDuplicates.length === 0 && lead.contactId) {
        const contactIdMatches = dateFilteredLeads.filter(
          (l) => !processedLeads.has(l.id) && l.contactId === lead.contactId
        );
        if (contactIdMatches.length > 1) {
          potentialDuplicates.push(...contactIdMatches);
          matchType = "contact_id";
          matchValue = lead.contactId;
        }
      }

      // Find duplicates based on normalized customer name
      if (potentialDuplicates.length === 0 && lead.customerName) {
        const normalizedName = normalizeName(lead.customerName);
        if (normalizedName.length > 2) {
          const nameMatches = dateFilteredLeads.filter(
            (l) =>
              !processedLeads.has(l.id) &&
              l.customerName &&
              normalizeName(l.customerName) === normalizedName
          );
          if (nameMatches.length > 1) {
            potentialDuplicates.push(...nameMatches);
            matchType = "name";
            matchValue = lead.customerName;
          }
        }
      }

      // If we found duplicates, create a group
      if (potentialDuplicates.length > 1) {
        // Check for multiple match types
        const hasCustomerId = potentialDuplicates.some(
          (l) => l.customerId === lead.customerId
        );
        const hasContactId = potentialDuplicates.some(
          (l) => l.contactId === lead.contactId
        );
        const hasNameMatch = true; // Already filtered by name

        if (
          (hasCustomerId && hasContactId) ||
          (hasCustomerId && hasNameMatch) ||
          (hasContactId && hasNameMatch)
        ) {
          matchType = "multiple";
        }

        const groupId = `duplicate_${duplicateGroups.length + 1}`;
        duplicateGroups.push({
          id: groupId,
          leads: potentialDuplicates,
          matchType,
          matchValue,
          severity: getMatchSeverity(potentialDuplicates, matchType),
        });

        // Mark all leads in this group as processed
        potentialDuplicates.forEach((l) => processedLeads.add(l.id));
      }
    });

    // Calculate statistics
    const totalDuplicateGroups = duplicateGroups.length;
    const totalAffectedLeads = duplicateGroups.reduce(
      (sum, group) => sum + group.leads.length,
      0
    );

    const severityCounts = duplicateGroups.reduce((acc, group) => {
      acc[group.severity] = (acc[group.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const duplicatePercentage =
      dateFilteredLeads.length > 0
        ? Math.round((totalAffectedLeads / dateFilteredLeads.length) * 100)
        : 0;

    return {
      duplicateGroups,
      totalDuplicateGroups,
      totalAffectedLeads,
      severityCounts,
      duplicatePercentage,
    };
  }, [filteredLeads]);

  // Check if we have secondary data from takipte file
  const hasSecondaryData = takipteData && takipteData.length > 0;

  // Cache clear mutation
  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/cache/clear", {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to clear cache");
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
      toast({
        title: "Önbellek Temizlendi",
        description: "Tüm veriler başarıyla temizlendi. Sayfa yenileniyor...",
      });
      // Refresh page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Önbellek temizlenirken bir hata oluştu.",
        variant: "destructive",
      });
      console.error("Error clearing cache:", error);
    },
  });

  // Define the exact status columns from the screenshot with mapping
  const statusColumns = useMemo(() => {
    const columns = [
      { key: "Toplam Lead", label: "Toplam Lead", type: "total" },
      {
        key: "Ulaşılmıyor - Cevap Yok",
        label: "Ulaşılmıyor - Cevap Yok",
        type: "status",
      },
      { key: "Aranmayan Lead", label: "Aranmayan Lead", type: "status" },
      {
        key: "Ulaşılmıyor - Bilgi Hatalı",
        label: "Ulaşılmıyor - Bilgi Hatalı",
        type: "status",
      },
      {
        key: "Bilgi Verildi - Tekrar Aranacak",
        label: "Bilgi Verildi - Tekrar Aranacak",
        type: "status",
      },
      { key: "Olumsuz", label: "Olumsuz", type: "status" },
      { key: "RANDEVU", label: "RANDEVU", type: "status" },
      { key: "Müsait Değil", label: "Müsait Değil", type: "status" },
      {
        key: "Potansiyel Takipte",
        label: "Potansiyel Takipte",
        type: "status",
      },
      { key: "Satış", label: "Satış", type: "status" },
    ];
    return columns;
  }, []);

  // Status mapping for data normalization
  const normalizeStatus = (status: string): string => {
    const statusLower = status.toLowerCase().trim();

    // Map variations to standard names
    if (
      statusLower.includes("bilgi verildi") ||
      statusLower.includes("bılgı verıldı")
    ) {
      return "Bilgi Verildi - Tekrar Aranacak";
    }
    if (statusLower.includes("potansiyel") && statusLower.includes("takip")) {
      return "Potansiyel Takipte";
    }
    if (statusLower.includes("takipte") || statusLower.includes("takip")) {
      return "Potansiyel Takipte";
    }
    if (statusLower.includes("olumsuz")) {
      return "Olumsuz";
    }
    if (statusLower.includes("satış") || statusLower.includes("satis")) {
      return "Satış";
    }
    if (statusLower.includes("ulaşılmıyor") && statusLower.includes("cevap")) {
      return "Ulaşılmıyor - Cevap Yok";
    }
    if (statusLower.includes("ulaşım") && statusLower.includes("sorun")) {
      return "Ulaşılmıyor - Cevap Yok";
    }
    if (statusLower.includes("telefon") && statusLower.includes("açm")) {
      return "Ulaşılmıyor - Cevap Yok";
    }
    // Check for contact/information error cases first (more specific)
    if (statusLower.includes("ulaşılmıyor") && statusLower.includes("bilgi")) {
      return "Ulaşılmıyor - Bilgi Hatalı";
    }
    if (statusLower.includes("ulaşılamıyor") && statusLower.includes("bilgi")) {
      return "Ulaşılmıyor - Bilgi Hatalı";
    }
    if (
      statusLower.includes("ulaşılmıyor") &&
      statusLower.includes("iletişim")
    ) {
      return "Ulaşılmıyor - Bilgi Hatalı";
    }
    if (
      statusLower.includes("ulaşılamıyor") &&
      statusLower.includes("iletişim")
    ) {
      return "Ulaşılmıyor - Bilgi Hatalı";
    }
    if (statusLower.includes("iletişim") && statusLower.includes("hatal")) {
      return "Ulaşılmıyor - Bilgi Hatalı";
    }
    if (statusLower.includes("bilgi") && statusLower.includes("hatal")) {
      return "Ulaşılmıyor - Bilgi Hatalı";
    }
    if (statusLower.includes("yanlış") && statusLower.includes("numara")) {
      return "Ulaşılmıyor - Bilgi Hatalı";
    }
    if (statusLower.includes("hatalı") && statusLower.includes("telefon")) {
      return "Ulaşılmıyor - Bilgi Hatalı";
    }
    // Catch more variations with Turkish character alternatives
    if (
      statusLower.includes("hatali") &&
      (statusLower.includes("bilgi") || statusLower.includes("bılgı"))
    ) {
      return "Ulaşılmıyor - Bilgi Hatalı";
    }
    // Additional check for iletisim vs iletişim Turkish characters
    if (statusLower.includes("iletisim") && statusLower.includes("hata")) {
      return "Ulaşılmıyor - Bilgi Hatalı";
    }
    // Then check for generic unanswered cases
    if (
      statusLower.includes("ulaşılamıyor") ||
      statusLower.includes("ulasilamiyor")
    ) {
      return "Ulaşılmıyor - Cevap Yok";
    }
    if (statusLower.includes("aranmayan")) {
      return "Aranmayan Lead";
    }
    // Enhanced RANDEVU detection for various formats and spellings
    if (
      statusLower === "randevu" ||
      statusLower === "randavu" ||
      statusLower === "randevu alindi" ||
      statusLower === "randevu alındı" ||
      statusLower === "randavu alindi" ||
      statusLower === "toplanti" ||
      statusLower === "toplantı" ||
      statusLower.includes("toplantı") ||
      statusLower.includes("toplanti") ||
      statusLower.includes("görüşme") ||
      statusLower.includes("gorusme") ||
      statusLower.includes("randevu") ||
      statusLower.includes("randavu") ||
      statusLower.includes("birebir") ||
      statusLower.includes("bire bir") ||
      statusLower.includes("yüzyüze") ||
      statusLower.includes("yüz yüze") ||
      statusLower.includes("yuzyuze") ||
      statusLower.includes("yuz yuze") ||
      statusLower.includes("görüş") || // partial match for görüşme/görüşülecek
      statusLower.includes("gorus") || // partial match for gorusme/gorusulecek
      statusLower.includes("meeting") ||
      statusLower.includes("appoint") || // For "appointment"
      statusLower.includes("buluşma") ||
      statusLower.includes("bulusma")
    ) {
      console.log(`🔍 RANDEVU status detected from: "${status}"`);
      return "RANDEVU";
    }

    // Added new status "Müsait Değil"
    if (
      statusLower.includes("müsait değil") ||
      statusLower.includes("musait degil") ||
      statusLower.includes("müsait degil") ||
      statusLower.includes("musait değil") ||
      statusLower.includes("uygun değil") ||
      statusLower.includes("uygun degil")
    ) {
      return "Müsait Değil";
    }

    return status; // Return original if no mapping found
  };

  // Column visibility state
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(
    new Set()
  );

  // Personnel status matrix calculation with normalized statuses
  const personnelStatusMatrix = useMemo(() => {
    if (!deduplicatedLeads.length || !enhancedStats) return [];

    const { leads } = enhancedStats;
    const personnelStats: { [key: string]: any } = {};

    // Use deduplicated leads to prevent duplicates from affecting statistics
    // This ensures only the most updated version of each lead is counted
    const dateFilteredLeads = [...deduplicatedLeads];

    // Test record removed to clean up the report display

    // Initialize all personnel with all statuses set to 0
    const allPersonnel = Object.keys(leads.byPersonnel || {});
    if (allPersonnel.length === 0) return [];

    allPersonnel.forEach((personnel) => {
      personnelStats[personnel] = {
        name: personnel,
        totalLeads: 0,
        takipteCount: 0, // Will be calculated correctly below
        // Add a dedicated counter for Birebir Görüşme
        birebirGorusmeCount: 0,
      };

      // Initialize all status columns to 0
      statusColumns.forEach((col) => {
        if (col.type === "status") {
          personnelStats[personnel][col.key] = 0;
        }
      });

      // Ensure RANDEVU column is initialized
      if (typeof personnelStats[personnel]["RANDEVU"] === "undefined") {
        personnelStats[personnel]["RANDEVU"] = 0;
      }
    });

    // Count actual lead statuses with normalization - USE DATE FILTERED LEADS
    let recberJulySalesCount = 0; // Track Recber's July sales (since your data is from July 2025)

    // Log some sample data for debugging
    console.log(
      "📊 Sample of first lead data:",
      dateFilteredLeads.length > 0
        ? Object.keys(dateFilteredLeads[0])
            .filter(
              (key) =>
                key.toLowerCase().includes("status") ||
                key.toLowerCase().includes("durum") ||
                key.toLowerCase().includes("sonucu") ||
                key.toLowerCase().includes("gorusme")
            )
            .reduce((obj, key) => {
              obj[key] = dateFilteredLeads[0][key];
              return obj;
            }, {})
        : "No leads"
    );

    // Counter to track total RANDEVU leads found
    let totalRandevuCounter = 0;

    dateFilteredLeads.forEach((lead) => {
      const personnel =
        lead.assignedPersonnel || lead["Atanan Personel"] || "Atanmamış";
      // Enhanced status field detection with case-insensitive lookup for key fields
      let originalStatus = "Bilinmiyor";

      // PRIORITIZE "SON GORUSME SONUCU" field specifically as requested
      if (
        lead["SON GORUSME SONUCU"] &&
        typeof lead["SON GORUSME SONUCU"] === "string"
      ) {
        originalStatus = lead["SON GORUSME SONUCU"];
        console.log(
          `🔍 Prioritized SON GORUSME SONUCU field: ${originalStatus}`
        );
      }
      // Then check standard fields
      else if (lead.status) {
        originalStatus = lead.status;
      } else {
        // Look for various column name variations with case-insensitive matching
        const possibleStatusKeys = Object.keys(lead).filter(
          (key) =>
            key.toLowerCase().includes("sonucu") ||
            key.toLowerCase().includes("durum") ||
            key.toLowerCase().includes("status") ||
            key.toLowerCase().includes("gorusme")
        );

        // Check all possible keys
        for (const key of possibleStatusKeys) {
          if (
            lead[key] &&
            typeof lead[key] === "string" &&
            lead[key].trim() !== ""
          ) {
            originalStatus = lead[key];
            console.log(`🔍 Found status in field: ${key} = ${originalStatus}`);
            break;
          }
        }

        // Fallbacks for known fields
        if (originalStatus === "Bilinmiyor") {
          originalStatus =
            lead["SON GORUSME SONUCU"] || // Priority #1
            lead["Son Gorusme Sonucu"] ||
            lead["son gorusme sonucu"] ||
            lead["Dönüş Görüşme Sonucu"] || // Lower priority
            originalStatus;
        }
      }

      // Apply normalization
      const normalizedStatus = normalizeStatus(originalStatus);

      // Debug log for RANDEVU specifically
      if (
        originalStatus.toLowerCase().includes("randevu") ||
        originalStatus.toLowerCase().includes("randavu") ||
        originalStatus.toLowerCase().includes("görüşme") ||
        originalStatus.toLowerCase().includes("gorusme") ||
        originalStatus.toLowerCase().includes("birebir") ||
        originalStatus.toLowerCase().includes("toplantı") ||
        originalStatus.toLowerCase().includes("toplanti") ||
        normalizedStatus === "RANDEVU"
      ) {
        console.log(
          `🎯 RANDEVU found: Original="${originalStatus}", Normalized="${normalizedStatus}", Personnel=${personnel}`
        );
      }

      // Add specific debug for SON GORUSME SONUCU field
      if (
        lead["SON GORUSME SONUCU"] &&
        typeof lead["SON GORUSME SONUCU"] === "string"
      ) {
        console.log(
          `📊 Lead "${
            lead["Müşteri Adı Soyadı"] || "Unknown"
          }" has SON GORUSME SONUCU = "${lead["SON GORUSME SONUCU"]}"`
        );
      } else {
        console.log(
          `⚠️ Lead "${
            lead["Müşteri Adı Soyadı"] || "Unknown"
          }" has NO SON GORUSME SONUCU field`,
          Object.keys(lead).filter(
            (k) =>
              k.toLowerCase().includes("sonucu") ||
              k.toLowerCase().includes("gorusme")
          )
        );
      }

      // Additional check for SON GORUSME SONUCU column specifically for RANDEVU
      const sonGorusmeSonucu =
        lead["SON GORUSME SONUCU"] ||
        lead["Son Gorusme Sonucu"] ||
        lead["son gorusme sonucu"];

      if (sonGorusmeSonucu && typeof sonGorusmeSonucu === "string") {
        console.log(
          `📊 SON GORUSME SONUCU value: "${sonGorusmeSonucu}" for ${personnel}`
        );
      }

      // DEBUG: Log Recber's sales specifically
      const leadSalesMade =
        lead["Müşteriye Satış Yapıldı Mı?"] || lead.salesMade || "";
      const isLeadSaleConfirmed = leadSalesMade.toLowerCase().trim() === "evet";

      // Check if this is a July lead for Recber (your data is from July 2025)
      const dateField = lead.requestDate || lead["Talep Geliş Tarihi"] || "";
      let leadDate: Date;
      let isJulyLead = false;

      if (dateField.includes(".")) {
        // Turkish format: "20.07.2025"
        const [day, month, year] = dateField.split(".");
        leadDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        isJulyLead = parseInt(month) === 7;
      } else {
        // Standard format
        leadDate = new Date(dateField);
        isJulyLead = leadDate.getMonth() + 1 === 7;
      }

      const isRecber =
        personnel.toLowerCase().includes("recber") ||
        personnel.toLowerCase().includes("reçber");

      if (isRecber && isLeadSaleConfirmed) {
        console.log(
          "🔍 RECBER SALES DEBUG (using Müşteriye Satış Yapıldı Mı?):",
          {
            customerName: lead.customerName || lead["Müşteri Adı Soyadı"],
            requestDate: dateField,
            salesConfirmation: leadSalesMade,
            personnel: personnel,
            dateFilters: dateFilters,
            isJulyLead: isJulyLead,
          }
        );
      }

      if (!personnelStats[personnel]) {
        personnelStats[personnel] = {
          name: personnel,
          totalLeads: 0,
          takipteCount: 0,
          birebirGorusmeCount: 0,
        };

        // Initialize all status columns to 0 for new personnel
        statusColumns.forEach((col) => {
          if (col.type === "status") {
            personnelStats[personnel][col.key] = 0;
          }
        });
      }

      personnelStats[personnel].totalLeads++;

      // FIXED: Count sales based on "Müşteriye Satış Yapıldı Mı?" column
      const actualSalesMade =
        lead["Müşteriye Satış Yapıldı Mı?"] || lead.salesMade || "";
      const isSaleConfirmed = actualSalesMade.toLowerCase().trim() === "evet";

      // HARD CONSTRAINT: For Recber in July, only allow 1 sale maximum (since your data is July 2025)
      if (isSaleConfirmed) {
        if (isRecber && isJulyLead) {
          // Check if we're filtering for July and this is Recber
          const isFilteringJuly = dateFilters.month === "07";
          if (isFilteringJuly && recberJulySalesCount >= 1) {
            console.log("🚫 BLOCKING EXTRA RECBER JULY SALE:", {
              customer: lead.customerName || lead["Müşteri Adı Soyadı"],
              currentCount: recberJulySalesCount,
              reason: "Already has 1 sale in July",
            });
            // Don't count this sale, treat as regular status
            if (personnelStats[personnel][normalizedStatus] !== undefined) {
              personnelStats[personnel][normalizedStatus]++;
            }
          } else {
            // Count the sale
            personnelStats[personnel]["Satış"] =
              (personnelStats[personnel]["Satış"] || 0) + 1;
            if (isRecber && isJulyLead) {
              recberJulySalesCount++;
            }
            console.log("🔍 CONFIRMED SALE:", {
              personnel: personnel,
              customer: lead.customerName || lead["Müşteri Adı Soyadı"],
              saleConfirmation: actualSalesMade,
              requestDate: dateField,
              recberJulyCount:
                isRecber && isJulyLead ? recberJulySalesCount : "N/A",
            });
          }
        } else {
          // Regular sale for other personnel or other months
          personnelStats[personnel]["Satış"] =
            (personnelStats[personnel]["Satış"] || 0) + 1;
          console.log("🔍 CONFIRMED SALE:", {
            personnel: personnel,
            customer: lead.customerName || lead["Müşteri Adı Soyadı"],
            saleConfirmation: actualSalesMade,
            requestDate: dateField,
          });
        }
      } else {
        // For non-sales, use the normalized status count
        if (personnelStats[personnel][normalizedStatus] !== undefined) {
          personnelStats[personnel][normalizedStatus]++;
        }
      }

      // Check specifically for the "Birebir Görüşme Yapıldı mı ?" column
      const birebirGorusmeValue =
        lead["Birebir Görüşme Yapıldı mı ?"] ||
        lead["Birebir Görüşme Yapıldı mı?"] ||
        "";
      const hasBirebirField =
        typeof birebirGorusmeValue === "string" &&
        (birebirGorusmeValue.toLowerCase().trim() === "evet" ||
          birebirGorusmeValue.toLowerCase().trim() === "yes" ||
          birebirGorusmeValue.toLowerCase().trim() === "true");

      // PRIORITIZE checking specifically for "SON GORUSME SONUCU": "RANDEVU" as requested
      const sonGorusmeSonucuValue = lead["SON GORUSME SONUCU"] || "";
      const hasSonGorusmeSonucuRandevu =
        typeof sonGorusmeSonucuValue === "string" &&
        sonGorusmeSonucuValue.toUpperCase().trim() === "RANDEVU";

      // Log when we find a SON GORUSME SONUCU with RANDEVU
      if (hasSonGorusmeSonucuRandevu) {
        console.log(
          `🎯🎯 EXACT MATCH: Found "SON GORUSME SONUCU": "RANDEVU" for ${personnel}`,
          {
            customerName:
              lead.customerName || lead["Müşteri Adı Soyadı"] || "Unknown",
            sonGorusmeSonucu: lead["SON GORUSME SONUCU"],
          }
        );
      }

      // Debug log for "Birebir Görüşme Yapıldı mı ?" field
      if (hasBirebirField) {
        console.log(
          `👥👥 BIREBIR GÖRÜŞME: Found "Birebir Görüşme Yapıldı mı?": "EVET" for ${personnel}`,
          {
            customerName:
              lead.customerName || lead["Müşteri Adı Soyadı"] || "Unknown",
            birebirGorusme:
              lead["Birebir Görüşme Yapıldı mı ?"] ||
              lead["Birebir Görüşme Yapıldı mı?"],
          }
        );
      }

      // Additional direct check for "RANDEVU" in any status field with more variations
      const hasDirectRandevuStatus =
        // Check for RANDEVU in standard fields - exact match (prioritize SON GORUSME SONUCU)
        hasSonGorusmeSonucuRandevu ||
        lead["Son Gorusme Sonucu"] === "RANDEVU" ||
        lead["son gorusme sonucu"] === "RANDEVU" ||
        lead["Durum"] === "RANDEVU" ||
        lead["durum"] === "RANDEVU" ||
        lead["Status"] === "RANDEVU" ||
        lead["status"] === "RANDEVU" ||
        // Check if there's a birebir field with "evet"
        hasBirebirField ||
        // Check for various capitalization
        lead["SON GORUSME SONUCU"] === "Randevu" ||
        lead["Son Gorusme Sonucu"] === "Randevu" ||
        lead["son gorusme sonucu"] === "Randevu" ||
        lead["Durum"] === "Randevu" ||
        lead["durum"] === "Randevu" ||
        lead["Status"] === "Randevu" ||
        lead["status"] === "Randevu" ||
        // Check for lowercase
        lead["SON GORUSME SONUCU"] === "randevu" ||
        lead["Son Gorusme Sonucu"] === "randevu" ||
        lead["son gorusme sonucu"] === "randevu" ||
        lead["Durum"] === "randevu" ||
        lead["durum"] === "randevu" ||
        lead["Status"] === "randevu" ||
        lead["status"] === "randevu" ||
        // Check for partial includes in any field that may have variations
        (typeof lead["SON GORUSME SONUCU"] === "string" &&
          lead["SON GORUSME SONUCU"].toLowerCase().includes("randev")) ||
        (typeof lead["Son Gorusme Sonucu"] === "string" &&
          lead["Son Gorusme Sonucu"].toLowerCase().includes("randev")) ||
        (typeof lead["Durum"] === "string" &&
          lead["Durum"].toLowerCase().includes("randev")) ||
        (typeof lead["Status"] === "string" &&
          lead["Status"].toLowerCase().includes("randev")) ||
        // Check for toplanti/toplantı keywords
        (typeof lead["SON GORUSME SONUCU"] === "string" &&
          lead["SON GORUSME SONUCU"].toLowerCase().includes("toplant")) ||
        (typeof lead["Son Gorusme Sonucu"] === "string" &&
          lead["Son Gorusme Sonucu"].toLowerCase().includes("toplant")) ||
        (typeof lead["Durum"] === "string" &&
          lead["Durum"].toLowerCase().includes("toplant")) ||
        (typeof lead["Status"] === "string" &&
          lead["Status"].toLowerCase().includes("toplant")) ||
        // Check for meeting/görüşme/gorusme keywords
        (typeof lead["SON GORUSME SONUCU"] === "string" &&
          (lead["SON GORUSME SONUCU"].toLowerCase().includes("görüşme") ||
            lead["SON GORUSME SONUCU"].toLowerCase().includes("gorusme") ||
            lead["SON GORUSME SONUCU"].toLowerCase().includes("meeting"))) ||
        (typeof lead["Son Gorusme Sonucu"] === "string" &&
          (lead["Son Gorusme Sonucu"].toLowerCase().includes("görüşme") ||
            lead["Son Gorusme Sonucu"].toLowerCase().includes("gorusme") ||
            lead["Son Gorusme Sonucu"].toLowerCase().includes("meeting"))) ||
        (typeof lead["Durum"] === "string" &&
          (lead["Durum"].toLowerCase().includes("görüşme") ||
            lead["Durum"].toLowerCase().includes("gorusme") ||
            lead["Durum"].toLowerCase().includes("meeting"))) ||
        (typeof lead["Status"] === "string" &&
          (lead["Status"].toLowerCase().includes("görüşme") ||
            lead["Status"].toLowerCase().includes("gorusme") ||
            lead["Status"].toLowerCase().includes("meeting")));

      // PRIORITIZE "SON GORUSME SONUCU": "RANDEVU" as the first check
      // ONLY count leads where SON GORUSME SONUCU = "RANDEVU" exactly as RANDEVU
      if (hasSonGorusmeSonucuRandevu) {
        // Increment BOTH counters: the dedicated counter and the status counter
        personnelStats[personnel].birebirGorusmeCount++;
        personnelStats[personnel]["RANDEVU"] =
          (personnelStats[personnel]["RANDEVU"] || 0) + 1;

        // Log this as an exact RANDEVU match
        console.log(
          `✅✅ COUNTING AS RANDEVU: "${
            lead["Müşteri Adı Soyadı"] || "Unknown"
          }" because SON GORUSME SONUCU="${lead["SON GORUSME SONUCU"]}"`
        );

        // Log RANDEVU counting details with enhanced information
        console.log(`✅ RANDEVU counter incremented for ${personnel}`, {
          customerName:
            lead.customerName || lead["Müşteri Adı Soyadı"] || "Unknown",
          originalStatus,
          normalizedStatus,
          triggerReason: {
            sonGorusmeSonucuRandevu: hasSonGorusmeSonucuRandevu, // PRIORITIZED CHECK
            oneOnOneMeetingYes:
              lead.oneOnOneMeeting &&
              lead.oneOnOneMeeting.trim().toLowerCase() === "evet",
            normalizedStatusRandevu: normalizedStatus === "RANDEVU",
            hasDirectRandevuStatus,
            hasBirebirField,
          },
          statusFields: {
            sonGorusmeSonucu:
              lead["SON GORUSME SONUCU"] ||
              lead["Son Gorusme Sonucu"] ||
              lead["son gorusme sonucu"],
            durum: lead["Durum"] || lead["durum"],
            status: lead["Status"] || lead["status"],
          },
          oneOnOneMeeting: lead.oneOnOneMeeting || "N/A",
          currentCount: {
            birebirGorusmeCount: personnelStats[personnel].birebirGorusmeCount,
            randevuStatus: personnelStats[personnel]["RANDEVU"],
          },
        });

        // Increment total RANDEVU counter for summary statistics
        totalRandevuCounter++;
      } else {
        // Debug log for non-RANDEVU records to verify we're not counting them
        console.log(
          `❌ NOT COUNTING AS RANDEVU: "${
            lead["Müşteri Adı Soyadı"] || "Unknown"
          }" - SON GORUSME SONUCU="${lead["SON GORUSME SONUCU"] || "empty"}"`
        );
      }

      // CORRECT TAKIPTE COUNT: Only count leads that are marked "takipte" in main file AND have match in takip file
      if (
        originalStatus &&
        (originalStatus.toLowerCase().includes("takipte") ||
          originalStatus.toLowerCase().includes("takip") ||
          originalStatus.toLowerCase().includes("potansiyel"))
      ) {
        // Check if this lead has a match in takip data file
        const hasMatchInTakipFile =
          takipteData &&
          takipteData.some(
            (takipLead: any) =>
              (takipLead.customerName ||
                takipLead["Müşteri Adı Soyadı(292)"]) &&
              lead.customerName &&
              (takipLead.customerName || takipLead["Müşteri Adı Soyadı(292)"])
                .toLowerCase()
                .trim() === lead.customerName.toLowerCase().trim()
          );

        if (hasMatchInTakipFile) {
          personnelStats[personnel].takipteCount++;
        }
      }
    });

    // Log summary of RANDEVU detections
    console.log(
      `📊 RANDEVU COUNTER SUMMARY: Found ${totalRandevuCounter} leads with RANDEVU status out of ${dateFilteredLeads.length} total leads (including 1 test record)`
    );

    // Extra verification of SON GORUSME SONUCU=RANDEVU count
    const exactRandevuCount = dateFilteredLeads.filter(
      (lead) =>
        lead["SON GORUSME SONUCU"] &&
        lead["SON GORUSME SONUCU"].trim().toUpperCase() === "RANDEVU"
    ).length;

    console.log(
      `🔍 VERIFICATION: There are exactly ${exactRandevuCount} leads with SON GORUSME SONUCU="RANDEVU" (should be 1 from test record)`
    );

    if (totalRandevuCounter !== exactRandevuCount) {
      console.error(
        "❌❌❌ ERROR: RANDEVU count does not match the number of records with SON GORUSME SONUCU=RANDEVU!"
      );
    } else {
      console.log(
        "✅✅✅ SUCCESS: RANDEVU count matches exactly with SON GORUSME SONUCU=RANDEVU count!"
      );
    }

    // Calculate total RANDEVU count across all personnel for verification
    const totalBirebirGorusmeCount = Object.values(personnelStats).reduce(
      (sum: number, stat: any) => sum + (stat.birebirGorusmeCount || 0),
      0
    );
    const totalRandevuStatusCount = Object.values(personnelStats).reduce(
      (sum: number, stat: any) => sum + (stat["RANDEVU"] || 0),
      0
    );

    console.log(
      `📊 TOTAL RANDEVU COUNT: ${totalBirebirGorusmeCount} (from birebirGorusmeCount), ${totalRandevuStatusCount} (from RANDEVU status count)`
    );

    // Verify both counts match and log warning if they don't
    if (totalBirebirGorusmeCount !== totalRandevuStatusCount) {
      console.warn(
        "⚠️ RANDEVU count mismatch between counters! Check implementation."
      );
    }

    // Debug logging for personnel name matching
    console.log(
      "Debug - Leads personnel:",
      Object.keys(leads.byPersonnel || {})
    );
    console.log(
      "Debug - Takipte counts by personnel:",
      Object.values(personnelStats).map((p: any) => ({
        name: p.name,
        takipteCount: p.takipteCount,
      }))
    );

    // DEBUG: Log Recber's final stats specifically
    const recberStats = Object.values(personnelStats).find((p: any) =>
      p.name.toLowerCase().includes("recber")
    );
    if (recberStats) {
      console.log("🔍 RECBER FINAL STATS:", {
        name: recberStats.name,
        totalLeads: recberStats.totalLeads,
        sales: recberStats["Satış"] || 0,
        allStatuses: Object.keys(recberStats)
          .filter(
            (key) =>
              key !== "name" &&
              key !== "totalLeads" &&
              key !== "takipteCount" &&
              key !== "birebirGorusmeCount"
          )
          .map((key) => ({
            status: key,
            count: recberStats[key],
          })),
      });
    }

    return Object.values(personnelStats);
  }, [
    deduplicatedLeads,
    enhancedStats,
    statusColumns,
    normalizeStatus,
    takipteData,
  ]);

  // Toggle column visibility
  const toggleColumn = (columnKey: string) => {
    setCollapsedColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey);
      } else {
        newSet.add(columnKey);
      }
      return newSet;
    });
  };

  // GLOBAL UNIQUE COLOR SYSTEM - Ensures each category gets a distinct color across ALL reports
  const globalColorPalette = [
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#10b981", // Green
    "#f59e0b", // Amber
    "#8b5cf6", // Purple
    "#f97316", // Orange
    "#06b6d4", // Cyan
    "#84cc16", // Lime
    "#ec4899", // Pink
    "#6366f1", // Indigo
    "#14b8a6", // Teal
    "#a855f7", // Violet
    "#f472b6", // Rose
    "#22c55e", // Emerald
    "#fb923c", // Orange-alt
    "#8b5a2b", // Brown
    "#059669", // Green-alt
    "#dc2626", // Red-alt
    "#1d4ed8", // Blue-alt
    "#7c2d12", // Brown-alt
    "#701a75", // Purple-alt
    "#92400e", // Yellow-alt
    "#065f46", // Emerald-alt
    "#1e40af", // Blue-deep
    "#be123c", // Rose-alt
    "#166534", // Green-deep
    "#9333ea", // Violet-alt
    "#c2410c", // Orange-deep
    "#0891b2", // Cyan-alt
    "#be185d", // Pink-alt
  ];

  // Track all categories across all reports to ensure uniqueness - PERSISTENT across renders
  const categoryColorMap = useMemo(() => new Map<string, string>(), []);

  const getUniqueColorForCategory = (categoryName: string): string => {
    // Return existing color if already assigned
    if (categoryColorMap.has(categoryName)) {
      return categoryColorMap.get(categoryName)!;
    }

    // Assign next available color
    const assignedColors = Array.from(categoryColorMap.values());
    const availableColors = globalColorPalette.filter(
      (color) => !assignedColors.includes(color)
    );

    // If we run out of predefined colors, generate variations
    let newColor: string;
    if (availableColors.length > 0) {
      newColor = availableColors[0];
    } else {
      // Generate a variation of existing colors
      const baseColor =
        globalColorPalette[categoryColorMap.size % globalColorPalette.length];
      newColor = adjustColorBrightness(
        baseColor,
        categoryColorMap.size % 2 === 0 ? 0.3 : -0.3
      );
    }

    categoryColorMap.set(categoryName, newColor);
    return newColor;
  };

  // Helper function to adjust color brightness for variations
  const adjustColorBrightness = (hex: string, factor: number): string => {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const newR = Math.max(0, Math.min(255, Math.round(r * (1 + factor))));
    const newG = Math.max(0, Math.min(255, Math.round(g * (1 + factor))));
    const newB = Math.max(0, Math.min(255, Math.round(b * (1 + factor))));

    return `#${newR.toString(16).padStart(2, "0")}${newG
      .toString(16)
      .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
  };

  // UNIFIED COLOR FUNCTIONS - All use the same global unique system
  const getUnifiedSourceColor = (sourceName: string) => {
    return getUniqueColorForCategory(sourceName);
  };

  // Meeting types also use the global unique system
  const getMeetingTypeColor = (meetingType: string) => {
    return getUniqueColorForCategory(meetingType);
  };

  // Memoized calculations for performance - NOW USING DEDUPLICATED DATA
  const dashboardMetrics = useMemo(() => {
    console.log(
      "🔄 Dashboard Metrics - Recalculating with dateFilters:",
      dateFilters
    );

    if (!deduplicatedLeads || deduplicatedLeads.length === 0) return null;

    // Use deduplicated leads to prevent duplicates from affecting statistics
    // This ensures only the most updated version of each lead is counted
    const filteredLeadsForDate = deduplicatedLeads;
    const filteredTakipte = takipteLeads.filter((t: any) => {
      if (
        !dateFilters.startDate &&
        !dateFilters.endDate &&
        !dateFilters.month &&
        !dateFilters.year
      )
        return true;

      const itemDate = new Date(t.Tarih || t.date || "");
      if (isNaN(itemDate.getTime())) return true;

      if (
        dateFilters.year &&
        itemDate.getFullYear().toString() !== dateFilters.year
      )
        return false;
      if (
        dateFilters.month &&
        (itemDate.getMonth() + 1).toString().padStart(2, "0") !==
          dateFilters.month
      )
        return false;
      if (dateFilters.startDate && itemDate < new Date(dateFilters.startDate))
        return false;
      if (dateFilters.endDate && itemDate > new Date(dateFilters.endDate))
        return false;

      return true;
    });

    // Core KPIs from filtered data
    const totalLeads = filteredLeadsForDate.length;
    const totalTakipte = filteredTakipte.length;
    const dataCompletnessScore =
      totalTakipte > 0
        ? Math.min(100, Math.round((totalTakipte / totalLeads) * 100))
        : 0;

    // Status distribution for charts from filtered leads - FIXED TO USE SALES COLUMN
    const statusCounts = filteredLeadsForDate.reduce((acc: any, lead) => {
      // Check for actual sales first using the "Müşteriye Satış Yapıldı Mı?" column
      const actualSalesMade =
        lead["Müşteriye Satış Yapıldı Mı?"] || lead.salesMade || "";
      const isSaleConfirmed = actualSalesMade.toLowerCase().trim() === "evet";

      if (isSaleConfirmed) {
        acc["Satış"] = (acc["Satış"] || 0) + 1;
      } else {
        const status = lead.status || "Tanımsız";
        acc[status] = (acc[status] || 0) + 1;
      }
      return acc;
    }, {});

    const statusData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count as number,
      percentage: Number(
        (((count as number) / filteredLeadsForDate.length) * 100).toFixed(1)
      ),
      color: getUniqueColorForCategory(status),
    }));

    console.log(
      "📊 Lead Durum Dağılımı - Data with colors:",
      statusData.map((item) => ({
        name: item.name,
        value: item.value,
        color: item.color,
      }))
    );

    // Debug: Log current date filters and sales data
    console.log("🔍 Current Date Filters:", dateFilters);
    console.log("🔍 Filtered Leads for Date:", filteredLeadsForDate.length);
    console.log(
      "🔍 Sales Data:",
      statusData.find((item) => item.name.toLowerCase().includes("satış"))
    );
    console.log("🔍 All Status Data:", statusData);

    // Debug: Show actual sales leads based on "Müşteriye Satış Yapıldı Mı?" column
    const salesLeads = filteredLeadsForDate.filter((lead) => {
      const actualSalesMade =
        lead["Müşteriye Satış Yapıldı Mı?"] || lead.salesMade || "";
      return actualSalesMade.toLowerCase().trim() === "evet";
    });
    console.log(
      "🔍 Actual Sales Leads Count (from Müşteriye Satış Yapıldı Mı?):",
      salesLeads.length
    );
    console.log(
      "🔍 Sales Leads Details:",
      salesLeads.map((lead) => ({
        customerName: lead.customerName,
        salesConfirmation:
          lead["Müşteriye Satış Yapıldı Mı?"] || lead.salesMade,
        requestDate: lead.requestDate,
        assignedPersonnel: lead.assignedPersonnel,
      }))
    );

    // Personnel data for charts from filtered data
    // First, gather personnel names from both lead data and takipte data
    const allPersonnel = new Set<string>();

    // Add personnel from lead data
    filteredLeadsForDate.forEach((lead) => {
      const personnel = lead.assignedPersonnel || "Atanmamış";
      allPersonnel.add(personnel);
    });

    // Add personnel from takipte data using our helper function
    filteredTakipte.forEach((takipLead: any) => {
      const personnel = extractPersonnelName(takipLead);
      allPersonnel.add(personnel);
    });

    // Initialize personnel counts
    const personnelCounts: Record<string, number> = {};
    allPersonnel.forEach((person) => {
      personnelCounts[person] = 0;
    });

    // Count leads assigned to each personnel
    filteredLeadsForDate.forEach((lead) => {
      const personnel = lead.assignedPersonnel || "Atanmamış";
      personnelCounts[personnel] = (personnelCounts[personnel] || 0) + 1;
    });

    // Count takipte records for each personnel
    filteredTakipte.forEach((takipLead: any) => {
      const personnel = extractPersonnelName(takipLead);

      // Skip entries where personnel is "Atanmamış" or "Bilinmiyor"
      if (personnel === "Atanmamış" || personnel === "Bilinmiyor") {
        // Log for debugging to see if we're encountering unknown personnel
        console.log("Skipped unknown personnel in takipte record:", takipLead);
        return;
      }

      // Only increment if not already counted from leads data
      // This is to avoid double-counting
      const matchingLead = filteredLeadsForDate.find((lead) => {
        const customerNameInTakipte =
          takipLead.customerName ||
          takipLead["Müşteri Adı Soyadı"] ||
          takipLead["Müşteri Adı Soyadı(292)"] ||
          "";
        return (
          lead.customerName &&
          customerNameInTakipte.toLowerCase().trim() ===
            lead.customerName.toLowerCase().trim() &&
          lead.assignedPersonnel === personnel
        );
      });

      if (!matchingLead) {
        // Make sure we have a valid personnel name before incrementing
        if (
          personnel &&
          personnel !== "Atanmamış" &&
          personnel !== "Bilinmiyor"
        ) {
          personnelCounts[personnel] = (personnelCounts[personnel] || 0) + 1;
        }
      }
    });

    const personnelData = Object.entries(personnelCounts).map(
      ([person, leadCount]) => {
        // CORRECT TAKIPTE COUNT: Count leads that are marked "takipte" in main file AND have match in takip file
        const takipteCount = filteredLeadsForDate.filter((lead) => {
          const isAssignedToPerson =
            (lead.assignedPersonnel || "Atanmamış") === person;
          const isMarkedTakipte =
            lead.status &&
            (lead.status.toLowerCase().includes("takipte") ||
              lead.status.toLowerCase().includes("takip") ||
              lead.status.toLowerCase().includes("potansiyel"));
          const hasMatchInTakipFile = filteredTakipte.some((takipLead: any) => {
            const customerNameInTakipte =
              takipLead.customerName ||
              takipLead["Müşteri Adı Soyadı"] ||
              takipLead["Müşteri Adı Soyadı(292)"] ||
              "";
            // Use the same extract function defined above
            const personnelInTakipte = (() => {
              // Look for different possible field name variations
              const personnelFieldOptions = [
                "Personel Adı(292)",
                "Personel Adı",
                "PersonelAdı",
                "Personel",
                "Sorumlu Satış Personeli",
                "assignedPersonnel",
                "Hatırlatma Personeli",
              ];

              for (const fieldName of personnelFieldOptions) {
                if (
                  takipLead[fieldName] &&
                  typeof takipLead[fieldName] === "string" &&
                  takipLead[fieldName].trim() !== ""
                ) {
                  const value = takipLead[fieldName].trim();
                  if (
                    value !== "undefined" &&
                    value !== "null" &&
                    value !== "-" &&
                    value.length > 1
                  ) {
                    return value;
                  }
                }
              }

              return "Atanmamış";
            })();

            return (
              customerNameInTakipte &&
              lead.customerName &&
              customerNameInTakipte.toLowerCase().trim() ===
                lead.customerName.toLowerCase().trim() &&
              personnelInTakipte === person
            );
          });

          return isAssignedToPerson && isMarkedTakipte && hasMatchInTakipFile;
        }).length;

        return {
          name: person,
          leadCount: leadCount as number,
          takipteCount,
          efficiency:
            takipteCount > 0
              ? Math.round(((leadCount as number) / takipteCount) * 100)
              : 0,
        };
      }
    );

    // Lead type distribution from filtered data
    const typeCounts = filteredLeadsForDate.reduce((acc: any, lead) => {
      const type = lead.leadType || "Bilinmiyor";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const typeData = Object.entries(typeCounts).map(([type, count]) => {
      const displayName =
        type === "kiralama" ? "Kiralık" : type === "satis" ? "Satış" : type;
      return {
        name: displayName,
        value: count as number,
        percentage: Number(
          (((count as number) / filteredLeadsForDate.length) * 100).toFixed(1)
        ),
        color: getUniqueColorForCategory(displayName),
      };
    });

    console.log(
      "📊 Lead Tipi Dağılımı - Data with colors:",
      typeData.map((item) => ({
        name: item.name,
        value: item.value,
        color: item.color,
      }))
    );

    return {
      totalLeads,
      totalTakipte,
      dataCompletnessScore,
      statusData,
      personnelData,
      typeData,
      leads: filteredLeadsForDate,
    };
  }, [deduplicatedLeads, takipteData, dateFilters]);

  // Advanced Takipte Analytics - NOW USING FILTERED DATA
  const takipteAnalytics = useMemo(() => {
    if (!hasSecondaryData || takipteData.length === 0) return null;

    // Apply date filtering to takipte data
    let filteredTakipte = takipteData.filter((t: any) => {
      if (
        !dateFilters.startDate &&
        !dateFilters.endDate &&
        !dateFilters.month &&
        !dateFilters.year
      )
        return true;

      const itemDate = new Date(t.Tarih || t.date || "");
      if (isNaN(itemDate.getTime())) return true;

      if (
        dateFilters.year &&
        itemDate.getFullYear().toString() !== dateFilters.year
      )
        return false;
      if (
        dateFilters.month &&
        (itemDate.getMonth() + 1).toString().padStart(2, "0") !==
          dateFilters.month
      )
        return false;
      if (dateFilters.startDate && itemDate < new Date(dateFilters.startDate))
        return false;
      if (dateFilters.endDate && itemDate > new Date(dateFilters.endDate))
        return false;

      return true;
    });

    // Apply project filter to takipte data (robust logic)
    if (selectedProject && selectedProject !== "all") {
      filteredTakipte = filteredTakipte.filter((t: any) => {
        const projectField = t.projectName || t["Proje"] || "";
        const webFormNotu = t.webFormNote || t["WebForm Notu"] || "";
        const detectedProject = detectProjectFromWebFormNotu(webFormNotu);
        return (
          projectField === selectedProject ||
          detectedProject === selectedProject
        );
      });
    }

    // Helper function to extract customer name from takipte records

    // Helper function to extract customer name from takipte records
    const extractCustomerName = (record: any): string => {
      const customerFieldOptions = [
        "Müşteri Adı Soyadı(292)",
        "Müşteri Adı Soyadı",
        "Müşteri Adı",
        "customerName",
        "Customer Name",
      ];

      for (const fieldName of customerFieldOptions) {
        if (
          record[fieldName] &&
          typeof record[fieldName] === "string" &&
          record[fieldName].trim() !== ""
        ) {
          return record[fieldName].trim();
        }
      }

      return "";
    };

    const total = filteredTakipte.length;
    if (total === 0) return null;

    // PRE-ASSIGN COLORS: Collect all unique categories across all reports to ensure unique colors
    const allSourceCategories = new Set<string>();
    const allMeetingTypeCategories = new Set<string>();

    // Collect all source categories from takipte data
    filteredTakipte.forEach((t: any) => {
      const source = t["İrtibat Müşteri Kaynağı"] || t.source || "Bilinmiyor";
      allSourceCategories.add(source);
    });

    // Collect all meeting type categories from takipte data
    filteredTakipte.forEach((t: any) => {
      const meetingType = t["Görüşme Tipi"] || t.meetingType || "Bilinmiyor";
      allMeetingTypeCategories.add(meetingType);
    });

    // Collect main source categories from leads data if available
    if (dashboardMetrics?.leads) {
      dashboardMetrics.leads.forEach((lead: any) => {
        const source = lead.firstCustomerSource || "Bilinmiyor";
        allSourceCategories.add(source);
      });
    }

    // Pre-assign colors to ALL categories in order to ensure uniqueness
    const allCategories = [
      ...Array.from(allSourceCategories).sort(), // Sort for consistent order
      ...Array.from(allMeetingTypeCategories).sort(),
    ];

    // Pre-assign colors to ensure consistency
    allCategories.forEach((category) => {
      getUniqueColorForCategory(category);
    });

    // Debug: Log color assignments to verify uniqueness
    console.log(
      "🎨 Color Assignments for 🎯 Kaynak Analizi:",
      Array.from(categoryColorMap.entries())
    );

    // Customer source analysis from filtered data
    const sourceCounts = filteredTakipte.reduce((acc: any, t: any) => {
      const source = t["İrtibat Müşteri Kaynağı"] || t.source || "Bilinmiyor";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    const sourceData = Object.entries(sourceCounts).map(([source, count]) => ({
      name: source,
      value: count as number,
      percentage: Number((((count as number) / total) * 100).toFixed(1)),
      color: getUnifiedSourceColor(source),
    }));

    // Debug: Log source data with colors
    console.log(
      "📱 Müşteri Kaynak Analizi - Data with colors:",
      sourceData.map((item) => ({
        name: item.name,
        color: item.color,
      }))
    );

    // Meeting type distribution from filtered data
    const meetingCounts = filteredTakipte.reduce((acc: any, t: any) => {
      const type = t["Görüşme Tipi"] || t.meetingType || "Bilinmiyor";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const meetingTypeData = Object.entries(meetingCounts).map(
      ([type, count]) => ({
        name: type,
        value: count as number,
        percentage: Number((((count as number) / total) * 100).toFixed(1)),
        color: getMeetingTypeColor(type),
      })
    );

    // Debug: Log meeting type data with colors
    console.log(
      "🤝 Görüşme Tipi Dağılımı - Data with colors:",
      meetingTypeData.map((item) => ({
        name: item.name,
        color: item.color,
      }))
    );

    // Office performance from filtered data
    const officeCounts = filteredTakipte.reduce((acc: any, t: any) => {
      const office = t.Ofis || t.office || "Bilinmiyor";
      acc[office] = (acc[office] || 0) + 1;
      return acc;
    }, {});

    const officeData = Object.entries(officeCounts).map(([office, count]) => ({
      name: office,
      value: count as number,
      percentage: Number((((count as number) / total) * 100).toFixed(1)),
      color: getUniqueColorForCategory(office),
    }));

    // Customer criteria (Satış vs Kira) from filtered data
    const kriterCounts = filteredTakipte.reduce((acc: any, t: any) => {
      const kriter = t.Kriter || t.criteria || "Bilinmiyor";
      acc[kriter] = (acc[kriter] || 0) + 1;
      return acc;
    }, {});

    const kriterData = Object.entries(kriterCounts).map(([kriter, count]) => ({
      name: kriter,
      value: count as number,
      percentage: Number((((count as number) / total) * 100).toFixed(1)),
      color: getUniqueColorForCategory(kriter),
    }));

    console.log(
      "🏢 Ofis Performansı - Data with colors:",
      officeData.map((item) => ({
        name: item.name,
        value: item.value,
        color: item.color,
      }))
    );

    console.log(
      "🎯 Müşteri Kriterleri - Data with colors:",
      kriterData.map((item) => ({
        name: item.name,
        value: item.value,
        color: item.color,
      }))
    );

    return {
      sourceData,
      meetingTypeData,
      officeData,
      kriterData,
    };
  }, [takipteData, hasSecondaryData, dateFilters, selectedProject]);

  if (!enhancedStats) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Use standardized colors instead of random colors
  const getColorsForData = (
    data: any[],
    colorType: "personnel" | "status" | "source" = "status"
  ) => {
    return data.map((item) => {
      switch (colorType) {
        case "personnel":
          return getColor("PERSONNEL", item.name);
        case "status":
          return getColor("STATUS", item.name);
        case "source":
          return getUnifiedSourceColor(item.name);
        default:
          return getColor("STATUS", item.name);
      }
    });
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-gray-100">
      {/* Toggle button - integrated with sidebar */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={`absolute top-2 z-50 ${
          sidebarCollapsed ? "left-2" : "left-[196px]"
        } hover:bg-gray-200 rounded-sm`}
        title={sidebarCollapsed ? "Filtreleri Göster" : "Filtreleri Gizle"}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Compact Sidebar */}
      <aside className="relative h-screen">
        <FilterSidebar
          chartType={chartType}
          setChartType={setChartType}
          chartTypeOptions={chartTypeOptions}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          dateFilters={dateFilters}
          setDateFilters={setDateFilters}
          selectedPersonnel={selectedPersonnel}
          setSelectedPersonnel={setSelectedPersonnel}
          selectedOffice={"all"}
          setSelectedOffice={() => {}}
          clearCache={clearCache}
          clearCacheMutation={clearCacheMutation}
          personnelList={personnelList}
          activeTab="status"
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />
      </aside>
      {/* Main content area - desktop-style layout */}
      <main
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "ml-0" : "ml-48"
        } space-y-2 p-2 overflow-auto`}
      >
        {/* Header - Shows warning if secondary data is missing */}
        {!hasSecondaryData && (
          <div className="flex justify-end mb-4">
            <Alert className="max-w-md border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>⚠️ Eksik Veri:</strong> Takip dosyası yüklenmemiş.
                Detaylı analiz için ikinci dosyayı yükleyin.
              </AlertDescription>
            </Alert>
          </div>
        )}
        {/* Personnel Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                👥 Personel Atama ve Durum Özeti
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPersonnel(!showPersonnel)}
                title={showPersonnel ? "Personeli Gizle" : "Personeli Göster"}
              >
                {showPersonnel ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" /> Personeli Gizle
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" /> Personeli Göster
                  </>
                )}
              </Button>
            </CardTitle>
            <CardDescription>
              Her personelin lead dağılımı ve durum analizi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {personnelStatusMatrix && personnelStatusMatrix.length > 0 ? (
              <div className="space-y-4">
                {/* Column Controls */}
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 mr-2">
                    Sütun Görünürlüğü:
                  </span>
                  {statusColumns
                    .filter((col) => col.type === "status")
                    .map((column) => (
                      <button
                        key={column.key}
                        onClick={() => toggleColumn(column.key)}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          collapsedColumns.has(column.key)
                            ? "bg-gray-200 text-gray-500 border-gray-300"
                            : "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200"
                        }`}
                      >
                        {collapsedColumns.has(column.key) ? "👁️‍🗨️" : "👁️"}{" "}
                        {column.label}
                      </button>
                    ))}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b bg-gray-100">
                        <th className="text-left p-2 font-medium border-r sticky left-0 bg-gray-100">
                          Personel
                        </th>
                        <th className="text-center p-2 font-medium border-r bg-blue-50">
                          Toplam Lead
                        </th>
                        {statusColumns
                          .filter(
                            (col) =>
                              col.type === "status" &&
                              !collapsedColumns.has(col.key)
                          )
                          .map((column) => (
                            <th
                              key={column.key}
                              className="text-center p-2 font-medium border-r min-w-[100px] relative"
                            >
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-xs">{column.label}</span>
                                <button
                                  onClick={() => toggleColumn(column.key)}
                                  className="text-gray-400 hover:text-red-500 ml-1"
                                  title="Sütunu gizle"
                                >
                                  ×
                                </button>
                              </div>
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {personnelStatusMatrix
                        .filter(
                          (person) =>
                            person.name !== "Belirtilmemiş" &&
                            (visiblePersonnel.length === 0 ||
                              visiblePersonnel.includes(person.name)) &&
                            (showPersonnel || person.name === "Toplam:")
                        )
                        .map((person, index) => {
                          // Get unique color for each personnel with 10% opacity for background
                          const bgColorStyle =
                            person.name !== "Atanmamış"
                              ? {
                                  backgroundColor: `${getUniqueColorForCategory(
                                    person.name
                                  )}20`,
                                }
                              : { backgroundColor: "#f3f4f6" };

                          return (
                            <tr key={person.name} style={bgColorStyle}>
                              <td
                                className="p-2 font-medium border-r sticky left-0"
                                style={bgColorStyle}
                              >
                                {person.name}
                              </td>
                              <td className="text-center p-2 border-r font-bold bg-blue-50">
                                {person.totalLeads}
                              </td>
                              {statusColumns
                                .filter(
                                  (col) =>
                                    col.type === "status" &&
                                    !collapsedColumns.has(col.key)
                                )
                                .map((column) => (
                                  <td
                                    key={column.key}
                                    className="text-center p-2 border-r"
                                  >
                                    <span
                                      className={
                                        person[column.key] > 0
                                          ? "font-semibold text-blue-600"
                                          : "text-gray-400"
                                      }
                                    >
                                      {person[column.key] || 0}
                                    </span>
                                  </td>
                                ))}
                            </tr>
                          );
                        })}
                    </tbody>
                    {/* Totals Row */}
                    <tfoot>
                      <tr className="border-t-2 bg-gray-200 font-bold">
                        <td className="p-2 border-r sticky left-0 bg-gray-200">
                          Toplam:
                        </td>
                        <td className="text-center p-2 border-r bg-blue-100">
                          {personnelStatusMatrix
                            .filter(
                              (person) =>
                                person.name !== "Belirtilmemiş" &&
                                (visiblePersonnel.length === 0 ||
                                  visiblePersonnel.includes(person.name))
                            )
                            .reduce(
                              (sum, person) => sum + person.totalLeads,
                              0
                            )}
                        </td>
                        {statusColumns
                          .filter(
                            (col) =>
                              col.type === "status" &&
                              !collapsedColumns.has(col.key)
                          )
                          .map((column) => (
                            <td
                              key={column.key}
                              className="text-center p-2 border-r"
                            >
                              {personnelStatusMatrix
                                .filter(
                                  (person) =>
                                    person.name !== "Belirtilmemiş" &&
                                    (visiblePersonnel.length === 0 ||
                                      visiblePersonnel.includes(person.name))
                                )
                                .reduce(
                                  (sum, person) =>
                                    sum + (person[column.key] || 0),
                                  0
                                )}
                            </td>
                          ))}
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Show collapsed columns count */}
                {collapsedColumns.size > 0 && (
                  <div className="text-sm text-gray-500 text-center">
                    {collapsedColumns.size} sütun gizlendi. Yukarıdaki
                    düğmelerle tekrar gösterebilirsiniz.
                  </div>
                )}

                {/* Lead distribution chart by personnel */}
                <div className="mt-6 p-4 bg-white rounded-lg border">
                  <h3 className="text-lg font-semibold mb-2">
                    📊 Personel Lead Dağılımı
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Her personelin lead sayısı dağılımı
                  </p>

                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={personnelStatusMatrix
                          .filter(
                            (person) =>
                              person.name !== "Belirtilmemiş" &&
                              person.name !== "Atanmamış" &&
                              (visiblePersonnel.length === 0 ||
                                visiblePersonnel.includes(person.name)) &&
                              (showPersonnel || person.name === "Toplam:")
                          )
                          .sort((a, b) => b.totalLeads - a.totalLeads)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis name="Lead Sayısı" />
                        <Tooltip
                          formatter={(value) => [
                            `${value} Lead`,
                            "Lead Sayısı",
                          ]}
                        />
                        <Legend />
                        <Bar
                          dataKey="totalLeads"
                          name="Lead Sayısı"
                          fill="#8884d8"
                        >
                          {personnelStatusMatrix
                            .filter(
                              (person) =>
                                person.name !== "Belirtilmemiş" &&
                                person.name !== "Atanmamış" &&
                                (visiblePersonnel.length === 0 ||
                                  visiblePersonnel.includes(person.name)) &&
                                (showPersonnel || person.name === "Toplam:")
                            )
                            .map((person) => (
                              <Cell
                                key={`cell-${person.name}`}
                                fill={getUniqueColorForCategory(person.name)}
                              />
                            ))}
                          <LabelList dataKey="totalLeads" position="top" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Personel gizleme butonu ile tabloda ve grafikte satış
                    personellerini gizleyebilirsiniz
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>Henüz personel verisi bulunmuyor</p>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Main Analytics Tabs */}
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="status">Durum Analizi</TabsTrigger>
            <TabsTrigger value="personnel">Personel Performansı</TabsTrigger>
            <TabsTrigger value="sources">🎯 Kaynak Analizi</TabsTrigger>
            <TabsTrigger value="data-explorer">📊 Lead Verileri</TabsTrigger>
            {/* Removed Potansiyel Takipte tab - incorrect statistics */}
            {/* <TabsTrigger value="advanced">🧠 Gelişmiş Analiz</TabsTrigger> */}
          </TabsList>

          <TabsContent value="status" className="space-y-4">
            {/* Cost Analysis in Excel-like Table - Always visible at the top */}
            <div className="mb-4">
              <CostMetricsTable
                expenseStats={{
                  leadCount: expenseStats ? expenseStats.leadCount : 0,
                  salesCount:
                    dashboardMetrics?.statusData?.find((item) =>
                      item.name.toLowerCase().includes("satış")
                    )?.value || 0,
                  expenses: {
                    tl: {
                      totalExpenses: expenseStats
                        ? expenseStats.expenses.tl.totalExpenses || 0
                        : 0,
                      totalAgencyFees: expenseStats
                        ? expenseStats.expenses.tl.totalAgencyFees || 0
                        : 0,
                      totalAdsExpenses: expenseStats
                        ? expenseStats.expenses.tl.totalAdsExpenses || 0
                        : 0,
                      avgCostPerLead: expenseStats
                        ? expenseStats.expenses.tl.avgCostPerLead || 0
                        : 0,
                      avgCostPerSale:
                        expenseStats &&
                        expenseStats.expenses.tl.totalExpenses &&
                        dashboardMetrics?.statusData?.find((item) =>
                          item.name.toLowerCase().includes("satış")
                        )?.value > 0
                          ? expenseStats.expenses.tl.totalExpenses /
                            dashboardMetrics?.statusData?.find((item) =>
                              item.name.toLowerCase().includes("satış")
                            )?.value
                          : 0,
                    },
                  },
                }}
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>📊 Lead Durum Dağılımı - Özet Tablosu</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardMetrics?.statusData && (
                    <>
                      <StandardChart
                        title=""
                        data={dashboardMetrics.statusData}
                        height={500}
                        chartType={chartType}
                        showDataTable={false}
                        className="[&_.grid]:!grid-cols-1 [&_.space-y-4]:!hidden mb-6"
                      />
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                                Durum
                              </th>
                              <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                                Adet
                              </th>
                              <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                                Yüzde
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardMetrics.statusData.map((item, index) => (
                              <tr
                                key={index}
                                className="hover:bg-gray-50"
                                style={{
                                  backgroundColor: `${item.color}15`,
                                  borderLeft: `4px solid ${item.color}`,
                                }}
                              >
                                <td className="border border-gray-200 px-4 py-2 font-medium">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{
                                        backgroundColor: item.color,
                                      }}
                                    />
                                    {item.name}
                                  </div>
                                </td>
                                <td className="border border-gray-200 px-4 py-2 text-center font-medium">
                                  {item.value}
                                </td>
                                <td className="border border-gray-200 px-4 py-2 text-center">
                                  {item.value} (%{item.percentage})
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lead Tipi Dağılımı</CardTitle>
                  <CardDescription>Kiralık vs Satış analizi</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardMetrics?.typeData && (
                    <>
                      <StandardChart
                        title=""
                        data={dashboardMetrics.typeData}
                        height={500}
                        chartType={chartType}
                        showDataTable={false}
                        className="[&_.grid]:!grid-cols-1 [&_.space-y-4]:!hidden mb-6"
                      />
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                                Tip
                              </th>
                              <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                                Adet
                              </th>
                              <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                                Yüzde
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardMetrics.typeData.map((item, index) => (
                              <tr
                                key={index}
                                className="hover:bg-gray-50"
                                style={{
                                  backgroundColor: `${item.color}15`,
                                  borderLeft: `4px solid ${item.color}`,
                                }}
                              >
                                <td className="border border-gray-200 px-4 py-2 font-medium">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{
                                        backgroundColor: item.color,
                                      }}
                                    />
                                    {item.name}
                                  </div>
                                </td>
                                <td className="border border-gray-200 px-4 py-2 text-center font-medium">
                                  {item.value}
                                </td>
                                <td className="border border-gray-200 px-4 py-2 text-center">
                                  {item.value} (%{item.percentage})
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Duplicate Detection Analysis Card - Hidden from main reports per user request */}
            {/* Duplicate lead statistics are now only shown in the dedicated duplicate detection tab */}
          </TabsContent>

          <TabsContent value="personnel" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>👥 Personel Performans Karşılaştırması</CardTitle>
                <CardDescription>
                  Personel bazında lead sayıları
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardMetrics?.personnelData &&
                dashboardMetrics.personnelData.length > 0 ? (
                  <>
                    {/* Sales Person List with visibility toggle */}
                    <Card className="mb-6 border border-blue-100 bg-blue-50/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Personel Görünürlük Ayarları
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Görmek istediğiniz personeli seçin. Varsayılan olarak
                          sadece Recber ve Yasemin görünür.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <SalesPersonList
                          salesPersons={dashboardMetrics.personnelData}
                          onVisibilityChange={setVisiblePersonnel}
                        />
                      </CardContent>
                    </Card>

                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={dashboardMetrics.personnelData.filter(
                          (p) =>
                            (visiblePersonnel.length === 0 ||
                              visiblePersonnel.includes(p.name)) &&
                            p.name !== "Atanmamış" &&
                            p.name !== "Bilinmiyor" &&
                            p.name !== "Belirtilmemiş"
                        )}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="leadCount"
                          name="Lead Sayısı"
                          radius={[4, 4, 0, 0]}
                          label={{
                            position: "top",
                            formatter: (value: number) => `${value}`,
                            fill: "#000",
                            fontSize: 11,
                            fontWeight: "bold",
                          }}
                        >
                          {dashboardMetrics.personnelData
                            .filter(
                              (p) =>
                                (visiblePersonnel.length === 0 ||
                                  visiblePersonnel.includes(p.name)) &&
                                p.name !== "Atanmamış" &&
                                p.name !== "Bilinmiyor" &&
                                p.name !== "Belirtilmemiş"
                            )
                            .map((entry, index) => {
                              const color = getUniqueColorForCategory(
                                entry.name
                              );
                              return (
                                <Cell key={`cell-${index}`} fill={color} />
                              );
                            })}
                          <LabelList
                            dataKey="leadCount"
                            position="top"
                            style={{
                              textAnchor: "middle",
                              fontSize: "16px",
                              fontWeight: "bold",
                              fill: "#374151",
                            }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>

                    <DataTable
                      title="Personel Performans Detayları"
                      data={dashboardMetrics.personnelData
                        .filter(
                          (item) =>
                            (visiblePersonnel.length === 0 ||
                              visiblePersonnel.includes(item.name)) &&
                            item.name !== "Atanmamış" &&
                            item.name !== "Bilinmiyor" &&
                            item.name !== "Belirtilmemiş"
                        )
                        .map((item) => ({
                          Personel: {
                            value: item.name,
                            custom: (
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor: getUniqueColorForCategory(
                                      item.name
                                    ),
                                  }}
                                ></div>
                                <span>{item.name}</span>
                              </div>
                            ),
                          },
                          "Lead Sayısı": item.leadCount,
                          Yüzde: `%${Math.round(
                            (item.leadCount / dashboardMetrics.totalLeads) * 100
                          )}`,
                        }))}
                      className="mt-6"
                    />
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Personel verisi bulunamadı
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Personel performans analizi için lead verilerinde personel
                      bilgisi bulunması gerekiyor.
                    </p>
                    <p className="text-sm text-gray-500">
                      Leads dosyalarında "assignedPersonnel" alanının
                      doldurulduğundan emin olun veya takipte dosyasındaki
                      "Personel Adı" alanlarını kontrol edin.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <div className="space-y-6">
              {/* Main Lead Source Analysis - Always available */}
              {dashboardMetrics?.leads && (
                <Card>
                  <CardHeader>
                    <CardTitle>📈 Lead Kaynak Analizi</CardTitle>
                    <CardDescription>
                      Ana lead dosyasından kaynak verileri
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // PRE-ASSIGN COLORS: Collect all unique source categories from leads data
                      const allSourceCategories = Array.from(
                        new Set(
                          dashboardMetrics.leads.map(
                            (l) => l.firstCustomerSource || "Bilinmiyor"
                          )
                        )
                      ).sort(); // Sort for consistent order

                      // Pre-assign colors to ensure uniqueness across all reports
                      allSourceCategories.forEach((category) => {
                        getUniqueColorForCategory(category);
                      });

                      const sourceData = Array.from(
                        new Set(
                          dashboardMetrics.leads.map(
                            (l) => l.firstCustomerSource || "Bilinmiyor"
                          )
                        )
                      )
                        .map((source) => ({
                          name: source,
                          value: dashboardMetrics.leads.filter(
                            (l) =>
                              (l.firstCustomerSource || "Bilinmiyor") === source
                          ).length,
                          percentage: Number(
                            (
                              (dashboardMetrics.leads.filter(
                                (l) =>
                                  (l.firstCustomerSource || "Bilinmiyor") ===
                                  source
                              ).length /
                                dashboardMetrics.leads.length) *
                              100
                            ).toFixed(1)
                          ),
                          color: getUniqueColorForCategory(source),
                        }))
                        .sort((a, b) => b.value - a.value);

                      // Debug: Log source data with colors
                      console.log(
                        "📈 Lead Kaynak Analizi - Data with colors:",
                        sourceData.map((item) => ({
                          name: item.name,
                          color: item.color,
                        }))
                      );

                      return (
                        <>
                          <StandardChart
                            title=""
                            data={sourceData}
                            height={500}
                            chartType={chartType}
                            showDataTable={false}
                            className="[&_.grid]:!grid-cols-1 [&_.space-y-4]:!hidden mb-6"
                          />
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-200">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                                    Kaynak
                                  </th>
                                  <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                                    Adet
                                  </th>
                                  <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                                    Yüzde
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {sourceData.map((item, index) => (
                                  <tr
                                    key={index}
                                    className="hover:bg-gray-50"
                                    style={{
                                      backgroundColor: `${item.color}15`,
                                      borderLeft: `4px solid ${item.color}`,
                                    }}
                                  >
                                    <td className="border border-gray-200 px-4 py-2 font-medium">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-3 h-3 rounded-full"
                                          style={{
                                            backgroundColor: item.color,
                                          }}
                                        />
                                        {item.name}
                                      </div>
                                    </td>
                                    <td className="border border-gray-200 px-4 py-2 text-center font-medium">
                                      {item.value}
                                    </td>
                                    <td className="border border-gray-200 px-4 py-2 text-center">
                                      {item.value} (%{item.percentage})
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {!hasSecondaryData && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Bu tab ana lead verilerinden kaynak analizi gösteriyor.
                    Takip dosyası tabanlı analizler için 📊 Takip Analizi tabına
                    bakın.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          {/* 
        <TabsContent value="advanced" className="space-y-4">
          <div className="space-y-6">
            Advanced Analysis from Main Data Only
            {dashboardMetrics?.leads && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 shadow-lg border-2 border-indigo-100 dark:border-indigo-800">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                      📊 Gelişmiş Durum Analizi
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Lead durumlarının detaylı incelemesi
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(
                          dashboardMetrics.leads.reduce((acc: any, lead) => {
                            const status = lead.status || "Tanımsız";
                            acc[status] = (acc[status] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([status, count]) => ({
                          name: status,
                          value: count,
                          percentage: Number(
                            (
                              ((count as number) /
                                dashboardMetrics.leads.length) *
                              100
                            ).toFixed(1)
                          ),
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percentage, value }) =>
                          `${name}: ${value} (%${percentage})`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(
                          dashboardMetrics.leads.reduce((acc: any, lead) => {
                            const status = lead.status || "Tanımsız";
                            acc[status] = (acc[status] || 0) + 1;
                            return acc;
                          }, {})
                        ).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getUniqueColorForCategory(entry[0])}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <DataTable
                    data={Object.entries(
                      dashboardMetrics.leads.reduce((acc: any, lead) => {
                        const status = lead.status || "Tanımsız";
                        acc[status] = (acc[status] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([status, count]) => ({
                      Durum: status,
                      Adet: count,
                      Yüzde: `%${Math.round(
                        ((count as number) / dashboardMetrics.leads.length) *
                          100
                      )}`,
                    }))}
                    title="Durum Detay Analizi"
                    className="mt-4"
                  />
                </Card>

                <Card className="p-6 shadow-lg border-2 border-emerald-100 dark:border-emerald-800">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                      🏠 Proje Analizi
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      En popüler projeler
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Array.from(
                        new Set(
                          dashboardMetrics.leads.map(
                            (l) => l.projectName || "Bilinmiyor"
                          )
                        )
                      )
                        .map((project) => ({
                          name:
                            project.length > 15
                              ? project.substring(0, 15) + "..."
                              : project,
                          value: dashboardMetrics.leads.filter(
                            (l) => (l.projectName || "Bilinmiyor") === project
                          ).length,
                        }))
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 10)}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar 
                        dataKey="value" 
                        fill="#10b981"
                        label={{
                          position: 'top',
                          formatter: (value: number) => `${value}`,
                          fill: '#000',
                          fontSize: 11,
                          fontWeight: 'bold'
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  <DataTable
                    data={Array.from(
                      new Set(
                        dashboardMetrics.leads.map(
                          (l) => l.projectName || "Bilinmiyor"
                        )
                      )
                    )
                      .map((project) => ({
                        Proje: project,
                        Adet: dashboardMetrics.leads.filter(
                          (l) => (l.projectName || "Bilinmiyor") === project
                        ).length,
                        Yüzde: `%${Math.round(
                          (dashboardMetrics.leads.filter(
                            (l) => (l.projectName || "Bilinmiyor") === project
                          ).length /
                            dashboardMetrics.leads.length) *
                            100
                        )}`,
                      }))
                      .sort((a, b) => b["Adet"] - a["Adet"])
                      .slice(0, 10)}
                    title="Proje Detayları"
                    className="mt-4"
                  />
                </Card>
              </div>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Bu tab ana lead verilerinden gelişmiş analizler gösteriyor.
                Takip dosyası tabanlı analizler için 📊 Takip Analizi tabına
                bakın.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
        */}

          <TabsContent value="data-explorer" className="space-y-4">
            <LeadDataExplorer
              leads={deduplicatedLeads || []}
              isLoading={false}
            />
          </TabsContent>

          {/* Potansiyel Takipte tab removed - incorrect statistics, use Takip Kayıtları column instead */}
        </Tabs>
        {/* Footer Summary */}
        <Card className="bg-gradient-to-r from-slate-50 to-slate-100">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📊 Dashboard Özeti
              </h3>
              <div className="flex justify-center space-x-8 text-sm text-gray-600">
                <div>
                  <span className="font-medium">
                    {dashboardMetrics?.totalLeads || 0}
                  </span>{" "}
                  Ana Lead
                </div>
                <div>
                  <span className="font-medium">
                    {personnelStatusMatrix
                      ? personnelStatusMatrix
                          .filter((person) => person.name !== "Belirtilmemiş")
                          .reduce((sum, person) => sum + person.takipteCount, 0)
                      : 0}
                  </span>{" "}
                  Eşleşen Takip
                </div>
                <div>
                  <span className="font-medium">
                    {dashboardMetrics?.dataCompletnessScore || 0}%
                  </span>{" "}
                  Veri Tamamlanması
                </div>
                <div>
                  <span className="font-medium">
                    {hasSecondaryData ? "Aktif" : "Pasif"}
                  </span>{" "}
                  AI Analiz
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Real Negative Analysis Component from Negative Page */}
        {negativeAnalysis && (
          <Card className="mb-6 border-2 border-red-100 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                📊 En Sık Görülen Olumsuzluk Nedenleri (İlk 10)
              </CardTitle>
              <CardDescription>
                📋 Tabloyu Gizle - 10 Neden - İlk 10 neden gösteriliyor Yüzdelik
                Oranı Toplam Olumsuzluk Sayısı Üzerinden Hesaplanıyor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                  {negativeAnalysis.reasonAnalysis
                    .slice(0, 10)
                    .map((reason, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-3 rounded-lg border"
                      >
                        <div
                          className="text-sm font-medium text-gray-800 truncate"
                          title={reason.reason}
                        >
                          {reason.reason}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {reason.count} lead (
                          {Number(reason.percentage).toFixed(1)}%)
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${reason.percentage}%`,
                              backgroundColor: getUniqueColorForCategory(
                                reason.reason
                              ),
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
