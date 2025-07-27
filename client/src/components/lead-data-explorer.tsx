import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, Filter, Download, Eye, FileText, FileSpreadsheet, Settings, EyeOff, ChevronDown, X } from "lucide-react";
import { Lead } from "@shared/schema";

interface LeadDataExplorerProps {
  leads: Lead[];
  isLoading?: boolean;
}

export default function LeadDataExplorer({ leads = [], isLoading = false }: LeadDataExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [leadTypeFilter, setLeadTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [salesRepFilter, setSalesRepFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set([
    'customerInfo', 'leadType', 'projectName', 'status', 'assignedPersonnel', 
    'requestDate', 'firstCustomerSource', 'webFormNote'
  ]));
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Get unique values for filters
  const uniqueLeadTypes = [...new Set(leads.map(lead => lead.leadType).filter(Boolean))];
  const uniqueStatuses = [...new Set(leads.map(lead => lead.status).filter(Boolean))];
  const uniqueSalesReps = [...new Set(leads.map(lead => lead.assignedPersonnel).filter(Boolean))];
  const uniqueSources = [...new Set(leads.map(lead => lead.firstCustomerSource).filter(Boolean))];
  const uniqueProjects = [...new Set(leads.map(lead => lead.projectName).filter(Boolean))];

  // Define all available columns
  const allColumns = [
    { key: 'customerInfo', label: 'Müşteri Bilgileri', essential: true },
    { key: 'leadType', label: 'Lead Tipi', essential: true },
    { key: 'projectName', label: 'Proje Adı', essential: false },
    { key: 'status', label: 'Durum', essential: true },
    { key: 'assignedPersonnel', label: 'Atanan Personel', essential: false },
    { key: 'requestDate', label: 'Talep Tarihi', essential: false },
    { key: 'firstCustomerSource', label: 'İlk Kaynak', essential: false },
    { key: 'formCustomerSource', label: 'Form Kaynağı', essential: false },
    { key: 'infoFormOrigin', label: 'Form Geliş Yeri', essential: false },
    { key: 'reminderPersonnel', label: 'Hatırlatma Personeli', essential: false },
    { key: 'customerCalled', label: 'Geri Dönüş', essential: false },
    { key: 'emailSent', label: 'Mail Gönderildi', essential: false },
    { key: 'oneOnOneMeeting', label: 'Görüşme Yapıldı', essential: false },
    { key: 'oneOnOneDate', label: 'Görüşme Tarihi', essential: false },
    { key: 'saleMade', label: 'Satış Yapıldı', essential: false },
    { key: 'saleQuantity', label: 'Satış Adedi', essential: false },
    { key: 'appointmentDate', label: 'Randevu Tarihi', essential: false },
    { key: 'lastMeetingResult', label: 'Son Görüşme Sonucu', essential: false },
    { key: 'lastMeetingNote', label: 'Son Görüşme Notu', essential: false },
    { key: 'webFormNote', label: 'WebForm Notu', essential: false }
  ];

  // Filter and sort leads
  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leads.filter(lead => {
      const matchesSearch = !searchTerm || 
        lead.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.customerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.contactId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.webFormNote?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.lastMeetingNote?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLeadType = leadTypeFilter === "all" || lead.leadType === leadTypeFilter;
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesSalesRep = salesRepFilter === "all" || lead.assignedPersonnel === salesRepFilter;
      const matchesSource = sourceFilter === "all" || lead.firstCustomerSource === sourceFilter;
      const matchesProject = projectFilter === "all" || lead.projectName === projectFilter;

      // Date range filtering
      const matchesDateRange = (() => {
        if (dateRangeFilter === "all") return true;
        if (!lead.requestDate) return false;
        
        const leadDate = new Date(lead.requestDate);
        const now = new Date();
        
        switch (dateRangeFilter) {
          case "today":
            return leadDate.toDateString() === now.toDateString();
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return leadDate >= weekAgo;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return leadDate >= monthAgo;
          case "quarter":
            const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            return leadDate >= quarterAgo;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesLeadType && matchesStatus && matchesSalesRep && 
             matchesSource && matchesProject && matchesDateRange;
    });

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField as keyof Lead] || '';
        let bValue = b[sortField as keyof Lead] || '';
        
        // Convert to string for comparison
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
        
        if (sortDirection === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    return filtered;
  }, [leads, searchTerm, leadTypeFilter, statusFilter, salesRepFilter, sourceFilter, 
      projectFilter, dateRangeFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = filteredAndSortedLeads.slice(startIndex, startIndex + itemsPerPage);

  // Export functions
  const exportToCSV = () => {
    const headers = allColumns.filter(col => visibleColumns.has(col.key)).map(col => col.label);
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedLeads.map(lead => 
        allColumns.filter(col => visibleColumns.has(col.key)).map(col => {
          let value = '';
          switch (col.key) {
            case 'customerInfo':
              value = `"${lead.customerName || ''} (ID: ${lead.customerId || ''})"`;
              break;
            case 'leadType':
              value = getLeadTypeLabel(lead.leadType || '');
              break;
            default:
              value = `"${lead[col.key as keyof Lead] || ''}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lead_data_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToExcel = () => {
    // Simple Excel export using data URLs
    const headers = allColumns.filter(col => visibleColumns.has(col.key)).map(col => col.label);
    const data = filteredAndSortedLeads.map(lead => 
      allColumns.filter(col => visibleColumns.has(col.key)).map(col => {
        switch (col.key) {
          case 'customerInfo':
            return `${lead.customerName || ''} (ID: ${lead.customerId || ''})`;
          case 'leadType':
            return getLeadTypeLabel(lead.leadType || '');
          default:
            return lead[col.key as keyof Lead] || '';
        }
      })
    );
    
    const worksheet = [headers, ...data];
    const csvContent = worksheet.map(row => row.join('\t')).join('\n');
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lead_data_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
  };

  // Selection functions
  const toggleLeadSelection = (leadId: string) => {
    const newSelection = new Set(selectedLeads);
    if (newSelection.has(leadId)) {
      newSelection.delete(leadId);
    } else {
      newSelection.add(leadId);
    }
    setSelectedLeads(newSelection);
  };

  const selectAllVisible = () => {
    const allVisibleIds = paginatedLeads.map(lead => lead.id?.toString() || lead.customerId || '');
    setSelectedLeads(new Set(allVisibleIds));
  };

  const clearSelection = () => {
    setSelectedLeads(new Set());
  };

  // Sort function
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setLeadTypeFilter("all");
    setStatusFilter("all");
    setSalesRepFilter("all");
    setSourceFilter("all");
    setProjectFilter("all");
    setDateRangeFilter("all");
    setCurrentPage(1);
  };

  // Lead type color mapping
  const getLeadTypeColor = (leadType: string) => {
    switch (leadType) {
      case 'satis': return 'bg-green-100 text-green-800 border-green-200';
      case 'kiralama': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLeadTypeLabel = (leadType: string) => {
    switch (leadType) {
      case 'satis': return 'Satılık';
      case 'kiralama': return 'Kiralık';
      default: return leadType || 'Belirtilmemiş';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Lead Veri Keşifçisi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Veriler yükleniyor...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Lead Veri Keşifçisi - Tüm Detaylar
          <Badge variant="outline" className="ml-auto">
            {filteredAndSortedLeads.length} / {leads.length} Lead
          </Badge>
        </CardTitle>
        <div className="text-sm text-gray-600 mt-1">
          Yatay kaydırma ile tüm lead detaylarını görüntüleyebilirsiniz
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Header Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search and Quick Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Arama yapın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 min-w-[300px]"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={leadTypeFilter} onValueChange={setLeadTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Lead Tipi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Tipler</SelectItem>
                  {uniqueLeadTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {getLeadTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 kayıt</SelectItem>
                  <SelectItem value="15">15 kayıt</SelectItem>
                  <SelectItem value="25">25 kayıt</SelectItem>
                  <SelectItem value="50">50 kayıt</SelectItem>
                  <SelectItem value="100">100 kayıt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Advanced Filters */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtreler
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-4">
                  <h4 className="font-semibold">Gelişmiş Filtreler</h4>
                  
                  <div className="space-y-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Durum Filtrele" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Durumlar</SelectItem>
                        {uniqueStatuses.map(status => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={salesRepFilter} onValueChange={setSalesRepFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Temsilci" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Temsilciler</SelectItem>
                        {uniqueSalesReps.map(rep => (
                          <SelectItem key={rep} value={rep}>
                            {rep}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kaynak" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Kaynaklar</SelectItem>
                        {uniqueSources.map(source => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={projectFilter} onValueChange={setProjectFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Proje" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Projeler</SelectItem>
                        {uniqueProjects.map(project => (
                          <SelectItem key={project} value={project}>
                            {project}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tarih Aralığı" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Tarihler</SelectItem>
                        <SelectItem value="today">Bugün</SelectItem>
                        <SelectItem value="week">Son 7 Gün</SelectItem>
                        <SelectItem value="month">Son 30 Gün</SelectItem>
                        <SelectItem value="quarter">Son 90 Gün</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Filtreleri Temizle
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Column Visibility */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <EyeOff className="h-4 w-4 mr-2" />
                  Gizle
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Sütun Görünürlüğü</SheetTitle>
                  <SheetDescription>
                    Tabloda görüntülemek istediğiniz sütunları seçin
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {allColumns.map(column => (
                    <div key={column.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={column.key}
                        checked={visibleColumns.has(column.key)}
                        onCheckedChange={(checked) => {
                          const newVisible = new Set(visibleColumns);
                          if (checked) {
                            newVisible.add(column.key);
                          } else if (!column.essential) {
                            newVisible.delete(column.key);
                          }
                          setVisibleColumns(newVisible);
                        }}
                        disabled={column.essential}
                      />
                      <label
                        htmlFor={column.key}
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                          column.essential ? 'text-gray-500' : ''
                        }`}
                      >
                        {column.label} {column.essential && '(Zorunlu)'}
                      </label>
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => setVisibleColumns(new Set(allColumns.map(c => c.key)))}
                      className="w-full mb-2"
                    >
                      Tümünü Göster
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setVisibleColumns(new Set(allColumns.filter(c => c.essential).map(c => c.key)))}
                      className="w-full"
                    >
                      Sadece Zorunlu
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Export Buttons */}
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <FileText className="h-4 w-4 mr-2" />
              CSV
            </Button>
            
            <Button variant="outline" size="sm" onClick={exportToExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>

        {/* Statistics Summary with Selection Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredAndSortedLeads.filter(lead => lead.leadType === 'satis').length}
            </div>
            <div className="text-sm text-gray-600">Satılık Leadleri</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredAndSortedLeads.filter(lead => lead.leadType === 'kiralama').length}
            </div>
            <div className="text-sm text-gray-600">Kiralık Leadleri</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {filteredAndSortedLeads.length}
            </div>
            <div className="text-sm text-gray-600">Toplam Gösterilen</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {selectedLeads.size}
            </div>
            <div className="text-sm text-gray-600">Seçili Lead</div>
            {selectedLeads.size > 0 && (
              <Button 
                variant="link" 
                size="sm" 
                onClick={clearSelection}
                className="text-xs p-0 h-auto"
              >
                Seçimi Temizle
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedLeads.size > 0 && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-medium text-blue-800">
              {selectedLeads.size} lead seçildi
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={exportToCSV}>
                Seçilileri CSV'ye Aktar
              </Button>
              <Button size="sm" variant="outline" onClick={exportToExcel}>
                Seçilileri Excel'e Aktar
              </Button>
            </div>
          </div>
        )}

        {/* Comprehensive Data Table with Horizontal Scrolling */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto" style={{ maxHeight: '70vh' }}>
            <Table className="min-w-full lead-data-table">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  {/* Selection Column */}
                  <TableHead className="w-12 sticky left-0 bg-gray-50 z-10">
                    <Checkbox
                      checked={selectedLeads.size === paginatedLeads.length && paginatedLeads.length > 0}
                      onCheckedChange={() => {
                        if (selectedLeads.size === paginatedLeads.length) {
                          clearSelection();
                        } else {
                          selectAllVisible();
                        }
                      }}
                    />
                  </TableHead>
                  
                  {/* Dynamic columns based on visibility */}
                  {visibleColumns.has('customerInfo') && (
                    <TableHead 
                      className="font-semibold min-w-[200px] sticky left-12 bg-gray-50 z-10 border-r cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('customerName')}
                    >
                      Müşteri Bilgileri
                      {sortField === 'customerName' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                  )}
                  
                  {visibleColumns.has('leadType') && (
                    <TableHead 
                      className="font-semibold min-w-[120px] cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('leadType')}
                    >
                      Lead Tipi
                      {sortField === 'leadType' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                  )}
                  
                  {visibleColumns.has('projectName') && (
                    <TableHead 
                      className="font-semibold min-w-[150px] cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('projectName')}
                    >
                      Proje Adı
                      {sortField === 'projectName' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                  )}
                  
                  {visibleColumns.has('status') && (
                    <TableHead 
                      className="font-semibold min-w-[120px] cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      Durum
                      {sortField === 'status' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                  )}
                  
                  {visibleColumns.has('assignedPersonnel') && (
                    <TableHead 
                      className="font-semibold min-w-[150px] cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('assignedPersonnel')}
                    >
                      Atanan Personel
                      {sortField === 'assignedPersonnel' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                  )}
                  
                  {visibleColumns.has('requestDate') && (
                    <TableHead 
                      className="font-semibold min-w-[120px] cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('requestDate')}
                    >
                      Talep Tarihi
                      {sortField === 'requestDate' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                  )}
                  
                  {visibleColumns.has('firstCustomerSource') && (
                    <TableHead className="font-semibold min-w-[120px]">İlk Kaynak</TableHead>
                  )}
                  
                  {visibleColumns.has('formCustomerSource') && (
                    <TableHead className="font-semibold min-w-[120px]">Form Kaynağı</TableHead>
                  )}
                  
                  {visibleColumns.has('infoFormOrigin') && (
                    <TableHead className="font-semibold min-w-[150px]">Form Geliş Yeri</TableHead>
                  )}
                  
                  {visibleColumns.has('reminderPersonnel') && (
                    <TableHead className="font-semibold min-w-[150px]">Hatırlatma Personeli</TableHead>
                  )}
                  
                  {visibleColumns.has('customerCalled') && (
                    <TableHead className="font-semibold min-w-[120px]">Geri Dönüş</TableHead>
                  )}
                  
                  {visibleColumns.has('emailSent') && (
                    <TableHead className="font-semibold min-w-[120px]">Mail Gönderildi</TableHead>
                  )}
                  
                  {visibleColumns.has('oneOnOneMeeting') && (
                    <TableHead className="font-semibold min-w-[120px]">Görüşme Yapıldı</TableHead>
                  )}
                  
                  {visibleColumns.has('oneOnOneDate') && (
                    <TableHead className="font-semibold min-w-[120px]">Görüşme Tarihi</TableHead>
                  )}
                  
                  {visibleColumns.has('saleMade') && (
                    <TableHead className="font-semibold min-w-[120px]">Satış Yapıldı</TableHead>
                  )}
                  
                  {visibleColumns.has('saleQuantity') && (
                    <TableHead className="font-semibold min-w-[100px]">Satış Adedi</TableHead>
                  )}
                  
                  {visibleColumns.has('appointmentDate') && (
                    <TableHead className="font-semibold min-w-[120px]">Randevu Tarihi</TableHead>
                  )}
                  
                  {visibleColumns.has('lastMeetingResult') && (
                    <TableHead className="font-semibold min-w-[250px]">Son Görüşme Sonucu</TableHead>
                  )}
                  
                  {visibleColumns.has('lastMeetingNote') && (
                    <TableHead className="font-semibold min-w-[250px]">Son Görüşme Notu</TableHead>
                  )}
                  
                  {visibleColumns.has('webFormNote') && (
                    <TableHead className="font-semibold min-w-[300px]">WebForm Notu</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={21} className="text-center py-8 text-gray-500">
                      {searchTerm || leadTypeFilter !== "all" || statusFilter !== "all" || salesRepFilter !== "all" 
                        ? "Filtrelere uygun lead bulunamadı" 
                        : "Henüz lead verisi yok"}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLeads.map((lead, index) => {
                    const leadId = lead.id?.toString() || lead.customerId || '';
                    const isSelected = selectedLeads.has(leadId);
                    
                    return (
                      <TableRow 
                        key={leadId || `${lead.customerId}-${index}`} 
                        className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                      >
                        {/* Selection Checkbox */}
                        <TableCell className="sticky left-0 bg-white z-10 w-12">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleLeadSelection(leadId)}
                          />
                        </TableCell>
                        
                        {/* Dynamic columns based on visibility */}
                        {visibleColumns.has('customerInfo') && (
                          <TableCell className="sticky left-12 bg-white z-10 border-r min-w-[200px]">
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{lead.customerName || 'İsimsiz'}</div>
                              <div className="text-xs text-gray-500">
                                <div>Müşteri ID: {lead.customerId}</div>
                                <div>İletişim ID: {lead.contactId}</div>
                              </div>
                            </div>
                          </TableCell>
                        )}
                        
                        {visibleColumns.has('leadType') && (
                          <TableCell className="min-w-[120px]">
                            <Badge className={getLeadTypeColor(lead.leadType || '')}>
                              {getLeadTypeLabel(lead.leadType || '')}
                            </Badge>
                          </TableCell>
                        )}
                        
                        {visibleColumns.has('projectName') && (
                          <TableCell className="min-w-[150px] text-sm">
                            <div className="max-w-[140px] truncate" title={lead.projectName || 'Belirtilmemiş'}>
                              {lead.projectName || 'Belirtilmemiş'}
                            </div>
                          </TableCell>
                        )}
                        
                        {visibleColumns.has('status') && (
                          <TableCell className="min-w-[120px]">
                            <Badge variant="outline" className="text-xs">
                              {lead.status || 'Durum yok'}
                            </Badge>
                          </TableCell>
                        )}
                        
                        {visibleColumns.has('assignedPersonnel') && (
                          <TableCell className="min-w-[150px] text-sm">
                            {lead.assignedPersonnel || 'Atanmamış'}
                          </TableCell>
                        )}
                        
                        {visibleColumns.has('requestDate') && (
                          <TableCell className="min-w-[120px] text-sm">
                            {lead.requestDate || 'Tarih yok'}
                          </TableCell>
                        )}
                        
                        {visibleColumns.has('firstCustomerSource') && (
                          <TableCell className="min-w-[120px] text-sm">
                            {lead.firstCustomerSource || '-'}
                          </TableCell>
                        )}
                        
                        {visibleColumns.has('formCustomerSource') && (
                          <TableCell className="min-w-[120px] text-sm">
                            {lead.formCustomerSource || '-'}
                          </TableCell>
                        )}
                        
                        {visibleColumns.has('infoFormOrigin') && (
                          <TableCell className="min-w-[150px] text-sm">
                            {lead.infoFormOrigin || '-'}
                          </TableCell>
                        )}
                        
                        {visibleColumns.has('reminderPersonnel') && (
                          <TableCell className="min-w-[150px] text-sm">
                            {lead.reminderPersonnel || '-'}
                          </TableCell>
                        )}
                        
                        {visibleColumns.has('customerCalled') && (
                          <TableCell className="min-w-[120px] text-sm">
                            {lead.customerCalled || '-'}
                          </TableCell>
                        )}
                        
                        {visibleColumns.has('emailSent') && (
                          <TableCell className="min-w-[120px] text-sm">
                            {lead.emailSent || '-'}
                          </TableCell>
                        )}
                        
                        {visibleColumns.has('oneOnOneMeeting') && (
                          <TableCell className="min-w-[120px] text-sm">
                            {lead.oneOnOneMeeting || '-'}
                          </TableCell>
                        )}
                        
                        {visibleColumns.has('oneOnOneDate') && (
                          <TableCell className="min-w-[120px] text-sm">
                            {lead.oneOnOneDate || '-'}
                          </TableCell>
                        )}
                        
                        {visibleColumns.has('saleMade') && (
                          <TableCell className="min-w-[120px] text-sm">
                            {lead.saleMade || '-'}
                          </TableCell>
                        )}
                        
                        {visibleColumns.has('saleQuantity') && (
                          <TableCell className="min-w-[100px] text-sm text-center">
                            {lead.saleQuantity || '-'}
                          </TableCell>
                        )}
                        
                        {visibleColumns.has('appointmentDate') && (
                          <TableCell className="min-w-[120px] text-sm">
                            {lead.appointmentDate || '-'}
                          </TableCell>
                        )}
                        
                        {visibleColumns.has('lastMeetingResult') && (
                          <TableCell className="min-w-[250px] text-sm">
                            <div className="max-w-[240px] truncate" title={lead.lastMeetingResult || '-'}>
                              {lead.lastMeetingResult || '-'}
                            </div>
                          </TableCell>
                        )}
                        
                        {visibleColumns.has('lastMeetingNote') && (
                          <TableCell className="min-w-[250px] text-sm">
                            <div className="max-w-[240px] truncate" title={lead.lastMeetingNote || '-'}>
                              {lead.lastMeetingNote || '-'}
                            </div>
                          </TableCell>
                        )}
                        
                        {visibleColumns.has('webFormNote') && (
                          <TableCell className="min-w-[300px] text-sm text-gray-600">
                            <div className="max-w-[290px] truncate" title={lead.webFormNote || '-'}>
                              {lead.webFormNote || '-'}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedLeads.length)} / {filteredAndSortedLeads.length} lead gösteriliyor
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
              <div className="flex items-center gap-1">
                <span className="text-sm">
                  Sayfa {currentPage} / {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Sonraki
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}