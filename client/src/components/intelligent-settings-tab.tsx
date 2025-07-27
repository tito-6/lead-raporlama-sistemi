import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useSettings, useUpdateSetting } from "@/hooks/use-settings";
import { Palette, BarChart3, Bell, Monitor, Settings2, Download, Eye } from "lucide-react";

interface ChartSettings {
  defaultType: 'pie' | 'bar' | 'line' | 'donut';
  enable3D: boolean;
  showPercentages: boolean;
  showLabels: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
}

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

interface AlertSettings {
  performanceAlerts: boolean;
  duplicateAlerts: boolean;
  underperformingProjects: boolean;
  lowConversionWarnings: boolean;
  alertThreshold: number;
}

export default function IntelligentSettingsTab() {
  const { data: settings, isLoading } = useSettings();
  const updateSetting = useUpdateSetting();
  const [activeTab, setActiveTab] = useState('general');

  const [chartSettings, setChartSettings] = useState<ChartSettings>({
    defaultType: 'pie',
    enable3D: true,
    showPercentages: true,
    showLabels: true,
    animationSpeed: 'normal'
  });

  const [colorSettings, setColorSettings] = useState<ColorSettings>({
    statusColors: {
      success: '#10B981',
      warning: '#F59E0B', 
      error: '#EF4444',
      primary: '#3B82F6',
      secondary: '#6B7280'
    },
    leadTypeColors: {
      satilik: '#059669',
      kiralik: '#DC2626'
    },
    personnelColors: {}
  });

  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    performanceAlerts: true,
    duplicateAlerts: true,
    underperformingProjects: true,
    lowConversionWarnings: true,
    alertThreshold: 70
  });

  const chartTypeOptions = [
    { value: 'pie', label: '3D Pasta Grafik', icon: '🥧' },
    { value: 'bar', label: 'Sütun Grafik', icon: '📊' },
    { value: 'line', label: 'Çizgi Grafik', icon: '📈' },
    { value: 'donut', label: 'Donut Grafik', icon: '🍩' }
  ];

  const animationOptions = [
    { value: 'slow', label: 'Yavaş (2s)' },
    { value: 'normal', label: 'Normal (1s)' },
    { value: 'fast', label: 'Hızlı (0.5s)' }
  ];

  const handleChartSettingChange = (key: keyof ChartSettings, value: any) => {
    setChartSettings(prev => ({ ...prev, [key]: value }));
    updateSetting.mutate({ key: `chart_${key}`, value: JSON.stringify(value) });
  };

  const handleColorChange = (category: string, colorKey: string, value: string) => {
    setColorSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof ColorSettings],
        [colorKey]: value
      }
    }));
    updateSetting.mutate({ key: `color_${category}_${colorKey}`, value });
  };

  const handleAlertSettingChange = (key: keyof AlertSettings, value: any) => {
    setAlertSettings(prev => ({ ...prev, [key]: value }));
    updateSetting.mutate({ key: `alert_${key}`, value: JSON.stringify(value) });
  };

  const exportSettings = () => {
    const allSettings = {
      charts: chartSettings,
      colors: colorSettings,
      alerts: alertSettings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(allSettings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              🎛️ Akıllı Dashboard Ayarları
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Grafikler, renkler, uyarılar ve görünüm özelleştirmeleri
            </p>
          </div>
          <Button onClick={exportSettings} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Ayarları Dışa Aktar
          </Button>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Settings2 className="w-4 h-4" />
            <span>Genel</span>
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Grafikler</span>
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span>Renkler</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Uyarılar</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Genel Dashboard Ayarları</CardTitle>
              <CardDescription>Temel görünüm ve davranış ayarları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Şirket Adı</Label>
                  <Input
                    id="company-name"
                    placeholder="Şirketinizin adını girin"
                    defaultValue={settings?.find(s => s.key === 'companyName')?.value || ''}
                    onChange={(e) => updateSetting.mutate({ key: 'companyName', value: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Para Birimi</Label>
                  <Select 
                    defaultValue={settings?.find(s => s.key === 'currency')?.value || 'TRY'}
                    onValueChange={(value) => updateSetting.mutate({ key: 'currency', value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Para birimi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRY">🇹🇷 Türk Lirası (₺)</SelectItem>
                      <SelectItem value="USD">🇺🇸 US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">🇪🇺 Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Otomatik Kaydetme</Label>
                    <p className="text-sm text-gray-600">Değişiklikler otomatik olarak kaydedilsin</p>
                  </div>
                  <Switch 
                    defaultChecked={settings?.find(s => s.key === 'autoSave')?.value === 'true'}
                    onCheckedChange={(checked) => updateSetting.mutate({ key: 'autoSave', value: checked.toString() })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Gerçek Zamanlı Güncelleme</Label>
                    <p className="text-sm text-gray-600">Dashboard verilerini anlık güncelle</p>
                  </div>
                  <Switch 
                    defaultChecked={true}
                    onCheckedChange={(checked) => updateSetting.mutate({ key: 'realTimeUpdates', value: checked.toString() })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chart Settings */}
        <TabsContent value="charts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📊 Grafik Yapılandırması</CardTitle>
              <CardDescription>Grafik türleri, animasyonlar ve görsel ayarlar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Varsayılan Grafik Türü</Label>
                  <Select 
                    value={chartSettings.defaultType}
                    onValueChange={(value: 'pie' | 'bar' | 'line' | 'donut') => handleChartSettingChange('defaultType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {chartTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.icon} {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Animasyon Hızı</Label>
                  <Select 
                    value={chartSettings.animationSpeed}
                    onValueChange={(value: 'slow' | 'normal' | 'fast') => handleChartSettingChange('animationSpeed', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {animationOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>3D Efektler</Label>
                    <p className="text-sm text-gray-600">Grafiklerde 3D görünüm kullan</p>
                  </div>
                  <Switch 
                    checked={chartSettings.enable3D}
                    onCheckedChange={(checked) => handleChartSettingChange('enable3D', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Yüzde Değerleri</Label>
                    <p className="text-sm text-gray-600">Grafiklerde yüzde değerlerini göster</p>
                  </div>
                  <Switch 
                    checked={chartSettings.showPercentages}
                    onCheckedChange={(checked) => handleChartSettingChange('showPercentages', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Etiketler</Label>
                    <p className="text-sm text-gray-600">Grafik etiketlerini göster</p>
                  </div>
                  <Switch 
                    checked={chartSettings.showLabels}
                    onCheckedChange={(checked) => handleChartSettingChange('showLabels', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Color Settings */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🎨 Renk Yapılandırması</CardTitle>
              <CardDescription>Durum, lead tipi ve personel bazında renk ayarları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Colors */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Durum Renkleri</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(colorSettings.statusColors).map(([key, color]) => (
                    <div key={key} className="space-y-2">
                      <Label className="capitalize">{key === 'success' ? 'Başarılı' : key === 'warning' ? 'Uyarı' : key === 'error' ? 'Hata' : key === 'primary' ? 'Ana' : 'İkincil'}</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => handleColorChange('statusColors', key, e.target.value)}
                          className="w-8 h-8 rounded border"
                        />
                        <Input 
                          value={color}
                          onChange={(e) => handleColorChange('statusColors', key, e.target.value)}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lead Type Colors */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Lead Tipi Renkleri</Label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(colorSettings.leadTypeColors).map(([key, color]) => (
                    <div key={key} className="space-y-2">
                      <Label className="capitalize">{key === 'satilik' ? 'Satılık' : 'Kiralık'}</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => handleColorChange('leadTypeColors', key, e.target.value)}
                          className="w-8 h-8 rounded border"
                        />
                        <Input 
                          value={color}
                          onChange={(e) => handleColorChange('leadTypeColors', key, e.target.value)}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alert Settings */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🚨 Akıllı Uyarı Sistemi</CardTitle>
              <CardDescription>Proaktif performans uyarıları ve eşik değerleri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Performans Uyarıları</Label>
                    <p className="text-sm text-gray-600">Düşük performanslı personel için uyarı</p>
                  </div>
                  <Switch 
                    checked={alertSettings.performanceAlerts}
                    onCheckedChange={(checked) => handleAlertSettingChange('performanceAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Duplicate Uyarıları</Label>
                    <p className="text-sm text-gray-600">Yeni duplicate tespit edildiğinde uyar</p>
                  </div>
                  <Switch 
                    checked={alertSettings.duplicateAlerts}
                    onCheckedChange={(checked) => handleAlertSettingChange('duplicateAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Proje Performans Uyarıları</Label>
                    <p className="text-sm text-gray-600">Düşük performanslı projeler için uyarı</p>
                  </div>
                  <Switch 
                    checked={alertSettings.underperformingProjects}
                    onCheckedChange={(checked) => handleAlertSettingChange('underperformingProjects', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dönüşüm Oranı Uyarıları</Label>
                    <p className="text-sm text-gray-600">Düşük dönüşüm oranları için uyarı</p>
                  </div>
                  <Switch 
                    checked={alertSettings.lowConversionWarnings}
                    onCheckedChange={(checked) => handleAlertSettingChange('lowConversionWarnings', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Uyarı Eşiği (%)</Label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={alertSettings.alertThreshold}
                    onChange={(e) => handleAlertSettingChange('alertThreshold', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <Badge variant="outline" className="min-w-[60px] text-center">
                    {alertSettings.alertThreshold}%
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  Bu değerin altındaki performans için uyarı gönderilir
                </p>
              </div>

              {/* Preview Alert Examples */}
              <div className="space-y-2">
                <Label>Örnek Uyarılar</Label>
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Badge variant="destructive" className="text-xs">UYARI</Badge>
                    <span className="text-sm">Model Sanayi Merkezi projesinde %65 satılmamış lead</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">BİLGİ</Badge>
                    <span className="text-sm">3 yeni duplicate lead tespit edildi</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">ÖNERI</Badge>
                    <span className="text-sm">Ahmet Yılmaz - bu hafta %45 dönüşüm oranı</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}