import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users } from "lucide-react";

interface CostMetricsTableProps {
  expenseStats: {
    leadCount: number;
    salesCount: number;
    expenses: {
      tl: {
        totalExpenses: number;
        totalAgencyFees: number;
        totalAdsExpenses: number;
        avgCostPerLead: number;
        avgCostPerSale: number;
      };
    };
  };
}

export function CostMetricsTable({ expenseStats }: CostMetricsTableProps) {
  // Format currency in Turkish Lira
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Calculate conversion rate
  const conversionRate = expenseStats?.leadCount
    ? ((expenseStats?.salesCount / expenseStats?.leadCount) * 100).toFixed(2)
    : "0.00";

  return (
    <Card className="shadow-md border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <DollarSign className="mr-2 h-5 w-5 text-blue-600" />
          Maliyet ve Performans Analizi
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-blue-50">
            <TableRow>
              <TableHead className="w-[250px] font-medium">Metrik</TableHead>
              <TableHead className="font-medium">Değer</TableHead>
              <TableHead className="font-medium text-right">Detay</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Total Expenses */}
            <TableRow className="border-b hover:bg-slate-50">
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-blue-600" />
                  Toplam Gider
                </div>
              </TableCell>
              <TableCell className="font-bold text-lg">
                {formatCurrency(expenseStats?.expenses.tl.totalExpenses)}
              </TableCell>
              <TableCell className="text-right text-sm text-gray-600">
                <div>
                  Ajans:{" "}
                  {formatCurrency(expenseStats?.expenses.tl.totalAgencyFees)}
                </div>
                <div>
                  Reklam:{" "}
                  {formatCurrency(expenseStats?.expenses.tl.totalAdsExpenses)}
                </div>
              </TableCell>
            </TableRow>

            {/* Cost Per Lead */}
            <TableRow className="border-b hover:bg-slate-50">
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-blue-600" />
                  Lead Başına Maliyet
                </div>
              </TableCell>
              <TableCell className="font-bold text-lg">
                {formatCurrency(expenseStats?.expenses.tl.avgCostPerLead)}
              </TableCell>
              <TableCell className="text-right text-sm text-gray-600">
                Toplam: {expenseStats?.leadCount || 0} Lead
              </TableCell>
            </TableRow>

            {/* Cost Per Sale - Highlighted */}
            <TableRow className="bg-amber-50 hover:bg-amber-100">
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-amber-600" />
                  <span className="text-amber-800">Satış Başına Maliyet</span>
                </div>
              </TableCell>
              <TableCell className="font-bold text-lg text-amber-800">
                {expenseStats?.salesCount > 0
                  ? formatCurrency(expenseStats?.expenses.tl.avgCostPerSale)
                  : "Hesaplanamadı"}
              </TableCell>
              <TableCell className="text-right text-sm text-gray-600">
                <div>{expenseStats?.salesCount || 0} Satış</div>
                <div>Dönüşüm Oranı: %{conversionRate}</div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
