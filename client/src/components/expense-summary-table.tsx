import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { formatCurrency, calculateCostPerSale } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface ExpenseSummaryTableProps {
  dateRangeText: string;
  metrics: {
    totalExpenses: number;
    agencyFees: number;
    adsExpenses: number;
    leadCount: number;
    avgCostPerLead: number;
    salesCount: number;
    costPerSale: number;
  };
}

export function ExpenseSummaryTable({
  dateRangeText,
  metrics,
}: ExpenseSummaryTableProps) {
  const {
    totalExpenses,
    agencyFees,
    adsExpenses,
    leadCount,
    avgCostPerLead,
    salesCount,
    costPerSale,
  } = metrics;

  // Calculate percentages
  const agencyFeePercentage =
    totalExpenses > 0 ? (agencyFees / totalExpenses) * 100 : 0;
  const adsExpensePercentage =
    totalExpenses > 0 ? (adsExpenses / totalExpenses) * 100 : 0;
  const conversionRate = leadCount > 0 ? (salesCount / leadCount) * 100 : 0;

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableCaption className="pt-2 pb-4 font-semibold text-base caption-top">
          {dateRangeText ? `${dateRangeText} Gider Raporu` : "Gider Özeti"}
        </TableCaption>
        <TableHeader className="bg-slate-100">
          <TableRow>
            <TableHead className="w-[200px]">Metrik</TableHead>
            <TableHead>Değer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="border-b">
            <TableCell className="font-medium">Toplam Gider</TableCell>
            <TableCell className="font-semibold">
              {formatCurrency(totalExpenses, "TRY")}
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-medium pl-8 text-blue-600">
              Ajans Ücreti
            </TableCell>
            <TableCell>
              {formatCurrency(agencyFees, "TRY")}{" "}
              <span className="text-gray-500 text-sm">
                (%{agencyFeePercentage.toFixed(1)})
              </span>
            </TableCell>
          </TableRow>

          <TableRow className="border-b">
            <TableCell className="font-medium pl-8 text-green-600">
              Reklam Harcaması
            </TableCell>
            <TableCell>
              {formatCurrency(adsExpenses, "TRY")}{" "}
              <span className="text-gray-500 text-sm">
                (%{adsExpensePercentage.toFixed(1)})
              </span>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-medium">Lead Sayısı</TableCell>
            <TableCell>{leadCount} lead</TableCell>
          </TableRow>

          <TableRow className="border-b">
            <TableCell className="font-medium">Lead Başına Maliyet</TableCell>
            <TableCell>{formatCurrency(avgCostPerLead, "TRY")}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-medium">Satış Sayısı</TableCell>
            <TableCell>{salesCount} satış</TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-medium">Dönüşüm Oranı</TableCell>
            <TableCell>%{conversionRate.toFixed(2)}</TableCell>
          </TableRow>

          <TableRow className="bg-yellow-50">
            <TableCell className="font-medium text-amber-800">
              Satış Başına Maliyet
            </TableCell>
            <TableCell className="font-bold text-amber-800">
              {salesCount > 0
                ? formatCurrency(costPerSale, "TRY")
                : "Hesaplanamadı (satış yok)"}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
}
