import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  DollarSign,
  TrendingUp,
  Users,
  Calculator,
  Receipt,
  Building,
  Megaphone,
} from "lucide-react";
import { LeadExpense } from "@shared/schema";
import DateFilter from "@/components/ui/date-filter";
import ProjectFilter from "@/components/project-filter";
import { filterLeadsByProject } from "@/lib/project-detector";

interface ExpenseStats {
  leadCount: number;
  expenses: {
    tl: {
      totalAgencyFees: number;
      totalAdsExpenses: number;
      totalExpenses: number;
    };
    usd: {
      totalExpenses: number;
      avgCostPerLead: number;
    };
  };
  exchangeRate: {
    rate: number;
    lastUpdated: string;
  };
}

interface ExchangeRateInfo {
  rate: number;
  buyingRate: number;
  sellingRate: number;
  lastUpdated: string;
  source: string;
}

export default function MainLeadReport() {
  const [dateFilters, setDateFilters] = useState({
    startDate: "",
    endDate: "",
    month: "",
    year: "",
  });

  // Add project filter state
  const [projectFilter, setProjectFilter] = useState<string>("all");

  // Fetch all leads for robust project filtering
  const { data: allLeads = [], isLoading: leadsLoading } = useQuery({
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

  // Apply robust project filtering to allLeads
  const filteredLeads = filterLeadsByProject(allLeads, projectFilter);

  // Calculate leadCount and other metrics from filteredLeads
  const leadCount = filteredLeads.length;

  // Fetch lead expense statistics with date filtering
  const { data: expenseStats, isLoading: expenseLoading } =
    useQuery<ExpenseStats>({
      queryKey: ["/api/lead-expenses/stats", dateFilters, projectFilter], // Add projectFilter to the query key
      queryFn: async () => {
        const params = new URLSearchParams();
        Object.entries(dateFilters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });

        // Add project filter to API request if selected
        if (projectFilter !== "all") {
          params.append("project", projectFilter);
        }

        const response = await fetch(
          `/api/lead-expenses/stats?${params.toString()}`
        );
        return response.json();
      },
    });

  // Fetch manual expenses from Manuel Gider Yönetimi with date filtering
  const { data: manualExpenses = [], isLoading: manualExpensesLoading } =
    useQuery<LeadExpense[]>({
      queryKey: ["/api/lead-expenses", dateFilters, projectFilter],
      queryFn: async () => {
        const params = new URLSearchParams();
        Object.entries(dateFilters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });

        // Add project filter to API request if selected
        if (projectFilter !== "all") {
          params.append("project", projectFilter);
        }

        const response = await fetch(`/api/lead-expenses?${params.toString()}`);
        return response.json();
      },
    });

  // Fetch current exchange rate
  const { data: exchangeRate, isLoading: rateLoading } =
    useQuery<ExchangeRateInfo>({
      queryKey: ["/api/exchange-rate/usd"],
    });

  // Projects are now fetched and handled by the ProjectFilter component

  if (expenseLoading || rateLoading || manualExpensesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  // Calculate manual expenses totals
  const manualExpensesTotals = manualExpenses.reduce(
    (acc, expense) => {
      const amount = parseFloat(expense.amountTL);
      acc.total += amount;
      if (expense.expenseType === "agency_fee") {
        acc.agencyFees += amount;
      } else if (expense.expenseType === "ads_expense") {
        acc.adsExpenses += amount;
      }
      return acc;
    },
    { total: 0, agencyFees: 0, adsExpenses: 0 }
  );

  // Convert manual expenses to USD
  const manualExpensesUSD = exchangeRate
    ? manualExpensesTotals.total / exchangeRate.rate
    : 0;

  // Expense stats are already filtered by project via the API call

  // Combined totals (automatic from leads + manual expenses)
  const combinedTotals = {
    tl: {
      agencyFees:
        (expenseStats?.expenses.tl.totalAgencyFees || 0) +
        manualExpensesTotals.agencyFees,
      adsExpenses:
        (expenseStats?.expenses.tl.totalAdsExpenses || 0) +
        manualExpensesTotals.adsExpenses,
      total:
        (expenseStats?.expenses.tl.totalExpenses || 0) +
        manualExpensesTotals.total,
    },
    usd: {
      total:
        (expenseStats?.expenses.usd.totalExpenses || 0) + manualExpensesUSD,
      avgCostPerLead: expenseStats?.leadCount
        ? (expenseStats.expenses.usd.totalExpenses + manualExpensesUSD) /
          expenseStats.leadCount
        : 0,
    },
  };

  const formatCurrency = (amount: number, currency: "TL" | "USD") => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency === "TL" ? "TRY" : "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Project filtering is now handled by the ProjectFilter component

  // Apply project filter to data
  // const filterDataByProject = (data: any) => {
  //   if (!data || projectFilter === "all") return data;

  //   // For expenses, we'd need to link expenses to projects by their related lead data
  //   // This is a simple implementation - you may need to adjust based on your data structure
  //   return {
  //     ...data,
  //     leadCount: data.leadCount * 0.7, // Example: adjust this based on actual project filtering logic
  //     expenses: {
  //       tl: {
  //         totalAgencyFees: data.expenses.tl.totalAgencyFees * 0.7,
  //         totalAdsExpenses: data.expenses.tl.totalAdsExpenses * 0.7,
  //         totalExpenses: data.expenses.tl.totalExpenses * 0.7
  //       },
  //       usd: {
  //         totalExpenses: data.expenses.usd.totalExpenses * 0.7,
  //         avgCostPerLead: data.expenses.usd.totalExpenses * 0.7 / (data.leadCount * 0.7)
  //       }
  //     }
  //   };
  // };

  // Apply project filtering to the expense stats - remove this line as we'll place it above

  return (
    <div className="space-y-6">
      {/* Project Filter */}
      <ProjectFilter onProjectChange={setProjectFilter} />

      {/* Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Tarih Filtresi</CardTitle>
        </CardHeader>
        <CardContent>
          <DateFilter
            onFilterChange={setDateFilters}
            initialFilters={dateFilters}
          />
        </CardContent>
      </Card>

      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          İNNO Gayrimenkul - Lead Gider Raporu
        </h2>
        <p className="text-gray-600">
          Toplam lead maliyeti ve performans analizi
        </p>
        {projectFilter !== "all" && (
          <Badge
            variant="outline"
            className="mt-2 bg-blue-50 text-blue-700 border-blue-200 px-3 py-1"
          >
            <Building className="h-4 w-4 mr-1 inline-block" />
            {projectFilter}
          </Badge>
        )}
      </div>

      {/* Exchange Rate Info */}
      {exchangeRate && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Güncel Döviz Kuru (TCMB)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Alış</p>
                <p className="text-2xl font-bold text-green-600">
                  {exchangeRate.buyingRate.toFixed(4)} TL
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Satış</p>
                <p className="text-2xl font-bold text-red-600">
                  {exchangeRate.sellingRate.toFixed(4)} TL
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Son Güncelleme</p>
                <p className="text-sm font-medium">
                  {new Date(exchangeRate.lastUpdated).toLocaleString("tr-TR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expense Summary */}
      {expenseStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Leads */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Lead</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leadCount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Sistemdeki toplam lead sayısı
              </p>
            </CardContent>
          </Card>

          {/* Total Expenses (TL) - Combined */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Gider (TL)
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(combinedTotals.tl.total, "TL")}
              </div>
              <p className="text-xs text-muted-foreground">
                Lead + Manuel giderler
              </p>
              <div className="text-xs text-gray-500 mt-1">
                Manuel: {formatCurrency(manualExpensesTotals.total, "TL")}
              </div>
            </CardContent>
          </Card>

          {/* Total Expenses (USD) - Combined */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Gider (USD)
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(combinedTotals.usd.total, "USD")}
              </div>
              <p className="text-xs text-muted-foreground">
                TCMB kuru ile hesaplanmış
              </p>
              <div className="text-xs text-gray-500 mt-1">
                Manuel: {formatCurrency(manualExpensesUSD, "USD")}
              </div>
            </CardContent>
          </Card>

          {/* Cost Per Lead (USD) - Combined */}
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Lead Başına Maliyet
              </CardTitle>
              <Calculator className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(combinedTotals.usd.avgCostPerLead, "USD")}
              </div>
              <p className="text-xs text-muted-foreground">
                Toplam maliyet / Lead sayısı
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Comprehensive Expense Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Combined Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Toplam Gider Analizi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">
                Gider Kaynakları (TL)
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Toplam Acenta Ücretleri:
                  </span>
                  <Badge variant="secondary">
                    {formatCurrency(combinedTotals.tl.agencyFees, "TL")}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 ml-6">
                  • Lead verileri:{" "}
                  {formatCurrency(
                    expenseStats?.expenses.tl.totalAgencyFees || 0,
                    "TL"
                  )}
                  <br />• Manuel giderler:{" "}
                  {formatCurrency(manualExpensesTotals.agencyFees, "TL")}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Megaphone className="h-4 w-4" />
                    Toplam Reklam Giderleri:
                  </span>
                  <Badge variant="secondary">
                    {formatCurrency(combinedTotals.tl.adsExpenses, "TL")}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 ml-6">
                  • Lead verileri:{" "}
                  {formatCurrency(
                    expenseStats?.expenses.tl.totalAdsExpenses || 0,
                    "TL"
                  )}
                  <br />• Manuel giderler:{" "}
                  {formatCurrency(manualExpensesTotals.adsExpenses, "TL")}
                </div>

                <Separator />
                <div className="flex justify-between font-semibold">
                  <span className="flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Genel Toplam:
                  </span>
                  <Badge className="bg-red-100 text-red-800">
                    {formatCurrency(combinedTotals.tl.total, "TL")}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* USD Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              USD Karşılığı ve Performans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exchangeRate && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Güncel Kur:</span>
                    <Badge variant="outline">
                      1 USD = {exchangeRate.rate.toFixed(4)} TL
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Toplam Gider (USD):
                    </span>
                    <Badge className="bg-green-100 text-green-800">
                      {formatCurrency(combinedTotals.usd.total, "USD")}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Lead Başına Maliyet:
                    </span>
                    <Badge className="bg-purple-100 text-purple-800">
                      {formatCurrency(combinedTotals.usd.avgCostPerLead, "USD")}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-blue-900 text-sm">
                      Performans Özeti
                    </h4>
                    <div className="text-xs text-blue-800 mt-1">
                      <p>• Toplam {leadCount || 0} lead için</p>
                      <p>
                        • {formatCurrency(combinedTotals.usd.total, "USD")}{" "}
                        toplam maliyet
                      </p>
                      <p>
                        • Lead başına ortalama{" "}
                        {formatCurrency(
                          combinedTotals.usd.avgCostPerLead,
                          "USD"
                        )}{" "}
                        maliyet
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>
                      Kur güncelleme:{" "}
                      {new Date(exchangeRate.lastUpdated).toLocaleString(
                        "tr-TR"
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Expenses Detail Table */}
      {manualExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Manuel Gider Detayları ({manualExpenses.length} kayıt)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ay</TableHead>
                    <TableHead>Gider Tipi</TableHead>
                    <TableHead className="text-right">Tutar (TL)</TableHead>
                    <TableHead className="text-right">Tutar (USD)</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Tarih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manualExpenses
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .map((expense) => {
                      const amountTL = parseFloat(expense.amountTL);
                      const amountUSD = exchangeRate
                        ? amountTL / exchangeRate.rate
                        : 0;

                      return (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">
                            {expense.month}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {expense.expenseType === "agency_fee"
                                ? "🏢 Ajans"
                                : "📢 Reklam"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(amountTL, "TL")}
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            {formatCurrency(amountUSD, "USD")}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {expense.description || "-"}
                          </TableCell>
                          <TableCell>
                            {new Date(expense.createdAt).toLocaleDateString(
                              "tr-TR"
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>

            {/* Manual Expenses Summary */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-blue-600">
                    Manuel Ajans Ücretleri
                  </div>
                  <div className="text-lg font-bold">
                    {formatCurrency(manualExpensesTotals.agencyFees, "TL")}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatCurrency(
                      exchangeRate
                        ? manualExpensesTotals.agencyFees / exchangeRate.rate
                        : 0,
                      "USD"
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">
                    Manuel Reklam Giderleri
                  </div>
                  <div className="text-lg font-bold">
                    {formatCurrency(manualExpensesTotals.adsExpenses, "TL")}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatCurrency(
                      exchangeRate
                        ? manualExpensesTotals.adsExpenses / exchangeRate.rate
                        : 0,
                      "USD"
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-red-600">
                    Manuel Toplam
                  </div>
                  <div className="text-lg font-bold">
                    {formatCurrency(manualExpensesTotals.total, "TL")}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatCurrency(manualExpensesUSD, "USD")}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data Message */}
      {expenseStats && expenseStats.leadCount === 0 && (
        <Card className="text-center p-8">
          <CardContent>
            <p className="text-gray-600">Henüz gider verisi bulunmamaktadır.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Lead'leri gider bilgileri ile birlikte ekledikçe burada analiz
              görüntülenecektir.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
