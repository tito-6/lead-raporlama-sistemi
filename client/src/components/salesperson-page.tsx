import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Users,
  TrendingUp,
  Target,
  Clock,
  Phone,
  FileText,
  Eye,
  DollarSign,
  TrendingDown,
  Calculator,
  Calendar,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Lead } from "@shared/schema";
import { DataTable } from "@/components/ui/data-table";
import { StandardChart } from "@/components/charts";
import UniversalFilter, {
  UniversalFilters,
} from "@/components/ui/universal-filter";
import {
  getStandardColor,
  getStatusColor,
  getPersonnelColor,
} from "@/lib/color-system";
import MeetingAnalyticsTab from "./meeting-analytics-tab";

interface SalespersonPageProps {
  salespersonName: string;
}

export default function SalespersonPage({
  salespersonName,
}: SalespersonPageProps) {
  const [filters, setFilters] = useState<UniversalFilters>({
    startDate: "",
    endDate: "",
    month: "",
    year: "",
    leadType: "",
    projectName: "",
    salesRep: "",
    status: "",
  });

  // Fetch leads data
  const { data: allLeads = [] } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  // Get unique projects and statuses for filtering
  const availableProjects = useMemo(() => {
    const projects = allLeads
      .filter((lead) => lead.projectName)
      .map((lead) => lead.projectName!)
      .filter(Boolean);
    return Array.from(new Set(projects));
  }, [allLeads]);

  const availableStatuses = useMemo(() => {
    const statuses = allLeads.map((lead) => lead.status).filter(Boolean);
    return Array.from(new Set(statuses));
  }, [allLeads]);

  // Filter leads for this salesperson
  const filteredLeads = useMemo(() => {
    let leads = allLeads.filter(
      (lead) => lead.assignedPersonnel === salespersonName
    );

    // Apply universal filters
    if (filters.startDate) {
      leads = leads.filter((lead) => {
        const leadDate = new Date(lead.requestDate || lead.createdAt || "");
        return leadDate >= new Date(filters.startDate);
      });
    }

    if (filters.endDate) {
      leads = leads.filter((lead) => {
        const leadDate = new Date(lead.requestDate || lead.createdAt || "");
        return leadDate <= new Date(filters.endDate);
      });
    }

    if (filters.month) {
      leads = leads.filter((lead) => {
        const leadDate = new Date(lead.requestDate || lead.createdAt || "");
        return (
          (leadDate.getMonth() + 1).toString().padStart(2, "0") ===
          filters.month
        );
      });
    }

    if (filters.year && filters.year !== "all-years") {
      leads = leads.filter((lead) => {
        const leadDate = new Date(lead.requestDate || lead.createdAt || "");
        return leadDate.getFullYear().toString() === filters.year;
      });
    }

    if (filters.leadType && filters.leadType !== "all-types") {
      leads = leads.filter((lead) => lead.leadType === filters.leadType);
    }

    if (filters.projectName && filters.projectName !== "all-projects") {
      leads = leads.filter((lead) => lead.projectName === filters.projectName);
    }

    if (filters.status && filters.status !== "all-statuses") {
      leads = leads.filter((lead) => lead.status === filters.status);
    }

    return leads;
  }, [allLeads, salespersonName, filters]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredLeads.length;

    // Debug logging to see actual values
    if (filteredLeads.length > 0) {
      console.log("🔍 DEBUG: Sample lead data for debugging:", {
        salesperson: salespersonName,
        sampleLead: {
          status: filteredLeads[0]?.status,
          wasSaleMade: filteredLeads[0]?.wasSaleMade,
          leadType: filteredLeads[0]?.leadType,
          customerName: filteredLeads[0]?.customerName,
        },
        totalLeads: filteredLeads.length,
        allSalesValues: filteredLeads
          .map((l) => l.wasSaleMade)
          .filter(Boolean)
          .slice(0, 10),
        allStatuses: filteredLeads
          .map((l) => l.status)
          .filter(Boolean)
          .slice(0, 10),
      });
    }

    const satisLeads = filteredLeads.filter(
      (lead) => lead.leadType === "satis"
    );
    const kiralamaLeads = filteredLeads.filter(
      (lead) => lead.leadType === "kiralama"
    );
    const olumsuzLeads = filteredLeads.filter((lead) => {
      const status = lead.status?.toLowerCase() || "";
      return status.includes("olumsuz") || status.includes("negative");
    });
    const takipteLeads = filteredLeads.filter((lead) => {
      const status = lead.status?.toLowerCase() || "";
      return (
        status.includes("takip") ||
        status.includes("follow") ||
        status.includes("potansiyel")
      );
    });
    // Use the same logic as the "👥 Personel Atama ve Durum Özeti" table
    // Count leads where status contains "satış" or "satis"
    const satisYapilanLeads = filteredLeads.filter((lead) => {
      const status = lead.status?.toLowerCase() || "";
      const isSale = status.includes("satış") || status.includes("satis");

      // Debug individual lead
      if (isSale) {
        console.log("✅ SALE FOUND (by status):", {
          customerName: lead.customerName,
          status: lead.status,
          originalStatus: lead.status,
        });
      }

      return isSale;
    });

    const finalStats = {
      total,
      satis: satisLeads.length,
      kiralama: kiralamaLeads.length,
      olumsuz: olumsuzLeads.length,
      takipte: takipteLeads.length,
      satisYapilan: satisYapilanLeads.length,
      conversion:
        total > 0 ? Math.round((satisYapilanLeads.length / total) * 100) : 0,
    };

    // Debug final statistics
    console.log("📊 FINAL STATS for", salespersonName, ":", finalStats);

    return finalStats;
  }, [filteredLeads]);

  // Status distribution for pie chart
  const statusData = useMemo(() => {
    const statusCounts = filteredLeads.reduce((acc, lead) => {
      const status = lead.status || "Belirtilmemiş";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = filteredLeads.length;

    return Object.entries(statusCounts)
      .map(([status, count]) => ({
        name: status,
        value: count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: getStatusColor(status),
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredLeads]);

  // Lead type distribution
  const leadTypeData = useMemo(() => {
    const total = stats.satis + stats.kiralama;
    const typeData = [
      {
        name: "Satılık",
        value: stats.satis,
        percentage: total > 0 ? Math.round((stats.satis / total) * 100) : 0,
        color: getStandardColor("LEAD_TYPE", "Satılık"),
      },
      {
        name: "Kiralık",
        value: stats.kiralama,
        percentage: total > 0 ? Math.round((stats.kiralama / total) * 100) : 0,
        color: getStandardColor("LEAD_TYPE", "Kiralık"),
      },
    ];
    return typeData.filter((item) => item.value > 0);
  }, [stats]);

  // Project distribution with sales data
  const projectData = useMemo(() => {
    const projectStats = filteredLeads.reduce((acc, lead) => {
      const project = lead.projectName || "Belirtilmemiş";
      if (!acc[project]) {
        acc[project] = {
          total: 0,
          sales: 0,
        };
      }
      acc[project].total += 1;

      // Use the same logic as the "👥 Personel Atama ve Durum Özeti" table
      const status = lead.status?.toLowerCase() || "";
      if (status.includes("satış") || status.includes("satis")) {
        acc[project].sales += 1;
      }

      return acc;
    }, {} as Record<string, { total: number; sales: number }>);

    return Object.entries(projectStats)
      .map(([project, stats]) => ({
        name: project.length > 20 ? project.substring(0, 20) + "..." : project,
        fullName: project,
        value: stats.total,
        sales: stats.sales,
        salesRate:
          stats.total > 0 ? Math.round((stats.sales / stats.total) * 100) : 0,
        color: getStandardColor("PROJECT", project),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredLeads]);

  // Recent leads
  const recentLeads = useMemo(() => {
    return filteredLeads
      .sort(
        (a, b) =>
          new Date(b.requestDate || b.createdAt || "").getTime() -
          new Date(a.requestDate || a.createdAt || "").getTime()
      )
      .slice(0, 10);
  }, [filteredLeads]);

  // Fetch expense data for cost analysis - temporarily disabled
  const { data: expenseStats } = useQuery({
    queryKey: ["/api/expense-stats", filters],
    queryFn: async () => {
      // Temporarily return null to avoid API errors
      return null;
      /* 
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await fetch(`/api/expense-stats?${params.toString()}`);
      return response.json();
      */
    },
    enabled: false, // Disable this query temporarily
  });

  // Fetch exchange rate for USD conversions
  const { data: exchangeRate } = useQuery({
    queryKey: ["/api/exchange-rate/usd"],
    queryFn: async () => {
      const response = await fetch("/api/exchange-rate/usd");
      return response.json();
    },
  });

  // Calculate cost metrics for this salesperson
  const costMetrics = useMemo(() => {
    if (!expenseStats || !exchangeRate || expenseStats === null) return null;

    const stats = expenseStats as any; // Type cast for now
    const totalLeads = stats.leadCount || 0;
    const salespersonLeads = filteredLeads.length;
    const totalExpensesTL = stats.expenses?.tl?.totalExpenses || 0;

    // Calculate salesperson's share of total costs based on lead ratio
    const leadRatio = totalLeads > 0 ? salespersonLeads / totalLeads : 0;
    const salespersonCostTL = totalExpensesTL * leadRatio;
    const salespersonCostUSD = salespersonCostTL / exchangeRate.rate;

    // Cost per lead for this salesperson
    const costPerLeadTL =
      salespersonLeads > 0 ? salespersonCostTL / salespersonLeads : 0;
    const costPerLeadUSD =
      salespersonLeads > 0 ? salespersonCostUSD / salespersonLeads : 0;

    // Agency fees and ads expenses breakdown
    const agencyFeesShare =
      (stats.expenses?.tl?.totalAgencyFees || 0) * leadRatio;
    const adsExpensesShare =
      (stats.expenses?.tl?.totalAdsExpenses || 0) * leadRatio;

    return {
      totalCostTL: salespersonCostTL,
      totalCostUSD: salespersonCostUSD,
      costPerLeadTL,
      costPerLeadUSD,
      agencyFeesShare,
      adsExpensesShare,
      leadRatio: leadRatio * 100,
    };
  }, [expenseStats, exchangeRate, filteredLeads.length]);

  const handleFilterChange = (newFilters: UniversalFilters) => {
    setFilters(newFilters);
  };

  // Sales status distribution for detailed analytics
  const salesStatusData = useMemo(() => {
    const salesData = [
      {
        name: "Satış Yapılan",
        value: stats.satisYapilan,
        color: getStandardColor("STATUS", "Satış Yapılan"),
      },
      {
        name: "Satış Yapılmayan",
        value: stats.total - stats.satisYapilan,
        color: getStandardColor("STATUS", "Aktif"),
      },
    ];
    return salesData.filter((item) => item.value > 0);
  }, [stats]);

  // Negative reasons analysis
  const negativeReasonsData = useMemo(() => {
    const negativeLeads = filteredLeads.filter((lead) =>
      lead.status?.includes("Olumsuz")
    );

    const reasonCounts = negativeLeads.reduce((acc, lead) => {
      // Priority: negativeReason -> lastMeetingNote -> responseResult or fallback to "Belirtilmemiş"
      let reason = "Belirtilmemiş";
      if (lead.negativeReason && lead.negativeReason.trim() !== "") {
        reason = lead.negativeReason.trim();
      } else if (lead.lastMeetingNote && lead.lastMeetingNote.trim() !== "") {
        reason = lead.lastMeetingNote.trim();
      } else if (lead.responseResult && lead.responseResult.trim() !== "") {
        reason = lead.responseResult.trim();
      }
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(reasonCounts)
      .map(([reason, count]) => ({
        name: reason.length > 30 ? reason.substring(0, 30) + "..." : reason,
        fullName: reason,
        value: count,
        color: getStandardColor("STATUS", reason),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredLeads]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            {salespersonName}
          </h1>
          <p className="text-sm text-gray-500">Personel Performans Raporu</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {stats.total} toplam lead
        </Badge>
      </div>

      {/* Universal Filters */}
      <UniversalFilter
        onFilterChange={handleFilterChange}
        initialFilters={filters}
        availableProjects={availableProjects}
        availableStatuses={availableStatuses}
        showSalesRepFilter={false}
      />

      {/* Major Performance Analysis Table */}
      <SalespersonPerformanceTable salespersonName={salespersonName} />

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Lead</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground">Bu dönem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satılık Lead</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.satis}
            </div>
            <p className="text-xs text-muted-foreground">
              %
              {stats.total > 0
                ? Math.round((stats.satis / stats.total) * 100)
                : 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kiralık Lead</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.kiralama}
            </div>
            <p className="text-xs text-muted-foreground">
              %
              {stats.total > 0
                ? Math.round((stats.kiralama / stats.total) * 100)
                : 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Takipte</CardTitle>
            <Phone className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.takipte}
            </div>
            <p className="text-xs text-muted-foreground">Aktif takip</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Olumsuz</CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.olumsuz}
            </div>
            <p className="text-xs text-muted-foreground">Olumsuz sonuç</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satış Yapılan</CardTitle>
            <Target className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {stats.satisYapilan}
            </div>
            <p className="text-xs text-muted-foreground">
              %{stats.conversion} dönüşüm
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Target Tracking Section - DISABLED FOR NOW */}
      {/* 
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-6">
        <SalesTargetChart
          leads={filteredLeads}
          salesReps={[{ name: salespersonName, monthlyTarget: 1, isActive: true, id: 1 }]}
          className="h-auto"
        />
      </div>
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-6">
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4" />
              Hedef Analizi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-600">
                  {stats.satisYapilan}
                </div>
                <div className="text-xs text-gray-600">Bu Dönem Satış</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-600">
                  {stats.conversion}%
                </div>
                <div className="text-xs text-gray-600">Dönüşüm Oranı</div>
              </div>
            </div>
            
            {/* Project-based targets */}
            <div className="p-2 bg-gray-50 rounded text-xs">
              <div className="font-medium text-gray-700 mb-1">🎯 Proje Hedefleri:</div>
              <div className="text-gray-600 space-y-0.5">
                <div>• Sanayi Merkezi: Aylık 1 satış</div>
                <div>• Kuyum Merkezi: 2 ayda 1 satış</div>
                <div>• Mevcut Performans: {stats.satisYapilan >= 1 ? "✅ Hedef karşılandı" : "⏳ Hedef bekleniyor"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Analysis Section */}
      {costMetrics && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">💰 Maliyet Analizi</h2>
            <Badge variant="secondary">
              Lead oranı: %{costMetrics.leadRatio.toFixed(1)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Toplam Maliyet (TL)
                </CardTitle>
                <Target className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ₺
                  {costMetrics.totalCostTL.toLocaleString("tr-TR", {
                    maximumFractionDigits: 0,
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Bu personel payı
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Toplam Maliyet (USD)
                </CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  $
                  {costMetrics.totalCostUSD.toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </div>
                <p className="text-xs text-muted-foreground">Dolar olarak</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Lead Başına (TL)
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₺
                  {costMetrics.costPerLeadTL.toLocaleString("tr-TR", {
                    maximumFractionDigits: 0,
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ortalama maliyet
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Lead Başına (USD)
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  $
                  {costMetrics.costPerLeadUSD.toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </div>
                <p className="text-xs text-muted-foreground">Dolar olarak</p>
              </CardContent>
            </Card>
          </div>

          {/* Expense Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Gider Dağılımı (TL)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Ajans Ücretleri:</span>
                    <span className="font-medium">
                      ₺
                      {costMetrics.agencyFeesShare.toLocaleString("tr-TR", {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Reklam Giderleri:</span>
                    <span className="font-medium">
                      ₺
                      {costMetrics.adsExpensesShare.toLocaleString("tr-TR", {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-semibold">Toplam:</span>
                    <span className="font-bold">
                      ₺
                      {costMetrics.totalCostTL.toLocaleString("tr-TR", {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Verimlilik Metrikleri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">ROI (Satış/Maliyet):</span>
                    <span className="font-medium">
                      {stats.satisYapilan > 0
                        ? `%${(
                            (stats.satisYapilan / costMetrics.totalCostTL) *
                            100000
                          ).toFixed(1)}`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Satış Başına Maliyet:</span>
                    <span className="font-medium">
                      {stats.satisYapilan > 0
                        ? `₺${(
                            costMetrics.totalCostTL / stats.satisYapilan
                          ).toLocaleString("tr-TR", {
                            maximumFractionDigits: 0,
                          })}`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Lead Payı:</span>
                    <span className="font-medium">
                      %{costMetrics.leadRatio.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Chart Tabs */}
      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="status">Durum Analizi</TabsTrigger>
          <TabsTrigger value="sales">Satış Analizi</TabsTrigger>
          <TabsTrigger value="negative">Olumsuz Analizi</TabsTrigger>
          <TabsTrigger value="lead-type">Lead Tipi</TabsTrigger>
          <TabsTrigger value="projects">Proje Dağılımı</TabsTrigger>
          <TabsTrigger value="meetings">Toplantı Analizi</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📊 Durum Analizi - Detaylı Özet</CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <>
                  <StandardChart
                    title=""
                    data={statusData}
                    height={500}
                    chartType="pie"
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
                        {statusData.map((item, index) => (
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
                              %{item.percentage}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Bu personel için durum verisi bulunmuyor.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>💰 Satış Analizi - Detaylı Özet</CardTitle>
            </CardHeader>
            <CardContent>
              {salesStatusData.length > 0 ? (
                <>
                  <StandardChart
                    title=""
                    data={salesStatusData}
                    height={500}
                    chartType="pie"
                    showDataTable={false}
                    className="[&_.grid]:!grid-cols-1 [&_.space-y-4]:!hidden mb-6"
                  />
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                            Satış Durumu
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
                        {salesStatusData.map((item, index) => (
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
                              %{((item.value / stats.total) * 100).toFixed(1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-green-700">
                        Toplam Satış
                      </div>
                      <div className="text-2xl font-bold text-green-900">
                        {stats.satisYapilan}
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-blue-700">
                        Dönüşüm Oranı
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        %{stats.conversion}
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-purple-700">
                        Toplam Lead
                      </div>
                      <div className="text-2xl font-bold text-purple-900">
                        {stats.total}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Bu personel için satış verisi bulunmuyor.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="negative" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>❌ Olumsuz Analizi - Detaylı Sebep Analizi</CardTitle>
            </CardHeader>
            <CardContent>
              {negativeReasonsData.length > 0 ? (
                <>
                  <StandardChart
                    title=""
                    data={negativeReasonsData}
                    height={500}
                    chartType="bar"
                    showDataTable={false}
                    className="[&_.grid]:!grid-cols-1 [&_.space-y-4]:!hidden mb-6"
                  />
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                            Olumsuz Sebep
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
                        {negativeReasonsData.map((item, index) => (
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
                                <span title={item.fullName}>
                                  {item.fullName || item.name}
                                </span>
                              </div>
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-center font-medium">
                              {item.value}
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-center">
                              %{((item.value / stats.olumsuz) * 100).toFixed(1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-red-700">
                        Toplam Olumsuz
                      </div>
                      <div className="text-2xl font-bold text-red-900">
                        {stats.olumsuz}
                      </div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-orange-700">
                        Olumsuz Oranı
                      </div>
                      <div className="text-2xl font-bold text-orange-900">
                        %
                        {stats.total > 0
                          ? Math.round((stats.olumsuz / stats.total) * 100)
                          : 0}
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-blue-700">
                        Toplam Lead
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        {stats.total}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Bu personel için olumsuz lead bulunmuyor.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lead-type" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🏠 Lead Tipi Dağılımı - Detaylı Analiz</CardTitle>
            </CardHeader>
            <CardContent>
              {leadTypeData.length > 0 ? (
                <>
                  <StandardChart
                    title=""
                    data={leadTypeData}
                    height={500}
                    chartType="pie"
                    showDataTable={false}
                    className="[&_.grid]:!grid-cols-1 [&_.space-y-4]:!hidden mb-6"
                  />
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                            Lead Tipi
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
                        {leadTypeData.map((item, index) => (
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
                              %{item.percentage}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Bu personel için lead tipi verisi bulunmuyor.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🏢 Proje Dağılımı - Satış Analizi</CardTitle>
            </CardHeader>
            <CardContent>
              {projectData.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Lead Count Chart */}
                    <div>
                      <h4 className="font-medium text-sm mb-3">
                        Proje Başına Lead Sayısı
                      </h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={projectData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={12}
                          />
                          <YAxis />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = projectData.find(
                                  (item) => item.name === label
                                );
                                return (
                                  <div className="bg-white p-3 border rounded shadow">
                                    <p className="font-medium">
                                      {data?.fullName}
                                    </p>
                                    <p className="text-blue-600">
                                      Toplam Lead: {payload[0].value}
                                    </p>
                                    <p className="text-green-600">
                                      Satış: {data?.sales}
                                    </p>
                                    <p className="text-purple-600">
                                      Satış Oranı: %{data?.salesRate}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="value" fill="#8884d8">
                            {projectData.map((entry, index) => (
                              <Cell
                                key={`project-${index}`}
                                fill={entry.color}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Sales Chart */}
                    <div>
                      <h4 className="font-medium text-sm mb-3">
                        Proje Başına Satış Sayısı
                      </h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={projectData.filter((item) => item.sales > 0)}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={12}
                          />
                          <YAxis />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = projectData.find(
                                  (item) => item.name === label
                                );
                                return (
                                  <div className="bg-white p-3 border rounded shadow">
                                    <p className="font-medium">
                                      {data?.fullName}
                                    </p>
                                    <p className="text-green-600">
                                      Satış: {payload[0].value}
                                    </p>
                                    <p className="text-blue-600">
                                      Toplam Lead: {data?.value}
                                    </p>
                                    <p className="text-purple-600">
                                      Satış Oranı: %{data?.salesRate}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="sales" fill="#10b981">
                            {projectData.map((entry, index) => (
                              <Cell key={`sales-${index}`} fill="#10b981" />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Detailed Data Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                            Proje
                          </th>
                          <th className="border border-gray-200 px-4 py-2 text-center font-medium">
                            Toplam Lead
                          </th>
                          <th className="border border-gray-200 px-4 py-2 text-center font-medium">
                            Satış Yapılan
                          </th>
                          <th className="border border-gray-200 px-4 py-2 text-center font-medium">
                            Satış Oranı
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectData.map((item, index) => (
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
                                <span title={item.fullName}>
                                  {item.fullName}
                                </span>
                              </div>
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-center font-medium">
                              {item.value}
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-center">
                              <span className="font-semibold text-green-600">
                                {item.sales}
                              </span>
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-center">
                              <span
                                className={`font-semibold ${
                                  item.salesRate >= 50
                                    ? "text-green-600"
                                    : item.salesRate >= 25
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                              >
                                %{item.salesRate}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-blue-700">
                        Toplam Proje
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        {projectData.length}
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-green-700">
                        Toplam Satış
                      </div>
                      <div className="text-2xl font-bold text-green-900">
                        {projectData.reduce((sum, item) => sum + item.sales, 0)}
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-purple-700">
                        Ortalama Satış Oranı
                      </div>
                      <div className="text-2xl font-bold text-purple-900">
                        %
                        {projectData.length > 0
                          ? Math.round(
                              projectData.reduce(
                                (sum, item) => sum + item.salesRate,
                                0
                              ) / projectData.length
                            )
                          : 0}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Bu personel için proje verisi bulunmuyor.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📅 Toplantı Analizi - Detaylı Rapor</CardTitle>
            </CardHeader>
            <CardContent>
              <MeetingAnalyticsTab
                filters={{
                  startDate: filters.startDate,
                  endDate: filters.endDate,
                  month: filters.month,
                  year: filters.year,
                  salesRep: salespersonName,
                  leadType: filters.leadType,
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// SalespersonPerformanceTable Component
interface SalespersonPerformanceTableProps {
  salespersonName: string;
}

const SalespersonPerformanceTable: React.FC<
  SalespersonPerformanceTableProps
> = ({ salespersonName }) => {
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, [salespersonName]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/salesperson-performance/${encodeURIComponent(salespersonName)}`
      );
      const data = await response.json();
      setPerformanceData(data);
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Performans Analizi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Performans verileri yükleniyor...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!performanceData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Performans Analizi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Performans verisi bulunamadı.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${Math.round(rate * 100)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-600" />
          Kapsamlı Performans Analizi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metrik</TableHead>
                <TableHead className="text-right">Değer</TableHead>
                <TableHead className="text-right">Oran</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    Toplam Lead Sayısı
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {performanceData.totalLeads.toLocaleString("tr-TR")}
                </TableCell>
                <TableCell className="text-right text-gray-500">-</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <div>
                      <div>Satış Yapılan Lead</div>
                      <div className="text-xs text-gray-500 font-normal">
                        (Toplam leadlerin %
                        {performanceData.totalLeads > 0
                          ? Math.round(
                              (performanceData.totalSales /
                                performanceData.totalLeads) *
                                100
                            )
                          : 0}
                        )
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {performanceData.totalSales.toLocaleString("tr-TR")} /{" "}
                  {performanceData.totalLeads.toLocaleString("tr-TR")}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`font-semibold ${
                      performanceData.salesConversionRate > 0.1
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {formatPercentage(performanceData.salesConversionRate)}
                  </span>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <div>
                      <div>Toplantı Yapılan Lead</div>
                      <div className="text-xs text-gray-500 font-normal">
                        (1000 leadden{" "}
                        {Math.round(
                          (performanceData.meetingConversionRate || 0) * 1000
                        )}{" "}
                        toplantı)
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {performanceData.totalMeetings.toLocaleString("tr-TR")} /{" "}
                  {performanceData.totalLeads.toLocaleString("tr-TR")}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`font-semibold ${
                      performanceData.meetingConversionRate > 0.2
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {formatPercentage(performanceData.meetingConversionRate)}
                  </span>
                </TableCell>
              </TableRow>

              <TableRow className="border-t-2 border-gray-200">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-orange-500" />
                    Toplam Maliyet
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-orange-600">
                  {formatCurrency(performanceData.totalCost)}
                </TableCell>
                <TableCell className="text-right text-gray-500">-</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    Lead Başına Maliyet
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-red-600">
                  {formatCurrency(performanceData.costPerLead)}
                </TableCell>
                <TableCell className="text-right text-gray-500">-</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-indigo-500" />
                    Satış Başına Maliyet
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-indigo-600">
                  {performanceData.totalSales > 0
                    ? formatCurrency(performanceData.costPerSale)
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right text-gray-500">-</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Toplantı Başına Maliyet
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-blue-600">
                  {performanceData.totalMeetings > 0
                    ? formatCurrency(performanceData.costPerMeeting)
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right text-gray-500">-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <p>
            • <strong>Satış Dönüşüm Oranı:</strong> Toplam leadlerin yüzde
            kaçının satışla sonuçlandığını gösterir
          </p>
          <p>
            • <strong>Önemli:</strong> Backend satış sayımı frontend'den farklı
            olabilir (backend hem status hem wasSaleMade alanlarını kontrol
            eder)
          </p>
          <p>
            • Maliyet hesaplaması: Bu personele atanan lead oranına göre
            giderler dağıtılmıştır
          </p>
          <p>• Veriler mevcut filtrelere göre hesaplanmıştır</p>
        </div>
      </CardContent>
    </Card>
  );
};
