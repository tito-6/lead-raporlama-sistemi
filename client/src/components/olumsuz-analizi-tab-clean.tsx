import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  AlertCircle,
  TrendingDown,
  Users,
  Target,
  FileText,
  Calendar,
  Phone,
  Filter,
  X,
  Building,
  RefreshCw,
} from "lucide-react";
import { MasterDataTable } from "@/components/ui/master-data-table";
import { DataTable } from "@/components/ui/data-table";
import DateFilter from "./ui/date-filter";
import UniversalFilter, { UniversalFilters } from "./ui/universal-filter";
import NegativeReasonsSummaryTable from "./negative-reasons-summary-table";
import {
  getStandardColor,
  getPersonnelColor,
  getStatusColor,
} from "@/lib/color-system";
import ProjectFilter from "./project-filter";
import { useToast } from "@/hooks/use-toast";

interface NegativeAnalysisData {
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
}

export default function OlumsuzAnaliziTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedPersonnel, setSelectedPersonnel] = useState<string>("all");
  const [selectedReason, setSelectedReason] = useState<string>("all");
  const [chartType, setChartType] = useState<"pie" | "bar" | "line">("bar");
  const [viewMode, setViewMode] = useState<"summary" | "detailed">("summary");
  const [dateFilters, setDateFilters] = useState({
    startDate: "",
    endDate: "",
    month: "",
    year: "",
  });
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [showReasonTable, setShowReasonTable] = useState<boolean>(true);
  const [showSummaryTable, setShowSummaryTable] = useState<boolean>(true);

  // Chart type options matching the takipte-analizi design
  const chartTypeOptions = [
    { value: "pie" as const, label: "Pasta Grafik", icon: "🥧" },
    { value: "bar" as const, label: "Sütun Grafik", icon: "📊" },
    { value: "line" as const, label: "Çizgi Grafik", icon: "📈" },
  ];

  const [universalFilters, setUniversalFilters] = useState<UniversalFilters>({
    startDate: "",
    endDate: "",
    month: "",
    year: "",
    leadType: "all-types",
    projectName: "all-projects",
    salesRep: "",
    status: "",
  });

  // Add project to universalFilters
  const filters = { ...universalFilters, project: selectedProject };

  // Cache clearing function
  const clearCache = async () => {
    try {
      // Clear all queries from the cache
      await queryClient.invalidateQueries();
      // Alternatively, you can be more specific:
      // await queryClient.invalidateQueries({ queryKey: ["/api/negative-analysis"] });
      // await queryClient.invalidateQueries({ queryKey: ["/api/leads"] });

      toast({
        title: "✅ Önbellek Temizlendi",
        description: "Olumsuzluk analizi verileri yeniden yüklenecek.",
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

  // Fetch negative analysis data
  const { data: negativeAnalysis, isLoading } = useQuery<NegativeAnalysisData>({
    queryKey: ["/api/negative-analysis", dateFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(dateFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await fetch(
        `/api/negative-analysis?${params.toString()}`
      );
      return response.json();
    },
    refetchInterval: 5000,
  });

  // Fetch detailed leads data for advanced table
  const { data: leadsData = [] } = useQuery({
    queryKey: ["/api/leads", dateFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(dateFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await fetch(`/api/leads?${params.toString()}`);
      return response.json();
    },
  });

  // Filter negative leads based on selections - use same logic as NegativeReasonsSummaryTable
  const filteredNegativeLeads = useMemo(() => {
    return leadsData.filter((lead: any) => {
      // Match exactly how server and summary table filter olumsuz leads
      const isNegativeLead =
        lead.status?.includes("Olumsuz") ||
        lead.status?.toLowerCase().includes("olumsuz");
      const matchesPersonnel =
        selectedPersonnel === "all" ||
        lead.assignedPersonnel === selectedPersonnel;
      const reasonToCheck =
        lead.negativeReason && lead.negativeReason.trim() !== ""
          ? lead.negativeReason.trim()
          : lead.status || "Belirtilmemiş";
      const matchesReason =
        selectedReason === "all" || reasonToCheck === selectedReason;

      // Additional universal filters
      const matchesProject =
        !universalFilters.projectName ||
        universalFilters.projectName === "all-projects" ||
        lead.projectName === universalFilters.projectName;
      const matchesLeadType =
        !universalFilters.leadType ||
        universalFilters.leadType === "all-types" ||
        lead.leadType === universalFilters.leadType;

      return (
        isNegativeLead &&
        matchesPersonnel &&
        matchesReason &&
        matchesProject &&
        matchesLeadType
      );
    });
  }, [leadsData, selectedPersonnel, selectedReason, universalFilters]);

  // Get unique personnel and reasons for filtering - use same logic as summary table
  const uniquePersonnel = useMemo(() => {
    const personnel = leadsData
      .filter(
        (lead: any) =>
          lead.status?.includes("Olumsuz") ||
          lead.status?.toLowerCase().includes("olumsuz")
      )
      .map((lead: any) => lead.assignedPersonnel)
      .filter(Boolean);
    return Array.from(new Set(personnel)) as string[];
  }, [leadsData]);

  const uniqueReasons = useMemo(() => {
    const negativeLeads = leadsData.filter(
      (lead: any) =>
        lead.status?.includes("Olumsuz") ||
        lead.status?.toLowerCase().includes("olumsuz")
    );

    // More comprehensive reason extraction - check multiple fields
    const reasons = negativeLeads
      .map((lead: any) => {
        // Priority: negativeReason -> lastMeetingNote -> responseResult -> status
        if (lead.negativeReason && lead.negativeReason.trim() !== "") {
          return lead.negativeReason.trim();
        }
        if (lead.lastMeetingNote && lead.lastMeetingNote.trim() !== "") {
          return lead.lastMeetingNote.trim();
        }
        if (lead.responseResult && lead.responseResult.trim() !== "") {
          return lead.responseResult.trim();
        }
        return lead.status || "Belirtilmemiş";
      })
      .filter(Boolean);

    return Array.from(new Set(reasons)) as string[];
  }, [leadsData]);

  // Optimize reason display for "all" view - limit to top 10 reasons
  const optimizedReasonData = useMemo(() => {
    if (!negativeAnalysis?.reasonAnalysis) return [];

    if (selectedPersonnel === "all") {
      // Show only top 10 reasons when all personnel selected
      return negativeAnalysis.reasonAnalysis
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map((item) => ({
          ...item,
          name:
            item.reason.length > 25
              ? item.reason.substring(0, 25) + "..."
              : item.reason,
          fullReason: item.reason,
          percentage: Math.round(item.percentage * 10) / 10, // Round to 1 decimal place
        }));
    }

    // Show all reasons when specific personnel selected
    return negativeAnalysis.reasonAnalysis.map((item) => ({
      ...item,
      name: item.reason,
      fullReason: item.reason,
      percentage: Math.round(item.percentage * 10) / 10, // Round to 1 decimal place
    }));
  }, [negativeAnalysis, selectedPersonnel]);

  // Color mapping for negative reasons
  const getReasonColor = (reason: string, index: number) => {
    const colors = [
      "#ef4444", // Red
      "#f97316", // Orange
      "#eab308", // Yellow
      "#22c55e", // Green
      "#3b82f6", // Blue
      "#8b5cf6", // Purple
      "#ec4899", // Pink
      "#06b6d4", // Cyan
      "#84cc16", // Lime
      "#f59e0b", // Amber
      "#10b981", // Emerald
      "#6366f1", // Indigo
      "#14b8a6", // Teal
      "#f43f5e", // Rose
      "#a855f7", // Violet
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">
              Olumsuz analiz verileri yükleniyor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />❌ Olumsuzluk
                Nedenleri Analizi
              </CardTitle>
              <CardDescription>
                Olumsuz lead'lerin detaylı analizi ve nedenlerin incelenmesi
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={clearCache}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-red-50 border-red-200"
              >
                <RefreshCw className="h-4 w-4" />
                🗑️ Önbelleği Temizle
              </Button>
              <Select
                value={viewMode}
                onValueChange={(v) => setViewMode(v as "summary" | "detailed")}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Özet</SelectItem>
                  <SelectItem value="detailed">Detaylı</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                {chartTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setChartType(option.value)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      chartType === option.value
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {option.icon} {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DateFilter
              onFilterChange={setDateFilters}
              initialFilters={dateFilters}
            />
            <Select
              value={universalFilters.projectName}
              onValueChange={(value) =>
                setUniversalFilters({
                  ...universalFilters,
                  projectName: value,
                })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Proje Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-projects">Tüm Projeler</SelectItem>
                {(
                  Array.from(
                    new Set(
                      filteredNegativeLeads
                        .map((lead: any) => lead.projectName)
                        .filter(Boolean)
                    )
                  ) as string[]
                ).map((project) => (
                  <SelectItem key={project} value={project}>
                    {project}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedPersonnel}
              onValueChange={setSelectedPersonnel}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Personel Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Personel</SelectItem>
                {uniquePersonnel.map((personnel) => (
                  <SelectItem key={personnel} value={personnel}>
                    {personnel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Neden Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Nedenler</SelectItem>
                {uniqueReasons.map((reason: string) => (
                  <SelectItem key={reason} value={reason}>
                    {reason.length > 30
                      ? reason.substring(0, 30) + "..."
                      : reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {negativeAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Olumsuz Lead
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {filteredNegativeLeads.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Tüm lead'lerin %
                {Math.round(
                  (filteredNegativeLeads.length /
                    (negativeAnalysis.totalLeads || 1)) *
                    100
                )}
                'i
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Farklı Neden Sayısı
              </CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {uniqueReasons.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Benzersiz olumsuzluk nedeni
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Etkilenen Personel
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {uniquePersonnel.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Olumsuz lead'e sahip personel
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                En Çok Görülen
              </CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-purple-600">
                {negativeAnalysis.reasonAnalysis[0]?.reason.substring(0, 20) +
                  (negativeAnalysis.reasonAnalysis[0]?.reason.length > 20
                    ? "..."
                    : "") || "Veri yok"}
              </div>
              <p className="text-xs text-muted-foreground">
                {negativeAnalysis.reasonAnalysis[0]?.count || 0} lead (%
                {negativeAnalysis.reasonAnalysis[0]?.percentage || 0})
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 📊 En Sık Görülen Olumsuzluk Nedenleri (İlk 10) - Moved to main page */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">
            📊 En Sık Görülen Olumsuzluk Nedenleri (İlk 10)
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReasonTable(!showReasonTable)}
              className="h-8 px-3 text-xs"
            >
              {showReasonTable ? "📋 Tabloyu Gizle" : "📋 Tabloyu Göster"}
            </Button>
            <Badge
              variant="outline"
              className="text-sm font-medium px-3 py-1 bg-red-50 text-red-700 border-red-200"
            >
              {optimizedReasonData.length} Neden
            </Badge>
            {selectedPersonnel === "all" && (
              <Badge variant="secondary">İlk 10 neden gösteriliyor</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {optimizedReasonData.length > 0 ? (
            <>
              <div className="mb-6">
                <ResponsiveContainer width="100%" height={400}>
                  {chartType === "pie" ? (
                    <PieChart>
                      <Pie
                        data={optimizedReasonData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ value, percentage }) =>
                          `${value} (${percentage}%)`
                        }
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {optimizedReasonData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getReasonColor(entry.fullReason, index)}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value} lead`,
                          props.payload.fullReason,
                        ]}
                      />
                    </PieChart>
                  ) : chartType === "line" ? (
                    <LineChart data={optimizedReasonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value} lead`,
                          props.payload.fullReason,
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={{
                          fill: "#ef4444",
                          strokeWidth: 2,
                          r: 6,
                          stroke: "#ffffff",
                        }}
                        activeDot={{
                          r: 8,
                          stroke: "#ef4444",
                          strokeWidth: 2,
                          fill: "#ef4444",
                        }}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={optimizedReasonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value} lead`,
                          props.payload.fullReason,
                        ]}
                      />
                      <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]}>
                        {optimizedReasonData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getReasonColor(entry.fullReason, index)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>

              {showReasonTable && (
                <DataTable
                  title="Olumsuzluk Nedenleri Grafik Detayları"
                  data={optimizedReasonData.map((item) => ({
                    Neden: item.fullReason,
                    Adet: item.count,
                    Yüzde: `%${item.percentage}`,
                  }))}
                />
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Seçilen kriterlere uygun olumsuz lead bulunamadı
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Tabs */}
      <Tabs defaultValue="reasons" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reasons">Olumsuzluk Nedenleri</TabsTrigger>
          <TabsTrigger value="personnel">Personel Analizi</TabsTrigger>
          <TabsTrigger value="detailed">Detaylı Liste</TabsTrigger>
        </TabsList>

        <TabsContent value="reasons" className="space-y-4">
          {/* Toggle Button for Summary Table */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Olumsuzluk Nedenleri - Özet Tablo
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSummaryTable(!showSummaryTable)}
              className="h-8 px-3 text-xs"
            >
              {showSummaryTable ? "📋 Tabloyu Gizle" : "📋 Tabloyu Göster"}
            </Button>
          </div>

          {/* Comprehensive Negative Reasons Summary Table */}
          {showSummaryTable && (
            <NegativeReasonsSummaryTable
              leads={leadsData}
              selectedPersonnel={selectedPersonnel}
            />
          )}
        </TabsContent>

        <TabsContent value="personnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>👥 Personel Bazında Olumsuz Lead Analizi</CardTitle>
              <CardDescription>
                Personel performansı ve olumsuz lead dağılımı
              </CardDescription>
            </CardHeader>
            <CardContent>
              {negativeAnalysis?.personnelAnalysis &&
              negativeAnalysis.personnelAnalysis.length > 0 ? (
                <>
                  <div className="mb-6">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={negativeAnalysis.personnelAnalysis}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="personnel"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="count"
                          fill="#f97316"
                          radius={[4, 4, 0, 0]}
                        >
                          {negativeAnalysis.personnelAnalysis.map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={getPersonnelColor(entry.personnel)}
                              />
                            )
                          )}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="mb-2 flex justify-between items-center">
                      <h3 className="text-sm font-semibold">
                        Personel Olumsuz Lead Detayları
                      </h3>
                      <div className="text-xs text-gray-500">
                        Toplam {negativeAnalysis.personnelAnalysis.length}{" "}
                        personel
                      </div>
                    </div>
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-3 py-2 text-left font-medium">
                            Personel
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-left font-medium">
                            Olumsuz Lead
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-left font-medium">
                            Yüzde
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {negativeAnalysis.personnelAnalysis.map(
                          (item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td
                                className="border border-gray-300 px-3 py-2 font-medium"
                                style={{
                                  color: getPersonnelColor(item.personnel),
                                }}
                              >
                                {item.personnel}
                              </td>
                              <td className="border border-gray-300 px-3 py-2">
                                {item.count}
                              </td>
                              <td
                                className="border border-gray-300 px-3 py-2 font-medium"
                                style={{
                                  color: getPersonnelColor(item.personnel),
                                }}
                              >
                                %{Math.round(item.percentage)}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Personel analizi için veri bulunamadı
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📋 Olumsuz Lead'ler - Detaylı Liste</CardTitle>
              <CardDescription>
                Tüm olumsuz lead'lerin filtrelenebilir ve aranabilir listesi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Advanced Filtering for Detailed List */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Detaylı Liste Filtreleri
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-xs font-medium">Satış Personeli</span>
                    <Select
                      value={selectedPersonnel}
                      onValueChange={setSelectedPersonnel}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Personel seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Personel</SelectItem>
                        {uniquePersonnel.map((personnel) => (
                          <SelectItem key={personnel} value={personnel}>
                            {personnel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <span className="text-xs font-medium">
                      Olumsuzluk Nedeni
                    </span>
                    <Select
                      value={selectedReason}
                      onValueChange={setSelectedReason}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Neden seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Nedenler</SelectItem>
                        {uniqueReasons.map((reason: string) => (
                          <SelectItem key={reason} value={reason}>
                            {reason.length > 30
                              ? reason.substring(0, 30) + "..."
                              : reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <span className="text-xs font-medium">Proje</span>
                    <Select
                      value={universalFilters.projectName}
                      onValueChange={(value) =>
                        setUniversalFilters({
                          ...universalFilters,
                          projectName: value,
                        })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Proje seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-projects">
                          Tüm Projeler
                        </SelectItem>
                        {(
                          Array.from(
                            new Set(
                              filteredNegativeLeads
                                .map((lead: any) => lead.projectName)
                                .filter(Boolean)
                            )
                          ) as string[]
                        ).map((project) => (
                          <SelectItem key={project} value={project}>
                            {project}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <span className="text-xs font-medium">Lead Tipi</span>
                    <Select
                      value={universalFilters.leadType}
                      onValueChange={(value) =>
                        setUniversalFilters({
                          ...universalFilters,
                          leadType: value,
                        })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Tip seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-types">Tüm Tipler</SelectItem>
                        <SelectItem value="satis">Satılık</SelectItem>
                        <SelectItem value="kiralama">Kiralık</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="outline">
                    {filteredNegativeLeads.length} olumsuz lead görüntüleniyor
                  </Badge>
                  <Badge variant="secondary">
                    {uniquePersonnel.length} personel
                  </Badge>
                  <Badge variant="secondary">
                    {uniqueReasons.length} neden
                  </Badge>
                  <Badge variant="secondary">
                    {
                      Array.from(
                        new Set(
                          filteredNegativeLeads
                            .map((lead: any) => lead.projectName)
                            .filter(Boolean)
                        )
                      ).length
                    }{" "}
                    proje
                  </Badge>
                  {(selectedPersonnel !== "all" ||
                    selectedReason !== "all" ||
                    universalFilters.projectName ||
                    universalFilters.leadType) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPersonnel("all");
                        setSelectedReason("all");
                        setUniversalFilters({
                          ...universalFilters,
                          projectName: "all-projects",
                          leadType: "all-types",
                        });
                      }}
                      className="h-7 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Filtreleri Temizle
                    </Button>
                  )}
                </div>
              </div>

              {filteredNegativeLeads.length > 0 ? (
                <MasterDataTable
                  title="Olumsuz Lead Detayları"
                  data={filteredNegativeLeads.map((lead: any) => ({
                    customerName: lead.customerName,
                    effectiveReason: (() => {
                      if (
                        lead.negativeReason &&
                        lead.negativeReason.trim() !== ""
                      ) {
                        return lead.negativeReason.trim();
                      }
                      if (
                        lead.lastMeetingNote &&
                        lead.lastMeetingNote.trim() !== ""
                      ) {
                        return lead.lastMeetingNote.trim();
                      }
                      if (
                        lead.responseResult &&
                        lead.responseResult.trim() !== ""
                      ) {
                        return lead.responseResult.trim();
                      }
                      return lead.status || "Belirtilmemiş";
                    })(),
                    assignedPersonnel: lead.assignedPersonnel,
                    projectName: lead.projectName,
                    leadType: lead.leadType,
                    requestDate: lead.requestDate,
                    status: lead.status,
                    lastMeetingNote: lead.lastMeetingNote,
                    responseResult: lead.responseResult,
                    firstCustomerSource: lead.firstCustomerSource,
                    formCustomerSource: lead.formCustomerSource,
                    customerId: lead.customerId,
                    contactId: lead.contactId,
                  }))}
                  columns={[
                    { key: "customerName", label: "Müşteri Adı", type: "text" },
                    {
                      key: "effectiveReason",
                      label: "Olumsuzluk Nedeni",
                      type: "badge",
                    },
                    {
                      key: "assignedPersonnel",
                      label: "Atanan Personel",
                      type: "badge",
                    },
                    { key: "projectName", label: "Proje", type: "text" },
                    { key: "leadType", label: "Lead Tipi", type: "badge" },
                    { key: "requestDate", label: "Talep Tarihi", type: "date" },
                    { key: "status", label: "Durum", type: "badge" },
                    {
                      key: "lastMeetingNote",
                      label: "Son Görüşme Notu",
                      type: "text",
                    },
                    {
                      key: "responseResult",
                      label: "Dönüş Sonucu",
                      type: "text",
                    },
                    {
                      key: "firstCustomerSource",
                      label: "İlk Müşteri Kaynağı",
                      type: "text",
                    },
                    {
                      key: "formCustomerSource",
                      label: "Form Müşteri Kaynağı",
                      type: "text",
                    },
                    { key: "customerId", label: "Müşteri ID", type: "text" },
                    { key: "contactId", label: "İletişim ID", type: "text" },
                  ]}
                />
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Seçilen kriterlere uygun olumsuz lead bulunamadı
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedPersonnel === "all" && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Optimize Edilmiş Görünüm:</strong> Tüm personel seçildiğinde
            performans için sadece en sık görülen 10 olumsuzluk nedeni
            gösterilmektedir. Belirli bir personel seçerek o personele ait tüm
            olumsuzluk nedenlerini görebilirsiniz.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
