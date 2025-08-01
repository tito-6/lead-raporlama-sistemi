import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import EditableLeadTable from './editable-lead-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, Download, RefreshCw, Users, Database, TrendingUp, CheckSquare, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { triggerGlobalLeadDataUpdate } from '@/hooks/use-global-data-sync';

interface Lead {
  id: number;
  customerName: string;
  customerId?: string;
  contactId?: string;
  assignedPersonnel?: string;
  status: string;
  leadType?: string;
  projectName?: string;
  requestDate?: string;
  responseDate?: string;
  webFormNote?: string;
  callNote?: string;
  emailNote?: string;
  lastMeetingResult?: string;
  wasCalledBack?: string;
  wasSaleMade?: string;
  saleCount?: string;
  responseResult?: string;
  negativeReason?: string;
  appointmentDate?: string;
  oneOnOneMeeting?: string; // Birebir Görüşme Yapıldı mı?
  createdAt: string;
}

interface LeadApiResponse {
  leads: Lead[];
  total: number;
  page: number;
  totalPages: number;
}

export default function EnhancedLeadDataTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [salesRepFilter, setSalesRepFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkPersonnel, setBulkPersonnel] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const limit = 50;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leadsData, isLoading, refetch, isFetching } = useQuery<LeadApiResponse>({
    queryKey: ['/api/leads', page, limit, searchTerm, statusFilter, salesRepFilter, projectFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(salesRepFilter !== 'all' && { salesRep: salesRepFilter }),
        ...(projectFilter !== 'all' && { project: projectFilter }),
      });
      
      const response = await fetch(`/api/leads?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      return response.json();
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchInterval: false, // Don't auto-refetch
  });

  // Fetch sales reps for filter dropdown
  const { data: salesReps } = useQuery({
    queryKey: ['/api/sales-reps'],
    queryFn: async () => {
      const response = await fetch('/api/sales-reps');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch unique projects for filter dropdown
  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      // This would need to be implemented in the backend
      return [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ leadId, updates }: { leadId: number; updates: Partial<Lead> }) => {
      console.log(`🔥 Sending PUT request for lead ${leadId}:`, updates);
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // CRITICAL: Include authentication cookies!
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ PUT request failed for lead ${leadId}:`, response.status, errorText);
        throw new Error(`Failed to update lead: ${response.status} ${errorText}`);
      }
      
      console.log(`✅ PUT request successful for lead ${leadId}`);
      return response.json();
    },
    onSuccess: () => {
      // Trigger global data synchronization across all components and reports
      triggerGlobalLeadDataUpdate();
      
      // Note: Removed cache clear call as it was clearing actual data, not just cache
      // Query invalidation through triggerGlobalLeadDataUpdate is sufficient
    },
  });

  const handleLeadUpdate = async (leadId: number, updates: Partial<Lead>) => {
    await updateLeadMutation.mutateAsync({ leadId, updates });
  };

  // Bulk operations
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ leadIds, updates }: { leadIds: number[]; updates: Partial<Lead> }) => {
      console.log(`🔥 Sending bulk PUT request for ${leadIds.length} leads:`, updates);
      const response = await fetch(`/api/leads/bulk-update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ leadIds, updates }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to bulk update leads: ${response.status} ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      triggerGlobalLeadDataUpdate();
      setSelectedLeads(new Set());
      setSelectAll(false);
      
      toast({
        title: "✅ Toplu Güncelleme Başarılı",
        description: `${result.updated} lead başarıyla güncellendi`,
      });
      
      // Note: Removed cache clear call as it was clearing actual data, not just cache
      // Global data sync handles query invalidation properly
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Toplu Güncelleme Hatası",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSelectLead = (leadId: number, checked: boolean) => {
    const newSelected = new Set(selectedLeads);
    if (checked) {
      newSelected.add(leadId);
    } else {
      newSelected.delete(leadId);
    }
    setSelectedLeads(newSelected);
    
    // Update select all state
    if (leadsData?.leads) {
      setSelectAll(newSelected.size === leadsData.leads.length);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && leadsData?.leads) {
      setSelectedLeads(new Set(leadsData.leads.map(lead => lead.id)));
    } else {
      setSelectedLeads(new Set());
    }
    setSelectAll(checked);
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedLeads.size === 0 || !bulkStatus) {
      toast({
        title: "⚠️ Eksik Seçim",
        description: "Lütfen lead'ler ve yeni durum seçin",
        variant: "destructive",
      });
      return;
    }

    await bulkUpdateMutation.mutateAsync({
      leadIds: Array.from(selectedLeads),
      updates: { status: bulkStatus }
    });
  };

  const handleBulkPersonnelUpdate = async () => {
    if (selectedLeads.size === 0 || !bulkPersonnel) {
      toast({
        title: "⚠️ Eksik Seçim",
        description: "Lütfen lead'ler ve personel seçin",
        variant: "destructive",
      });
      return;
    }

    await bulkUpdateMutation.mutateAsync({
      leadIds: Array.from(selectedLeads),
      updates: { assignedPersonnel: bulkPersonnel }
    });
  };

  const exportToCSV = () => {
    if (!leadsData?.leads) return;
    
    const headers = [
      'ID', 'Müşteri Adı', 'Müşteri ID', 'İletişim ID', 'Atanan Personel', 
      'Durum', 'Lead Türü', 'Proje', 'Talep Tarihi', 'WebForm Notu', 
      'Çağrı Notu', 'Son Görüşme Sonucu', 'Oluşturulma Tarihi'
    ];
    
    const csvContent = [
      headers.join(','),
      ...leadsData.leads.map((lead: Lead) => [
        lead.id,
        `"${lead.customerName || ''}"`,
        `"${lead.customerId || ''}"`,
        `"${lead.contactId || ''}"`,
        `"${lead.assignedPersonnel || ''}"`,
        `"${lead.status || ''}"`,
        `"${lead.leadType || ''}"`,
        `"${lead.projectName || ''}"`,
        `"${lead.requestDate || ''}"`,
        `"${(lead.webFormNote || '').replace(/"/g, '""')}"`,
        `"${(lead.callNote || '').replace(/"/g, '""')}"`,
        `"${lead.lastMeetingResult || ''}"`,
        new Date(lead.createdAt).toLocaleDateString('tr-TR')
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({
      title: "Başarılı",
      description: `${leadsData.leads.length} lead CSV olarak indirildi`,
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'salesRep':
        setSalesRepFilter(value);
        break;
      case 'project':
        setProjectFilter(value);
        break;
    }
    setPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSalesRepFilter('all');
    setProjectFilter('all');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            📊 Lead Verileri - Tam Düzenlenebilir Tablo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Lead ara (isim, müşteri ID, iletişim ID, personel...)"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button 
                onClick={() => refetch()} 
                variant="outline"
                disabled={isFetching}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                Yenile
              </Button>
            </div>

            {/* Filter Controls */}
            <div className="flex gap-4 flex-wrap">
              <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Durum Filtresi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="Ulaşılmıyor - Cevap Yok">Ulaşılmıyor - Cevap Yok</SelectItem>
                  <SelectItem value="Aranmayan Lead">Aranmayan Lead</SelectItem>
                  <SelectItem value="Ulaşılmıyor - Bilgi Hatalı">Ulaşılmıyor - Bilgi Hatalı</SelectItem>
                  <SelectItem value="Bilgi Verildi - Tekrar Aranacak">Bilgi Verildi - Tekrar Aranacak</SelectItem>
                  <SelectItem value="Olumsuz">Olumsuz</SelectItem>
                  <SelectItem value="RANDEVU">RANDEVU</SelectItem>
                  <SelectItem value="Müsait Değil">Müsait Değil</SelectItem>
                  <SelectItem value="Potansiyel Takipte">Potansiyel Takipte</SelectItem>
                  <SelectItem value="Satış">Satış</SelectItem>
                </SelectContent>
              </Select>

              <Select value={salesRepFilter} onValueChange={(value) => handleFilterChange('salesRep', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Personel Filtresi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Personel</SelectItem>
                  {salesReps?.map((rep: any) => (
                    <SelectItem key={rep.id} value={rep.name}>
                      {rep.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={clearFilters} variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtreleri Temizle
              </Button>

              <Button onClick={exportToCSV} variant="outline" disabled={!leadsData?.leads?.length}>
                <Download className="h-4 w-4 mr-2" />
                CSV İndir
              </Button>
            </div>

            {/* Bulk Operations */}
            {selectedLeads.size > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      {selectedLeads.size} lead seçildi
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedLeads(new Set());
                      setSelectAll(false);
                    }}
                  >
                    Seçimi Temizle
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bulk Status Update */}
                  <div className="flex gap-2">
                    <Select value={bulkStatus} onValueChange={setBulkStatus}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Yeni durum seç..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ulaşılmıyor - Cevap Yok">Ulaşılmıyor - Cevap Yok</SelectItem>
                        <SelectItem value="Aranmayan Lead">Aranmayan Lead</SelectItem>
                        <SelectItem value="Ulaşılmıyor - Bilgi Hatalı">Ulaşılmıyor - Bilgi Hatalı</SelectItem>
                        <SelectItem value="Bilgi Verildi - Tekrar Aranacak">Bilgi Verildi - Tekrar Aranacak</SelectItem>
                        <SelectItem value="Olumsuz">Olumsuz</SelectItem>
                        <SelectItem value="RANDEVU">RANDEVU</SelectItem>
                        <SelectItem value="Müsait Değil">Müsait Değil</SelectItem>
                        <SelectItem value="Potansiyel Takipte">Potansiyel Takipte</SelectItem>
                        <SelectItem value="Satış">Satış</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleBulkStatusUpdate}
                      disabled={!bulkStatus || bulkUpdateMutation.isPending}
                    >
                      Durumu Güncelle
                    </Button>
                  </div>

                  {/* Bulk Personnel Update */}
                  <div className="flex gap-2">
                    <Select value={bulkPersonnel} onValueChange={setBulkPersonnel}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Personel seç..." />
                      </SelectTrigger>
                      <SelectContent>
                        {salesReps?.map((rep: any) => (
                          <SelectItem key={rep.id} value={rep.name}>
                            {rep.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleBulkPersonnelUpdate}
                      disabled={!bulkPersonnel || bulkUpdateMutation.isPending}
                    >
                      Personel Ata
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          {leadsData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-600" />
                  <div className="text-sm text-blue-600">Toplam Lead</div>
                </div>
                <div className="text-2xl font-bold text-blue-800">{leadsData.total}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <div className="text-sm text-green-600">Bu Sayfada</div>
                </div>
                <div className="text-2xl font-bold text-green-800">{leadsData.leads?.length || 0}</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-yellow-600" />
                  <div className="text-sm text-yellow-600">Sayfa</div>
                </div>
                <div className="text-2xl font-bold text-yellow-800">{page} / {leadsData.totalPages}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-purple-600" />
                  <div className="text-sm text-purple-600">Sayfa Başına</div>
                </div>
                <div className="text-2xl font-bold text-purple-800">{limit}</div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <div>Lead verileri yükleniyor...</div>
            </div>
          )}

          {/* Editable Table */}
          {!isLoading && leadsData?.leads && (
            <>
              <EditableLeadTable
                leads={leadsData.leads}
                onLeadUpdate={handleLeadUpdate}
                loading={updateLeadMutation.isPending}
                selectedLeads={selectedLeads}
                onSelectLead={handleSelectLead}
                selectAll={selectAll}
                onSelectAll={handleSelectAll}
              />
              
              {/* Additional Statistics Table for Randevu and Birebir Görüşme */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Randevu Statistics */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    📅 Randevu İstatistikleri
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-blue-700">RANDEVU Durumundaki Leadler:</span>
                      <span className="font-bold text-blue-900">
                        {leadsData.leads.filter(lead => 
                          lead.status === "RANDEVU" || 
                          lead.lastMeetingResult === "RANDEVU"
                        ).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Randevu Tarihi Belirlenmiş:</span>
                      <span className="font-bold text-blue-900">
                        {leadsData.leads.filter(lead => 
                          lead.appointmentDate && lead.appointmentDate.trim() !== ""
                        ).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Toplam Randevu Oranı:</span>
                      <span className="font-bold text-blue-900">
                        {((leadsData.leads.filter(lead => 
                          lead.status === "RANDEVU" || 
                          lead.lastMeetingResult === "RANDEVU"
                        ).length / leadsData.leads.length) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Birebir Görüşme Statistics */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                    🤝 Birebir Görüşme İstatistikleri
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-green-700">Birebir Görüşme Yapılan:</span>
                      <span className="font-bold text-green-900">
                        {leadsData.leads.filter(lead => {
                          const meetingField = lead.oneOnOneMeeting;
                          return meetingField && (
                            meetingField.toLowerCase().includes("evet") ||
                            meetingField.toLowerCase().includes("yapıldı") ||
                            meetingField.toLowerCase().includes("yes") ||
                            meetingField === "1"
                          );
                        }).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Görüşme Yapılmayan:</span>
                      <span className="font-bold text-green-900">
                        {leadsData.leads.filter(lead => {
                          const meetingField = lead.oneOnOneMeeting;
                          return !meetingField || 
                            meetingField.toLowerCase().includes("hayır") ||
                            meetingField.toLowerCase().includes("yapılmadı") ||
                            meetingField.toLowerCase().includes("no") ||
                            meetingField === "0" ||
                            meetingField.trim() === "";
                        }).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Görüşme Başarı Oranı:</span>
                      <span className="font-bold text-green-900">
                        {(() => {
                          const totalMeetings = leadsData.leads.filter(lead => {
                            const meetingField = lead.oneOnOneMeeting;
                            return meetingField && (
                              meetingField.toLowerCase().includes("evet") ||
                              meetingField.toLowerCase().includes("yapıldı") ||
                              meetingField.toLowerCase().includes("yes") ||
                              meetingField === "1"
                            );
                          }).length;
                          return ((totalMeetings / leadsData.leads.length) * 100).toFixed(1);
                        })()}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* No Data State */}
          {!isLoading && !leadsData?.leads?.length && (
            <div className="text-center py-8 text-gray-500">
              <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <div className="text-lg font-medium">Lead verisi bulunamadı</div>
              <div className="text-sm">Filtrelerinizi kontrol edin veya yeni lead ekleyin</div>
            </div>
          )}

          {/* Pagination */}
          {leadsData && leadsData.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
              >
                ← Önceki
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sayfa</span>
                <Select value={page.toString()} onValueChange={(value) => setPage(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: leadsData.totalPages }, (_, i) => i + 1).map(pageNum => (
                      <SelectItem key={pageNum} value={pageNum.toString()}>
                        {pageNum}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">/ {leadsData.totalPages}</span>
              </div>

              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(leadsData.totalPages, p + 1))}
                disabled={page === leadsData.totalPages || isFetching}
              >
                Sonraki →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
