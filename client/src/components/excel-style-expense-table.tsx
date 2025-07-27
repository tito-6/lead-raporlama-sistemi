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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
import {
  ArrowUpDown,
  ChevronDown,
  Edit,
  MoreHorizontal,
  Save,
  Trash2,
  X,
  Download,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { LeadExpense } from "@shared/schema";
import { TimeFrameDisplay } from "@/components/ui/time-frame-display";

interface ExpenseTableProps {
  expenses: LeadExpense[];
  dateFilters: {
    startDate: string;
    endDate: string;
    month: string;
    year: string;
  };
  metrics: {
    totalExpenses: number;
    agencyFees: number;
    adsExpenses: number;
    leadCount: number;
    avgCostPerLead: number;
    salesCount: number;
    costPerSale: number;
  };
  onEdit: (expense: LeadExpense) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, expense: Partial<LeadExpense>) => void;
}

export function ExcelStyleExpenseTable({
  expenses,
  dateFilters,
  metrics,
  onEdit,
  onDelete,
  onUpdate,
}: ExpenseTableProps) {
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<LeadExpense>>({});
  const [sortField, setSortField] = useState<string>("month");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Sort expenses
  const sortedExpenses = [...expenses].sort((a, b) => {
    if (sortField === "month") {
      // Sort by month (newest first or oldest first)
      const comparison = a.month.localeCompare(b.month);
      return sortDirection === "asc" ? comparison : -comparison;
    } else if (sortField === "expenseType") {
      // Sort by expense type
      const comparison = a.expenseType.localeCompare(b.expenseType);
      return sortDirection === "asc" ? comparison : -comparison;
    } else if (sortField === "amountTL") {
      // Sort by amount
      const aAmount = parseFloat(a.amountTL.toString());
      const bAmount = parseFloat(b.amountTL.toString());
      return sortDirection === "asc" ? aAmount - bAmount : bAmount - aAmount;
    }
    return 0;
  });

  const handleSort = (field: string) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection("desc");
    }
  };

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

  // Export to Excel
  const exportToExcel = () => {
    // Create CSV content
    const headers = ["Ay", "Gider Türü", "Tutar (₺)", "Açıklama"];
    const rows = sortedExpenses.map((expense) => [
      formatMonth(expense.month),
      getExpenseTypeDisplay(expense.expenseType),
      parseFloat(expense.amountTL.toString()).toFixed(2),
      expense.description || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `gider-raporu-${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="py-4 px-6 bg-slate-50 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Gider Tablosu</CardTitle>
          <TimeFrameDisplay {...dateFilters} />
        </div>
      </CardHeader>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-100">
            <TableRow>
              <TableHead
                className="w-1/4 cursor-pointer hover:bg-slate-200"
                onClick={() => handleSort("month")}
              >
                <div className="flex items-center">
                  Ay
                  {sortField === "month" && (
                    <ChevronDown
                      className={`ml-1 h-4 w-4 transform ${
                        sortDirection === "asc" ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="w-1/4 cursor-pointer hover:bg-slate-200"
                onClick={() => handleSort("expenseType")}
              >
                <div className="flex items-center">
                  Gider Türü
                  {sortField === "expenseType" && (
                    <ChevronDown
                      className={`ml-1 h-4 w-4 transform ${
                        sortDirection === "asc" ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="w-1/6 cursor-pointer hover:bg-slate-200"
                onClick={() => handleSort("amountTL")}
              >
                <div className="flex items-center">
                  Tutar (₺)
                  {sortField === "amountTL" && (
                    <ChevronDown
                      className={`ml-1 h-4 w-4 transform ${
                        sortDirection === "asc" ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-1/3">Açıklama</TableHead>
              <TableHead className="w-[80px] text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedExpenses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  Seçilen zaman aralığında gider kaydı bulunmamaktadır.
                </TableCell>
              </TableRow>
            ) : (
              sortedExpenses.map((expense) => (
                <TableRow
                  key={expense.id}
                  className={editingRow === expense.id ? "bg-blue-50" : ""}
                >
                  <TableCell>
                    {editingRow === expense.id ? (
                      <Input
                        type="month"
                        value={editData.month}
                        onChange={(e) => handleChange("month", e.target.value)}
                        className="h-8"
                      />
                    ) : (
                      formatMonth(expense.month)
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRow === expense.id ? (
                      <select
                        className="w-full p-1 border rounded-md h-8"
                        value={editData.expenseType as string}
                        onChange={(e) =>
                          handleChange("expenseType", e.target.value)
                        }
                      >
                        <option value="agency_fee">Ajans Ücreti</option>
                        <option value="ads_expense">Reklam Harcaması</option>
                      </select>
                    ) : (
                      <div
                        className={
                          expense.expenseType === "agency_fee"
                            ? "text-blue-600"
                            : "text-green-600"
                        }
                      >
                        {getExpenseTypeDisplay(expense.expenseType)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {editingRow === expense.id ? (
                      <Input
                        type="number"
                        value={editData.amountTL as string}
                        onChange={(e) =>
                          handleChange("amountTL", e.target.value)
                        }
                        className="h-8"
                      />
                    ) : (
                      formatCurrency(
                        parseFloat(expense.amountTL.toString()),
                        "TRY"
                      )
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRow === expense.id ? (
                      <Input
                        value={editData.description || ""}
                        onChange={(e) =>
                          handleChange("description", e.target.value)
                        }
                        className="h-8"
                      />
                    ) : (
                      expense.description || "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingRow === expense.id ? (
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSaveEdit(expense.id!)}
                          className="h-7 w-7"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCancelEdit}
                          className="h-7 w-7"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                          >
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

      <CardFooter className="flex justify-between py-4 px-6 bg-slate-50 border-t">
        <div className="grid grid-cols-3 gap-6 w-full">
          <div>
            <div className="text-sm font-medium text-gray-600">
              Toplam Kayıt
            </div>
            <div className="text-lg font-semibold">
              {sortedExpenses.length} gider kaydı
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-600">
              Toplam Gider
            </div>
            <div className="text-lg font-semibold">
              {formatCurrency(metrics.totalExpenses, "TRY")}
            </div>
            <div className="text-xs text-gray-500">
              Ajans: {formatCurrency(metrics.agencyFees, "TRY")} | Reklam:{" "}
              {formatCurrency(metrics.adsExpenses, "TRY")}
            </div>
          </div>

          <div className="flex justify-end items-center">
            <Button variant="outline" onClick={exportToExcel} className="gap-2">
              <Download className="h-4 w-4" />
              Excel'e Aktar
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
