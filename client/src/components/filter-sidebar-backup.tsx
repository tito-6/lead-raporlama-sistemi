import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Filter,
  RotateCcw,
  Building,
  Users,
  Activity,
  Tag,
  MapPin,
  Calendar,
  X,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Brain,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Move
} from 'lucide-react';
import { useFilters } from '@/contexts/filter-context';

function FilterSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // Load saved position from localStorage on component mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('filterSidebarPosition');
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch (e) {
        console.error('Error loading sidebar position:', e);
      }
    }
    
    const savedCollapsed = localStorage.getItem('filterSidebarCollapsed');
    if (savedCollapsed) {
      setCollapsed(savedCollapsed === 'true');
    }
  }, []);
  
  // Save position to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('filterSidebarPosition', JSON.stringify(position));
  }, [position]);
  
  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('filterSidebarCollapsed', String(collapsed));
  }, [collapsed]);
  
  // Handle drag stop to save position
  const handleDragStop = (e: any, data: any) => {
    setPosition({ x: data.x, y: data.y });
  };
  
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };
  const { filters, setFilters, resetFilters, clearCache, filteredLeads } = useFilters();

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ [key]: value });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.selectedProject !== 'all') count++;
    if (filters.selectedSalesperson !== 'all') count++;
    if (filters.selectedStatus !== 'all') count++;
    if (filters.selectedLeadType !== 'all') count++;
    if (filters.selectedSource !== 'all') count++;
    if (filters.dateFilterType !== 'none') count++;
    if (filters.isRealTime) count++;
    if (filters.isAiPowered) count++;
    return count;
  };

  const clearFilter = (filterKey: string) => {
    if (filterKey === 'dates') {
      setFilters({ 
        startDate: '', 
        endDate: '', 
        selectedMonth: '',
        selectedYear: '',
        dateFilterType: 'none' 
      });
    } else if (filterKey === 'dateFilterType') {
      setFilters({ 
        dateFilterType: 'none',
        selectedMonth: '',
        selectedYear: '',
        startDate: '',
        endDate: ''
      });
    } else {
      setFilters({ [filterKey]: filterKey.includes('is') ? false : 'all' });
    }
  };

  const activeFiltersCount = getActiveFiltersCount();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const months = [
    { value: '1', label: 'Ocak' },
    { value: '2', label: 'Şubat' },
    { value: '3', label: 'Mart' },
    { value: '4', label: 'Nisan' },
    { value: '5', label: 'Mayıs' },
    { value: '6', label: 'Haziran' },
    { value: '7', label: 'Temmuz' },
    { value: '8', label: 'Ağustos' },
    { value: '9', label: 'Eylül' },
    { value: '10', label: 'Ekim' },
    { value: '11', label: 'Kasım' },
    { value: '12', label: 'Aralık' }
  ];

  return (
    <Draggable
      handle=".sidebar-drag-handle"
      position={position}
      onStop={handleDragStop}
      bounds="body"
    >
      <div className={`fixed z-50 ${collapsed ? 'w-16' : 'w-80'} bg-white border border-gray-200 rounded-lg shadow-lg h-auto max-h-[90vh] overflow-y-auto`}>
        {/* Drag handle */}
        <div className="sidebar-drag-handle flex items-center justify-between p-2 bg-blue-50 border-b border-blue-200 cursor-move">
          <div className="flex items-center gap-2">
            <Move className="h-4 w-4 text-blue-600" />
            {!collapsed && <span className="text-sm font-medium text-blue-700">Filtreler</span>}
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapse}
              className="h-8 w-8 p-0 rounded-full hover:bg-blue-100"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {!collapsed && (
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Filtreler</h2>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Results Summary */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-800">
                {filteredLeads.length}
              </div>
              <div className="text-sm text-blue-600">Lead bulundu</div>
            </div>
          </CardContent>
        </Card>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-800">
                Aktif Filtreler
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {filters.selectedProject !== 'all' && (
                <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                  <span className="text-sm text-gray-700">
                    Proje: {filters.selectedProject}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('selectedProject')}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {filters.selectedSalesperson !== 'all' && (
                <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                  <span className="text-sm text-gray-700">
                    Temsilci: {filters.selectedSalesperson}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('selectedSalesperson')}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {filters.selectedStatus !== 'all' && (
                <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                  <span className="text-sm text-gray-700">
                    Durum: {filters.selectedStatus}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('selectedStatus')}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {filters.selectedLeadType !== 'all' && (
                <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                  <span className="text-sm text-gray-700">
                    Tip: {filters.selectedLeadType === 'satis' ? 'Satış' : 'Kiralama'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('selectedLeadType')}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {filters.selectedSource !== 'all' && (
                <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                  <span className="text-sm text-gray-700">
                    Kaynak: {filters.selectedSource}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('selectedSource')}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {filters.dateFilterType !== 'none' && (
                <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                  <span className="text-sm text-gray-700">
                    Tarih: {filters.dateFilterType === 'month' ? 'Ay' : 
                           filters.dateFilterType === 'year' ? 'Yıl' : 'Özel'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('dateFilterType')}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {filters.isRealTime && (
                <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                  <span className="text-sm text-gray-700">
                    Gerçek Zamanlı: Açık
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('isRealTime')}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {filters.isAiPowered && (
                <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                  <span className="text-sm text-gray-700">
                    AI Destekli: Açık
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('isAiPowered')}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Project Filter */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Building className="h-4 w-4 text-blue-600" />
            Proje Filtresi
          </Label>
          <Select
            value={filters.selectedProject}
            onValueChange={(value) => handleFilterChange('selectedProject', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Proje seçiniz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Projeler</SelectItem>
              {filters.availableProjects.map((project) => (
                <SelectItem key={project} value={project}>
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Date Filter */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4 text-indigo-600" />
            Tarih Filtresi
          </Label>
          <div className="space-y-2">
            <Select
              value={filters.dateFilterType}
              onValueChange={(value) => handleFilterChange('dateFilterType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tarih filtresi seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tarih Filtresi Yok</SelectItem>
                <SelectItem value="month">Ay Seçimi</SelectItem>
                <SelectItem value="year">Yıl Seçimi</SelectItem>
                <SelectItem value="custom">Özel Tarih Aralığı</SelectItem>
              </SelectContent>
            </Select>

            {filters.dateFilterType === 'month' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">Ay</Label>
                  <Select
                    value={filters.selectedMonth}
                    onValueChange={(value) => handleFilterChange('selectedMonth', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ay" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Ay Seçin</SelectItem>
                      {months.map(month => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Yıl</Label>
                  <Select
                    value={filters.selectedYear}
                    onValueChange={(value) => handleFilterChange('selectedYear', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Yıl" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Yıl Seçin</SelectItem>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {filters.dateFilterType === 'year' && (
              <div>
                <Label className="text-xs text-gray-600">Yıl</Label>
                <Select
                  value={filters.selectedYear}
                  onValueChange={(value) => handleFilterChange('selectedYear', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Yıl seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Yıl Seçin</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {filters.dateFilterType === 'custom' && (
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-gray-600">Başlangıç Tarihi</Label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Bitiş Tarihi</Label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Salesperson Filter */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4 text-green-600" />
            Satış Temsilcisi
          </Label>
          <Select
            value={filters.selectedSalesperson}
            onValueChange={(value) => handleFilterChange('selectedSalesperson', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Temsilci seçiniz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Temsilciler</SelectItem>
              {filters.availableSalesReps.map((rep) => (
                <SelectItem key={rep.id} value={rep.name}>
                  {rep.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Status Filter */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Activity className="h-4 w-4 text-orange-600" />
            Durum
          </Label>
          <Select
            value={filters.selectedStatus}
            onValueChange={(value) => handleFilterChange('selectedStatus', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Durum seçiniz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              {filters.availableStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Lead Type Filter */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Tag className="h-4 w-4 text-purple-600" />
            Lead Tipi
          </Label>
          <Select
            value={filters.selectedLeadType}
            onValueChange={(value) => handleFilterChange('selectedLeadType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tip seçiniz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Tipler</SelectItem>
              <SelectItem value="satis">Satış</SelectItem>
              <SelectItem value="kiralama">Kiralama</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Source Filter */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4 text-red-600" />
            Kaynak
          </Label>
          <Select
            value={filters.selectedSource}
            onValueChange={(value) => handleFilterChange('selectedSource', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Kaynak seçiniz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kaynaklar</SelectItem>
              {filters.availableSources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Chart Type Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <BarChart3 className="h-4 w-4 text-cyan-600" />
            Grafik Türü
          </Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={filters.chartType === 'pie' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ chartType: 'pie' })}
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <PieChart className="w-4 h-4" />
              <span className="text-xs">Pasta</span>
            </Button>
            <Button
              variant={filters.chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ chartType: 'bar' })}
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs">Çubuk</span>
            </Button>
            <Button
              variant={filters.chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ chartType: 'line' })}
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <LineChart className="w-4 h-4" />
              <span className="text-xs">Çizgi</span>
            </Button>
          </div>
        </div>

        <Separator />

        {/* Display Options */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Activity className="h-4 w-4 text-emerald-600" />
            Görüntü Seçenekleri
          </Label>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">Gerçek Zamanlı</span>
            </div>
            <Button
              variant={filters.isRealTime ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ isRealTime: !filters.isRealTime })}
              className="text-xs"
            >
              {filters.isRealTime ? 'Açık' : 'Kapalı'}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              <span className="text-sm">AI Destekli</span>
            </div>
            <Button
              variant={filters.isAiPowered ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ isAiPowered: !filters.isAiPowered })}
              className="text-xs"
            >
              {filters.isAiPowered ? 'Açık' : 'Kapalı'}
            </Button>
          </div>
        </div>

        <Separator />

        {/* System Actions */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Trash2 className="h-4 w-4 text-red-600" />
            Sistem
          </Label>
          <Button
            variant="destructive"
            size="sm"
            onClick={clearCache}
            className="w-full text-xs"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Önbelleği Temizle
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FilterSidebar;
