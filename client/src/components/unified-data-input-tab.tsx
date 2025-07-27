import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Save,
  Download,
  FileSpreadsheet,
  CloudUpload,
  FileText,
  Trash2,
} from "lucide-react";
import { LeadGoogleSheetImportDialog } from "./lead-google-sheet-import-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeadSchema, type InsertLead } from "@shared/schema";
import ImportValidationWarnings from "@/components/import-validation-warnings";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useLeads } from "@/hooks/use-leads";
import { useSalesReps } from "@/hooks/use-leads";

// --- Excel-style entry types and columns ---
interface MainLeadData {
  [key: string]: string;
}
interface TakipteData {
  [key: string]: string;
}
const mainLeadColumns = [
  { key: "Müşteri ID", label: "Müşteri ID", width: "100px" },
  { key: "İletişim ID", label: "İletişim ID", width: "100px" },
  { key: "Müşteri Adı Soyadı", label: "Müşteri Adı Soyadı", width: "150px" },
  { key: "İlk Müşteri Kaynağı", label: "İlk Müşteri Kaynağı", width: "120px" },
  {
    key: "Form Müşteri Kaynağı",
    label: "Form Müşteri Kaynağı",
    width: "120px",
  },
  { key: "WebForm Notu", label: "WebForm Notu", width: "200px" },
  { key: "Talep Geliş Tarihi", label: "Talep Geliş Tarihi", width: "120px" },
  {
    key: "İnfo Form Geliş Yeri",
    label: "İnfo Form Geliş Yeri",
    width: "120px",
  },
  {
    key: "İnfo Form Geliş Yeri 2",
    label: "İnfo Form Geliş Yeri 2",
    width: "120px",
  },
  {
    key: "İnfo Form Geliş Yeri 3",
    label: "İnfo Form Geliş Yeri 3",
    width: "120px",
  },
  {
    key: "İnfo Form Geliş Yeri 4",
    label: "İnfo Form Geliş Yeri 4",
    width: "120px",
  },
  { key: "Atanan Personel", label: "Atanan Personel", width: "120px" },
  {
    key: "Hatırlatma Personeli",
    label: "Hatırlatma Personeli",
    width: "120px",
  },
  {
    key: "GERİ DÖNÜŞ YAPILDI MI? (Müşteri Arandı mı?)",
    label: "GERİ DÖNÜŞ YAPILDI MI? (Müşteri Arandı mı?)",
    width: "180px",
  },
  {
    key: "Web Form Havuz Oluşturma Tarihi",
    label: "Web Form Havuz Oluşturma Tarihi",
    width: "150px",
  },
  {
    key: "Form Sistem Olusturma Tarihi",
    label: "Form Sistem Olusturma Tarihi",
    width: "150px",
  },
  { key: "Atama Saat Farkı", label: "Atama Saat Farkı", width: "120px" },
  { key: "Dönüş Saat Farkı", label: "Dönüş Saat Farkı", width: "120px" },
  {
    key: "Giden Arama Sistem Oluşturma Tarihi",
    label: "Giden Arama Sistem Oluşturma Tarihi",
    width: "180px",
  },
  {
    key: "Müşteri Geri Dönüş Tarihi (Giden Arama)",
    label: "Müşteri Geri Dönüş Tarihi (Giden Arama)",
    width: "180px",
  },
  {
    key: "GERİ DÖNÜŞ YAPILDI MI? (Müşteriye Mail Gönderildi mi?)",
    label: "GERİ DÖNÜŞ YAPILDI MI? (Müşteriye Mail Gönderildi mi?)",
    width: "200px",
  },
  {
    key: "Müşteri Mail Geri Dönüş Tarihi",
    label: "Müşteri Mail Geri Dönüş Tarihi",
    width: "150px",
  },
  {
    key: "Telefonla Ulaşılamayan Müşteriler",
    label: "Telefonla Ulaşılamayan Müşteriler",
    width: "150px",
  },
  {
    key: "Kaç Gündür Geri Dönüş Bekliyor",
    label: "Kaç Gündür Geri Dönüş Bekliyor",
    width: "150px",
  },
  {
    key: "Kaç Günde Geri Dönüş Yapılmış (Süre)",
    label: "Kaç Günde Geri Dönüş Yapılmış (Süre)",
    width: "150px",
  },
  {
    key: "GERİ DÖNÜŞ NOTU (Giden Arama Notu)",
    label: "GERİ DÖNÜŞ NOTU (Giden Arama Notu)",
    width: "200px",
  },
  {
    key: "GERİ DÖNÜŞ NOTU (Giden Mail Notu)",
    label: "GERİ DÖNÜŞ NOTU (Giden Mail Notu)",
    width: "200px",
  },
  {
    key: "Birebir Görüşme Yapıldı mı ?",
    label: "Birebir Görüşme Yapıldı mı ?",
    width: "150px",
  },
  {
    key: "Birebir Görüşme Tarihi",
    label: "Birebir Görüşme Tarihi",
    width: "130px",
  },
  {
    key: "Dönüş Görüşme Sonucu",
    label: "Dönüş Görüşme Sonucu",
    width: "130px",
  },
  {
    key: "Dönüş Olumsuzluk Nedeni",
    label: "Dönüş Olumsuzluk Nedeni",
    width: "130px",
  },
  {
    key: "Müşteriye Satış Yapıldı Mı ?",
    label: "Müşteriye Satış Yapıldı Mı ?",
    width: "130px",
  },
  { key: "Satış Adedi", label: "Satış Adedi", width: "100px" },
  { key: "Randevu Tarihi", label: "Randevu Tarihi", width: "120px" },
  { key: "SON GORUSME NOTU", label: "SON GORUSME NOTU", width: "150px" },
  { key: "SON GORUSME SONUCU", label: "SON GORUSME SONUCU", width: "150px" },
];
const takipteColumns = [
  {
    key: "Müşteri Adı Soyadı(203)",
    label: "Müşteri Adı Soyadı(203)",
    width: "150px",
  },
  { key: "Tarih", label: "Tarih", width: "100px" },
  { key: "Personel Adı(203)", label: "Personel Adı(203)", width: "130px" },
  { key: "Ofis", label: "Ofis", width: "100px" },
  { key: "Notlar", label: "Notlar", width: "200px" },
  {
    key: "Müşteri Haberleşme Tipi",
    label: "Müşteri Haberleşme Tipi",
    width: "150px",
  },
  { key: "Görüşme Tipi", label: "Görüşme Tipi", width: "120px" },
  { key: "Saat", label: "Saat", width: "80px" },
  { key: "Hatırlatma Var Mı", label: "Hatırlatma Var Mı", width: "120px" },
  { key: "Hatırlatma Tarihi", label: "Hatırlatma Tarihi", width: "120px" },
  {
    key: "Hatırlatma Personeli",
    label: "Hatırlatma Personeli",
    width: "130px",
  },
  { key: "Hatırlatma Son Mu ?", label: "Hatırlatma Son Mu ?", width: "130px" },
  { key: "Konuşma Süresi", label: "Konuşma Süresi", width: "110px" },
  { key: "Meslek Adı", label: "Meslek Adı", width: "100px" },
  { key: "Acenta Adı", label: "Acenta Adı", width: "100px" },
  { key: "Son Sonuç Adı", label: "Son Sonuç Adı", width: "110px" },
  { key: "Puan", label: "Puan", width: "80px" },
  { key: "Randevu Var Mı ?", label: "Randevu Var Mı ?", width: "120px" },
  { key: "Randevu Tarihi", label: "Randevu Tarihi", width: "120px" },
  {
    key: "Sorumlu Satış Personeli",
    label: "Sorumlu Satış Personeli",
    width: "150px",
  },
  { key: "Randevu Ofisi", label: "Randevu Ofisi", width: "110px" },
  {
    key: "Ofis Bazında İlk Geliş",
    label: "Ofis Bazında İlk Geliş",
    width: "130px",
  },
  { key: "İletişim Aktif Mi ?", label: "İletişim Aktif Mi ?", width: "120px" },
  {
    key: "İrtibat Müşteri Kaynağı",
    label: "İrtibat Müşteri Kaynağı",
    width: "140px",
  },
  {
    key: "İrtibat Müşteri Kaynak Grubu",
    label: "İrtibat Müşteri Kaynak Grubu",
    width: "160px",
  },
  {
    key: "İletişim Müşteri Kaynağı",
    label: "İletişim Müşteri Kaynağı",
    width: "140px",
  },
  {
    key: "İletişim Müşteri Kaynak Grubu",
    label: "İletişim Müşteri Kaynak Grubu",
    width: "160px",
  },
  { key: "Cep Tel", label: "Cep Tel", width: "120px" },
  { key: "İş Tel", label: "İş Tel", width: "120px" },
  { key: "Ev Tel", label: "Ev Tel", width: "120px" },
  { key: "Email", label: "Email", width: "150px" },
  { key: "Kriter", label: "Kriter", width: "100px" },
  { key: "AktifMi", label: "AktifMi", width: "80px" },
];

export default function UnifiedDataInputTab() {
  // Excel-style entry state
  const [mainLeadData, setMainLeadData] = useState<MainLeadData[]>([
    {} as MainLeadData,
  ]);
  const [takipteData, setTakipteData] = useState<TakipteData[]>([
    {} as TakipteData,
  ]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Excel-style entry logic
  const addRow = (type: "main" | "takipte") => {
    if (type === "main") {
      setMainLeadData([...mainLeadData, {} as MainLeadData]);
    } else {
      setTakipteData([...takipteData, {} as TakipteData]);
    }
  };
  const updateMainCell = (rowIndex: number, column: string, value: string) => {
    const newData = [...mainLeadData];
    newData[rowIndex] = { ...newData[rowIndex], [column]: value };
    setMainLeadData(newData);
  };
  const updateTakipteCell = (
    rowIndex: number,
    column: string,
    value: string
  ) => {
    const newData = [...takipteData];
    newData[rowIndex] = { ...newData[rowIndex], [column]: value };
    setTakipteData(newData);
  };
  // Fix apiRequest usage for saveMainDataMutation and saveTakipteDataMutation
  const saveMainDataMutation = useMutation({
    mutationFn: async (data: MainLeadData[]) => {
      return apiRequest("POST", "/api/leads/import-main", { data });
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Ana veri başarıyla kaydedildi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Veri kaydedilirken hata oluştu",
        variant: "destructive",
      });
    },
  });
  const saveTakipteDataMutation = useMutation({
    mutationFn: async (data: TakipteData[]) => {
      return apiRequest("POST", "/api/takipte/import-excel", { data });
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Takipte verisi başarıyla kaydedildi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/takipte"] });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Veri kaydedilirken hata oluştu",
        variant: "destructive",
      });
    },
  });
  const exportTemplate = (type: "main" | "takipte") => {
    const columns = type === "main" ? mainLeadColumns : takipteColumns;
    const csvHeader = columns.map((col) => col.label).join("\t");
    const csvContent = csvHeader + "\n";
    const blob = new Blob([csvContent], {
      type: "text/tab-separated-values;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${type === "main" ? "ana_veri" : "takipte_veri"}_sablonu.tsv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Manual single entry and smart file import state/logic
  const { data: salesReps = [] } = useSalesReps();
  const { data: stats } = useLeads();
  const [file, setFile] = useState<File | null>(null);
  const [secondaryFile, setSecondaryFile] = useState<File | null>(null);
  const [validationWarnings, setValidationWarnings] = useState<any>(null);
  const form = useForm<InsertLead>({
    resolver: zodResolver(insertLeadSchema),
    defaultValues: {
      customerName: "",
      requestDate: new Date().toISOString().split("T")[0],
      leadType: "kiralama",
      assignedPersonnel: "",
      status: "yeni",
      customerId: "",
      contactId: "",
      firstCustomerSource: "",
      formCustomerSource: "",
      webFormNote: "",
      infoFormLocation1: "",
      infoFormLocation2: "",
      infoFormLocation3: "",
      infoFormLocation4: "",
      reminderPersonnel: "",
      wasCalledBack: "",
      webFormPoolDate: "",
      formSystemDate: "",
      assignmentTimeDiff: "",
      responseTimeDiff: "",
      outgoingCallSystemDate: "",
      customerResponseDate: "",
      wasEmailSent: "",
      customerEmailResponseDate: "",
      unreachableByPhone: "",
      daysWaitingResponse: undefined,
      daysToResponse: undefined,
      callNote: "",
      emailNote: "",
      oneOnOneMeeting: "",
      meetingDate: "",
      responseResult: "",
      negativeReason: "",
      wasSaleMade: "",
      saleCount: undefined,
      appointmentDate: "",
      lastMeetingNote: "",
      lastMeetingResult: "",
    },
  });
  const createLeadMutation = useMutation({
    mutationFn: async (data: InsertLead) => {
      const response = await apiRequest("POST", "/api/leads", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      form.reset();
      toast({ title: "Başarılı", description: "Lead başarıyla eklendi." });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Lead eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
  const importFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/leads/import", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Import failed");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales-reps"] });
      if (data.validationWarnings)
        setValidationWarnings(data.validationWarnings);
      setFile(null);
      let description = `${data.imported} lead başarıyla içe aktarıldı.`;
      if (data.errors > 0) description += ` ${data.errors} hata oluştu.`;
      if (data.duplicateInfo && data.duplicateInfo.skipped > 0)
        description += ` ${data.duplicateInfo.skipped} yinelenen kayıt atlandı.`;
      toast({ title: "İçe Aktarma Başarılı", description });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Dosya içe aktarılırken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
  const clearDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/leads/clear");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Veriler Temizlendi",
        description: "Tüm lead verileri başarıyla temizlendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Veriler temizlenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
  const importSecondaryMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/takipte/import", {
        method: "POST",
        body: formData,
      });
      if (!response.ok)
        throw new Error(`Takipte upload failed: ${response.statusText}`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/takipte"] });
      queryClient.invalidateQueries({ queryKey: ["/api/enhanced-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setSecondaryFile(null);
      if (data.imported === 0) {
        toast({
          title: "Uyarı",
          description:
            "Takip dosyası yüklendi ancak 0 kayıt işlendi. Dosya formatını kontrol edin.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Takip Dosyası Yüklendi",
          description: `${data.imported} takip kaydı başarıyla işlendi.`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description:
          error.message || "Takip dosyası yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      importFileMutation.mutate(selectedFile);
    }
  };
  const handleSecondaryFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setSecondaryFile(selectedFile);
      importSecondaryMutation.mutate(selectedFile);
    }
  };
  const handleClear = () => {
    form.reset();
  };

  return (
    <div className="space-y-6">
      {validationWarnings && (
        <div>
          <ImportValidationWarnings validationResults={validationWarnings} />
        </div>
      )}
      <Tabs defaultValue="excel" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="excel">Excel Tarzı Giriş</TabsTrigger>
          <TabsTrigger value="manual">Manuel Tekli Giriş</TabsTrigger>
          <TabsTrigger value="import">🧠 Akıllı Dosya İçe Aktarma</TabsTrigger>
        </TabsList>
        <TabsContent value="excel">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Excel Tarzı Lead Girişi</h2>
                <p className="text-gray-600">
                  Tam sütun desteği ile Excel tarzı veri girişi
                </p>
              </div>
              <div className="flex gap-2">
                <LeadGoogleSheetImportDialog
                  onSuccess={() => {
                    toast({
                      title: "İçe Aktarım Başarılı",
                      description:
                        "Google Sheets'ten lead verileri başarıyla içe aktarıldı.",
                    });
                    queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => exportTemplate("main")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Ana Veri Şablonu
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportTemplate("takipte")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Takipte Şablonu
                </Button>
              </div>
            </div>
            <Tabs defaultValue="main-data">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="main-data">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Ana Lead Verisi ({mainLeadColumns.length} sütun)
                </TabsTrigger>
                <TabsTrigger value="takipte-data">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Takipte Verisi ({takipteColumns.length} sütun)
                </TabsTrigger>
              </TabsList>
              <TabsContent value="main-data" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Ana Lead Verisi</CardTitle>
                        <p className="text-sm text-gray-600">
                          {mainLeadColumns.length} sütun desteklenmektedir
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => addRow("main")} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Satır Ekle
                        </Button>
                        <Button
                          onClick={() =>
                            saveMainDataMutation.mutate(mainLeadData)
                          }
                          disabled={saveMainDataMutation.isPending}
                          size="sm"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Kaydet
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border p-2 text-xs font-medium w-12">
                              #
                            </th>
                            {mainLeadColumns.map((col) => (
                              <th
                                key={col.key}
                                className="border p-2 text-xs font-medium text-left"
                                style={{ minWidth: col.width }}
                              >
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {mainLeadData.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                              <td className="border p-1 text-center text-xs font-medium bg-gray-50">
                                {rowIndex + 1}
                              </td>
                              {mainLeadColumns.map((col) => (
                                <td key={col.key} className="border p-1">
                                  <Input
                                    value={row[col.key] || ""}
                                    onChange={(e) =>
                                      updateMainCell(
                                        rowIndex,
                                        col.key,
                                        e.target.value
                                      )
                                    }
                                    className="border-0 h-8 text-xs focus:ring-1 focus:ring-blue-500"
                                    placeholder=""
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="takipte-data" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Takipte Verisi</CardTitle>
                        <p className="text-sm text-gray-600">
                          {takipteColumns.length} sütun desteklenmektedir
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => addRow("takipte")} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Satır Ekle
                        </Button>
                        <Button
                          onClick={() =>
                            saveTakipteDataMutation.mutate(takipteData)
                          }
                          disabled={saveTakipteDataMutation.isPending}
                          size="sm"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Kaydet
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border p-2 text-xs font-medium w-12">
                              #
                            </th>
                            {takipteColumns.map((col) => (
                              <th
                                key={col.key}
                                className="border p-2 text-xs font-medium text-left"
                                style={{ minWidth: col.width }}
                              >
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {takipteData.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                              <td className="border p-1 text-center text-xs font-medium bg-gray-50">
                                {rowIndex + 1}
                              </td>
                              {takipteColumns.map((col) => (
                                <td key={col.key} className="border p-1">
                                  <Input
                                    value={row[col.key] || ""}
                                    onChange={(e) =>
                                      updateTakipteCell(
                                        rowIndex,
                                        col.key,
                                        e.target.value
                                      )
                                    }
                                    className="border-0 h-8 text-xs focus:ring-1 focus:ring-blue-500"
                                    placeholder=""
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Ana Veri</span>
                    <span className="text-sm font-medium">
                      {mainLeadData.length} satır
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Takipte</span>
                    <span className="text-sm font-medium">
                      {takipteData.length} satır
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Ana Sütun</span>
                    <span className="text-sm font-medium">
                      {mainLeadColumns.length} adet
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Takipte Sütun</span>
                    <span className="text-sm font-medium">
                      {takipteColumns.length} adet
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="manual">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Manuel Veri Girişi</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit((data) =>
                        createLeadMutation.mutate(data)
                      )}
                      className="space-y-4"
                    >
                      {/* ...form fields as in DataEntryTab... */}
                      <div className="flex justify-end space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleClear}
                        >
                          Temizle
                        </Button>
                        <Button
                          type="submit"
                          disabled={createLeadMutation.isPending}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Lead Ekle
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="import">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>🧠 Akıllı Dosya İçe Aktarma</CardTitle>
                  <CardDescription>
                    Ana lead dosyası + isteğe bağlı takip dosyası
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Main Lead File */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-blue-700">
                        1. Ana Lead Dosyası
                      </Label>
                      <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors bg-blue-50">
                        <CloudUpload className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                        <p className="text-sm text-blue-700 mb-2">
                          Ana lead dosyasını yükleyin
                        </p>
                        <input
                          type="file"
                          className="hidden"
                          accept=".xlsx,.csv,.json"
                          onChange={handleFileUpload}
                          id="main-file-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document.getElementById("main-file-upload")?.click()
                          }
                          disabled={importFileMutation.isPending}
                        >
                          {importFileMutation.isPending
                            ? "İşleniyor..."
                            : "Ana Dosya Seç"}
                        </Button>
                      </div>
                    </div>
                    {/* Secondary Takipte File */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-green-700">
                        2. Takip Dosyası (ZORUNLU)
                      </Label>
                      <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors bg-green-50">
                        <FileText className="mx-auto h-8 w-8 text-green-500 mb-2" />
                        <p className="text-sm text-green-700 mb-2">
                          Kriter, İrtibat Kaynağı, Görüşme Tipi kolonları
                        </p>
                        <input
                          type="file"
                          className="hidden"
                          accept=".xlsx,.csv,.json"
                          onChange={handleSecondaryFileUpload}
                          id="secondary-file-upload"
                        />
                        <Button
                          type="button"
                          variant={secondaryFile ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            document
                              .getElementById("secondary-file-upload")
                              ?.click()
                          }
                          disabled={importSecondaryMutation.isPending}
                        >
                          {importSecondaryMutation.isPending
                            ? "İşleniyor..."
                            : secondaryFile
                            ? `✓ ${secondaryFile.name}`
                            : "Takip Dosyası Seç"}
                        </Button>
                      </div>
                      {!secondaryFile && (
                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                          ⚠️ Takipte Analizi için bu dosya gereklidir
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                      <strong>Akıllı Özellikler:</strong>
                      <br />• Tarih formatlarını otomatik algılar
                      <br />• Duplicate leadleri tespit eder
                      <br />• Proje tipini WebForm'dan çıkarır
                      <br />• Boş durumlar "Yeni" olarak etiketlenmez
                    </div>
                    {/* Clear Data Button */}
                    <div className="pt-4 border-t">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => clearDataMutation.mutate()}
                        disabled={clearDataMutation.isPending}
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {clearDataMutation.isPending
                          ? "Temizleniyor..."
                          : "Tüm Verileri Temizle"}
                      </Button>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Bu işlem tüm lead verilerini kalıcı olarak siler
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Hızlı İstatistikler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Toplam Lead</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {stats &&
                        typeof stats === "object" &&
                        "totalLeads" in stats
                          ? Number((stats as any).totalLeads)
                          : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Bu Ay</span>
                      <span className="text-lg font-semibold text-primary">
                        {stats &&
                        typeof stats === "object" &&
                        "thisMonth" in stats
                          ? Number((stats as any).thisMonth)
                          : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Satış</span>
                      <span className="text-lg font-semibold text-green-600">
                        {stats && typeof stats === "object" && "sales" in stats
                          ? Number((stats as any).sales)
                          : 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
