import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react";

interface ReasonData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface SmartReasonsTableProps {
  data: ReasonData[];
  title: string;
  className?: string;
}

export default function SmartReasonsTable({ data, title, className }: SmartReasonsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'percentage'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAll, setShowAll] = useState(false);
  const [selectedRange, setSelectedRange] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Filter and sort data
  const filteredData = data
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedRange === 'all' || 
       (selectedRange === 'high' && item.percentage >= 10) ||
       (selectedRange === 'medium' && item.percentage >= 5 && item.percentage < 10) ||
       (selectedRange === 'low' && item.percentage < 5))
    )
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });

  const displayData = showAll ? filteredData : filteredData.slice(0, 10);

  const getRangeBadgeColor = (percentage: number) => {
    if (percentage >= 10) return "bg-red-500";
    if (percentage >= 5) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getRangeLabel = (percentage: number) => {
    if (percentage >= 10) return "Yüksek";
    if (percentage >= 5) return "Orta";
    return "Düşük";
  };

  return (
    <Card className={`shadow-lg border-2 border-orange-100 dark:border-orange-800 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
        <CardTitle className="flex items-center text-orange-700 dark:text-orange-300">
          📊 {title}
        </CardTitle>
        <CardDescription>
          {data.length} farklı neden tespit edildi. Akıllı filtreleme ve sıralama ile detaylı analiz.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Olumsuzluk nedeni ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedRange} onValueChange={(value: 'all' | 'high' | 'medium' | 'low') => setSelectedRange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Aralıklar</SelectItem>
              <SelectItem value="high">Yüksek (%10+)</SelectItem>
              <SelectItem value="medium">Orta (%5-10)</SelectItem>
              <SelectItem value="low">Düşük (%5-)</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value: 'name' | 'value' | 'percentage') => setSortBy(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="value">Adet</SelectItem>
              <SelectItem value="percentage">Yüzde</SelectItem>
              <SelectItem value="name">Ad</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="w-[100px]"
          >
            {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {sortOrder === 'asc' ? 'Artan' : 'Azalan'}
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="text-sm text-red-600 dark:text-red-400 font-medium">Yüksek Etkili</div>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {data.filter(item => item.percentage >= 10).length}
            </div>
            <div className="text-xs text-red-500 dark:text-red-400">%10 ve üzeri</div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Orta Etkili</div>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {data.filter(item => item.percentage >= 5 && item.percentage < 10).length}
            </div>
            <div className="text-xs text-yellow-500 dark:text-yellow-400">%5-10 arası</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">Düşük Etkili</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {data.filter(item => item.percentage < 5).length}
            </div>
            <div className="text-xs text-green-500 dark:text-green-400">%5 altı</div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                    Olumsuzluk Nedeni
                  </div>
                </th>
                <th className="text-center p-3 font-semibold text-gray-900 dark:text-gray-100">Adet</th>
                <th className="text-center p-3 font-semibold text-gray-900 dark:text-gray-100">Yüzde</th>
                <th className="text-center p-3 font-semibold text-gray-900 dark:text-gray-100">Etki</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((item, index) => (
                <tr 
                  key={index} 
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="text-center p-3">
                    <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                      {item.value}
                    </span>
                  </td>
                  <td className="text-center p-3">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {item.percentage}%
                    </span>
                  </td>
                  <td className="text-center p-3">
                    <Badge className={`text-white ${getRangeBadgeColor(item.percentage)}`}>
                      {getRangeLabel(item.percentage)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Show More/Less Button */}
        {filteredData.length > 10 && (
          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2"
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Daha Az Göster
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Tümünü Göster ({filteredData.length - 10} daha)
                </>
              )}
            </Button>
          </div>
        )}

        {/* Results Info */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          {filteredData.length > 0 ? (
            <>
              {filteredData.length} sonuç gösteriliyor
              {searchTerm && ` "${searchTerm}" için`}
              {selectedRange !== 'all' && ` (${selectedRange} etki aralığı)`}
            </>
          ) : (
            "Arama kriterlerinize uygun sonuç bulunamadı."
          )}
        </div>
      </CardContent>
    </Card>
  );
}