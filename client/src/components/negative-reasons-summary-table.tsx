import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight, Eye, Users, BarChart3 } from 'lucide-react';
import { getStandardColor } from '@/lib/color-system';

interface NegativeReason {
  reason: string;
  count: number;
  percentage: number;
  leads: Array<{
    customerName: string;
    assignedPersonnel: string;
    projectName: string;
    leadType: string;
    requestDate: string;
    status: string;
    lastMeetingNote: string;
    responseResult: string;
  }>;
}

interface NegativeReasonsSummaryTableProps {
  leads: any[];
  selectedPersonnel?: string;
}

export default function NegativeReasonsSummaryTable({ leads, selectedPersonnel = 'all' }: NegativeReasonsSummaryTableProps) {
  const [expandedReasons, setExpandedReasons] = useState<Set<string>>(new Set());
  const [selectedReason, setSelectedReason] = useState<NegativeReason | null>(null);

  const negativeReasonsData = useMemo(() => {
    // Filter leads exactly like the server does - check for status containing "Olumsuz"
    let filteredLeads = leads.filter(lead => 
      lead.status?.includes('Olumsuz') || 
      lead.status?.toLowerCase().includes('olumsuz')
    );
    
    if (selectedPersonnel !== 'all') {
      filteredLeads = filteredLeads.filter(lead => lead.assignedPersonnel === selectedPersonnel);
    }

    // Group by negative reason - comprehensive reason extraction
    const reasonGroups = filteredLeads.reduce((acc, lead) => {
      // Priority: negativeReason -> lastMeetingNote -> responseResult -> status
      let reason = 'Belirtilmemiş';
      if (lead.negativeReason && lead.negativeReason.trim() !== '') {
        reason = lead.negativeReason.trim();
      } else if (lead.lastMeetingNote && lead.lastMeetingNote.trim() !== '') {
        reason = lead.lastMeetingNote.trim();
      } else if (lead.responseResult && lead.responseResult.trim() !== '') {
        reason = lead.responseResult.trim();
      } else if (lead.status) {
        reason = lead.status;
      }
      
      if (!acc[reason]) {
        acc[reason] = [];
      }
      acc[reason].push({
        customerName: lead.customerName || 'Bilinmiyor',
        assignedPersonnel: lead.assignedPersonnel || 'Atanmamış',
        projectName: lead.projectName || 'Belirtilmemiş',
        leadType: lead.leadType || 'Bilinmiyor',
        requestDate: lead.requestDate || '',
        status: lead.status || 'Bilinmiyor',
        lastMeetingNote: lead.lastMeetingNote || '',
        responseResult: lead.responseResult || ''
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Convert to array and sort by count
    const totalLeads = filteredLeads.length;
    return Object.entries(reasonGroups)
      .map(([reason, reasonLeads]) => ({
        reason,
        count: reasonLeads.length,
        percentage: totalLeads > 0 ? Math.round((reasonLeads.length / totalLeads) * 100) : 0,
        leads: reasonLeads
      }))
      .sort((a, b) => b.count - a.count);
  }, [leads, selectedPersonnel]);

  const toggleReasonExpansion = (reason: string) => {
    const newExpanded = new Set(expandedReasons);
    if (newExpanded.has(reason)) {
      newExpanded.delete(reason);
    } else {
      newExpanded.add(reason);
    }
    setExpandedReasons(newExpanded);
  };

  const exportCSV = () => {
    const csvContent = [
      'Olumsuzluk Nedeni,Müşteri Sayısı,Yüzde,Müşteri Adları',
      ...negativeReasonsData.map(item => 
        `"${item.reason}",${item.count},${item.percentage}%,"${item.leads.map(l => l.customerName).join('; ')}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `olumsuzluk_nedenleri_ozet_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalNegativeLeads = negativeReasonsData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-red-600" />
              Olumsuzluk Nedenleri - Özet Tablo
              <Badge variant="outline">{totalNegativeLeads} olumsuz lead</Badge>
            </CardTitle>
            <CardDescription>
              {selectedPersonnel === 'all' 
                ? `Tüm personel için ${negativeReasonsData.length} farklı olumsuzluk nedeni` 
                : `${selectedPersonnel} için ${negativeReasonsData.length} farklı olumsuzluk nedeni`
              }
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV}>
              CSV İndir
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {negativeReasonsData.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Olumsuzluk Nedeni</TableHead>
                    <TableHead className="text-center">Müşteri Sayısı</TableHead>
                    <TableHead className="text-center">Yüzde</TableHead>
                    <TableHead className="text-center">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {negativeReasonsData.map((reasonData, index) => (
                    <React.Fragment key={reasonData.reason}>
                      <TableRow className="hover:bg-gray-50">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleReasonExpansion(reasonData.reason)}
                            className="p-1 h-6 w-6"
                          >
                            {expandedReasons.has(reasonData.reason) ? 
                              <ChevronDown className="h-4 w-4" /> : 
                              <ChevronRight className="h-4 w-4" />
                            }
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full border"
                              style={{ backgroundColor: getStandardColor('NEGATIVE', reasonData.reason) }}
                            ></div>
                            <span className="max-w-md truncate" title={reasonData.reason}>
                              {reasonData.reason}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{reasonData.count}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">%{reasonData.percentage}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedReason(reasonData)}
                                className="h-8"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Detay
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl max-h-[80vh]">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Users className="h-5 w-5 text-red-600" />
                                  {reasonData.reason}
                                </DialogTitle>
                                <DialogDescription>
                                  Bu olumsuzluk nedenine sahip {reasonData.count} müşteri
                                </DialogDescription>
                              </DialogHeader>
                              <ScrollArea className="max-h-[60vh]">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Müşteri Adı</TableHead>
                                      <TableHead>Atanan Personel</TableHead>
                                      <TableHead>Proje</TableHead>
                                      <TableHead>Lead Tipi</TableHead>
                                      <TableHead>Tarih</TableHead>
                                      <TableHead>Durum</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {reasonData.leads.map((lead, leadIndex) => (
                                      <TableRow key={leadIndex}>
                                        <TableCell className="font-medium">{lead.customerName}</TableCell>
                                        <TableCell>
                                          <Badge variant="outline">{lead.assignedPersonnel}</Badge>
                                        </TableCell>
                                        <TableCell>{lead.projectName}</TableCell>
                                        <TableCell>
                                          <Badge variant="secondary">{lead.leadType}</Badge>
                                        </TableCell>
                                        <TableCell>{lead.requestDate}</TableCell>
                                        <TableCell>
                                          <Badge variant="outline">{lead.status}</Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                      {expandedReasons.has(reasonData.reason) && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-gray-50 p-4">
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Bu nedene sahip müşteriler:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {reasonData.leads.map((lead, leadIndex) => (
                                  <div key={leadIndex} className="p-2 bg-white rounded border text-sm">
                                    <div className="font-medium">{lead.customerName}</div>
                                    <div className="text-gray-600">
                                      {lead.assignedPersonnel} • {lead.projectName}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <strong>Toplam:</strong> {totalNegativeLeads} olumsuz lead, {negativeReasonsData.length} farklı neden
                  </div>
                  <div>
                    <strong>En Yaygın:</strong> {negativeReasonsData[0]?.reason.substring(0, 30)}... 
                    ({negativeReasonsData[0]?.count} müşteri)
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Seçilen kriterlere uygun olumsuz lead bulunamadı</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}