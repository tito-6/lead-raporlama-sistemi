import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LeadExpense } from "@shared/schema";
import { Edit, MoreHorizontal, Save, Trash2, X } from "lucide-react";

interface ExpenseTableProps {
  expenses: LeadExpense[];
  onEdit: (expense: LeadExpense) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, expense: Partial<LeadExpense>) => void;
  exchangeRate?: { rate: number; lastUpdated: string };
}

export function ExpenseTableView({
  expenses,
  onEdit,
  onDelete,
  onUpdate,
  exchangeRate,
}: ExpenseTableProps) {
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<LeadExpense>>({});

  // Start editing a row
  const handleStartEdit = (expense: LeadExpense) => {
    setEditingRow(expense.id!);
    setEditData({
      month: expense.month,
      expenseType: expense.expenseType,
      amountTL: expense.amountTL,
      description: expense.description,
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditData({});
  };

  // Save edits
  const handleSaveEdit = (id: number) => {
    onUpdate(id, editData);
    setEditingRow(null);
    setEditData({});
  };

  // Handle input change
  const handleChange = (field: string, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  // Format month for display (YYYY-MM to Month YYYY)
  const formatMonth = (monthStr: string) => {
    try {
      const [year, month] = monthStr.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return new Intl.DateTimeFormat("tr-TR", {
        year: "numeric",
        month: "long",
      }).format(date);
    } catch (e) {
      return monthStr;
    }
  };

  // Translate expense type for display
  const getExpenseTypeDisplay = (type: string) => {
    switch (type) {
      case "agency_fee":
        return "Ajans Ücreti";
      case "ads_expense":
        return "Reklam Harcaması";
      default:
        return type;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ay</TableHead>
            <TableHead>Gider Tipi</TableHead>
            <TableHead>Tutar (TL)</TableHead>
            <TableHead>Tutar (USD)</TableHead>
            <TableHead>Proje</TableHead>
            <TableHead>Açıklama</TableHead>
            <TableHead className="w-[100px]">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                Henüz gider kaydı bulunmamaktadır.
              </TableCell>
            </TableRow>
          ) : (
            expenses
              .sort((a, b) => b.month.localeCompare(a.month)) // Sort by month (newest first)
              .map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    {editingRow === expense.id ? (
                      <Input
                        type="month"
                        value={editData.month}
                        onChange={(e) => handleChange("month", e.target.value)}
                      />
                    ) : (
                      formatMonth(expense.month)
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRow === expense.id ? (
                      <select
                        className="w-full p-2 border rounded-md"
                        value={editData.expenseType as string}
                        onChange={(e) =>
                          handleChange("expenseType", e.target.value)
                        }
                      >
                        <option value="agency_fee">Ajans Ücreti</option>
                        <option value="ads_expense">Reklam Harcaması</option>
                      </select>
                    ) : (
                      getExpenseTypeDisplay(expense.expenseType)
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRow === expense.id ? (
                      <Input
                        type="number"
                        value={editData.amountTL as string}
                        onChange={(e) =>
                          handleChange("amountTL", e.target.value)
                        }
                      />
                    ) : (
                      new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                        minimumFractionDigits: 2,
                      }).format(parseFloat(expense.amountTL.toString()))
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {exchangeRate ? (
                      `$${(parseFloat(expense.amountTL.toString()) / exchangeRate.rate).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {expense.projectName ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {expense.projectName}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRow === expense.id ? (
                      <Input
                        value={editData.description || ""}
                        onChange={(e) =>
                          handleChange("description", e.target.value)
                        }
                      />
                    ) : (
                      expense.description || "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRow === expense.id ? (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleSaveEdit(expense.id!)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleStartEdit(expense)}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(expense.id!)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default ExpenseTableView;
