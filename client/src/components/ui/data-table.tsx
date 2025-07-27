import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, EyeOff } from "lucide-react";

interface DataTableProps {
  title: string;
  data: Array<Record<string, any>>;
  totalRecords?: number;
  onExport?: () => void;
  className?: string;
}

export function DataTable({ title, data, totalRecords, onExport, className }: DataTableProps) {
  const [isVisible, setIsVisible] = useState(false);

  if (!data || data.length === 0) {
    return (
      <Card className={`mt-4 ${className || ''}`}>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            📊 {title} - Özet Tablosu
            <Badge variant="outline">Veri Yok</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Gösterilecek veri bulunamadı.</p>
        </CardContent>
      </Card>
    );
  }

  const exportToCSV = () => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (onExport) onExport();
  };

  const exportToExcel = () => {
    const headers = Object.keys(data[0]);
    let excelContent = headers.join('\t') + '\n';
    data.forEach(row => {
      excelContent += headers.map(header => row[header] || '').join('\t') + '\n';
    });

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <Card className={`mt-4 ${className || ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            📊 {title} - Özet Tablosu
            <Badge variant="outline">{data.length} kayıt</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVisible(!isVisible)}
              className="flex items-center gap-1"
            >
              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {isVisible ? 'Gizle' : 'Göster'}
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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  {headers.map((header, index) => (
                    <th key={index} className="border border-gray-300 px-3 py-2 text-left font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {headers.map((header, headerIndex) => (
                      <td key={headerIndex} className="border border-gray-300 px-3 py-2">
                        {row[header] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            Toplam {data.length} kayıt {totalRecords ? `• ${totalRecords} toplam veri` : ''}
          </div>
        </CardContent>
      )}
    </Card>
  );
}