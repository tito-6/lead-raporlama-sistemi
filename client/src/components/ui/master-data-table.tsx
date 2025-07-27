import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, Search, Eye, EyeOff, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useColors } from "@/hooks/use-colors";

interface MasterDataTableProps {
  title: string;
  data: any[];
  columns: Array<{
    key: string;
    label: string;
    type?: "text" | "number" | "date" | "badge" | "personnel" | "status";
  }>;
  onExport?: () => void;
}

export function MasterDataTable({
  title,
  data,
  columns,
  onExport,
}: MasterDataTableProps) {
  const { getColor } = useColors();
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  // Filter data based on search term
  const filteredData = data.filter((row) =>
    columns.some((col) => {
      const value = row[col.key];
      return (
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedData = sortedData.slice(
    startIndex,
    startIndex + recordsPerPage
  );

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const exportToCSV = () => {
    const headers = columns.map((col) => col.label);
    const csvContent = [
      headers.join(","),
      ...sortedData.map((row) =>
        columns
          .map((col) => {
            const value = row[col.key];
            return typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${title.replace(/\s+/g, "_")}_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onExport) onExport();
  };

  const exportToExcel = () => {
    const headers = columns.map((col) => col.label);
    let excelContent = headers.join("\t") + "\n";

    sortedData.forEach((row) => {
      const rowData = columns.map((col) => row[col.key] || "");
      excelContent += rowData.join("\t") + "\n";
    });

    const blob = new Blob([excelContent], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${title.replace(/\s+/g, "_")}_${new Date()
        .toISOString()
        .slice(0, 10)}.xls`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderCellValue = (value: any, type: string = "text") => {
    if (value === null || value === undefined) return "-";

    switch (type) {
      case "badge":
        return <Badge variant="outline">{value}</Badge>;
      case "personnel":
        return (
          <Badge
            variant="outline"
            style={{
              backgroundColor: getColor("PERSONNEL", value),
              color: "white",
            }}
          >
            {value}
          </Badge>
        );
      case "status":
        return (
          <Badge
            variant="outline"
            style={{
              backgroundColor: getColor("STATUS", value),
              color: "white",
            }}
          >
            {value}
          </Badge>
        );
      case "number":
        return <span className="font-mono">{value}</span>;
      case "date":
        return <span className="text-sm">{value}</span>;
      default:
        return value;
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-medium flex items-center gap-2">
            📋 {title}
            <Badge variant="outline">{data.length} kayıt</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVisible(!isVisible)}
              className="flex items-center gap-1"
            >
              {isVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {isVisible ? "Gizle" : "Göster"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToExcel}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>
      </CardHeader>

      {isVisible && (
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Arama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>

            <Select
              value={recordsPerPage.toString()}
              onValueChange={(value) => {
                setRecordsPerPage(parseInt(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 kayıt</SelectItem>
                <SelectItem value="25">25 kayıt</SelectItem>
                <SelectItem value="50">50 kayıt</SelectItem>
                <SelectItem value="100">100 kayıt</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              {searchTerm
                ? `${filteredData.length} / ${data.length} kayıt`
                : `${data.length} toplam kayıt`}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="border border-gray-200 px-4 py-2 text-left font-medium cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort(col.key)}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {sortColumn === col.key && (
                          <span className="text-xs">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="border border-gray-200 px-4 py-2"
                      >
                        {renderCellValue(row[col.key], col.type)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                Sayfa {currentPage} / {totalPages}
                (Gösterilen: {startIndex + 1}-
                {Math.min(startIndex + recordsPerPage, sortedData.length)} /{" "}
                {sortedData.length})
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Önceki
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum =
                    Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
