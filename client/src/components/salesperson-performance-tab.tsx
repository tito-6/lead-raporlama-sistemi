import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Lead, SalesRep } from "@shared/schema";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Calendar,
  Filter,
  User,
  TrendingUp,
  Users,
  Target,
  Star,
  PhoneCall,
  DollarSign,
  Calculator,
} from "lucide-react";
import StandardChart from "@/components/charts/StandardChart";
import DateFilter from "./ui/date-filter";
import { useColors } from "@/hooks/use-colors";

interface SalespersonPerformanceTabProps {
  salespersonId: number;
}

export default function SalespersonPerformanceTab({
  salespersonId,
}: SalespersonPerformanceTabProps) {
  const { getColor } = useColors();

  // Status definitions with colors using standardized system
  const statusConfig: Record<
    string,
    { label: string; color: string; bgColor: string }
  > = {
    "Ulaşılamıyor - Cevap Vermiyor": {
      label: "Ulaşılamıyor",
      color: getColor("STATUS", "Ulaşılamıyor"),
      bgColor: "bg-orange-100",
    },
    Yeni: {
      label: "Yeni Lead",
      color: getColor("STATUS", "Yeni"),
      bgColor: "bg-blue-100",
    },
    Takipte: {
      label: "Takipte",
      color: getColor("STATUS", "Takipte"),
      bgColor: "bg-yellow-100",
    },
    "Bilgi Verildi": {
      label: "Bilgi Verildi",
      color: getColor("STATUS", "Bilgi Verildi"),
      bgColor: "bg-purple-100",
    },
    Olumsuz: {
      label: "Olumsuz",
      color: getColor("STATUS", "Olumsuz"),
      bgColor: "bg-red-100",
    },
    "Toplantı/Birebir Görüşme": {
      label: "Toplantı",
      color: getColor("STATUS", "Toplantı/Birebir Görüşme"),
      bgColor: "bg-indigo-100",
    },
    "Potansiyel Takipte": {
      label: "Potansiyel",
      color: getColor("STATUS", "Potansiyel Takipte"),
      bgColor: "bg-slate-100",
    },
    Satış: {
      label: "Satış",
      color: getColor("STATUS", "Satış"),
      bgColor: "bg-green-100",
    },
    Tanımsız: {
      label: "Tanımsız",
      color: getColor("STATUS", "Tanımsız"),
      bgColor: "bg-gray-100",
    },
    Bilinmiyor: {
      label: "Bilinmiyor",
      color: getColor("STATUS", "Bilinmiyor"),
      bgColor: "bg-gray-100",
    },
  };

  const [dateFilters, setDateFilters] = useState({
    startDate: "",
    endDate: "",
    month: "",
    year: "",
  });
  const [chartType, setChartType] = useState<"pie" | "bar" | "line">("pie");
  const [selectedProject, setSelectedProject] = useState<string>("all");

  const { data: leads = [] } = useQuery<Lead[]>({
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

  const { data: salesReps = [] } = useQuery<SalesRep[]>({
    queryKey: ["/api/sales-reps"],
  });

  const { data: uniqueStatuses = [] } = useQuery<string[]>({
    queryKey: ["/api/status-values"],
  });

  // Fetch enhanced stats for unified data with date filtering
  const { data: enhancedStats } = useQuery({
    queryKey: ["/api/enhanced-stats", dateFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(dateFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await fetch(`/api/enhanced-stats?${params.toString()}`);
      return response.json();
    },
    refetchInterval: 5000,
  });

  // Fetch takipte data for complete analysis with date filtering
  const { data: takipteData = [] } = useQuery({
    queryKey: ["/api/takipte", dateFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(dateFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await fetch(`/api/takipte?${params.toString()}`);
      return response.json();
    },
  });

  // Find the salesperson first
  const salesperson = salesReps.find((rep) => rep.id === salespersonId);

  // Fetch expense stats for this salesperson's leads
  const { data: expenseStats } = useQuery({
    queryKey: ["/api/lead-expenses/stats", salesperson?.name, dateFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (salesperson?.name) {
        params.append("salesRep", salesperson.name);
      }
      Object.entries(dateFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await fetch(
        `/api/lead-expenses/stats?${params.toString()}`
      );
      return response.json();
    },
    enabled: !!salesperson?.name,
  });
  const salespersonLeads = leads.filter(
    (lead) => lead.assignedPersonnel === salesperson?.name
  );
  const hasSecondaryData = takipteData.length > 0;

  if (!salesperson) {
    return <div>Personel bulunamadı</div>;
  }

  // Calculate statistics using actual imported data statuses
  // Note: All leads are currently 'kiralama' type based on imported data
  const salesLeads = salespersonLeads.filter(
    (lead) => lead.leadType === "satis"
  );
  const rentalLeads = salespersonLeads.filter(
    (lead) => lead.leadType === "kiralama"
  );

  console.log("Salesperson Performance Debug:", {
    salespersonName: salesperson.name,
    totalLeads: salespersonLeads.length,
    salesLeads: salesLeads.length,
    rentalLeads: rentalLeads.length,
    sampleStatuses: salespersonLeads.slice(0, 3).map((l) => l.status),
    uniqueStatuses: Array.from(new Set(salespersonLeads.map((l) => l.status))),
  });

  const salesStats = {
    total: salesLeads.length,
    "Ulaşılamıyor - Cevap Vermiyor": salesLeads.filter(
      (l) => l.status === "Ulaşılamıyor - Cevap Vermiyor"
    ).length,
    Takipte: salesLeads.filter((l) => l.status === "Takipte").length,
    "Bilgi Verildi": salesLeads.filter((l) => l.status === "Bilgi Verildi")
      .length,
    Olumsuz: salesLeads.filter((l) => l.status === "Olumsuz").length,
    "Toplantı/Birebir Görüşme": salesLeads.filter(
      (l) => l.status === "Toplantı/Birebir Görüşme"
    ).length,
    "Potansiyel Takipte": salesLeads.filter(
      (l) => l.status === "Potansiyel Takipte"
    ).length,
    Satış: salesLeads.filter((l) => l.status === "Satış").length,
    Yeni: salesLeads.filter((l) => l.status === "Yeni").length,
    Tanımsız: salesLeads.filter((l) => l.status === "Tanımsız").length,
    Bilinmiyor: salesLeads.filter((l) => l.status === "Bilinmiyor").length,
  };

  const rentalStats = {
    total: rentalLeads.length,
    "Ulaşılamıyor - Cevap Vermiyor": rentalLeads.filter(
      (l) => l.status === "Ulaşılamıyor - Cevap Vermiyor"
    ).length,
    Takipte: rentalLeads.filter((l) => l.status === "Takipte").length,
    "Bilgi Verildi": rentalLeads.filter((l) => l.status === "Bilgi Verildi")
      .length,
    Olumsuz: rentalLeads.filter((l) => l.status === "Olumsuz").length,
    "Toplantı/Birebir Görüşme": rentalLeads.filter(
      (l) => l.status === "Toplantı/Birebir Görüşme"
    ).length,
    "Potansiyel Takipte": rentalLeads.filter(
      (l) => l.status === "Potansiyel Takipte"
    ).length,
    Satış: rentalLeads.filter((l) => l.status === "Satış").length,
    Yeni: rentalLeads.filter((l) => l.status === "Yeni").length,
    Tanımsız: rentalLeads.filter((l) => l.status === "Tanımsız").length,
    Bilinmiyor: rentalLeads.filter((l) => l.status === "Bilinmiyor").length,
  };

  const salesTargetPercentage =
    salesperson.monthlyTarget > 0
      ? Math.round((salesStats["Satış"] / salesperson.monthlyTarget) * 100)
      : 0;

  // Pie chart data for sales leads
  const salesPieData = Object.entries(statusConfig)
    .map(([key, config]) => ({
      name: config.label,
      value: salesStats[key as keyof typeof salesStats] || 0,
      color: config.color,
    }))
    .filter((item) => item.value > 0);

  // Pie chart data for rental leads
  const rentalPieData = Object.entries(statusConfig)
    .map(([key, config]) => ({
      name: config.label,
      value: rentalStats[key as keyof typeof rentalStats] || 0,
      color: config.color,
    }))
    .filter((item) => item.value > 0);

  // Negative reasons analysis
  const negativeLeads = salespersonLeads.filter(
    (lead) =>
      lead.status === "Olumsuz" &&
      lead.negativeReason &&
      lead.negativeReason.trim() !== ""
  );

  const negativeReasonsData = negativeLeads.reduce(
    (acc: Record<string, number>, lead) => {
      const reason = lead.negativeReason?.trim() || "Belirtilmemiş";
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    },
    {}
  );

  const negativeReasonsChartData = Object.entries(negativeReasonsData)
    .map(([reason, count]) => ({
      name: reason.length > 20 ? reason.substring(0, 20) + "..." : reason,
      fullName: reason,
      value: count,
      color: getColor("STATUS", "Olumsuz"), // Use consistent red color for negative reasons
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 reasons

  return (
    <div className="space-y-6">
      {/* Header with unified design */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            📊 {salesperson.name} - Performans Raporu
          </h2>
          <p className="text-gray-600 mt-1">
            🤖 AI-destekli performans analizi ve satış raporları
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">Toplam: {salespersonLeads.length}</Badge>
          <Badge variant="outline">🎯 Hedef: {salesTargetPercentage}%</Badge>
          {hasSecondaryData && <Badge variant="outline">🔗 Dual-Source</Badge>}
        </div>
      </div>

      {/* KPI Cards matching main dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Lead</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salespersonLeads.length}</div>
            <p className="text-xs text-muted-foreground">
              Atanan toplam lead sayısı
            </p>
          </CardContent>
        </Card>

        {/* Sales Count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Satış Başarısı
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {salesStats["Satış"]}
            </div>
            <p className="text-xs text-muted-foreground">
              Başarıyla tamamlanan satış
            </p>
          </CardContent>
        </Card>

        {/* Lead Expenses (USD) */}
        {expenseStats && (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Lead Giderleri (USD)
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                $
                {expenseStats.expenses?.usd?.totalExpenses?.toFixed(2) ||
                  "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">
                Toplam lead maliyeti
              </p>
            </CardContent>
          </Card>
        )}

        {/* Cost Per Lead (USD) */}
        {expenseStats && (
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Lead Başına Maliyet
              </CardTitle>
              <Calculator className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                $
                {expenseStats.expenses?.usd?.avgCostPerLead?.toFixed(2) ||
                  "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">
                Ortalama lead maliyeti
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Date Filter and Chart Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <DateFilter
            onFilterChange={setDateFilters}
            initialFilters={dateFilters}
          />
        </div>

        <div className="lg:col-span-2">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg h-full">
            <div className="flex gap-2">
              <Select
                value={chartType}
                onValueChange={(value: "pie" | "bar" | "line") =>
                  setChartType(value)
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pie">🥧 Pasta Grafik</SelectItem>
                  <SelectItem value="bar">📊 Sütun Grafik</SelectItem>
                  <SelectItem value="line">📈 Çizgi Grafik</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              {/* Removed emoji badges as requested */}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performans Analizi</TabsTrigger>
          <TabsTrigger value="sales">Satış Analizi</TabsTrigger>
          <TabsTrigger value="rental">Kiralama Analizi</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>📈 Genel Performans Dağılımı</CardTitle>
                <CardDescription>Tüm leadlerin durum analizi</CardDescription>
              </CardHeader>
              <CardContent>
                <StandardChart
                  title="Genel Performance"
                  data={[
                    ...Object.entries(salesStats)
                      .filter(([key]) => key !== "total")
                      .map(([key, value]) => ({
                        name: `Satış ${statusConfig[key]?.label || key}`,
                        value: value as number,
                        percentage: Math.round(
                          ((value as number) / salespersonLeads.length) * 100
                        ),
                      })),
                    ...Object.entries(rentalStats)
                      .filter(([key]) => key !== "total")
                      .map(([key, value]) => ({
                        name: `Kiralama ${statusConfig[key]?.label || key}`,
                        value: value as number,
                        percentage: Math.round(
                          ((value as number) / salespersonLeads.length) * 100
                        ),
                      })),
                  ].filter((item) => item.value > 0)}
                  chartType={chartType}
                  height={500}
                />

                {/* Performance Details Table */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4">
                    📊 Detaylı Performans Raporu
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-2 text-left">
                            Durum
                          </th>
                          <th className="border border-gray-300 px-4 py-2 text-center">
                            Satış Leads
                          </th>
                          <th className="border border-gray-300 px-4 py-2 text-center">
                            Kiralama Leads
                          </th>
                          <th className="border border-gray-300 px-4 py-2 text-center">
                            Toplam
                          </th>
                          <th className="border border-gray-300 px-4 py-2 text-center">
                            Adet (Yüzde)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(statusConfig).map(
                          ([statusKey, config]) => {
                            const salesCount =
                              salesStats[
                                statusKey as keyof typeof salesStats
                              ] || 0;
                            const rentalCount =
                              rentalStats[
                                statusKey as keyof typeof rentalStats
                              ] || 0;
                            const total = salesCount + rentalCount;
                            const percentage =
                              salespersonLeads.length > 0
                                ? (
                                    (total / salespersonLeads.length) *
                                    100
                                  ).toFixed(1)
                                : "0";

                            if (total === 0) return null;

                            return (
                              <tr key={statusKey}>
                                <td className="border border-gray-300 px-4 py-2">
                                  <div className="flex items-center">
                                    <div
                                      className="w-3 h-3 rounded-full mr-2"
                                      style={{ backgroundColor: config.color }}
                                    ></div>
                                    {config.label}
                                  </div>
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                  {salesCount}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                  {rentalCount}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                                  {total}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                  {total} ({percentage}%)
                                </td>
                              </tr>
                            );
                          }
                        )}
                        <tr className="bg-gray-100 font-bold">
                          <td className="border border-gray-300 px-4 py-2">
                            TOPLAM
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {salesStats.total}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {rentalStats.total}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {salespersonLeads.length}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {salespersonLeads.length} (100%)
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>💼 Satış Lead Dağılımı</CardTitle>
                <CardDescription>
                  Satış leadlerinin durum analizi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StandardChart
                  title="Satış Performance"
                  data={Object.entries(salesStats)
                    .filter(([key]) => key !== "total")
                    .map(([key, value]) => ({
                      name: statusConfig[key]?.label || key,
                      value: value as number,
                      percentage: Math.round(
                        ((value as number) / salesStats.total) * 100
                      ),
                    }))
                    .filter((item) => item.value > 0)}
                  chartType={chartType}
                  height={500}
                />

                {/* Sales Details Table */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4">
                    💼 Satış Lead Detayları
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Status Distribution Table */}
                    <div>
                      <h5 className="font-medium mb-2">Durum Dağılımı</h5>
                      <div className="mb-4">
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={Object.entries(salesStats)
                                .filter(
                                  ([key]) =>
                                    key !== "total" &&
                                    salesStats[key as keyof typeof salesStats] >
                                      0
                                )
                                .map(([key, value]) => ({
                                  name: statusConfig[key]?.label || key,
                                  value: value as number,
                                  percentage:
                                    salesStats.total > 0
                                      ? (
                                          ((value as number) /
                                            salesStats.total) *
                                          100
                                        ).toFixed(1)
                                      : "0",
                                }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {Object.entries(salesStats)
                                .filter(
                                  ([key]) =>
                                    key !== "total" &&
                                    salesStats[key as keyof typeof salesStats] >
                                      0
                                )
                                .map(([key], index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      statusConfig[key]?.color ||
                                      getColor("STATUS", key)
                                    }
                                  />
                                ))}
                            </Pie>
                            <Tooltip
                              formatter={(value, name) => [
                                `${value} adet`,
                                name,
                              ]}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 text-sm">
                          <thead>
                            <tr className="bg-blue-50">
                              <th className="border border-gray-300 px-3 py-2 text-left">
                                Durum
                              </th>
                              <th className="border border-gray-300 px-3 py-2 text-center">
                                Adet
                              </th>
                              <th className="border border-gray-300 px-3 py-2 text-center">
                                Adet (Yüzde)
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(salesStats)
                              .filter(([key]) => key !== "total")
                              .map(([key, value]) => {
                                const percentage =
                                  salesStats.total > 0
                                    ? (
                                        ((value as number) / salesStats.total) *
                                        100
                                      ).toFixed(1)
                                    : "0";
                                if (value === 0) return null;
                                return (
                                  <tr key={key}>
                                    <td className="border border-gray-300 px-3 py-2">
                                      <div className="flex items-center">
                                        <div
                                          className="w-2 h-2 rounded-full mr-2"
                                          style={{
                                            backgroundColor:
                                              statusConfig[key]?.color ||
                                              "#gray",
                                          }}
                                        ></div>
                                        {statusConfig[key]?.label || key}
                                      </div>
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-center">
                                      {value}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-center">
                                      {value} ({percentage}%)
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Lead Source Analysis */}
                    <div>
                      <h5 className="font-medium mb-2">Kaynak Analizi</h5>
                      <div className="mb-4">
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart
                            data={Array.from(
                              new Set(
                                salespersonLeads
                                  .filter((l) => l.leadType === "satis")
                                  .map(
                                    (l) => l.firstCustomerSource || "Bilinmiyor"
                                  )
                              )
                            )
                              .map((source) => ({
                                name:
                                  source.length > 12
                                    ? source.substring(0, 12) + "..."
                                    : source,
                                fullName: source,
                                value: salespersonLeads.filter(
                                  (l) =>
                                    l.leadType === "satis" &&
                                    (l.firstCustomerSource || "Bilinmiyor") ===
                                      source
                                ).length,
                              }))
                              .sort((a, b) => b.value - a.value)
                              .slice(0, 8)}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="name"
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis />
                            <Tooltip
                              formatter={(value, name, props) => [
                                `${value} adet`,
                                props.payload.fullName,
                              ]}
                            />
                            <Bar dataKey="value" fill="#10b981" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 text-sm">
                          <thead>
                            <tr className="bg-green-50">
                              <th className="border border-gray-300 px-3 py-2 text-left">
                                Kaynak
                              </th>
                              <th className="border border-gray-300 px-3 py-2 text-center">
                                Adet
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from(
                              new Set(
                                salespersonLeads
                                  .filter((l) => l.leadType === "satis")
                                  .map(
                                    (l) => l.firstCustomerSource || "Bilinmiyor"
                                  )
                              )
                            )
                              .map((source) => ({
                                source,
                                count: salespersonLeads.filter(
                                  (l) =>
                                    l.leadType === "satis" &&
                                    (l.firstCustomerSource || "Bilinmiyor") ===
                                      source
                                ).length,
                              }))
                              .sort((a, b) => b.count - a.count)
                              .map(({ source, count }) => (
                                <tr key={source}>
                                  <td className="border border-gray-300 px-3 py-2">
                                    {source}
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-center">
                                    {count}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Sales Activity */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4">
                    🕒 Son Satış Aktiviteleri
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-3 py-2 text-left">
                            Müşteri
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-center">
                            Durum
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-center">
                            Tarih
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-center">
                            Kaynak
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {salespersonLeads
                          .filter((l) => l.leadType === "satis")
                          .slice(0, 10)
                          .map((lead, index) => (
                            <tr key={lead.id || index}>
                              <td className="border border-gray-300 px-3 py-2">
                                {lead.customerName}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-center">
                                <span
                                  className="px-2 py-1 rounded text-xs text-white"
                                  style={{
                                    backgroundColor:
                                      statusConfig[lead.status]?.color ||
                                      "#gray",
                                  }}
                                >
                                  {statusConfig[lead.status]?.label ||
                                    lead.status}
                                </span>
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-center">
                                {lead.requestDate}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-center">
                                {lead.firstCustomerSource || "Bilinmiyor"}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rental" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🏠 Kiralama Lead Dağılımı</CardTitle>
                <CardDescription>
                  Kiralama leadlerinin durum analizi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StandardChart
                  title="Kiralama Performance"
                  data={Object.entries(rentalStats)
                    .filter(([key]) => key !== "total")
                    .map(([key, value]) => ({
                      name: statusConfig[key]?.label || key,
                      value: value as number,
                      percentage: Math.round(
                        ((value as number) / rentalStats.total) * 100
                      ),
                    }))
                    .filter((item) => item.value > 0)}
                  chartType={chartType}
                  height={500}
                />

                {/* Rental Details Table */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4">
                    🏠 Kiralama Lead Detayları
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Status Distribution Table */}
                    <div>
                      <h5 className="font-medium mb-2">Durum Dağılımı</h5>
                      <div className="mb-4">
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={Object.entries(rentalStats)
                                .filter(
                                  ([key]) =>
                                    key !== "total" &&
                                    rentalStats[
                                      key as keyof typeof rentalStats
                                    ] > 0
                                )
                                .map(([key, value]) => ({
                                  name: statusConfig[key]?.label || key,
                                  value: value as number,
                                  percentage:
                                    rentalStats.total > 0
                                      ? (
                                          ((value as number) /
                                            rentalStats.total) *
                                          100
                                        ).toFixed(1)
                                      : "0",
                                }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {Object.entries(rentalStats)
                                .filter(
                                  ([key]) =>
                                    key !== "total" &&
                                    rentalStats[
                                      key as keyof typeof rentalStats
                                    ] > 0
                                )
                                .map(([key], index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      statusConfig[key]?.color ||
                                      getColor("STATUS", key)
                                    }
                                  />
                                ))}
                            </Pie>
                            <Tooltip
                              formatter={(value, name) => [
                                `${value} adet`,
                                name,
                              ]}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 text-sm">
                          <thead>
                            <tr className="bg-orange-50">
                              <th className="border border-gray-300 px-3 py-2 text-left">
                                Durum
                              </th>
                              <th className="border border-gray-300 px-3 py-2 text-center">
                                Adet
                              </th>
                              <th className="border border-gray-300 px-3 py-2 text-center">
                                Adet (Yüzde)
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(rentalStats)
                              .filter(([key]) => key !== "total")
                              .map(([key, value]) => {
                                const percentage =
                                  rentalStats.total > 0
                                    ? (
                                        ((value as number) /
                                          rentalStats.total) *
                                        100
                                      ).toFixed(1)
                                    : "0";
                                if (value === 0) return null;
                                return (
                                  <tr key={key}>
                                    <td className="border border-gray-300 px-3 py-2">
                                      <div className="flex items-center">
                                        <div
                                          className="w-2 h-2 rounded-full mr-2"
                                          style={{
                                            backgroundColor:
                                              statusConfig[key]?.color ||
                                              "#gray",
                                          }}
                                        ></div>
                                        {statusConfig[key]?.label || key}
                                      </div>
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-center">
                                      {value}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-center">
                                      {value} ({percentage}%)
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Lead Source Analysis */}
                    <div>
                      <h5 className="font-medium mb-2">Kaynak Analizi</h5>
                      <div className="mb-4">
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart
                            data={Array.from(
                              new Set(
                                salespersonLeads
                                  .filter((l) => l.leadType === "kiralama")
                                  .map(
                                    (l) => l.firstCustomerSource || "Bilinmiyor"
                                  )
                              )
                            )
                              .map((source) => ({
                                name:
                                  source.length > 12
                                    ? source.substring(0, 12) + "..."
                                    : source,
                                fullName: source,
                                value: salespersonLeads.filter(
                                  (l) =>
                                    l.leadType === "kiralama" &&
                                    (l.firstCustomerSource || "Bilinmiyor") ===
                                      source
                                ).length,
                              }))
                              .sort((a, b) => b.value - a.value)
                              .slice(0, 8)}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="name"
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis />
                            <Tooltip
                              formatter={(value, name, props) => [
                                `${value} adet`,
                                props.payload.fullName,
                              ]}
                            />
                            <Bar dataKey="value" fill="#8b5cf6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 text-sm">
                          <thead>
                            <tr className="bg-purple-50">
                              <th className="border border-gray-300 px-3 py-2 text-left">
                                Kaynak
                              </th>
                              <th className="border border-gray-300 px-3 py-2 text-center">
                                Adet
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from(
                              new Set(
                                salespersonLeads
                                  .filter((l) => l.leadType === "kiralama")
                                  .map(
                                    (l) => l.firstCustomerSource || "Bilinmiyor"
                                  )
                              )
                            )
                              .map((source) => ({
                                source,
                                count: salespersonLeads.filter(
                                  (l) =>
                                    l.leadType === "kiralama" &&
                                    (l.firstCustomerSource || "Bilinmiyor") ===
                                      source
                                ).length,
                              }))
                              .sort((a, b) => b.count - a.count)
                              .map(({ source, count }) => (
                                <tr key={source}>
                                  <td className="border border-gray-300 px-3 py-2">
                                    {source}
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-center">
                                    {count}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Rental Activity */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4">
                    🕒 Son Kiralama Aktiviteleri
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-3 py-2 text-left">
                            Müşteri
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-center">
                            Durum
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-center">
                            Tarih
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-center">
                            Kaynak
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {salespersonLeads
                          .filter((l) => l.leadType === "kiralama")
                          .slice(0, 10)
                          .map((lead, index) => (
                            <tr key={lead.id || index}>
                              <td className="border border-gray-300 px-3 py-2">
                                {lead.customerName}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-center">
                                <span
                                  className="px-2 py-1 rounded text-xs text-white"
                                  style={{
                                    backgroundColor:
                                      statusConfig[lead.status]?.color ||
                                      "#gray",
                                  }}
                                >
                                  {statusConfig[lead.status]?.label ||
                                    lead.status}
                                </span>
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-center">
                                {lead.requestDate}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-center">
                                {lead.firstCustomerSource || "Bilinmiyor"}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Negative Reasons Analysis Chart */}
      {negativeReasonsChartData.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              📊 En Yaygın Olumsuz Nedenler
            </h3>
            <Badge variant="outline" className="text-xs">
              {negativeLeads.length} olumsuz kayıt
            </Badge>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={negativeReasonsChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(1)}%)`
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {negativeReasonsChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                          <p className="font-medium text-gray-900">
                            {data.fullName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {data.value} kayıt (
                            {(
                              (data.value / negativeLeads.length) *
                              100
                            ).toFixed(1)}
                            %)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
