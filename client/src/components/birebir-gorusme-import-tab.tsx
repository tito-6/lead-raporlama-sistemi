import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Download, Database, Users, TrendingUp, Calendar, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { triggerGlobalLeadDataUpdate } from '@/hooks/use-global-data-sync';

interface BirebirGorusmeRecord {
  "Müşteri Adı Soyadı(5,520)": string;
  "Tarih": string;
  "Personel Adı(5,520)": string;
  "Ofis": string;
  "Notlar": string;
  "Müşteri Haberleşme Tipi": string;
  "Görüşme Tipi": string;
  "Saat": string;
  "Hatırlatma Var Mı": string;
  "Hatırlatma Tarihi": string;
  "Hatırlatma Personeli": string;
  "Hatırlatma Son Mu ?": string;
  "Konuşma Süresi": string;
  "Meslek Adı": string;
  "Acenta Adı": string;
  "Son Sonuç Adı": string;
  "Puan": string;
  "Randevu Var Mı ?": string;
  "Randevu Tarihi": string;
  "Sorumlu Satış Personeli": string;
  "Randevu Ofisi": string;
  "Ofis Bazında İlk Geliş": string;
  "İletişim Aktif Mi ?": string;
  "İrtibat Müşteri Kaynağı": string;
  "İrtibat Müşteri Kaynak Grubu": string;
  "İletişim Müşteri Kaynağı": string;
  "İletişim Müşteri Kaynak Grubu": string;
  "Cep Tel": string;
  "İş Tel": string;
  "Ev Tel": string;
  "Email": string;
  "Kriter": string;
  "AktifMi": string;
}

interface ImportStats {
  totalRecords: number;
  successfulImports: number;
  errors: string[];
  duplicates: number;
  newRecords: number;
}

export default function BirebirGorusmeImportTab() {
  const [jsonInput, setJsonInput] = useState('');
  const [previewData, setPreviewData] = useState<BirebirGorusmeRecord[]>([]);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch birebir görüşme statistics
  const { data: gorusmeStats, refetch: refetchStats } = useQuery({
    queryKey: ['/api/birebir-gorusme/stats'],
    queryFn: async () => {
      const response = await fetch('/api/birebir-gorusme/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    staleTime: 30000,
  });

  // Fetch recent birebir görüşme records
  const { data: recentRecords } = useQuery({
    queryKey: ['/api/birebir-gorusme/recent'],
    queryFn: async () => {
      const response = await fetch('/api/birebir-gorusme/recent?limit=20');
      if (!response.ok) throw new Error('Failed to fetch recent records');
      return response.json();
    },
    staleTime: 30000,
  });

  const importMutation = useMutation({
    mutationFn: async (data: BirebirGorusmeRecord[]) => {
      const response = await fetch('/api/birebir-gorusme/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ records: data }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Import failed: ${response.status} ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: (result: ImportStats) => {
      setImportStats(result);
      refetchStats();
      triggerGlobalLeadDataUpdate();
      toast({
        title: "✅ İmport Başarılı",
        description: `${result.successfulImports} kayıt başarıyla işlendi`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ İmport Hatası",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const fileUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/birebir-gorusme/import-file', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`File upload failed: ${response.status} ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: (result: ImportStats) => {
      setImportStats(result);
      refetchStats();
      triggerGlobalLeadDataUpdate();
      setUploadedFile(null);
      toast({
        title: "✅ Dosya İmportı Başarılı",
        description: `${result.successfulImports} kayıt başarıyla işlendi`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Dosya İmport Hatası",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const parseJsonInput = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed)) {
        setPreviewData(parsed);
        toast({
          title: "✅ JSON Başarıyla Ayrıştırıldı",
          description: `${parsed.length} kayıt bulundu`,
        });
      } else {
        throw new Error('JSON bir dizi olmalıdır');
      }
    } catch (error) {
      toast({
        title: "❌ JSON Ayrıştırma Hatası",
        description: "Geçerli bir JSON formatı girin",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) {
      toast({
        title: "⚠️ Veri Yok",
        description: "Önce JSON verilerini ayrıştırın",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await importMutation.mutateAsync(previewData);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Clear existing data when a new file is uploaded
      setPreviewData([]);
      setJsonInput('');
      setImportStats(null);
      
      // Auto-upload the file
      fileUploadMutation.mutate(file);
    }
  };

  const clearData = () => {
    setJsonInput('');
    setPreviewData([]);
    setImportStats(null);
    setUploadedFile(null);
  };

  const downloadTemplate = () => {
    const template = [
      {
        "Müşteri Adı Soyadı(105)": "Örnek Müşteri",
        "Tarih": "01/05/2025",
        "Personel Adı(105)": "Yasemin Kaya",
        "Ofis": "İkitelli",
        "Notlar": "Örnek görüşme notu...",
        "Müşteri Haberleşme Tipi": "Birebir Görüşme",
        "Görüşme Tipi": "İlk Geliş",
        "Saat": "14:30",
        "Son Sonuç Adı": "Bilgi Verildi",
        "Puan": "20",
        "Cep Tel": "5551234567",
        "Email": "ornek@email.com",
        "Kriter": "Satış Müşterisi",
        "AktifMi": "TRUE"
      }
    ];

    const blob = new Blob([JSON.stringify(template, null, 2)], { 
      type: 'application/json;charset=utf-8;' 
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'birebir-gorusme-template.json';
    link.click();
  };

  const downloadCSVTemplate = () => {
    const csvHeaders = [
      "Müşteri Adı Soyadı(105)",
      "Tarih",
      "Personel Adı(105)",
      "Ofis",
      "Notlar",
      "Müşteri Haberleşme Tipi",
      "Görüşme Tipi",
      "Saat",
      "Son Sonuç Adı",
      "Puan",
      "Cep Tel",
      "Email",
      "Kriter",
      "AktifMi"
    ];

    const csvContent = [
      csvHeaders.join(','),
      '"Örnek Müşteri","01/05/2025","Yasemin Kaya","İkitelli","Örnek görüşme notu...","Birebir Görüşme","İlk Geliş","14:30","Bilgi Verildi","20","5551234567","ornek@email.com","Satış Müşterisi","TRUE"'
    ].join('\n');

    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'birebir-gorusme-template.csv';
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            🤝 Birebir Görüşme Veri İçe Aktarım Sistemi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {gorusmeStats && (
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-600" />
                    <div className="text-sm text-blue-600">Toplam Görüşme</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-800">{gorusmeStats.totalMeetings || 0}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <div className="text-sm text-green-600">Bu Ay</div>
                  </div>
                  <div className="text-2xl font-bold text-green-800">{gorusmeStats.thisMonth || 0}</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-yellow-600" />
                    <div className="text-sm text-yellow-600">Bu Hafta</div>
                  </div>
                  <div className="text-2xl font-bold text-yellow-800">{gorusmeStats.thisWeek || 0}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <div className="text-sm text-purple-600">Bugün</div>
                  </div>
                  <div className="text-2xl font-bold text-purple-800">{gorusmeStats.today || 0}</div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              � Dosya Yükleme (Excel/CSV/JSON)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                id="file-upload"
                accept=".json,.csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Dosya seçin veya sürükleyip bırakın
                </span>
                <span className="text-xs text-gray-500">
                  JSON, CSV dosyaları desteklenir
                </span>
              </label>
            </div>

            {uploadedFile && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    Dosya yüklendi: {uploadedFile.name}
                  </span>
                </div>
              </div>
            )}

            {fileUploadMutation.isPending && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-600 animate-spin" />
                  <span className="text-sm text-blue-800">
                    Dosya işleniyor...
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={downloadTemplate} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                JSON Şablon
              </Button>
              <Button onClick={downloadCSVTemplate} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                CSV Şablon
              </Button>
              <Button onClick={clearData} variant="outline">
                🗑️ Temizle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* JSON Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              📤 Manuel JSON Girişi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="json-input">Birebir Görüşme JSON Verisi</Label>
              <Textarea
                id="json-input"
                placeholder="JSON verinizi buraya yapıştırın..."
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={parseJsonInput} variant="outline">
                🔍 JSON'ı Ayrıştır
              </Button>
              <Button onClick={clearData} variant="outline">
                🗑️ Temizle
              </Button>
            </div>

            {previewData.length > 0 && (
              <div className="mt-4">
                <Badge variant="secondary" className="mb-2">
                  {previewData.length} kayıt hazır
                </Badge>
                <Button 
                  onClick={handleImport}
                  disabled={isProcessing || importMutation.isPending}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Database className="h-4 w-4 mr-2 animate-spin" />
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Verileri İçe Aktar
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Preview/Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importStats ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  📊 İçe Aktarım Sonuçları
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5" />
                  👁️ Veri Önizleme
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {importStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-sm text-blue-600">Toplam Kayıt</div>
                    <div className="text-xl font-bold text-blue-800">{importStats.totalRecords}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-sm text-green-600">Başarılı</div>
                    <div className="text-xl font-bold text-green-800">{importStats.successfulImports}</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <div className="text-sm text-yellow-600">Yeni Kayıt</div>
                    <div className="text-xl font-bold text-yellow-800">{importStats.newRecords}</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded">
                    <div className="text-sm text-orange-600">Tekrar Eden</div>
                    <div className="text-xl font-bold text-orange-800">{importStats.duplicates}</div>
                  </div>
                </div>

                {importStats.errors.length > 0 && (
                  <div className="bg-red-50 p-3 rounded">
                    <div className="text-sm text-red-600 font-medium mb-2">Hatalar:</div>
                    <ul className="text-sm text-red-700 space-y-1">
                      {importStats.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : previewData.length > 0 ? (
              <div className="space-y-4">
                <Badge variant="outline">{previewData.length} kayıt önizlemesi</Badge>
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Müşteri</TableHead>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Personel</TableHead>
                        <TableHead>Sonuç</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.slice(0, 10).map((record, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {record["Müşteri Adı Soyadı(105)"]}
                          </TableCell>
                          <TableCell>{record.Tarih}</TableCell>
                          <TableCell>{record["Personel Adı(105)"]}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {record["Son Sonuç Adı"]}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {previewData.length > 10 && (
                    <div className="text-center text-sm text-gray-500 mt-2">
                      ... ve {previewData.length - 10} kayıt daha
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <div>JSON verisi girildikten sonra önizleme burada görünecek</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Records */}
      {recentRecords && recentRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              📞 Son Birebir Görüşmeler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Müşteri Adı</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Personel</TableHead>
                    <TableHead>Ofis</TableHead>
                    <TableHead>Görüşme Tipi</TableHead>
                    <TableHead>Sonuç</TableHead>
                    <TableHead>Puan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRecords.map((record: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{record.customerName}</TableCell>
                      <TableCell>{record.meetingDate}</TableCell>
                      <TableCell>{record.personnel}</TableCell>
                      <TableCell>{record.office}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.meetingType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            record.result === 'Satış' ? 'default' :
                            record.result === 'Takipte' ? 'secondary' :
                            record.result === 'Olumsuz' ? 'destructive' : 'outline'
                          }
                        >
                          {record.result}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.score || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
