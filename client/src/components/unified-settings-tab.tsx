import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Settings, SalesRep } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { 
  Settings as SettingsIcon, 
  Palette, 
  BarChart3, 
  Bell, 
  Users, 
  Save, 
  Download, 
  Upload,
  Sliders 
} from 'lucide-react';

interface ColorSettings {
  statusColors: {
    success: string;
    warning: string;
    error: string;
    primary: string;
    secondary: string;
  };
  leadTypeColors: {
    satilik: string;
    kiralik: string;
  };
  personnelColors: Record<string, string>;
}

interface ChartSettings {
  defaultType: 'pie' | 'bar' | 'line';
  enable3D: boolean;
  showPercentages: boolean;
  showLabels: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
}

interface AlertSettings {
  performanceAlerts: boolean;
  duplicateAlerts: boolean;
  underperformingProjects: boolean;
  lowConversionWarnings: boolean;
  alertThreshold: number;
}

interface AppSettings {
  companyName: string;
  currency: string;
  language: string;
  darkMode: boolean;
  notifications: boolean;
  autoSave: boolean;
}

export default function UnifiedSettingsTab() {
  const { toast } = useToast();
  
  const [colorSettings, setColorSettings] = useState<ColorSettings>({
    statusColors: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      primary: '#3b82f6',
      secondary: '#6b7280'
    },
    leadTypeColors: {
      satilik: '#10b981',
      kiralik: '#f59e0b'
    },
    personnelColors: {}
  });

  const [chartSettings, setChartSettings] = useState<ChartSettings>({
    defaultType: 'pie',
    enable3D: false,
    showPercentages: true,
    showLabels: true,
    animationSpeed: 'normal'
  });

  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    performanceAlerts: true,
    duplicateAlerts: true,
    underperformingProjects: true,
    lowConversionWarnings: true,
    alertThreshold: 10
  });

  const [appSettings, setAppSettings] = useState<AppSettings>({
    companyName: '',
    currency: 'TRY',
    language: 'tr',
    darkMode: false,
    notifications: true,
    autoSave: true
  });

  const { data: settings = [] } = useQuery<Settings[]>({
    queryKey: ['/api/settings'],
  });

  const { data: salesReps = [] } = useQuery<SalesRep[]>({
    queryKey: ['/api/sales-reps'],
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Ayarlar Kaydedildi",
        description: "Tüm ayarlar başarıyla güncellenmiştir.",
      });
    }
  });

  const exportConfigMutation = useMutation({
    mutationFn: async () => {
      const config = {
        colorSettings,
        chartSettings,
        alertSettings,
        appSettings
      };
      
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'settings-config.json';
      a.click();
      URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({
        title: "Ayarlar Dışa Aktarıldı",
        description: "Ayarlar dosyası başarıyla indirildi.",
      });
    }
  });

  const handleSaveAll = () => {
    saveSettingsMutation.mutate({
      colorSettings,
      chartSettings,
      alertSettings,
      appSettings
    });
  };

  const handleExportConfig = () => {
    exportConfigMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🎛️ Akıllı Ayarlar</h2>
          <p className="text-gray-600 mt-1">Tüm uygulama ayarlarını tek yerden yönetin</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportConfig} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Ayarları Dışa Aktar
          </Button>
          <Button onClick={handleSaveAll} disabled={saveSettingsMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {saveSettingsMutation.isPending ? 'Kaydediliyor...' : 'Tüm Ayarları Kaydet'}
          </Button>
        </div>
      </div>

      {/* Unified Settings Tabs */}
      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="colors">🎨 Renkler</TabsTrigger>
          <TabsTrigger value="charts">📊 Grafikler</TabsTrigger>
          <TabsTrigger value="alerts">🔔 Uyarılar</TabsTrigger>
          <TabsTrigger value="personnel">👥 Personel</TabsTrigger>
          <TabsTrigger value="general">⚙️ Genel</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Lead Durum Renkleri
                </CardTitle>
                <CardDescription>Lead durumları için renk atamalarını özelleştirin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Başarı (Success)</Label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: colorSettings.statusColors.success }}
                      />
                      <Input 
                        type="color" 
                        value={colorSettings.statusColors.success}
                        onChange={(e) => setColorSettings(prev => ({
                          ...prev,
                          statusColors: { ...prev.statusColors, success: e.target.value }
                        }))}
                        className="w-12 h-8"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Uyarı (Warning)</Label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: colorSettings.statusColors.warning }}
                      />
                      <Input 
                        type="color" 
                        value={colorSettings.statusColors.warning}
                        onChange={(e) => setColorSettings(prev => ({
                          ...prev,
                          statusColors: { ...prev.statusColors, warning: e.target.value }
                        }))}
                        className="w-12 h-8"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Hata (Error)</Label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: colorSettings.statusColors.error }}
                      />
                      <Input 
                        type="color" 
                        value={colorSettings.statusColors.error}
                        onChange={(e) => setColorSettings(prev => ({
                          ...prev,
                          statusColors: { ...prev.statusColors, error: e.target.value }
                        }))}
                        className="w-12 h-8"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Lead Tip Renkleri
                </CardTitle>
                <CardDescription>Satış ve kiralama leadleri için renkler</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Satılık</Label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: colorSettings.leadTypeColors.satilik }}
                      />
                      <Input 
                        type="color" 
                        value={colorSettings.leadTypeColors.satilik}
                        onChange={(e) => setColorSettings(prev => ({
                          ...prev,
                          leadTypeColors: { ...prev.leadTypeColors, satilik: e.target.value }
                        }))}
                        className="w-12 h-8"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Kiralık</Label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: colorSettings.leadTypeColors.kiralik }}
                      />
                      <Input 
                        type="color" 
                        value={colorSettings.leadTypeColors.kiralik}
                        onChange={(e) => setColorSettings(prev => ({
                          ...prev,
                          leadTypeColors: { ...prev.leadTypeColors, kiralik: e.target.value }
                        }))}
                        className="w-12 h-8"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Grafik Ayarları
              </CardTitle>
              <CardDescription>Tüm grafiklerin görünümü ve davranışı</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Varsayılan Grafik Tipi</Label>
                  <Select 
                    value={chartSettings.defaultType} 
                    onValueChange={(value: 'pie' | 'bar' | 'line') => 
                      setChartSettings(prev => ({ ...prev, defaultType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pie">🥧 Pasta Grafik</SelectItem>
                      <SelectItem value="bar">📊 Sütun Grafik</SelectItem>
                      <SelectItem value="line">📈 Çizgi Grafik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Animasyon Hızı</Label>
                  <Select 
                    value={chartSettings.animationSpeed} 
                    onValueChange={(value: 'slow' | 'normal' | 'fast') => 
                      setChartSettings(prev => ({ ...prev, animationSpeed: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">🐌 Yavaş</SelectItem>
                      <SelectItem value="normal">⚡ Normal</SelectItem>
                      <SelectItem value="fast">🚀 Hızlı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>3D Görünüm</Label>
                    <p className="text-sm text-gray-500">Grafiklerde 3D efektleri etkinleştir</p>
                  </div>
                  <Switch 
                    checked={chartSettings.enable3D} 
                    onCheckedChange={(checked) => 
                      setChartSettings(prev => ({ ...prev, enable3D: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Yüzde Göster</Label>
                    <p className="text-sm text-gray-500">Grafiklerde yüzde değerlerini göster</p>
                  </div>
                  <Switch 
                    checked={chartSettings.showPercentages} 
                    onCheckedChange={(checked) => 
                      setChartSettings(prev => ({ ...prev, showPercentages: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Etiketleri Göster</Label>
                    <p className="text-sm text-gray-500">Grafiklerde veri etiketlerini göster</p>
                  </div>
                  <Switch 
                    checked={chartSettings.showLabels} 
                    onCheckedChange={(checked) => 
                      setChartSettings(prev => ({ ...prev, showLabels: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Akıllı Uyarı Sistemi
              </CardTitle>
              <CardDescription>Performans ve sistem uyarılarını özelleştirin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Performans Uyarıları</Label>
                    <p className="text-sm text-gray-500">Düşük performans durumlarında uyarı ver</p>
                  </div>
                  <Switch 
                    checked={alertSettings.performanceAlerts} 
                    onCheckedChange={(checked) => 
                      setAlertSettings(prev => ({ ...prev, performanceAlerts: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Duplikat Uyarıları</Label>
                    <p className="text-sm text-gray-500">Tekrarlayan lead girişlerinde uyarı ver</p>
                  </div>
                  <Switch 
                    checked={alertSettings.duplicateAlerts} 
                    onCheckedChange={(checked) => 
                      setAlertSettings(prev => ({ ...prev, duplicateAlerts: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Düşük Dönüşüm Uyarıları</Label>
                    <p className="text-sm text-gray-500">Düşük dönüşüm oranlarında uyarı ver</p>
                  </div>
                  <Switch 
                    checked={alertSettings.lowConversionWarnings} 
                    onCheckedChange={(checked) => 
                      setAlertSettings(prev => ({ ...prev, lowConversionWarnings: checked }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Uyarı Eşiği (%)</Label>
                  <Input 
                    type="number" 
                    value={alertSettings.alertThreshold}
                    onChange={(e) => 
                      setAlertSettings(prev => ({ ...prev, alertThreshold: parseInt(e.target.value) || 0 }))
                    }
                    min="0"
                    max="100"
                  />
                  <p className="text-sm text-gray-500">Bu değerin altındaki performans uyarı verir</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Personel Renkleri
              </CardTitle>
              <CardDescription>Her personel için özel renk atamaları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {salesReps.map((rep) => (
                  <div key={rep.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: colorSettings.personnelColors[rep.name] || '#6b7280' }}
                      />
                      <Label>{rep.name}</Label>
                    </div>
                    <Input 
                      type="color" 
                      value={colorSettings.personnelColors[rep.name] || '#6b7280'}
                      onChange={(e) => setColorSettings(prev => ({
                        ...prev,
                        personnelColors: { ...prev.personnelColors, [rep.name]: e.target.value }
                      }))}
                      className="w-12 h-8"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Genel Ayarlar
              </CardTitle>
              <CardDescription>Uygulama genel ayarları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Şirket Adı</Label>
                  <Input 
                    value={appSettings.companyName}
                    onChange={(e) => setAppSettings(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Şirket adını giriniz"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Para Birimi</Label>
                  <Select 
                    value={appSettings.currency} 
                    onValueChange={(value) => setAppSettings(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRY">🇹🇷 Türk Lirası (TRY)</SelectItem>
                      <SelectItem value="USD">🇺🇸 US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">🇪🇺 Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Karanlık Mod</Label>
                    <p className="text-sm text-gray-500">Karanlık tema kullan</p>
                  </div>
                  <Switch 
                    checked={appSettings.darkMode} 
                    onCheckedChange={(checked) => setAppSettings(prev => ({ ...prev, darkMode: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bildirimler</Label>
                    <p className="text-sm text-gray-500">Sistem bildirimlerini etkinleştir</p>
                  </div>
                  <Switch 
                    checked={appSettings.notifications} 
                    onCheckedChange={(checked) => setAppSettings(prev => ({ ...prev, notifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Otomatik Kaydetme</Label>
                    <p className="text-sm text-gray-500">Değişiklikleri otomatik olarak kaydet</p>
                  </div>
                  <Switch 
                    checked={appSettings.autoSave} 
                    onCheckedChange={(checked) => setAppSettings(prev => ({ ...prev, autoSave: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}