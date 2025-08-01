import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, X, Edit, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  createdAt: string;
}

interface EditableLeadTableProps {
  leads: Lead[];
  onLeadUpdate: (leadId: number, updates: Partial<Lead>) => Promise<void>;
  loading?: boolean;
  selectedLeads?: Set<number>;
  onSelectLead?: (leadId: number, checked: boolean) => void;
  selectAll?: boolean;
  onSelectAll?: (checked: boolean) => void;
}

interface EditingCell {
  leadId: number;
  field: string;
}

export default function EditableLeadTable({ 
  leads, 
  onLeadUpdate, 
  loading,
  selectedLeads = new Set(),
  onSelectLead,
  selectAll = false,
  onSelectAll
}: EditableLeadTableProps) {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [unsavedChanges, setUnsavedChanges] = useState<Map<number, Partial<Lead>>>(new Map());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateLeadMutation = useMutation({
    mutationFn: async ({ leadId, updates }: { leadId: number; updates: Partial<Lead> }) => {
      await onLeadUpdate(leadId, updates);
    },
    onSuccess: () => {
      // Trigger global data synchronization across all components
      triggerGlobalLeadDataUpdate();
      
      toast({
        title: "Başarılı",
        description: "Lead başarıyla güncellendi - Tüm raporlar güncellenecek",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Lead güncellenirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const startEditing = (leadId: number, field: string, currentValue: any) => {
    setEditingCell({ leadId, field });
    setEditValue(currentValue?.toString() || '');
  };

  const cancelEditing = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const saveEdit = async () => {
    if (!editingCell) return;

    const { leadId, field } = editingCell;
    const updates = { [field]: editValue };
    
    // Save IMMEDIATELY to server instead of batching
    try {
      await updateLeadMutation.mutateAsync({ leadId, updates });
      console.log(`✅ Successfully updated lead ${leadId} field ${field} to: ${editValue}`);
    } catch (error) {
      console.error('❌ Failed to update lead:', error);
      // Revert on error
      setEditValue('');
    }
    
    setEditingCell(null);
    setEditValue('');
  };

  const saveAllChanges = async (leadId: number) => {
    const changes = unsavedChanges.get(leadId);
    if (!changes) return;

    await updateLeadMutation.mutateAsync({ leadId, updates: changes });
    
    // Remove from unsaved changes
    const newUnsavedChanges = new Map(unsavedChanges);
    newUnsavedChanges.delete(leadId);
    setUnsavedChanges(newUnsavedChanges);
  };

  const discardChanges = (leadId: number) => {
    const newUnsavedChanges = new Map(unsavedChanges);
    newUnsavedChanges.delete(leadId);
    setUnsavedChanges(newUnsavedChanges);
  };

  const getDisplayValue = (lead: Lead, field: string) => {
    const changes = unsavedChanges.get(lead.id);
    return changes?.[field as keyof Lead] ?? lead[field as keyof Lead];
  };

  const renderEditableCell = (lead: Lead, field: string, value: any) => {
    const isEditing = editingCell?.leadId === lead.id && editingCell?.field === field;
    const hasUnsavedChanges = unsavedChanges.get(lead.id)?.[field as keyof Lead] !== undefined;

    if (isEditing) {
      if (field === 'status') {
        return (
          <div className="flex items-center gap-2">
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="w-32">
                <SelectValue />
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
            <Button size="sm" onClick={saveEdit}>
              <Check className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={cancelEditing}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      }

      if (field === 'leadType') {
        return (
          <div className="flex items-center gap-2">
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Satılık">Satılık</SelectItem>
                <SelectItem value="Kiralık">Kiralık</SelectItem>
                <SelectItem value="Yatırım">Yatırım</SelectItem>
                <SelectItem value="Diğer">Diğer</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={saveEdit}>
              <Check className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={cancelEditing}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-w-32"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEditing();
            }}
            onBlur={saveEdit}
          />
          <Button size="sm" onClick={saveEdit}>
            <Check className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={cancelEditing}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    return (
      <div 
        className={`cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors ${hasUnsavedChanges ? 'bg-yellow-50 border border-yellow-200' : ''}`}
        onClick={() => startEditing(lead.id, field, value)}
        title="Düzenlemek için tıklayın"
      >
        {field === 'status' ? (
          <Badge variant="outline" className="text-xs">
            {value || 'Tanımsız'}
          </Badge>
        ) : field === 'leadType' ? (
          <Badge variant="secondary" className="text-xs">
            {value || 'Tanımsız'}
          </Badge>
        ) : (
          <span className="block truncate max-w-32">
            {value || '-'}
          </span>
        )}
        {hasUnsavedChanges && (
          <span className="text-xs text-yellow-600 ml-1">*</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {onSelectLead && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={onSelectAll}
                    aria-label="Tümünü seç"
                  />
                </TableHead>
              )}
              <TableHead className="w-12">ID</TableHead>
              <TableHead className="min-w-32">Müşteri Adı</TableHead>
              <TableHead className="w-24">Müşteri ID</TableHead>
              <TableHead className="w-24">İletişim ID</TableHead>
              <TableHead className="min-w-32">Atanan Personel</TableHead>
              <TableHead className="w-32">Durum</TableHead>
              <TableHead className="w-24">Tür</TableHead>
              <TableHead className="min-w-32">Proje</TableHead>
              <TableHead className="w-28">Talep Tarihi</TableHead>
              <TableHead className="min-w-48">WebForm Notu</TableHead>
              <TableHead className="min-w-32">Çağrı Notu</TableHead>
              <TableHead className="w-32">Son Görüşme</TableHead>
              <TableHead className="w-28">Oluşturulma</TableHead>
              <TableHead className="w-32">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => {
              const hasChanges = unsavedChanges.has(lead.id);
              
              return (
                <TableRow key={lead.id} className={hasChanges ? 'bg-yellow-50' : ''}>
                  {onSelectLead && (
                    <TableCell>
                      <Checkbox
                        checked={selectedLeads.has(lead.id)}
                        onCheckedChange={(checked) => onSelectLead(lead.id, !!checked)}
                        aria-label={`Lead ${lead.id} seç`}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{lead.id}</TableCell>
                  <TableCell>
                    {renderEditableCell(lead, 'customerName', getDisplayValue(lead, 'customerName'))}
                  </TableCell>
                  <TableCell>
                    {renderEditableCell(lead, 'customerId', getDisplayValue(lead, 'customerId'))}
                  </TableCell>
                  <TableCell>
                    {renderEditableCell(lead, 'contactId', getDisplayValue(lead, 'contactId'))}
                  </TableCell>
                  <TableCell>
                    {renderEditableCell(lead, 'assignedPersonnel', getDisplayValue(lead, 'assignedPersonnel'))}
                  </TableCell>
                  <TableCell>
                    {renderEditableCell(lead, 'status', getDisplayValue(lead, 'status'))}
                  </TableCell>
                  <TableCell>
                    {renderEditableCell(lead, 'leadType', getDisplayValue(lead, 'leadType'))}
                  </TableCell>
                  <TableCell>
                    {renderEditableCell(lead, 'projectName', getDisplayValue(lead, 'projectName'))}
                  </TableCell>
                  <TableCell>
                    {renderEditableCell(lead, 'requestDate', getDisplayValue(lead, 'requestDate'))}
                  </TableCell>
                  <TableCell>
                    {renderEditableCell(lead, 'webFormNote', getDisplayValue(lead, 'webFormNote'))}
                  </TableCell>
                  <TableCell>
                    {renderEditableCell(lead, 'callNote', getDisplayValue(lead, 'callNote'))}
                  </TableCell>
                  <TableCell>
                    {renderEditableCell(lead, 'lastMeetingResult', getDisplayValue(lead, 'lastMeetingResult'))}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </TableCell>
                  <TableCell>
                    {hasChanges && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => saveAllChanges(lead.id)}
                          disabled={updateLeadMutation.isPending}
                          className="h-6 w-6 p-0"
                        >
                          {updateLeadMutation.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Save className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => discardChanges(lead.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {leads.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Görüntülenecek lead verisi yok
        </div>
      )}
    </div>
  );
}
