import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Calendar as CalendarIcon,
  DollarSign,
  PercentIcon,
  Plus,
  Search,
  FileSpreadsheet,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { LeadExpense } from "@shared/schema";
import { formatCurrency, calculateCostPerSale } from "@/lib/utils";
import { ExpenseTableView } from "@/components/expense-table-view";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExpenseFormData {
  month: string;
  expenseType: "agency_fee" | "ads_expense";
  amountTL: string;
  description: string;
}

export default function PersistentExpenseManagementTab() {
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

  // Fetch expense stats
  const { data: expenseStats } = useQuery<any>({
    queryKey: ["/api/expense-stats"],
    queryFn: async () => {
      const response = await fetch(`/api/expense-stats`);
      return response.json();
    },
  });

  // Fetch leads data for sales analysis
  const { data: leadsData = [] } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const response = await fetch(`/api/leads`);
      return response.json();
    },
  });

  // Fetch exchange rate
  const { data: exchangeRate } = useQuery<{rate: number; lastUpdated: string}>({
    queryKey: ["/api/usd-exchange-rate"],
    queryFn: async () => {
      const response = await fetch("/api/usd-exchange-rate");
      return response.json();
    },
  });

  // Add expense mutation
  const addExpenseMutation = useMutation({
    mutationFn: async (expense: any) => {
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

  // Calculate cost-per-sale metrics
  const salesMetrics = useMemo(() => {
    if (!expenseStats || !leadsData.length) return null;

    const totalExpenses = expenseStats.expenses.tl.totalExpenses;

    // Count sales (leads where wasSaleMade is "Evet")
    const salesCount = leadsData.filter(
      (lead: any) => lead.wasSaleMade === "Evet"
    ).length;

    // Calculate cost per sale
    const costPerSale = salesCount > 0 ? totalExpenses / salesCount : 0;

    return {
      salesCount,
      totalExpenses,
      costPerSale,
    };
  }, [expenseStats, leadsData]);

  const resetForm = () => {
    setFormData({
      month: new Date().toISOString().slice(0, 7),
      expenseType: "agency_fee",
      amountTL: "",
      description: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const expenseData = {
      month: formData.month,
      expenseType: formData.expenseType,
      amountTL: formData.amountTL,
      description: formData.description,
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
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bu gideri silmek istediğinize emin misiniz?")) {
      deleteExpenseMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Gider Yönetimi (Kalıcı)
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Yeni Gider Ekle
                </Button>
              </DialogTrigger>
              <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingExpense ? "Gider Düzenle" : "Yeni Gider Ekle"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="month">Ay</Label>
                  <Input
                    type="month"
                    id="month"
                    value={formData.month}
                    onChange={(e) =>
                      setFormData({ ...formData, month: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expenseType">Gider Türü</Label>
                  <Select
                    value={formData.expenseType}
                    onValueChange={(value: "agency_fee" | "ads_expense") =>
                      setFormData({ ...formData, expenseType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Gider türünü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agency_fee">Ajans Ücreti</SelectItem>
                      <SelectItem value="ads_expense">
                        Reklam Harcaması
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amountTL">Tutar (₺)</Label>
                  <Input
                    type="number"
                    id="amountTL"
                    placeholder="Tutarı girin"
                    value={formData.amountTL}
                    onChange={(e) =>
                      setFormData({ ...formData, amountTL: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Input
                    id="description"
                    placeholder="Açıklama girin"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit">
                    {editingExpense ? "Güncelle" : "Ekle"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Gider (TL)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expenseStats
                ? formatCurrency(expenseStats.expenses.tl.totalExpenses, "TRY")
                : "₺0,00"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lead Başına Maliyet
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expenseStats
                ? formatCurrency(expenseStats.expenses.tl.avgCostPerLead, "TRY")
                : "₺0,00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {expenseStats?.leadCount || 0} lead için
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Satış Başına Maliyet
            </CardTitle>
            <PercentIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesMetrics
                ? formatCurrency(salesMetrics.costPerSale, "TRY")
                : "₺0,00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {salesMetrics?.salesCount || 0} satış için
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="table" className="mt-6">
        <TabsList>
          <TabsTrigger value="table">Gider Tablosu</TabsTrigger>
          <TabsTrigger value="analysis">Satış Analizi</TabsTrigger>
        </TabsList>
        <TabsContent value="table" className="mt-4">
          {isLoading ? (
            <div className="text-center py-4">Yükleniyor...</div>
          ) : (
            <ExpenseTableView
              expenses={expenses}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUpdate={(id, expense) =>
                updateExpenseMutation.mutate({ id, expense })
              }
              exchangeRate={exchangeRate}
            />
          )}
        </TabsContent>
        <TabsContent value="analysis" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Satış Performansı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Toplam Lead Sayısı:</span>
                    <span className="font-medium">
                      {expenseStats?.leadCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Toplam Satış Sayısı:</span>
                    <span className="font-medium">
                      {salesMetrics?.salesCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dönüşüm Oranı:</span>
                    <span className="font-medium">
                      {expenseStats?.leadCount
                        ? (
                            ((salesMetrics?.salesCount || 0) /
                              expenseStats.leadCount) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maliyet Analizi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Toplam Gider:</span>
                    <span className="font-medium">
                      {expenseStats
                        ? formatCurrency(
                            expenseStats.expenses.tl.totalExpenses,
                            "TRY"
                          )
                        : "₺0,00"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Lead Başına Maliyet:</span>
                    <span className="font-medium">
                      {expenseStats
                        ? formatCurrency(
                            expenseStats.expenses.tl.avgCostPerLead,
                            "TRY"
                          )
                        : "₺0,00"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Satış Başına Maliyet:</span>
                    <span className="font-medium">
                      {salesMetrics
                        ? formatCurrency(salesMetrics.costPerSale, "TRY")
                        : "₺0,00"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle>Gider Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                {expenses.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Ajans Ücretleri:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          expenses
                            .filter((exp) => exp.expenseType === "agency_fee")
                            .reduce(
                              (sum, exp) =>
                                sum + parseFloat(exp.amountTL.toString()),
                              0
                            ),
                          "TRY"
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Reklam Harcamaları:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          expenses
                            .filter((exp) => exp.expenseType === "ads_expense")
                            .reduce(
                              (sum, exp) =>
                                sum + parseFloat(exp.amountTL.toString()),
                              0
                            ),
                          "TRY"
                        )}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    Gider verisi bulunmamaktadır
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
