import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, FileText } from 'lucide-react';

interface ImportValidationWarningsProps {
  validationResults: {
    dateFormatIssues: number;
    missingStatusCount: number;
    totalRecords: number;
    supportedDateFormats: string[];
    statusColumnPresent: boolean;
    dateColumnPresent: boolean;
  };
}

export default function ImportValidationWarnings({ validationResults }: ImportValidationWarningsProps) {
  const {
    dateFormatIssues,
    missingStatusCount,
    totalRecords,
    supportedDateFormats,
    statusColumnPresent,
    dateColumnPresent
  } = validationResults;

  const hasWarnings = dateFormatIssues > 0 || missingStatusCount > 0 || !statusColumnPresent || !dateColumnPresent;

  if (!hasWarnings) return null;

  return (
    <div className="space-y-4 mb-6">
      {!dateColumnPresent && (
        <Alert variant="destructive">
          <Calendar className="h-4 w-4" />
          <AlertTitle>Kritik: Tarih Sütunu Bulunamadı</AlertTitle>
          <AlertDescription>
            "Talep Geliş Tarihi" sütunu bulunamadı. Tarih bazlı filtreleme çalışmayacak.
            <br />
            <strong>Beklenen sütun adları:</strong> Talep Geliş Tarihi, Tarih, requestDate
          </AlertDescription>
        </Alert>
      )}

      {!statusColumnPresent && (
        <Alert variant="destructive">
          <FileText className="h-4 w-4" />
          <AlertTitle>Kritik: Durum Sütunu Bulunamadı</AlertTitle>
          <AlertDescription>
            "SON GORUSME SONUCU" sütunu bulunamadı. Dinamik durum tespiti çalışmayacak.
            <br />
            <strong>Beklenen sütun adları:</strong> SON GORUSME SONUCU, SON GÖRÜŞME SONUCU, Son Görüşme Sonucu
          </AlertDescription>
        </Alert>
      )}

      {dateFormatIssues > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Tarih Format Uyarısı</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>{dateFormatIssues} kayıt için tarih formatı tespit edilemedi.</p>
              <div>
                <p className="font-semibold">Desteklenen formatlar:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {supportedDateFormats.map((format, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {format}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {missingStatusCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Durum Uyarısı</AlertTitle>
          <AlertDescription>
            {missingStatusCount} kayıt "SON GORUSME SONUCU" sütununda boş değer içeriyor ve "Tanımsız" olarak işaretlendi.
            <br />
            Bu kayıtların durumunu uygulama ayarlarından manuel olarak düzenleyebilirsiniz.
          </AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground">
        <strong>İçe Aktarma Özeti:</strong> {totalRecords} toplam kayıt işlendi
      </div>
    </div>
  );
}