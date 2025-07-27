import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useColors } from "@/hooks/use-colors";
import { ColorSettings } from "@/lib/color-store";
import { Download, Upload, RotateCcw, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ColorSettingsSection() {
  const {
    colors,
    updateColor,
    resetToDefaults,
    exportColors,
    importColors,
    populateFromAPIData,
  } = useColors();
  const { toast } = useToast();

  const handleColorChange = (
    category: keyof ColorSettings,
    key: string,
    color: string
  ) => {
    updateColor(category, key, color);
  };

  const handleExport = () => {
    const colorData = exportColors();
    const blob = new Blob([colorData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leadtracker-colors.json";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Başarılı",
      description: "Renk ayarları başarıyla dışa aktarıldı.",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const success = importColors(result);

        if (success) {
          toast({
            title: "Başarılı",
            description: "Renk ayarları başarıyla içe aktarıldı.",
          });
        } else {
          throw new Error("Invalid format");
        }
      } catch (error) {
        toast({
          title: "Hata",
          description:
            "Geçersiz dosya formatı. Lütfen geçerli bir JSON dosyası seçin.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = ""; // Reset input
  };

  const handleReset = () => {
    resetToDefaults();
    toast({
      title: "Başarılı",
      description: "Tüm renkler varsayılan değerlere sıfırlandı.",
    });
  };

  const handleRefreshFromData = async () => {
    await populateFromAPIData();
    toast({
      title: "Başarılı",
      description: "Renkler içe aktarılan verilerden yenilendi.",
    });
  };

  const renderColorPicker = (category: keyof ColorSettings, label: string) => {
    const categoryColors = colors[category];
    const itemCount = Object.keys(categoryColors).length;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{label}</h3>
          <Badge variant="outline" className="text-xs">
            {itemCount} öğe (dinamik veri)
          </Badge>
        </div>
        {itemCount === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Bu kategori için henüz veri yok.</p>
            <p className="text-sm">
              Dosyaları içe aktardıktan sonra "Verilerden Yenile" butonunu
              kullanın.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categoryColors).map(([key, color]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`${category}-${key}`} className="text-sm">
                  {key}
                </Label>
                <div className="flex items-center space-x-2">
                  <input
                    id={`${category}-${key}`}
                    type="color"
                    value={color}
                    onChange={(e) =>
                      handleColorChange(category, key, e.target.value)
                    }
                    className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: color,
                      color: getContrastColor(color),
                    }}
                    className="text-xs px-2 py-1"
                  >
                    {color.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Helper function to determine text color based on background
  const getContrastColor = (hexColor: string): string => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🎨 Renk Ayarları</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefreshFromData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Verilerden Yenile
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("import-colors")?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              İçe Aktar
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Sıfırla
            </Button>
            <input
              id="import-colors"
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              📋 Dinamik Renk Yönetimi
            </h4>
            <p className="text-sm text-blue-800 mb-2">
              Bu renk ayarları içe aktarılan dosyalardan otomatik olarak
              oluşturulur. Tüm sekmelerde tutarlı bir şekilde uygulanır ve
              değişiklikler anında görünür.
            </p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>
                • <strong>Personel:</strong> Lead dosyasındaki "Atanan Personel"
                ve Takip dosyasındaki personel bilgileri
              </li>
              <li>
                • <strong>Durum:</strong> Lead ve Takip dosyalarındaki tüm
                durum/sonuç değerleri
              </li>
              <li>
                • <strong>Kaynak:</strong> Lead dosyasındaki müşteri kaynak
                bilgileri
              </li>
              <li>
                • <strong>Ofis:</strong> Takip dosyasındaki ofis bilgileri
              </li>
              <li>
                • <strong>Görüşme:</strong> Takip dosyasındaki görüşme tipleri
              </li>
            </ul>
            <p className="text-xs text-blue-600 mt-2 font-medium">
              💡 Yeni dosya yükledikten sonra "Verilerden Yenile" butonunu
              kullanarak renkleri güncelleyin.
            </p>
          </div>

          <Tabs defaultValue="personnel" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="personnel">Personel</TabsTrigger>
              <TabsTrigger value="status">Durum</TabsTrigger>
              <TabsTrigger value="source">Kaynak</TabsTrigger>
              <TabsTrigger value="project">Proje</TabsTrigger>
              <TabsTrigger value="office">Ofis</TabsTrigger>
              <TabsTrigger value="meeting">Görüşme</TabsTrigger>
              <TabsTrigger value="lead-type">Kriter</TabsTrigger>
              <TabsTrigger value="priority">Öncelik</TabsTrigger>
            </TabsList>

            <TabsContent value="personnel" className="mt-6">
              {renderColorPicker("PERSONNEL", "Personel Renkleri")}
            </TabsContent>

            <TabsContent value="status" className="mt-6">
              {renderColorPicker("STATUS", "Durum Renkleri")}
            </TabsContent>

            <TabsContent value="source" className="mt-6">
              {renderColorPicker("CUSTOMER_SOURCE", "Müşteri Kaynak Renkleri")}
            </TabsContent>

            <TabsContent value="project" className="mt-6">
              {renderColorPicker("PROJECT", "Proje Renkleri")}
            </TabsContent>

            <TabsContent value="office" className="mt-6">
              {renderColorPicker("OFFICE", "Ofis Renkleri")}
            </TabsContent>

            <TabsContent value="meeting" className="mt-6">
              {renderColorPicker("MEETING_TYPE", "Görüşme Tipi Renkleri")}
            </TabsContent>

            <TabsContent value="lead-type" className="mt-6">
              {renderColorPicker("LEAD_TYPE", "Lead Tipi Renkleri")}
            </TabsContent>

            <TabsContent value="priority" className="mt-6">
              {renderColorPicker("PRIORITY", "Öncelik Renkleri")}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
