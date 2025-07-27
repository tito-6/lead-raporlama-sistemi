import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useQuery } from "@tanstack/react-query";
import { Lead, SalesRep } from "@shared/schema";
import {
  Calendar,
  Filter,
  Users,
  TrendingUp,
  Target,
  BarChart3,
} from "lucide-react";
import StandardChart from "@/components/charts/StandardChart";

// Status definitions with colors matching the screenshot
const statusConfig = {
  ulasilamiyor: {
    label: "Ulaşılmıyor - Cevap Yok",
    color: "#ff9800",
    bgColor: "bg-orange-100",
  },
  yeni: { label: "Aranmayan Lead", color: "#2196f3", bgColor: "bg-blue-100" },
  bilgi_hatali: {
    label: "Ulaşılmıyor - Bilgi Hatalı",
    color: "#9c27b0",
    bgColor: "bg-purple-100",
  },
  takipte: {
    label: "Potansiyel Takipte",
    color: "#ffeb3b",
    bgColor: "bg-yellow-100",
  },
  olumsuz: { label: "Olumsuz", color: "#f44336", bgColor: "bg-red-100" },
  toplanti: {
    label: "RANDEVU",
    color: "#3f51b5",
    bgColor: "bg-indigo-100",
  },
  musaitDegil: {
    label: "Müsait Değil",
    color: "#795548",
    bgColor: "bg-amber-100",
  },
  satildi: { label: "Satış", color: "#4caf50", bgColor: "bg-green-100" },
};

interface SalesPersonStats {
  personel: string;
  toplamLead: number;
  ulasilmiyorCevapYok: number;
  aranmayanLead: number;
  ulasilmiyorBilgiHatali: number;
  bilgiVerildiTekrarAranacak: number;
  olumsuz: number;
  toplantiBirebirGorusme: number;
  potansiyelTakipte: number;
  satis: number;
  target: number;
  percentage: number;
}

export default function OverviewDashboardTab() {
  const [dateFilters, setDateFilters] = useState({
    startDate: "",
    endDate: "",
    month: "",
    year: "",
  });

  const [selectedPersonnel, setSelectedPersonnel] = useState<string>("");
  const [chartType, setChartType] = useState<"pie" | "bar" | "line">("pie");

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

  const { data: stats } = useQuery({
    queryKey: ["/api/stats", dateFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(dateFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await fetch(`/api/stats?${params.toString()}`);
      return response.json();
    },
  });

  const { data: uniqueStatuses = [] } = useQuery<string[]>({
    queryKey: ["/api/status-values"],
  });

  // Calculate statistics per salesperson with dynamic status handling
  const salesPersonStats: SalesPersonStats[] = salesReps.map((rep) => {
    const repLeads = leads.filter(
      (lead) => lead.assignedPersonnel === rep.name
    );

    const stats = {
      personel: rep.name,
      toplamLead: repLeads.length,
      ulasilmiyorCevapYok: 0,
      aranmayanLead: 0,
      ulasilmiyorBilgiHatali: 0,
      bilgiVerildiTekrarAranacak: 0,
      olumsuz: 0,
      toplantiBirebirGorusme: 0,
      potansiyelTakipte: 0,
      satis: 0,
      target: rep.monthlyTarget || 10,
      percentage: 0,
    };

    // Enhanced dynamic status categorization from SON GORUSME SONUCU
    repLeads.forEach((lead) => {
      const status = (lead.status || "").toLowerCase();

      if (
        status.includes("ulaş") &&
        (status.includes("cevap") || status.includes("yok"))
      ) {
        stats.ulasilmiyorCevapYok++;
      } else if (
        status.includes("aranmayan") ||
        status.includes("çağrılmadı") ||
        status === "tanımsız"
      ) {
        stats.aranmayanLead++;
      } else if (status.includes("bilgi") && status.includes("hatalı")) {
        stats.ulasilmiyorBilgiHatali++;
      } else if (
        status.includes("bilgi") &&
        (status.includes("verildi") || status.includes("aranacak"))
      ) {
        stats.bilgiVerildiTekrarAranacak++;
      } else if (
        status.includes("olumsuz") ||
        status.includes("red") ||
        status.includes("hayır")
      ) {
        stats.olumsuz++;
      } else if (
        status.includes("toplantı") ||
        status.includes("görüşme") ||
        status.includes("meeting")
      ) {
        stats.toplantiBirebirGorusme++;
      } else if (
        status.includes("takip") ||
        status.includes("potansiyel") ||
        status.includes("devam")
      ) {
        stats.potansiyelTakipte++;
      } else if (
        status.includes("satış") ||
        status.includes("satis") ||
        status.includes("başarılı") ||
        status.includes("evet")
      ) {
        stats.satis++;
      }
    });

    stats.percentage =
      stats.target > 0 ? Math.round((stats.satis / stats.target) * 100) : 0;

    return stats;
  });

  // Generate chart data for Lead Status Distribution
  const statusChartData = useMemo(() => {
    const statusCounts = leads.reduce(
      (acc: { [key: string]: number }, lead) => {
        const status = lead.status || "Tanımsız";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {}
    );

    const total = leads.length;
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  }, [leads]);

  // Generate chart data for Personnel Performance
  const personnelChartData = useMemo(() => {
    const personnelCounts = leads.reduce(
      (acc: { [key: string]: number }, lead) => {
        const personnel = lead.assignedPersonnel || "Atanmamış";
        acc[personnel] = (acc[personnel] || 0) + 1;
        return acc;
      },
      {}
    );

    const total = leads.length;
    return Object.entries(personnelCounts).map(([personnel, count]) => ({
      name: personnel,
      value: count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  }, [leads]);

  // Handle chart click to filter data
  const handleStatusChartClick = (item: { name: string }) => {
    console.log("Status clicked:", item.name);
  };

  const handlePersonnelChartClick = (item: { name: string }) => {
    setSelectedPersonnel(item.name === selectedPersonnel ? "" : item.name);
  };

  // Filter sales person stats based on selection
  const filteredSalesPersonStats = selectedPersonnel
    ? salesPersonStats.filter((stat) => stat.personel === selectedPersonnel)
    : salesPersonStats;

  // Calculate totals
  const totals = {
    personel: "TOPLAM",
    toplamLead: salesPersonStats.reduce((sum, s) => sum + s.toplamLead, 0),
    ulasilmiyorCevapYok: salesPersonStats.reduce(
      (sum, s) => sum + s.ulasilmiyorCevapYok,
      0
    ),
    aranmayanLead: salesPersonStats.reduce(
      (sum, s) => sum + s.aranmayanLead,
      0
    ),
    ulasilmiyorBilgiHatali: salesPersonStats.reduce(
      (sum, s) => sum + s.ulasilmiyorBilgiHatali,
      0
    ),
    bilgiVerildiTekrarAranacak: salesPersonStats.reduce(
      (sum, s) => sum + s.bilgiVerildiTekrarAranacak,
      0
    ),
    olumsuz: salesPersonStats.reduce((sum, s) => sum + s.olumsuz, 0),
    toplantiBirebirGorusme: salesPersonStats.reduce(
      (sum, s) => sum + s.toplantiBirebirGorusme,
      0
    ),
    potansiyelTakipte: salesPersonStats.reduce(
      (sum, s) => sum + s.potansiyelTakipte,
      0
    ),
    satis: salesPersonStats.reduce((sum, s) => sum + s.satis, 0),
    target: salesPersonStats.reduce((sum, s) => sum + s.target, 0),
    percentage: 0,
  };

  totals.percentage =
    totals.target > 0 ? Math.round((totals.satis / totals.target) * 100) : 0;

  // Dynamic pie chart data based on actual status values from SON GORUSME SONUCU
  const pieChartData =
    stats?.byStatusWithPercentages?.map(
      (
        item: { status: string; count: number; percentage: number },
        index: number
      ) => ({
        name: item.status,
        value: item.count,
        percentage: item.percentage,
        color: getStatusColor(item.status, index),
      })
    ) || [];

  function getStatusColor(status: string, index: number): string {
    const colorPalette = [
      "#4caf50",
      "#f44336",
      "#ff9800",
      "#2196f3",
      "#9c27b0",
      "#ffeb3b",
      "#3f51b5",
      "#00bcd4",
      "#4caf50",
      "#795548",
    ];

    // Map common status types to specific colors
    const statusColors: Record<string, string> = {
      satildi: "#4caf50",
      satış: "#4caf50",
      başarılı: "#4caf50",
      olumsuz: "#f44336",
      takipte: "#ff9800",
      takip: "#ff9800",
      devam: "#ff9800",
      yeni: "#2196f3",
      toplanti: "#3f51b5",
      randevu: "#3f51b5",
      ulasilamiyor: "#9c27b0",
      "bilgi-verildi": "#00bcd4",
    };

    const statusLower = status.toLowerCase();
    for (const [key, color] of Object.entries(statusColors)) {
      if (statusLower.includes(key)) {
        return color;
      }
    }

    return colorPalette[index % colorPalette.length];
  }

  const clearFilters = () => {
    setDateFilters({
      startDate: "",
      endDate: "",
      month: "",
      year: "",
    });
  };

  const setMonthFilter = (month: string, year: string) => {
    setDateFilters((prev) => ({
      ...prev,
      month,
      year,
      startDate: "",
      endDate: "",
    }));
  };

  const setDateRangeFilter = (startDate: string, endDate: string) => {
    setDateFilters((prev) => ({
      ...prev,
      startDate,
      endDate,
      month: "",
      year: "",
    }));
  };

  return (
    <div className="space-y-6">
      {/* Date Filtering Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tarih Filtreleme (Talep Geliş Tarihi)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>Başlangıç Tarihi</Label>
              <Input
                type="date"
                value={dateFilters.startDate}
                onChange={(e) =>
                  setDateRangeFilter(e.target.value, dateFilters.endDate)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Bitiş Tarihi</Label>
              <Input
                type="date"
                value={dateFilters.endDate}
                onChange={(e) =>
                  setDateRangeFilter(dateFilters.startDate, e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Ay Seçimi</Label>
              <Select
                value={dateFilters.month}
                onValueChange={(month) =>
                  setMonthFilter(month, dateFilters.year || "2025")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ay seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Ocak</SelectItem>
                  <SelectItem value="2">Şubat</SelectItem>
                  <SelectItem value="3">Mart</SelectItem>
                  <SelectItem value="4">Nisan</SelectItem>
                  <SelectItem value="5">Mayıs</SelectItem>
                  <SelectItem value="6">Haziran</SelectItem>
                  <SelectItem value="7">Temmuz</SelectItem>
                  <SelectItem value="8">Ağustos</SelectItem>
                  <SelectItem value="9">Eylül</SelectItem>
                  <SelectItem value="10">Ekim</SelectItem>
                  <SelectItem value="11">Kasım</SelectItem>
                  <SelectItem value="12">Aralık</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={clearFilters} variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Temizle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {totals.toplamLead}
            </div>
            <div className="text-sm text-muted-foreground">Toplam Lead</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {totals.olumsuz}
            </div>
            <div className="text-sm text-muted-foreground">Olumsuz</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {totals.potansiyelTakipte}
            </div>
            <div className="text-sm text-muted-foreground">Takipte</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {totals.satis}
            </div>
            <div className="text-sm text-muted-foreground">Satış</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Personel Performans Tablosu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Personel</th>
                    <th className="text-center p-2 bg-gray-100">Toplam</th>
                    <th className="text-center p-2 bg-orange-100">Cevap Yok</th>
                    <th className="text-center p-2 bg-blue-100">Aranmayan</th>
                    <th className="text-center p-2 bg-red-100">Olumsuz</th>
                    <th className="text-center p-2 bg-yellow-100">Takipte</th>
                    <th className="text-center p-2 bg-green-100">Satış</th>
                    <th className="text-center p-2">Hedef %</th>
                  </tr>
                </thead>
                <tbody>
                  {salesPersonStats.map((stats, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{stats.personel}</td>
                      <td className="text-center p-2 bg-gray-50">
                        {stats.toplamLead}
                      </td>
                      <td className="text-center p-2 bg-orange-50">
                        {stats.ulasilmiyorCevapYok}
                      </td>
                      <td className="text-center p-2 bg-blue-50">
                        {stats.aranmayanLead}
                      </td>
                      <td className="text-center p-2 bg-red-50">
                        {stats.olumsuz}
                      </td>
                      <td className="text-center p-2 bg-yellow-50">
                        {stats.potansiyelTakipte}
                      </td>
                      <td className="text-center p-2 bg-green-50">
                        {stats.satis}
                      </td>
                      <td className="text-center p-2">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={stats.percentage}
                            className="w-16 h-2"
                          />
                          <span className="text-xs">{stats.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-b-2 border-gray-300 bg-gray-100 font-bold">
                    <td className="p-2">{totals.personel}</td>
                    <td className="text-center p-2">{totals.toplamLead}</td>
                    <td className="text-center p-2">
                      {totals.ulasilmiyorCevapYok}
                    </td>
                    <td className="text-center p-2">{totals.aranmayanLead}</td>
                    <td className="text-center p-2">{totals.olumsuz}</td>
                    <td className="text-center p-2">
                      {totals.potansiyelTakipte}
                    </td>
                    <td className="text-center p-2">{totals.satis}</td>
                    <td className="text-center p-2">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={totals.percentage}
                          className="w-16 h-2"
                        />
                        <span className="text-xs">{totals.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Chart - Lead Status Distribution */}
        <StandardChart
          title="Toplam Lead - Durum Dağılımı (SON GORUSME SONUCU)"
          data={statusChartData}
          onItemClick={handleStatusChartClick}
          height={350}
          chartType={chartType === "pie" ? "3d-pie" : chartType}
          allowTypeChange={true}
          showDataTable={true}
          showBadge={true}
          badgeText={`${statusChartData.reduce(
            (sum, item) => sum + item.value,
            0
          )} Lead`}
          gradientColors={["from-blue-50", "to-indigo-100"]}
          borderColor="border-blue-100 dark:border-blue-800"
          description="Lead durumlarının genel dağılımı"
          icon="📊"
          tableTitle="Durum Detayları"
        />

        {/* Interactive Chart - Personnel Distribution */}
        <StandardChart
          title="Personel Başına Lead Dağılımı (Atanan Personel)"
          data={personnelChartData}
          onItemClick={handlePersonnelChartClick}
          height={350}
          chartType={chartType === "pie" ? "3d-pie" : chartType}
          allowTypeChange={true}
          showDataTable={true}
          showBadge={true}
          badgeText={`${personnelChartData.reduce(
            (sum, item) => sum + item.value,
            0
          )} Lead`}
          gradientColors={["from-green-50", "to-emerald-100"]}
          borderColor="border-green-100 dark:border-green-800"
          description="Personel bazında lead dağılımı"
          icon="👨‍💼"
          tableTitle="Personel Detayları"
        />
      </div>

      {/* Sales Target Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Satış Hedefi İlerlemesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {salesPersonStats.map((stats, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="font-medium mb-2">{stats.personel}</div>
                <div className="text-2xl font-bold mb-1">
                  {stats.satis} / {stats.target}
                </div>
                <Progress value={stats.percentage} className="mb-2" />
                <div className="text-sm text-muted-foreground">
                  {stats.percentage}% Tamamlandı
                </div>
                <Badge
                  variant={
                    stats.percentage >= 100
                      ? "default"
                      : stats.percentage >= 75
                      ? "secondary"
                      : "outline"
                  }
                  className="mt-2"
                >
                  {stats.percentage >= 100
                    ? "Hedef Aşıldı"
                    : stats.percentage >= 75
                    ? "Hedefe Yakın"
                    : "Devam Ediyor"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
