import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  FileSpreadsheet,
  Link2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export interface LeadGoogleSheetImportProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export function LeadGoogleSheetImportDialog({
  onSuccess,
  onError,
}: LeadGoogleSheetImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<{
    success?: boolean;
    importedCount?: number;
    totalRows?: number;
    skippedRows?: number;
    invalidRows?: number;
    message?: string;
    errors?: string[];
    imported?: number;
  } | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Helper function to normalize Google Sheets URLs
  const normalizeSheetUrl = (url: string): string => {
    let normalizedUrl = url.trim();

    // Add https:// if missing
    if (
      !normalizedUrl.startsWith("http://") &&
      !normalizedUrl.startsWith("https://")
    ) {
      // If it starts with docs.google.com, add https://
      if (normalizedUrl.startsWith("docs.google.com")) {
        normalizedUrl = "https://" + normalizedUrl;
      } else {
        // Default to https
        normalizedUrl = "https://" + normalizedUrl;
      }
    }

    // Verify and attempt to fix common issues
    if (!normalizedUrl.includes("docs.google.com/spreadsheets")) {
      console.warn("URL may not be a valid Google Sheets URL:", normalizedUrl);

      // Check for Google Sheets edit URL format variants
      if (normalizedUrl.includes("sheets.google.com")) {
        // Try to convert sheets.google.com to docs.google.com/spreadsheets format
        normalizedUrl = normalizedUrl.replace(
          "sheets.google.com",
          "docs.google.com/spreadsheets"
        );
      }
    }

    // Check for spreadsheet ID pattern (after /d/ or /spreadsheets/d/)
    if (
      !normalizedUrl.includes("/d/") &&
      !normalizedUrl.includes("/spreadsheets/d/")
    ) {
      console.warn("URL might be missing a proper spreadsheet ID format");
    }

    // Ensure the URL ends with /edit if it doesn't have query parameters
    if (!normalizedUrl.includes("?") && !normalizedUrl.endsWith("/edit")) {
      if (normalizedUrl.endsWith("/")) {
        normalizedUrl += "edit";
      } else {
        normalizedUrl += "/edit";
      }
    }

    // Try to extract and validate the spreadsheet ID
    try {
      const pattern = /\/d\/([a-zA-Z0-9-_]+)/;
      const match = normalizedUrl.match(pattern);
      if (match && match[1]) {
        console.log("Successfully extracted spreadsheet ID:", match[1]);
      } else {
        console.warn("Could not extract a valid spreadsheet ID from the URL");
      }
    } catch (e) {
      console.warn("Error extracting spreadsheet ID:", e);
    }

    return normalizedUrl;
  };

  const handleImport = async () => {
    if (!sheetUrl) {
      toast({
        title: "Hata",
        description: "Lütfen Google Sheets URL'si girin.",
        variant: "destructive",
      });
      return;
    }

    // Basic validation to catch obvious errors
    const normalizedForCheck = normalizeSheetUrl(sheetUrl);
    if (!normalizedForCheck.includes("docs.google.com/spreadsheets")) {
      const shouldContinue = window.confirm(
        "Bu URL geçerli bir Google Sheets URL'sine benzemiyor. URL şu formatta olmalıdır: https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit\n\nYine de devam etmek istiyor musunuz?"
      );
      if (!shouldContinue) return;
    }

    setIsLoading(true);
    setImportResult(null);

    // Normalize the URL before sending
    const normalizedUrl = normalizeSheetUrl(sheetUrl);
    console.log("Sending sheet URL:", normalizedUrl);
    console.log(
      "URL contains 'docs.google.com/spreadsheets':",
      normalizedUrl.includes("docs.google.com/spreadsheets")
    );

    // Check if URL can be parsed correctly
    try {
      const url = new URL(normalizedUrl);
      console.log("Parsed URL successfully:", {
        protocol: url.protocol,
        hostname: url.hostname,
        pathname: url.pathname,
        pathSegments: url.pathname.split("/"),
      });
    } catch (e) {
      console.error("Failed to parse URL:", e);
    }

    try {
      const response = await fetch("/api/import-leads-from-sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sheetUrl: normalizedUrl }),
      });

      if (!response.ok) {
        try {
          const errorText = await response.text();
          let errorMessage =
            "Google Sheets'ten veri alınırken bir hata oluştu.";

          try {
            // Try to parse as JSON
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
            console.log("Server error response:", errorData);
          } catch (e) {
            // If not JSON, use the text
            console.log("Server error response (not JSON):", errorText);
            errorMessage = `API Error: ${response.status} ${response.statusText}`;
          }

          throw new Error(errorMessage);
        } catch (parseError) {
          throw new Error(`Request failed with status code ${response.status}`);
        }
      }

      const result = await response.json();

      setImportResult({
        ...result,
        success: true,
        imported: result.importedCount,
      });

      toast({
        title: "İçe Aktarma Başarılı",
        description:
          result.message ||
          `${result.importedCount} lead kaydı başarıyla içe aktarıldı.`,
      });

      // Refresh leads data
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/enhanced-stats"] });

      if (onSuccess) onSuccess();

      // Close dialog after 2 seconds on success
      setTimeout(() => {
        setIsOpen(false);
        setSheetUrl("");
      }, 2000);
    } catch (error) {
      console.error("Failed to import from Google Sheets:", error);

      // Log additional details about the error
      if (error instanceof Error) {
        console.log("Error name:", error.name);
        console.log("Error message:", error.message);
        console.log("Error stack:", error.stack);
      }

      setImportResult({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Bilinmeyen bir hata oluştu.",
        errors:
          error instanceof Error
            ? [error.message]
            : ["Bilinmeyen bir hata oluştu."],
      });

      toast({
        title: "İçe Aktarma Hatası",
        description:
          error instanceof Error
            ? error.message
            : "Bilinmeyen bir hata oluştu.",
        variant: "destructive",
      });

      if (onError) onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Google Sheets'ten İçe Aktar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Google Sheets'ten Lead Verileri İçe Aktar</DialogTitle>
          <DialogDescription>
            Lead verilerinizi Google Sheets'ten içe aktarmak için paylaşılabilir
            bir bağlantı girin.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Google Sheets Gereksinimleri</AlertTitle>
            <AlertDescription>
              <p className="mb-2 font-semibold text-red-500">Önemli Notlar:</p>
              <ul className="list-disc pl-5 mb-3 text-red-500 text-sm">
                <li>Tablonun ilk sayfasının adı "Sheet1" olmalıdır</li>
                <li>
                  Google Sheet'in "Bağlantıya sahip herkes görebilir" şeklinde
                  paylaşılması gerekir
                </li>
                <li>
                  Header'lar (ilk satır) tam olarak aşağıdaki gibi olmalıdır
                  (büyük/küçük harf önemli değil)
                </li>
              </ul>

              <p className="mb-1">Gerekli sütunlar (zorunlu):</p>
              <ul className="list-disc pl-5 mb-2">
                <li>
                  <code className="bg-slate-100 px-1 rounded">
                    customerName
                  </code>{" "}
                  (Müşteri Adı Soyadı)
                </li>
                <li>
                  <code className="bg-slate-100 px-1 rounded">requestDate</code>{" "}
                  (Talep Geliş Tarihi)
                </li>
                <li>
                  <code className="bg-slate-100 px-1 rounded">
                    assignedPersonnel
                  </code>{" "}
                  (Atanan Personel)
                </li>
              </ul>

              <p className="mb-1">Opsiyonel sütunlar:</p>
              <ul className="list-disc pl-5">
                <li>
                  <code className="bg-slate-100 px-1 rounded">customerId</code>{" "}
                  (Müşteri ID)
                </li>
                <li>
                  <code className="bg-slate-100 px-1 rounded">contactId</code>{" "}
                  (İletişim ID)
                </li>
                <li>
                  <code className="bg-slate-100 px-1 rounded">leadType</code>{" "}
                  (Lead Tipi)
                </li>
                <li>
                  <code className="bg-slate-100 px-1 rounded">status</code>{" "}
                  (Durum)
                </li>
                <li>
                  <code className="bg-slate-100 px-1 rounded">projectName</code>{" "}
                  (Proje Adı)
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          {importResult && (
            <Alert
              variant={
                importResult.success === false ? "destructive" : "default"
              }
            >
              <AlertTitle>
                {importResult.success === false
                  ? "İçe Aktarım Hatası"
                  : "İçe Aktarım Sonucu"}
              </AlertTitle>
              <AlertDescription>
                {importResult.message || (
                  <>
                    Toplam {importResult.totalRows} kayıttan{" "}
                    {importResult.importedCount || importResult.imported} tanesi
                    başarıyla içe aktarıldı.
                    {(importResult.invalidRows || 0) > 0 &&
                      ` ${
                        importResult.invalidRows || 0
                      } kayıt geçersiz veri formatı nedeniyle atlandı.`}
                  </>
                )}

                {!importResult.success &&
                  importResult.errors &&
                  importResult.errors.length > 0 && (
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      {importResult.errors.slice(0, 5).map((err, i) => (
                        <li key={i} className="text-sm">
                          {err}
                        </li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li className="text-sm">
                          ...ve {importResult.errors.length - 5} daha hata
                        </li>
                      )}
                    </ul>
                  )}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="sheet-url">Google Sheets URL</Label>
            <Input
              id="sheet-url"
              placeholder="https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              <Link2 className="inline-block h-3 w-3 mr-1" />
              Google Sheet'in herkese açık paylaşım ayarına sahip olması
              gerekir.
            </p>
            <p className="text-xs text-rose-500 mt-1">
              URL formatı:
              https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
            </p>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  "https://docs.google.com/spreadsheets/create",
                  "_blank"
                )
              }
              className="gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Yeni Google Sheet Oluştur
            </Button>
          </div>

          <div className="p-3 mt-4 bg-amber-50 border border-amber-200 rounded-md">
            <h4 className="text-sm font-medium text-amber-800">
              Nasıl Yapılır:
            </h4>
            <ol className="list-decimal ml-4 text-xs mt-2 text-amber-700 space-y-1">
              <li>Google Sheets dosyanızı oluşturun</li>
              <li>
                İlk sayfa adının <strong>Sheet1</strong> olduğundan emin olun
              </li>
              <li>
                İlk satıra gerekli sütunları ekleyin:{" "}
                <code className="bg-white px-1 rounded">customerName</code>,{" "}
                <code className="bg-white px-1 rounded">requestDate</code>,{" "}
                <code className="bg-white px-1 rounded">assignedPersonnel</code>
              </li>
              <li>Dosyayı paylaşın: Sağ üstteki "Paylaş" butonuna tıklayın</li>
              <li>
                Bağlantıyla paylaşın: "Bağlantıya sahip herkes görebilir"
                seçeneğini seçin
              </li>
              <li>Bağlantıyı kopyalayıp buraya yapıştırın</li>
            </ol>
            <div className="mt-2 p-2 bg-white border border-amber-100 rounded text-xs">
              <p className="font-medium mb-1">Örnek Google Sheet Düzeni:</p>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-amber-100">
                    <th className="border border-amber-200 px-1 py-0.5">
                      customerName
                    </th>
                    <th className="border border-amber-200 px-1 py-0.5">
                      requestDate
                    </th>
                    <th className="border border-amber-200 px-1 py-0.5">
                      assignedPersonnel
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-amber-200 px-1 py-0.5">
                      Ahmet Yılmaz
                    </td>
                    <td className="border border-amber-200 px-1 py-0.5">
                      2023-07-15
                    </td>
                    <td className="border border-amber-200 px-1 py-0.5">
                      Fatma Demir
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-2 border-t">
            <Button
              variant="secondary"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button onClick={handleImport} disabled={!sheetUrl || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  İçe Aktarılıyor...
                </>
              ) : (
                "İçe Aktar"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
