import React, { useState, useMemo } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { LeadExpense, InsertLeadExpense } from "@shared/schema";
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Calculator,
  Calendar,
  TrendingUp,
  Users,
  Building,
  Megaphone,
  Receipt,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DateFilter from "@/components/ui/date-filter";

interface ExpenseFormData {
  month: string;
  expenseType: "agency_fee" | "ads_expense";
  amountTL: string;
  description: string;
  projectName?: string; // Optional project name for ads_expense
}

interface ExpenseStats {
  leadCount: number;
  expenses: {
    tl: {
      totalAgencyFees: number;
      totalAdsExpenses: number;
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
}

export default function UnifiedExpenseManagementTab() {
  const [dateFilters, setDateFilters] = useState({
    startDate: "",
    endDate: "",
    month: "",
    year: "",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<LeadExpense | null>(
    null
  );
  const [formData, setFormData] = useState<ExpenseFormData>({
    month: new Date().toISOString().slice(0, 7), // Current month in YYYY-MM format
    expenseType: "agency_fee",
    amountTL: "",
    description: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all expenses
  const { data: expenses = [], isLoading } = useQuery<LeadExpense[]>({
    queryKey: ["/api/lead-expenses"],
    queryFn: async () => {
      const response = await fetch("/api/lead-expenses");
      return response.json();
    },
  });

  // Fetch exchange rate from TCMB
  const { data: exchangeRate, refetch: refetchExchangeRate } =
    useQuery<ExchangeRateInfo>({
      queryKey: ["/api/exchange-rate/usd"],
      queryFn: async () => {
        const response = await fetch("/api/exchange-rate/usd");
        return response.json();
      },
      refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
      staleTime: 10 * 60 * 1000, // Consider data stale after 10 minutes
    });

  // Fetch expense stats with date filtering
  const { data: expenseStats } = useQuery<ExpenseStats>({
    queryKey: ["/api/expense-stats", dateFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(dateFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await fetch(`/api/expense-stats?${params.toString()}`);
      return response.json();
    },
  });

  // Fetch leads data for cost analysis
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

  // Add expense mutation
  const addExpenseMutation = useMutation({
    mutationFn: async (expense: InsertLeadExpense) => {
      const response = await fetch("/api/lead-expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense),
      });
      if (!response.ok) throw new Error("Failed to add expense");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expense-stats"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Başarılı", description: "Gider başarıyla eklendi." });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Gider eklenirken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: async ({
      id,
      expense,
    }: {
      id: number;
      expense: Partial<LeadExpense>;
    }) => {
      const response = await fetch(`/api/lead-expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense),
      });
      if (!response.ok) throw new Error("Failed to update expense");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expense-stats"] });
      setIsDialogOpen(false);
      setEditingExpense(null);
      resetForm();
      toast({ title: "Başarılı", description: "Gider başarıyla güncellendi." });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Gider güncellenirken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/lead-expenses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete expense");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expense-stats"] });
      toast({ title: "Başarılı", description: "Gider başarıyla silindi." });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Gider silinirken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Calculate personnel-specific costs
  const personnelCostAnalysis = useMemo(() => {
    if (!leadsData.length || !expenseStats) return [];

    const totalExpensesTL = expenseStats.expenses.tl.totalExpenses;
    const totalLeads = leadsData.length;
    const costPerLead = totalLeads > 0 ? totalExpensesTL / totalLeads : 0;

    // Group leads by personnel
    const personnelGroups = leadsData.reduce((acc: any, lead: any) => {
      const personnel = lead.assignedPersonnel || "Atanmamış";
      if (!acc[personnel]) {
        acc[personnel] = {
          personnel,
          leadCount: 0,
          totalCost: 0,
          avgCostPerLead: 0,
        };
      }
      acc[personnel].leadCount++;
      return acc;
    }, {});

    // Calculate costs for each personnel
    return Object.values(personnelGroups).map((group: any) => ({
      ...group,
      totalCost: group.leadCount * costPerLead,
      avgCostPerLead: costPerLead,
    }));
  }, [leadsData, expenseStats]);

  const resetForm = () => {
    setFormData({
      month: new Date().toISOString().slice(0, 7),
      expenseType: "agency_fee",
      amountTL: "",
      description: "",
      projectName: undefined,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const expenseData: InsertLeadExpense = {
      month: formData.month,
      expenseType: formData.expenseType,
      amountTL: formData.amountTL,
      description: formData.description,
      // Only include projectName for ads_expense type
      projectName:
        formData.expenseType === "ads_expense"
          ? formData.projectName
          : undefined,
    };

    if (editingExpense) {
      updateExpenseMutation.mutate({
        id: editingExpense.id!,
        expense: expenseData,
      });
    } else {
      addExpenseMutation.mutate(expenseData);
    }
  };

  const handleEdit = (expense: LeadExpense) => {
    setEditingExpense(expense);
    setFormData({
      month: expense.month,
      expenseType: expense.expenseType as "agency_fee" | "ads_expense",
      amountTL: expense.amountTL.toString(),
      description: expense.description || "",
      projectName: expense.projectName || undefined,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Bu gideri silmek istediğinizden emin misiniz?")) {
      deleteExpenseMutation.mutate(id);
    }
  };

  const formatCurrency = (amount: number, currency: "TL" | "USD" = "TL") => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency === "TL" ? "TRY" : "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatExpenseType = (type: string) => {
    return type === "agency_fee" ? "Ajans Ücreti" : "Reklam Gideri";
  };

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <DateFilter
            onFilterChange={setDateFilters}
            initialFilters={dateFilters}
          />
        </div>

        <div className="lg:col-span-3">
          {/* Exchange Rate Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  USD/TL Kuru (TCMB)
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchExchangeRate()}
                  disabled={exchangeRate === undefined}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Güncelle
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {exchangeRate ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {exchangeRate.rate.toFixed(4)}
                    </div>
                    <div className="text-sm text-gray-500">Ortalama Kur</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {exchangeRate.buyingRate.toFixed(4)}
                    </div>
                    <div className="text-sm text-gray-500">Alış Kuru</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">
                      {exchangeRate.sellingRate.toFixed(4)}
                    </div>
                    <div className="text-sm text-gray-500">Satış Kuru</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  Kur bilgisi yükleniyor...
                </div>
              )}
              {exchangeRate?.lastUpdated && (
                <div className="text-xs text-gray-400 text-center mt-2">
                  Son güncelleme:{" "}
                  {new Date(exchangeRate.lastUpdated).toLocaleString("tr-TR")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">📊 Genel Bakış</TabsTrigger>
          <TabsTrigger value="management">⚙️ Gider Yönetimi</TabsTrigger>
          <TabsTrigger value="personnel">
            👥 Personel Lead Maliyet Analizi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          {expenseStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Toplam Lead
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {expenseStats.leadCount}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Filtrelenmiş dönem
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Building className="mr-2 h-4 w-4" />
                    Ajans Ücretleri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(expenseStats.expenses.tl.totalAgencyFees)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Toplam ajans ücreti
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Megaphone className="mr-2 h-4 w-4" />
                    Reklam Giderleri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(expenseStats.expenses.tl.totalAdsExpenses)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Toplam reklam gideri
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Calculator className="mr-2 h-4 w-4" />
                    Lead Başına Maliyet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {expenseStats?.expenses?.tl?.avgCostPerLead !== undefined
                      ? formatCurrency(
                          expenseStats.expenses.tl.avgCostPerLead /
                            (exchangeRate?.rate || 1),
                          "USD"
                        )
                      : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {expenseStats?.expenses?.tl?.avgCostPerLead !== undefined
                      ? formatCurrency(expenseStats.expenses.tl.avgCostPerLead)
                      : "N/A"}{" "}
                    TL
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Expense breakdown table */}
          <Card>
            <CardHeader>
              <CardTitle>Aylık Gider Dökümü</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ay</TableHead>
                    <TableHead>Gider Tipi</TableHead>
                    <TableHead>Tutar (TL)</TableHead>
                    <TableHead>Tutar (USD)</TableHead>
                    <TableHead>Proje</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.month}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            expense.expenseType === "agency_fee"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {formatExpenseType(expense.expenseType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(parseFloat(expense.amountTL))}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(
                          parseFloat(expense.amountTL) /
                            (exchangeRate?.rate || 1),
                          "USD"
                        )}
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(expense.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {expenses.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-gray-500"
                      >
                        Henüz gider kaydı bulunmuyor
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          {/* Add/Edit Expense Dialog */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Gider Yönetimi
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Yeni Gider
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingExpense ? "Gider Düzenle" : "Yeni Gider Ekle"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="month">Ay</Label>
                        <Input
                          id="month"
                          type="month"
                          value={formData.month}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              month: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="expenseType">Gider Tipi</Label>
                        <Select
                          value={formData.expenseType}
                          onValueChange={(
                            value: "agency_fee" | "ads_expense"
                          ) =>
                            setFormData((prev) => ({
                              ...prev,
                              expenseType: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="agency_fee">
                              Ajans Ücreti
                            </SelectItem>
                            <SelectItem value="ads_expense">
                              Reklam Gideri
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Project selector only for ads_expense type */}
                      {formData.expenseType === "ads_expense" && (
                        <div>
                          <Label htmlFor="projectName">Proje</Label>
                          <Select
                            value={formData.projectName}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                projectName: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Proje seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                Tüm Projeler (Genel Reklam)
                              </SelectItem>
                              <SelectItem value="Model Sanayi Merkezi">
                                Model Sanayi Merkezi
                              </SelectItem>
                              <SelectItem value="Model Kuyum Merkezi">
                                Model Kuyum Merkezi
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 mt-1">
                            Reklam maliyeti yalnızca seçilen projeye ait olacak
                          </p>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="amountTL">Tutar (TL)</Label>
                        <Input
                          id="amountTL"
                          type="number"
                          step="0.01"
                          value={formData.amountTL}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              amountTL: e.target.value,
                            }))
                          }
                          required
                        />
                        {exchangeRate && formData.amountTL && (
                          <p className="text-xs text-gray-500 mt-1">
                            ≈{" "}
                            {formatCurrency(
                              parseFloat(formData.amountTL) / exchangeRate.rate,
                              "USD"
                            )}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="description">Açıklama</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Gider detayları..."
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          İptal
                        </Button>
                        <Button
                          type="submit"
                          disabled={
                            addExpenseMutation.isPending ||
                            updateExpenseMutation.isPending
                          }
                        >
                          {editingExpense ? "Güncelle" : "Ekle"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ay</TableHead>
                    <TableHead>Gider Tipi</TableHead>
                    <TableHead>Tutar (TL)</TableHead>
                    <TableHead>Tutar (USD)</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.month}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            expense.expenseType === "agency_fee"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {formatExpenseType(expense.expenseType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(parseFloat(expense.amountTL))}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(
                          parseFloat(expense.amountTL) /
                            (exchangeRate?.rate || 1),
                          "USD"
                        )}
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(expense.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {expenses.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-gray-500"
                      >
                        Henüz gider kaydı bulunmuyor
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Personel Bazında Maliyet Analizi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Personel</TableHead>
                    <TableHead>Lead Sayısı</TableHead>
                    <TableHead>Toplam Maliyet (TL)</TableHead>
                    <TableHead>Toplam Maliyet (USD)</TableHead>
                    <TableHead>Lead Başına Maliyet (TL)</TableHead>
                    <TableHead>Lead Başına Maliyet (USD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {personnelCostAnalysis.map((personnel: any) => (
                    <TableRow key={personnel.personnel}>
                      <TableCell className="font-medium">
                        {personnel.personnel}
                      </TableCell>
                      <TableCell>{personnel.leadCount}</TableCell>
                      <TableCell>
                        {formatCurrency(personnel.totalCost)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(
                          personnel.totalCost / (exchangeRate?.rate || 1),
                          "USD"
                        )}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(personnel.avgCostPerLead)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(
                          personnel.avgCostPerLead / (exchangeRate?.rate || 1),
                          "USD"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {personnelCostAnalysis.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-gray-500"
                      >
                        Personel maliyet verisi bulunamadı
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Cost efficiency metrics */}
          {personnelCostAnalysis.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Maliyet Verimliliği Metrikleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-lg font-semibold text-green-600">
                      En Verimli Personel
                    </div>
                    <div className="text-sm text-gray-600">
                      {
                        personnelCostAnalysis.reduce((best, current) =>
                          current.leadCount > best.leadCount ? current : best
                        ).personnel
                      }
                    </div>
                  </div>

                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-lg font-semibold text-blue-600">
                      Ortalama Maliyet/Lead
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(
                        personnelCostAnalysis.reduce(
                          (sum, p) => sum + p.avgCostPerLead,
                          0
                        ) / personnelCostAnalysis.length
                      )}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-lg font-semibold text-purple-600">
                      Toplam Lead Maliyeti
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(
                        personnelCostAnalysis.reduce(
                          (sum, p) => sum + p.totalCost,
                          0
                        )
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-lg font-semibold text-yellow-600">
              Debug: Takipte Data
            </div>
            {/* Debug info removed - personnelCostAnalysis not implemented yet */}
            <div className="text-sm text-gray-600">Debug info placeholder</div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
