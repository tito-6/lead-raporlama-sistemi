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
  HelpCircle,
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
import { DownloadTemplateButton } from "./download-template-button";

export interface GoogleSheetImportProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export function GoogleSheetImportDialog({
  onSuccess,
  onError,
}: GoogleSheetImportProps) {
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

    setIsLoading(true);
    setImportResult(null);

    // Normalize the URL before sending
    const normalizedUrl = normalizeSheetUrl(sheetUrl);

    try {
      const response = await fetch("/api/import-expenses-from-sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sheetUrl: normalizedUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Google Sheets'ten veri alınırken bir hata oluştu."
        );
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
          `${result.importedCount} gider kaydı başarıyla içe aktarıldı.`,
      });

      // Refresh expense data
      queryClient.invalidateQueries({ queryKey: ["/api/lead-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expense-stats"] });

      if (onSuccess) onSuccess();

      // Close dialog after 2 seconds on success
      setTimeout(() => {
        setIsOpen(false);
        setSheetUrl("");
      }, 2000);
    } catch (error) {
      console.error("Failed to import from Google Sheets:", error);

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
          <DialogTitle>Google Sheets'ten Gider Verileri İçe Aktar</DialogTitle>
          <DialogDescription>
            Gider verilerinizi Google Sheets'ten içe aktarmak için
            paylaşılabilir bir bağlantı girin.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Google Sheets Gereksinimleri</AlertTitle>
            <AlertDescription>
              Google Sheets'in aşağıdaki sütunları içerdiğinden emin olun:
              <ul className="list-disc pl-5 mt-2">
                <li>
                  <code className="bg-slate-100 px-1 rounded">month</code>{" "}
                  (YYYY-MM formatında)
                </li>
                <li>
                  <code className="bg-slate-100 px-1 rounded">expenseType</code>{" "}
                  (agency_fee veya ads_expense)
                </li>
                <li>
                  <code className="bg-slate-100 px-1 rounded">amountTL</code>{" "}
                  (sayısal değer)
                </li>
                <li>
                  <code className="bg-slate-100 px-1 rounded">description</code>{" "}
                  (açıklama)
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
                    {importResult.invalidRows > 0 &&
                      ` ${importResult.invalidRows} kayıt geçersiz veri formatı nedeniyle atlandı.`}
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
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              <Link2 className="inline-block h-3 w-3 mr-1" />
              Google Sheet'in herkese açık paylaşım ayarına sahip olması
              gerekir.
            </p>
          </div>

          <div className="flex gap-2 mt-4">
            <DownloadTemplateButton />
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
