import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Filter, X, Clock } from "lucide-react";

interface DateFilterProps {
  onFilterChange: (filters: {
    startDate: string;
    endDate: string;
    month: string;
    year: string;
  }) => void;
  initialFilters?: {
    startDate: string;
    endDate: string;
    month: string;
    year: string;
  };
  className?: string;
}

export default function DateFilter({ onFilterChange, initialFilters, className }: DateFilterProps) {
  const [filters, setFilters] = useState(initialFilters || {
    startDate: '',
    endDate: '',
    month: '',
    year: ''
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  const months = [
    { value: '01', label: 'Ocak' },
    { value: '02', label: 'Şubat' },
    { value: '03', label: 'Mart' },
    { value: '04', label: 'Nisan' },
    { value: '05', label: 'Mayıs' },
    { value: '06', label: 'Haziran' },
    { value: '07', label: 'Temmuz' },
    { value: '08', label: 'Ağustos' },
    { value: '09', label: 'Eylül' },
    { value: '10', label: 'Ekim' },
    { value: '11', label: 'Kasım' },
    { value: '12', label: 'Aralık' }
  ];

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange && typeof onFilterChange === 'function') {
      onFilterChange(newFilters);
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      startDate: '',
      endDate: '',
      month: '',
      year: ''
    };
    setFilters(clearedFilters);
    if (onFilterChange && typeof onFilterChange === 'function') {
      onFilterChange(clearedFilters);
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <Card className={`border-blue-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Tarih Filtresi
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              Aktif
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Month/Year Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="month-filter" className="text-xs font-medium">
              Ay Seçimi
            </Label>
            <Select
              value={filters.month}
              onValueChange={(value) => handleFilterChange('month', value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Ay seçin" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="year-filter" className="text-xs font-medium">
              Yıl Seçimi
            </Label>
            <Select
              value={filters.year}
              onValueChange={(value) => handleFilterChange('year', value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Yıl seçin" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Özel Tarih Aralığı</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start-date" className="text-xs text-gray-600">
                Başlangıç Tarihi
              </Label>
              <Input
                id="start-date"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="end-date" className="text-xs text-gray-600">
                Bitiş Tarihi
              </Label>
              <Input
                id="end-date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Filter className="h-3 w-3 text-gray-500" />
            <span className="text-xs text-gray-600">
              {hasActiveFilters ? 'Filtre aktif' : 'Filtre yok'}
            </span>
          </div>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Temizle
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {filters.month && (
              <Badge variant="secondary" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {months.find(m => m.value === filters.month)?.label} {filters.year}
              </Badge>
            )}
            {filters.startDate && (
              <Badge variant="secondary" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {filters.startDate} - {filters.endDate || 'Şu an'}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}