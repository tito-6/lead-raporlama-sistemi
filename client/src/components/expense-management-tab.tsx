import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { LeadExpense, InsertLeadExpense } from '@shared/schema';
import { Plus, Edit, Trash2, DollarSign, Calculator, Calendar, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ExpenseFormData {
  month: string;
  expenseType: 'agency_fee' | 'ads_expense';
  amountTL: string;
  description: string;
}

export default function ExpenseManagementTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<LeadExpense | null>(null);
  const [formData, setFormData] = useState<ExpenseFormData>({
    month: new Date().toISOString().slice(0, 7), // Current month in YYYY-MM format
    expenseType: 'agency_fee',
    amountTL: '',
    description: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all expenses
  const { data: expenses = [], isLoading } = useQuery<LeadExpense[]>({
    queryKey: ['/api/lead-expenses'],
    queryFn: async () => {
      const response = await fetch('/api/lead-expenses');
      return response.json();
    }
  });

  // Fetch exchange rate
  const { data: exchangeRate } = useQuery({
    queryKey: ['/api/exchange-rate/usd'],
    queryFn: async () => {
      const response = await fetch('/api/exchange-rate/usd');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (data: InsertLeadExpense) => {
      const response = await fetch('/api/lead-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to create expense');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lead-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lead-expenses/stats'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Başarılı",
        description: "Gider başarıyla eklendi",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Gider eklenirken hata oluştu",
        variant: "destructive",
      });
    }
  });

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertLeadExpense> }) => {
      const response = await fetch(`/api/lead-expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to update expense');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lead-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lead-expenses/stats'] });
      setIsDialogOpen(false);
      resetForm();
      setEditingExpense(null);
      toast({
        title: "Başarılı",
        description: "Gider başarıyla güncellendi",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Gider güncellenirken hata oluştu",
        variant: "destructive",
      });
    }
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/lead-expenses/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lead-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lead-expenses/stats'] });
      toast({
        title: "Başarılı",
        description: "Gider başarıyla silindi",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Gider silinirken hata oluştu",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      month: new Date().toISOString().slice(0, 7),
      expenseType: 'agency_fee',
      amountTL: '',
      description: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expenseData: InsertLeadExpense = {
      month: formData.month,
      expenseType: formData.expenseType,
      amountTL: formData.amountTL,
      description: formData.description || null
    };

    if (editingExpense) {
      updateExpenseMutation.mutate({ id: editingExpense.id, data: expenseData });
    } else {
      createExpenseMutation.mutate(expenseData);
    }
  };

  const handleEdit = (expense: LeadExpense) => {
    setEditingExpense(expense);
    setFormData({
      month: expense.month,
      expenseType: expense.expenseType as 'agency_fee' | 'ads_expense',
      amountTL: expense.amountTL,
      description: expense.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Bu gideri silmek istediğinize emin misiniz?')) {
      deleteExpenseMutation.mutate(id);
    }
  };

  const openCreateDialog = () => {
    setEditingExpense(null);
    resetForm();
    setIsDialogOpen(true);
  };

  // Calculate totals
  const totalsByMonth = expenses.reduce((acc, expense) => {
    const month = expense.month;
    if (!acc[month]) {
      acc[month] = { agency_fee: 0, ads_expense: 0, total: 0 };
    }
    const amount = parseFloat(expense.amountTL);
    acc[month][expense.expenseType as 'agency_fee' | 'ads_expense'] += amount;
    acc[month].total += amount;
    return acc;
  }, {} as Record<string, { agency_fee: number; ads_expense: number; total: number }>);

  const grandTotal = Object.values(totalsByMonth).reduce((sum, month) => sum + month.total, 0);
  const grandTotalUSD = exchangeRate ? grandTotal / exchangeRate.rate : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">💰 Manuel Gider Yönetimi</h2>
          <p className="text-gray-600 mt-1">Lead giderlerini manuel olarak ekleyin, düzenleyin ve silin</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            💱 USD/TRY: {exchangeRate?.rate?.toFixed(2) || 'Yükleniyor...'}
          </Badge>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Gider Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingExpense ? 'Gider Düzenle' : 'Yeni Gider Ekle'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="month">Ay</Label>
                  <Input
                    id="month"
                    type="month"
                    value={formData.month}
                    onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="expenseType">Gider Tipi</Label>
                  <Select 
                    value={formData.expenseType} 
                    onValueChange={(value: 'agency_fee' | 'ads_expense') => 
                      setFormData(prev => ({ ...prev, expenseType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agency_fee">🏢 Ajans Aylık Ücreti</SelectItem>
                      <SelectItem value="ads_expense">📢 Reklam Giderleri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amountTL">Tutar (TL)</Label>
                  <Input
                    id="amountTL"
                    type="number"
                    step="0.01"
                    value={formData.amountTL}
                    onChange={(e) => setFormData(prev => ({ ...prev, amountTL: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Gider ile ilgili notlar..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createExpenseMutation.isPending || updateExpenseMutation.isPending}
                  >
                    {editingExpense ? 'Güncelle' : 'Ekle'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calculator className="h-4 w-4 mr-2 text-blue-600" />
              Toplam Gider (TL)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₺{grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-600" />
              Toplam Gider (USD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${grandTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
              Toplam Kayıt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {expenses.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Gider Listesi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Giderler yükleniyor...</div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Henüz gider kaydı bulunmuyor. Yeni gider eklemek için yukarıdaki butonu kullanın.
            </div>
          ) : (
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
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((expense) => {
                      const amountTL = parseFloat(expense.amountTL);
                      const amountUSD = exchangeRate ? amountTL / exchangeRate.rate : 0;
                      
                      return (
                        <TableRow key={expense.id}>
                          <TableCell>{expense.month}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {expense.expenseType === 'agency_fee' ? '🏢 Ajans Ücreti' : '📢 Reklam'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₺{amountTL.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            ${amountUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {expense.description || '-'}
                          </TableCell>
                          <TableCell>
                            {new Date(expense.createdAt).toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEdit(expense)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDelete(expense.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Summary */}
      {Object.keys(totalsByMonth).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aylık Özet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(totalsByMonth)
                .sort((a, b) => b[0].localeCompare(a[0])) // Sort by month descending
                .map(([month, totals]) => (
                  <div key={month} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{month}</div>
                      <div className="text-sm text-gray-600">
                        Ajans: ₺{totals.agency_fee.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} | 
                        Reklam: ₺{totals.ads_expense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₺{totals.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                      <div className="text-sm text-green-600">
                        ${exchangeRate ? (totals.total / exchangeRate.rate).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}