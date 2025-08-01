import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "recharts";
import { useFilters } from "@/contexts/filter-context";
import {
  Phone,
  Clock,
  Users,
  Target,
  FileText,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Building,
  Activity,
  Filter,
  X,
  CheckCircle,
  PhoneCall,
  MessageSquare,
  UserCheck,
} from "lucide-react";
import { MasterDataTable } from "@/components/ui/master-data-table";
import { DataTable } from "@/components/ui/data-table";
import ProjectFilter from "./project-filter";
import {
  getStandardColor,
  getPersonnelColor,
  getStatusColor,
} from "@/lib/color-system";
import { Settings, RefreshCw, Trash2 } from "lucide-react";

// Interface for Takipte Response Data based on real structure
interface TakipteData {
  "Müşteri Adı Soyadı(285)"?: string;
  "Müşteri Adı Soyadı(203)"?: string;
  Tarih: string;
  "Personel Adı(285)"?: string;
  "Personel Adı(203)"?: string;
  Ofis: string;
  Notlar: string;
  "Müşteri Haberleşme Tipi": string;
  "Görüşme Tipi": string;
  Saat: string;
  "Hatırlatma Var Mı": string;
  "Hatırlatma Tarihi": string;
  "Hatırlatma Personeli": string;
  "Hatırlatma Son Mu ?": string;
  "Konuşma Süresi": string;
  "Meslek Adı": string;
  "Acenta Adı": string;
  "Son Sonuç Adı": string;
  Puan: string;
  "Randevu Var Mı ?": string;
  "Randevu Tarihi": string;
  "Sorumlu Satış Personeli": string;
  "Randevu Ofisi": string;
  "Ofis Bazında İlk Geliş": string;
  "İletişim Aktif Mi ?": string;
  "İrtibat Müşteri Kaynağı": string;
  "İrtibat Müşteri Kaynak Grubu": string;
  "İletişim Müşteri Kaynağı": string;
  "İletişim Müşteri Kaynak Grubu": string;
  "Cep Tel": string;
  "İş Tel": string;
  "Ev Tel": string;
  Email: string;
  Kriter: string;
  AktifMi: string;
}

// Helper function to get customer name from different column variations
const getCustomerName = (item: TakipteData): string => {
  return (
    item["Müşteri Adı Soyadı(285)"] ||
    item["Müşteri Adı Soyadı(203)"] ||
    "Belirtilmemiş"
  );
};

// Helper function to get personnel name from different column variations
const getPersonnelName = (item: TakipteData): string => {
  // Look for different possible field name variations
  const personnelFieldOptions = [
    "Personel Adı(292)",
    "Personel Adı(285)",
    "Personel Adı(203)",
    "Personel Adı",
    "PersonelAdı",
    "Personel",
    "Sorumlu Satış Personeli",
    "Satış Personeli",
    "Sales Person",
    "Sorumlu Personel",
    "Atanan Personel",
    "Görevli Personel",
    "Görevli",
    "Sorumlu",
    "assignedPersonnel",
    "Hatırlatma Personeli",
  ];

  // First pass: Look for exact matches in the standard fields
  for (const fieldName of personnelFieldOptions) {
    const fieldValue = item[fieldName as keyof TakipteData];
    if (fieldValue && typeof fieldValue === "string") {
      const trimmedValue = fieldValue.trim();
      if (trimmedValue !== "") {
        // Don't return empty values or "undefined"/"null" strings
        if (
          trimmedValue !== "undefined" &&
          trimmedValue !== "null" &&
          trimmedValue !== "-" &&
          trimmedValue.length > 1
        ) {
          return trimmedValue;
        }
      }
    }
  }

  // Second pass: Look for any field containing "Personel" in the key
  const keys = Object.keys(item);
  for (const key of keys) {
    const fieldValue = item[key as keyof TakipteData];
    if (
      (key.includes("Personel") || key.includes("Personnel")) &&
      fieldValue &&
      typeof fieldValue === "string"
    ) {
      const trimmedValue = fieldValue.trim();
      if (
        trimmedValue !== "" &&
        trimmedValue !== "undefined" &&
        trimmedValue !== "null" &&
        trimmedValue !== "-" &&
        trimmedValue.length > 1
      ) {
        return trimmedValue;
      }
    }
  }

  return "Belirtilmemiş";
};

export default function RefactoredTakipAnaliziTab() {
  // Global color palette for unified theming across all reports
  const globalColorPalette = [
    "#3b82f6", // Blue
    "#10b981", // Green
    "#f59e0b", // Amber
    "#8b5cf6", // Purple
    "#ef4444", // Red
    "#06b6d4", // Cyan
    "#ec4899", // Pink
    "#84cc16", // Lime
    "#f97316", // Orange
    "#6366f1", // Indigo
    "#14b8a6", // Teal
    "#a855f7", // Violet
    "#eab308", // Yellow
    "#22c55e", // Green-alt
    "#f43f5e", // Rose
    "#8b5cf6", // Purple-alt
    "#0ea5e9", // Sky
    "#64748b", // Slate
    "#78716c", // Stone
    "#dc2626", // Red-alt
    "#059669", // Emerald
    "#d97706", // Amber-alt
    "#7c3aed", // Violet-deep
    "#dc2626", // Red-deep
    "#16a34a", // Green-deep
    "#ca8a04", // Yellow-deep
    "#9333ea", // Purple-deep
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

  const [selectedPersonnel, setSelectedPersonnel] = useState<string>("all");
  const [selectedOffice, setSelectedOffice] = useState<string>("all");
  const [selectedResult, setSelectedResult] = useState<string>("all");
  const [selectedCommunicationType, setSelectedCommunicationType] =
    useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<string>(""); // Added project filter
  const [viewMode, setViewMode] = useState<"summary" | "detailed">("summary");
  
  // Get chart type from global filter context
  const { filters } = useFilters();
  const chartType = filters.chartType;

  // Fetch takipte data
  const { data: takipteData = [], isLoading } = useQuery<TakipteData[]>({
    queryKey: ["/api/takipte"],
    queryFn: async () => {
      const response = await fetch(`/api/takipte`);
      return response.json();
    },
    refetchInterval: 5000,
  });

  // Filter data based on selections
  const filteredData = useMemo(() => {
    return takipteData.filter((item: TakipteData) => {
      const matchesPersonnel =
        selectedPersonnel === "all" ||
        getPersonnelName(item) === selectedPersonnel;

      const matchesOffice =
        selectedOffice === "all" || item["Ofis"] === selectedOffice;

      const matchesResult =
        selectedResult === "all" || item["Son Sonuç Adı"] === selectedResult;

      const matchesCommunicationType =
        selectedCommunicationType === "all" ||
        item["Müşteri Haberleşme Tipi"] === selectedCommunicationType;

      return (
        matchesPersonnel &&
        matchesOffice &&
        matchesResult &&
        matchesCommunicationType
      );
    });
  }, [
    takipteData,
    selectedPersonnel,
    selectedOffice,
    selectedResult,
    selectedCommunicationType,
  ]);

  // Get unique values for filtering
  const uniquePersonnel = useMemo(() => {
    const personnel = takipteData
      .map((item) => getPersonnelName(item))
      .filter(Boolean);
    return Array.from(new Set(personnel)) as string[];
  }, [takipteData]);

  const uniqueOffices = useMemo(() => {
    const offices = takipteData.map((item) => item["Ofis"]).filter(Boolean);
    return Array.from(new Set(offices)) as string[];
  }, [takipteData]);

  const uniqueResults = useMemo(() => {
    const results = takipteData
      .map((item) => item["Son Sonuç Adı"])
      .filter(Boolean);
    return Array.from(new Set(results)) as string[];
  }, [takipteData]);

  const uniqueCommunicationTypes = useMemo(() => {
    const types = takipteData
      .map((item) => item["Müşteri Haberleşme Tipi"])
      .filter(Boolean);
    return Array.from(new Set(types)) as string[];
  }, [takipteData]);

  // Analytics calculations
  const analytics = useMemo(() => {
    if (!filteredData.length) return null;

    const total = filteredData.length;

    // Personnel analysis
    const personnelCounts = filteredData.reduce((acc, item) => {
      const personnel = getPersonnelName(item);
      acc[personnel] = (acc[personnel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const personnelData = Object.entries(personnelCounts)
      .map(([personnel, count]) => ({
        name: personnel,
        value: count as number,
        percentage: Math.round(((count as number) / total) * 100),
      }))
      .sort((a, b) => b.value - a.value);

    // PRE-ASSIGN COLORS: Ensure all personnel get unique colors
    personnelData.forEach((item) => {
      getUniqueColorForCategory(item.name);
    });

    // Office analysis
    const officeCounts = filteredData.reduce((acc, item) => {
      const office = item["Ofis"] || "Belirtilmemiş";
      acc[office] = (acc[office] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const officeData = Object.entries(officeCounts)
      .map(([office, count]) => ({
        name: office,
        value: count as number,
        percentage: Math.round(((count as number) / total) * 100),
      }))
      .sort((a, b) => b.value - a.value);

    // PRE-ASSIGN COLORS: Ensure all offices get unique colors
    officeData.forEach((item) => {
      getUniqueColorForCategory(item.name);
    });

    // Result analysis
    const resultCounts = filteredData.reduce((acc, item) => {
      const result = item["Son Sonuç Adı"] || "Belirtilmemiş";
      acc[result] = (acc[result] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const resultData = Object.entries(resultCounts)
      .map(([result, count]) => ({
        name: result,
        value: count as number,
        percentage: Math.round(((count as number) / total) * 100),
      }))
      .sort((a, b) => b.value - a.value);

    // Communication type analysis
    const communicationCounts = filteredData.reduce((acc, item) => {
      const type = item["Müşteri Haberleşme Tipi"] || "Belirtilmemiş";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const communicationData = Object.entries(communicationCounts)
      .map(([type, count]) => ({
        name: type,
        value: count as number,
        percentage: Math.round(((count as number) / total) * 100),
      }))
      .sort((a, b) => b.value - a.value);

    // PRE-ASSIGN COLORS: Ensure all communication types get unique colors
    communicationData.forEach((item) => {
      getUniqueColorForCategory(item.name);
    });

    // Customer source analysis
    const sourceCounts = filteredData.reduce((acc, item) => {
      const source =
        item["İletişim Müşteri Kaynağı"] ||
        item["İrtibat Müşteri Kaynağı"] ||
        "Belirtilmemiş";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sourceData = Object.entries(sourceCounts)
      .map(([source, count]) => ({
        name: source,
        value: count as number,
        percentage: Math.round(((count as number) / total) * 100),
      }))
      .sort((a, b) => b.value - a.value);

    // PRE-ASSIGN COLORS: Ensure all sources get unique colors
    sourceData.forEach((item) => {
      getUniqueColorForCategory(item.name);
    });

    // Reminder analysis - More robust checking
    const reminderCount = filteredData.filter((item) => {
      const reminder = item["Hatırlatma Var Mı"];
      return (
        reminder &&
        (reminder.toLowerCase() === "true" ||
          reminder.toLowerCase() === "evet" ||
          reminder.toLowerCase() === "var" ||
          reminder === "1")
      );
    }).length;

    const appointmentCount = filteredData.filter((item) => {
      const appointment = item["Randevu Var Mı ?"];
      return (
        appointment &&
        (appointment.toLowerCase() === "true" ||
          appointment.toLowerCase() === "evet" ||
          appointment.toLowerCase() === "var" ||
          appointment === "1")
      );
    }).length;

    // Score analysis
    const scores = filteredData
      .map((item) => parseInt(item["Puan"]) || 0)
      .filter((score) => score > 0);

    const averageScore =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum, score) => sum + score, 0) / scores.length
          )
        : 0;

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = filteredData.filter((item) => {
      if (!item["Tarih"]) return false;
      const itemDate = new Date(item["Tarih"]);
      return itemDate >= sevenDaysAgo;
    }).length;

    return {
      total,
      personnelData,
      officeData,
      resultData,
      communicationData,
      sourceData,
      reminderCount,
      appointmentCount,
      averageScore,
      recentActivity,
    };
  }, [filteredData]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">
              Takip analizi verileri yükleniyor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no data is available
  if (!takipteData || takipteData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-center bg-gray-50 p-8 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Takip Analizi Verileri Bulunamadı
            </h3>
            <p className="text-gray-600 mb-4">
              Henüz takip analizi için veri içe aktarılmamış.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Analiz sonuçlarını görmek için takip verilerinizi Excel veya CSV formatında yükleyin.
            </p>
            <Button 
              onClick={() => window.location.hash = '#veri-girisi'}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              📤 Veri İçe Aktar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            📞 Takip Analizi - Müşteri İletişim Verileri
          </h2>
          <p className="text-gray-600 mt-1">
            Müşteri takip faaliyetlerinin detaylı analizi ve performans
            değerlendirmesi
          </p>
        </div>
      </div>

      {/* Analysis Info */}
      {analytics && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
              <Activity className="h-5 w-5" />
              📊 Takip Analizi Özeti
            </CardTitle>
            <CardDescription className="text-blue-700">
              Toplam {analytics.total} takip faaliyeti analiz edildi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">{analytics.total}</div>
                <div className="text-sm text-gray-600">Toplam Takip</div>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-orange-600">{analytics.reminderCount}</div>
                <div className="text-sm text-gray-600">Hatırlatma</div>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-green-600">{analytics.appointmentCount}</div>
                <div className="text-sm text-gray-600">Randevu</div>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-purple-600">{analytics.averageScore}</div>
                <div className="text-sm text-gray-600">Ort. Puan</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Alert */}
      {analytics && (
        <Alert className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200">
          <Activity className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-gray-800">
            <strong>📊 Analiz Özeti:</strong> Toplam {analytics.total} takip
            faaliyeti analiz edildi.
            {analytics.reminderCount > 0 &&
              ` ${analytics.reminderCount} hatırlatma planlandı.`}
            {analytics.appointmentCount > 0 &&
              ` ${analytics.appointmentCount} randevu oluşturuldu.`}
            {analytics.averageScore > 0 &&
              ` Ortalama puan: ${analytics.averageScore}.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Takip
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {analytics.total}
              </div>
              <p className="text-xs text-muted-foreground">
                Toplam takip faaliyeti
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Hatırlatmalı
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {analytics.reminderCount}
              </div>
              <p className="text-xs text-muted-foreground">
                %
                {analytics.total > 0
                  ? Math.round(
                      (analytics.reminderCount / analytics.total) * 100
                    )
                  : 0}{" "}
                hatırlatma oranı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Randevulu</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {analytics.appointmentCount}
              </div>
              <p className="text-xs text-muted-foreground">
                %
                {analytics.total > 0
                  ? Math.round(
                      (analytics.appointmentCount / analytics.total) * 100
                    )
                  : 0}{" "}
                randevu oranı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ortalama Puan
              </CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {analytics.averageScore}
              </div>
              <p className="text-xs text-muted-foreground">
                Son 7 gün: {analytics.recentActivity} faaliyet
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis Tabs */}
      <Tabs defaultValue="personnel" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personnel">Personel</TabsTrigger>
          <TabsTrigger value="office">Ofis</TabsTrigger>
          <TabsTrigger value="communication">İletişim</TabsTrigger>
          <TabsTrigger value="sources">Kaynaklar</TabsTrigger>
          <TabsTrigger value="detailed">Detaylı Liste</TabsTrigger>
        </TabsList>

        <TabsContent value="personnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                👥 Personel Performans Analizi
              </CardTitle>
              <CardDescription>
                Personel bazında takip faaliyeti dağılımı ve performans
                değerlendirmesi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.personnelData &&
              analytics.personnelData.length > 0 ? (
                <>
                  <div className="mb-6">
                    <ResponsiveContainer width="100%" height={400}>
                      {chartType === "pie" ? (
                        <PieChart>
                          <Pie
                            data={analytics.personnelData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {analytics.personnelData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={getUniqueColorForCategory(entry.name)}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      ) : chartType === "line" ? (
                        <LineChart data={analytics.personnelData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                          />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                          />
                        </LineChart>
                      ) : (
                        <BarChart data={analytics.personnelData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="value"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                          >
                            {analytics.personnelData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={getUniqueColorForCategory(entry.name)}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                            Personel
                          </th>
                          <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                            Takip Sayısı
                          </th>
                          <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                            Yüzde
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.personnelData.map((item, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50"
                            style={{
                              backgroundColor: `${getUniqueColorForCategory(
                                item.name
                              )}15`,
                              borderLeft: `4px solid ${getUniqueColorForCategory(
                                item.name
                              )}`,
                            }}
                          >
                            <td className="border border-gray-200 px-4 py-2 font-medium">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor: getUniqueColorForCategory(
                                      item.name
                                    ),
                                  }}
                                />
                                {item.name}
                              </div>
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-center font-medium">
                              {item.value}
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-center">
                              %{item.percentage}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Personel verisi bulunamadı</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="office" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-green-600" />
                🏢 Ofis Bazında Analiz
              </CardTitle>
              <CardDescription>
                Ofis lokasyonları bazında takip faaliyeti dağılımı
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.officeData && analytics.officeData.length > 0 ? (
                <>
                  <div className="mb-6">
                    <ResponsiveContainer width="100%" height={400}>
                      {chartType === "pie" ? (
                        <PieChart>
                          <Pie
                            data={analytics.officeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {analytics.officeData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={getUniqueColorForCategory(entry.name)}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      ) : chartType === "line" ? (
                        <LineChart data={analytics.officeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                          />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ fill: "#10b981", strokeWidth: 2, r: 6 }}
                          />
                        </LineChart>
                      ) : (
                        <BarChart data={analytics.officeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="value"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                          >
                            {analytics.officeData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={getUniqueColorForCategory(entry.name)}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                            Ofis
                          </th>
                          <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                            Takip Sayısı
                          </th>
                          <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                            Yüzde
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.officeData.map((item, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50"
                            style={{
                              backgroundColor: `${getUniqueColorForCategory(
                                item.name
                              )}15`,
                              borderLeft: `4px solid ${getUniqueColorForCategory(
                                item.name
                              )}`,
                            }}
                          >
                            <td className="border border-gray-200 px-4 py-2 font-medium">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor: getUniqueColorForCategory(
                                      item.name
                                    ),
                                  }}
                                />
                                {item.name}
                              </div>
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-center font-medium">
                              {item.value}
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-center">
                              %{item.percentage}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Ofis verisi bulunamadı</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhoneCall className="h-5 w-5 text-orange-600" />
                📞 İletişim Tipi Analizi
              </CardTitle>
              <CardDescription>
                Müşteri haberleşme tiplerinin dağılımı ve etkinlik analizi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.communicationData &&
              analytics.communicationData.length > 0 ? (
                <>
                  <div className="mb-6">
                    <ResponsiveContainer width="100%" height={400}>
                      {chartType === "pie" ? (
                        <PieChart>
                          <Pie
                            data={analytics.communicationData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {analytics.communicationData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={getUniqueColorForCategory(entry.name)}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      ) : chartType === "line" ? (
                        <LineChart data={analytics.communicationData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                          />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#f97316"
                            strokeWidth={3}
                            dot={{ fill: "#f97316", strokeWidth: 2, r: 6 }}
                          />
                        </LineChart>
                      ) : (
                        <BarChart data={analytics.communicationData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="value"
                            fill="#f97316"
                            radius={[4, 4, 0, 0]}
                          >
                            {analytics.communicationData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={getUniqueColorForCategory(entry.name)}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                            İletişim Tipi
                          </th>
                          <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                            Takip Sayısı
                          </th>
                          <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                            Yüzde
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.communicationData.map((item, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50"
                            style={{
                              backgroundColor: `${getUniqueColorForCategory(
                                item.name
                              )}15`,
                              borderLeft: `4px solid ${getUniqueColorForCategory(
                                item.name
                              )}`,
                            }}
                          >
                            <td className="border border-gray-200 px-4 py-2 font-medium">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor: getUniqueColorForCategory(
                                      item.name
                                    ),
                                  }}
                                />
                                {item.name}
                              </div>
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-center font-medium">
                              {item.value}
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-center">
                              %{item.percentage}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <PhoneCall className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    İletişim tipi verisi bulunamadı
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-red-600" />
                🎯 Müşteri Kaynak Analizi
              </CardTitle>
              <CardDescription>
                Müşteri kaynaklarının dağılımı ve etkinlik analizi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.sourceData && analytics.sourceData.length > 0 ? (
                <>
                  <div className="mb-6">
                    <ResponsiveContainer width="100%" height={400}>
                      {chartType === "pie" ? (
                        <PieChart>
                          <Pie
                            data={analytics.sourceData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {analytics.sourceData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={getUniqueColorForCategory(entry.name)}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      ) : chartType === "line" ? (
                        <LineChart data={analytics.sourceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                          />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#ef4444"
                            strokeWidth={3}
                            dot={{ fill: "#ef4444", strokeWidth: 2, r: 6 }}
                          />
                        </LineChart>
                      ) : (
                        <BarChart data={analytics.sourceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="value"
                            fill="#ef4444"
                            radius={[4, 4, 0, 0]}
                          >
                            {analytics.sourceData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={getUniqueColorForCategory(entry.name)}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                            Kaynak
                          </th>
                          <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                            Takip Sayısı
                          </th>
                          <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                            Yüzde
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.sourceData.map((item, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50"
                            style={{
                              backgroundColor: `${getUniqueColorForCategory(
                                item.name
                              )}15`,
                              borderLeft: `4px solid ${getUniqueColorForCategory(
                                item.name
                              )}`,
                            }}
                          >
                            <td className="border border-gray-200 px-4 py-2 font-medium">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor: getUniqueColorForCategory(
                                      item.name
                                    ),
                                  }}
                                />
                                {item.name}
                              </div>
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-center font-medium">
                              {item.value}
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-center">
                              %{item.percentage}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Kaynak verisi bulunamadı</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                📋 Detaylı Takip Listesi
              </CardTitle>
              <CardDescription>
                Tüm takip faaliyetlerinin filtrelenebilir ve aranabilir listesi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filter Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Aktif Filtreler
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">
                    {filteredData.length} takip görüntüleniyor
                  </Badge>
                  <Badge variant="secondary">
                    {uniquePersonnel.length} personel
                  </Badge>
                  <Badge variant="secondary">{uniqueOffices.length} ofis</Badge>
                  <Badge variant="secondary">
                    {uniqueResults.length} sonuç tipi
                  </Badge>
                  {(selectedPersonnel !== "all" ||
                    selectedOffice !== "all" ||
                    selectedResult !== "all" ||
                    selectedCommunicationType !== "all") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPersonnel("all");
                        setSelectedOffice("all");
                        setSelectedResult("all");
                        setSelectedCommunicationType("all");
                      }}
                      className="h-7 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Filtreleri Temizle
                    </Button>
                  )}
                </div>
              </div>

              {filteredData.length > 0 ? (
                <MasterDataTable
                  title="Takip Faaliyet Detayları"
                  data={filteredData.map((item: TakipteData) => ({
                    customerName: getCustomerName(item),
                    date: item["Tarih"],
                    personnel: getPersonnelName(item),
                    office: item["Ofis"],
                    notes: item["Notlar"],
                    communicationType: item["Müşteri Haberleşme Tipi"],
                    meetingType: item["Görüşme Tipi"],
                    time: item["Saat"],
                    hasReminder: item["Hatırlatma Var Mı"],
                    reminderDate: item["Hatırlatma Tarihi"],
                    reminderPersonnel: item["Hatırlatma Personeli"],
                    talkDuration: item["Konuşma Süresi"],
                    result: item["Son Sonuç Adı"],
                    score: item["Puan"],
                    hasAppointment: item["Randevu Var Mı ?"],
                    appointmentDate: item["Randevu Tarihi"],
                    customerSource: item["İletişim Müşteri Kaynağı"],
                    phone: item["Cep Tel"],
                    email: item["Email"],
                    criteria: item["Kriter"],
                    isActive: item["AktifMi"],
                  }))}
                  columns={[
                    { key: "customerName", label: "Müşteri", type: "text" },
                    { key: "date", label: "Tarih", type: "date" },
                    { key: "personnel", label: "Personel", type: "badge" },
                    { key: "office", label: "Ofis", type: "badge" },
                    { key: "notes", label: "Notlar", type: "text" },
                    {
                      key: "communicationType",
                      label: "İletişim Tipi",
                      type: "badge",
                    },
                    {
                      key: "meetingType",
                      label: "Görüşme Tipi",
                      type: "badge",
                    },
                    { key: "time", label: "Saat", type: "text" },
                    { key: "hasReminder", label: "Hatırlatma", type: "badge" },
                    {
                      key: "reminderDate",
                      label: "Hatırlatma Tarihi",
                      type: "date",
                    },
                    {
                      key: "talkDuration",
                      label: "Konuşma Süresi",
                      type: "text",
                    },
                    { key: "result", label: "Sonuç", type: "badge" },
                    { key: "score", label: "Puan", type: "text" },
                    { key: "hasAppointment", label: "Randevu", type: "badge" },
                    {
                      key: "appointmentDate",
                      label: "Randevu Tarihi",
                      type: "date",
                    },
                    {
                      key: "customerSource",
                      label: "Müşteri Kaynağı",
                      type: "text",
                    },
                    { key: "phone", label: "Telefon", type: "text" },
                    { key: "email", label: "Email", type: "text" },
                    { key: "criteria", label: "Kriter", type: "badge" },
                    { key: "isActive", label: "Aktif", type: "badge" },
                  ]}
                />
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Seçilen kriterlere uygun takip faaliyeti bulunamadı
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
