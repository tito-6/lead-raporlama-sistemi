import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Filter,
  BarChart3,
  TrendingUp,
  Users,
  BarChart,
  PieChart,
  LineChart,
  Building,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLeads, useSalesReps } from "@/hooks/use-leads";
import { createChart } from "@/lib/chart-utils";
import StandardChart from "@/components/charts/StandardChart";
import DateFilter from "@/components/ui/date-filter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MeetingAnalyticsTab from "./meeting-analytics-tab";
import { TargetAudienceAnalyticsTab } from "./target-audience-analytics-tab";
import { ArtworkAnalyticsTab } from "./artwork-analytics-tab";
import { MarketingAnalyticsTab } from "./marketing-analytics-tab";
import type { Lead, SalesRep } from "@shared/schema";
import ProjectFilter from "./project-filter";

interface ReportFilters {
  startDate: string;
  endDate: string;
  month: string;
  year: string;
  salesRep: string;
  leadType: string;
  project: string; // Add project filter
}

export default function ReportsTab() {
  const { data: salesReps = [] } = useSalesReps();
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: "",
    endDate: "",
    month: "",
    year: "",
    salesRep: "",
    leadType: "",
    project: "all", // Default to all projects
  });

  const [selectedPersonnel, setSelectedPersonnel] = useState<string>("");

  // Handle date filter changes
  const handleDateFilterChange = (dateFilters: {
    startDate: string;
    endDate: string;
    month: string;
    year: string;
  }) => {
    setFilters((prev) => ({
      ...prev,
      ...dateFilters,
    }));
  };

  // Add handler for project filter
  const handleProjectChange = (project: string) => {
    setFilters((prev) => ({ ...prev, project }));
  };

  const { data: filteredLeads = [] } = useQuery({
    queryKey: ["/api/leads", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== "project") params.append(key, value);
      });
      // Fetch all leads, then filter by project client-side
      const response = await fetch(`/api/leads?${params.toString()}`);
      let leads = await response.json();
      if (filters.project && filters.project !== "all") {
        // Use the project detector to filter leads by project
        const { filterLeadsByProject } = await import("@/lib/project-detector");
        leads = filterLeadsByProject(leads, filters.project);
      }
      return leads;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await fetch(`/api/stats?${params.toString()}`);
      return response.json();
    },
  });

  // Filter leads by type
  const rentalLeads = filteredLeads.filter(
    (lead: any) => lead.leadType === "kiralama"
  );
  const salesLeads = filteredLeads.filter(
    (lead: any) => lead.leadType === "satis"
  );

  // Calculate statistics with unique keys
  const calculateStats = (leads: any[]) => {
    const total = leads.length;
    if (total === 0) return [];

    const statusCounts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count], index) => ({
      id: `${status}-${index}`, // Unique identifier
      status:
        status === "bilgi-verildi"
          ? "Bilgi Verildi"
          : status === "olumsuz"
          ? "Olumsuz"
          : status === "satis"
          ? "Satış"
          : status === "takipte"
          ? "Takipte"
          : status === "toplanti"
          ? "Toplantı"
          : status === "potansiyel"
          ? "Potansiyel"
          : status || "Tanımsız",
      originalStatus: status, // Keep original for debugging
      count: count as number,
      percentage: Math.round(((count as number) / total) * 100),
    }));
  };

  const rentalStats = calculateStats(rentalLeads);
  const salesStats = calculateStats(salesLeads);

  // Generate chart data for Lead Status Distribution (100% sync with Overview)
  const statusChartData = useMemo(() => {
    const statusCounts = filteredLeads.reduce(
      (acc: { [key: string]: number }, lead: any) => {
        const status = lead.status || "Tanımsız";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {}
    );

    const total = filteredLeads.length;
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: Number(count),
      percentage: total > 0 ? Math.round((Number(count) / total) * 100) : 0,
    }));
  }, [filteredLeads]);

  // Generate chart data for Personnel Performance (100% sync with Overview)
  const personnelChartData = useMemo(() => {
    const personnelCounts = filteredLeads.reduce(
      (acc: { [key: string]: number }, lead: any) => {
        const personnel = lead.assignedPersonnel || "Atanmamış";
        acc[personnel] = (acc[personnel] || 0) + 1;
        return acc;
      },
      {}
    );

    const total = filteredLeads.length;
    return Object.entries(personnelCounts).map(([personnel, count]) => ({
      name: personnel,
      value: Number(count),
      percentage: total > 0 ? Math.round((Number(count) / total) * 100) : 0,
    }));
  }, [filteredLeads]);

  // Handle chart click to filter data
  const handleStatusChartClick = (item: { name: string }) => {
    console.log("Status clicked in Reports:", item.name);
  };

  const handlePersonnelChartClick = (item: { name: string }) => {
    setSelectedPersonnel(item.name === selectedPersonnel ? "" : item.name);
  };

  // Calculate progress for each sales rep
  const calculateProgress = () => {
    return salesReps.map((rep) => {
      const repLeads = filteredLeads.filter(
        (lead: any) => lead.salesRep === rep.name && lead.status === "satis"
      );
      const progress = (repLeads.length / rep.monthlyTarget) * 100;

      return {
        ...rep,
        current: repLeads.length,
        progress: Math.min(progress, 100),
      };
    });
  };

  const progressData = calculateProgress();

  // Removed chart effects - now using InteractiveChart components

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    // Convert "all" back to empty string for API calls
    const apiValue = value === "all" ? "" : value;
    setFilters((prev) => ({ ...prev, [key]: apiValue }));
  };

  const applyFilters = () => {
    // Filters are automatically applied through React Query dependency
  };

  return (
    <div className="space-y-6">
      {/* Date Filter and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <DateFilter
            onFilterChange={handleDateFilterChange}
            initialFilters={{
              startDate: filters.startDate,
              endDate: filters.endDate,
              month: filters.month,
              year: filters.year,
            }}
          />
          <Card className="w-full max-w-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4 text-blue-600" />
                Proje Filtresi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectFilter
                value={filters.project}
                onChange={handleProjectChange}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Diğer Filtreler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salesRep">Satış Temsilcisi</Label>
                  <Select
                    value={filters.salesRep || "all"}
                    onValueChange={(value) =>
                      handleFilterChange("salesRep", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tümü" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {salesReps.map((rep) => (
                        <SelectItem key={rep.id} value={rep.name}>
                          {rep.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="leadType">Lead Tipi</Label>
                  <Select
                    value={filters.leadType || "all"}
                    onValueChange={(value) =>
                      handleFilterChange("leadType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tümü" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="kiralama">Kiralama</SelectItem>
                      <SelectItem value="satis">Satış</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid gap-6">
        {/* Lead Status Distribution Chart */}
        <StandardChart
          title="Filtrelenmiş Lead - Durum Dağılımı (SON GORUSME SONUCU)"
          data={statusChartData}
          onItemClick={handleStatusChartClick}
          height={350}
          chartType="3d-pie"
          showDataTable={true}
          showBadge={true}
          badgeText={`${filteredLeads.length} Lead`}
          gradientColors={["from-blue-50", "to-indigo-100"]}
          borderColor="border-blue-100 dark:border-blue-800"
          description="Filtrelenmiş lead verilerinin durum analizi"
          icon="📊"
          tableTitle="Durum Detayları"
        />

        {/* Personnel Lead Distribution Chart */}
        <StandardChart
          title="Filtrelenmiş Personel - Lead Dağılımı (Atanan Personel)"
          data={personnelChartData}
          onItemClick={handlePersonnelChartClick}
          height={350}
          chartType="bar"
          showDataTable={true}
          showBadge={true}
          badgeText={`${personnelChartData.length} Personel`}
          gradientColors={["from-green-50", "to-emerald-100"]}
          borderColor="border-green-100 dark:border-green-800"
          description="Personel bazında lead dağılımı"
          icon="👨‍💼"
          tableTitle="Personel Detayları"
        />

        {/* Lead Type Distribution Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Kiralama Lead Dağılımı ({rentalLeads.length} toplam)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rentalStats.map((stat) => (
                  <div
                    key={stat.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">{stat.status}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{stat.count}</span>
                      <Progress value={stat.percentage} className="w-20 h-2" />
                      <span className="text-sm text-muted-foreground">
                        {stat.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Satış Lead Dağılımı ({salesLeads.length} toplam)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {salesStats.map((stat) => (
                  <div
                    key={stat.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">{stat.status}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{stat.count}</span>
                      <Progress value={stat.percentage} className="w-20 h-2" />
                      <span className="text-sm text-muted-foreground">
                        {stat.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Report Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kiralama Report */}
        <Card>
          <CardHeader>
            <CardTitle>Kiralama Lead Raporu</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Durum</TableHead>
                  <TableHead>Adet</TableHead>
                  <TableHead>%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rentalStats.length > 0 ? (
                  rentalStats.map((stat, index) => (
                    <TableRow key={index}>
                      <TableCell>{stat.status}</TableCell>
                      <TableCell>{stat.count}</TableCell>
                      <TableCell>{stat.percentage}%</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-gray-500"
                    >
                      Veri bulunamadı
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Satış Report */}
        <Card>
          <CardHeader>
            <CardTitle>Satış Lead Raporu</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Durum</TableHead>
                  <TableHead>Adet</TableHead>
                  <TableHead>%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesStats.length > 0 ? (
                  salesStats.map((stat, index) => (
                    <TableRow key={index}>
                      <TableCell>{stat.status}</TableCell>
                      <TableCell>{stat.count}</TableCell>
                      <TableCell>{stat.percentage}%</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-gray-500"
                    >
                      Veri bulunamadı
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Progress Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Aylık Hedef Takibi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {progressData.map((rep) => (
              <div
                key={rep.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{rep.name}</h4>
                  <span className="text-sm text-gray-500">
                    {rep.current}/{rep.monthlyTarget}
                  </span>
                </div>
                <Progress value={rep.progress} className="mb-2" />
                <p className="text-xs text-gray-600">
                  Hedef: {rep.monthlyTarget} satış
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Tabs - New Section */}
      <Card>
        <CardHeader>
          <CardTitle>Detaylı Analizler</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="meeting" className="space-y-4">
            <TabsList>
              <TabsTrigger value="meeting">Toplantı Analizi</TabsTrigger>
              <TabsTrigger value="target-audience">
                Hedef Kitle Analizi
              </TabsTrigger>
              <TabsTrigger value="artwork">Tasarım Analizi</TabsTrigger>
              <TabsTrigger value="marketing">Pazarlama Analizi</TabsTrigger>
            </TabsList>

            <TabsContent value="meeting">
              <MeetingAnalyticsTab filters={filters} />
            </TabsContent>
            <TabsContent value="target-audience">
              <TargetAudienceAnalyticsTab filters={filters} />
            </TabsContent>
            <TabsContent value="artwork">
              <ArtworkAnalyticsTab filters={filters} />
            </TabsContent>
            <TabsContent value="marketing">
              <MarketingAnalyticsTab filters={filters} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
