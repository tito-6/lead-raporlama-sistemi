import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Save, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useSalesReps } from "@/hooks/use-leads";
import ColorSettingsSection from "./color-settings";

interface AppSettings {
  companyName: string;
  currency: string;
  language: string;
  darkMode: boolean;
  notifications: boolean;
  autoSave: boolean;
  colors: {
    success: string;
    error: string;
    primary: string;
    warning: string;
  };
}

export default function SettingsTab() {
  const { toast } = useToast();
  const { data: salesReps = [] } = useSalesReps();

  const [settings, setSettings] = useState<AppSettings>({
    companyName: "",
    currency: "TRY",
    language: "tr",
    darkMode: false,
    notifications: true,
    autoSave: true,
    colors: {
      success: "#4CAF50",
      error: "#F44336",
      primary: "#1976D2",
      warning: "#FF9800",
    },
  });

  const [targets, setTargets] = useState<Record<number, number>>({});

  // Fetch settings
  const { data: settingsData } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings");
      return response.json();
    },
  });

  // Load settings when data is available
  useEffect(() => {
    if (settingsData) {
      const settingsMap = settingsData.reduce((acc: any, setting: any) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      setSettings({
        companyName: settingsMap["companyName"] || "",
        currency: settingsMap["currency"] || "TRY",
        language: settingsMap["language"] || "tr",
        darkMode: settingsMap["darkMode"] === "true",
        notifications: settingsMap["notifications"] === "true",
        autoSave: settingsMap["autoSave"] === "true",
        colors: {
          success: settingsMap["colors.success"] || "#4CAF50",
          error: settingsMap["colors.error"] || "#F44336",
          primary: settingsMap["colors.primary"] || "#1976D2",
          warning: settingsMap["colors.warning"] || "#FF9800",
        },
      });
    }
  }, [settingsData]);

  // Initialize targets from sales reps
  useEffect(() => {
    if (salesReps.length > 0) {
      const targetsMap = salesReps.reduce(
        (acc: Record<number, number>, rep) => {
          acc[rep.id] = rep.monthlyTarget;
          return acc;
        },
        {}
      );
      setTargets(targetsMap);
    }
  }, [salesReps]);

  const saveSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await apiRequest("POST", "/api/settings", {
        key,
        value,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });

  const updateSalesRepMutation = useMutation({
    mutationFn: async ({
      id,
      monthlyTarget,
    }: {
      id: number;
      monthlyTarget: number;
    }) => {
      const response = await apiRequest("PUT", `/api/sales-reps/${id}`, {
        monthlyTarget,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales-reps"] });
    },
  });

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings((prev) => {
      if (key.startsWith("colors.")) {
        const colorKey = key.split(".")[1];
        return {
          ...prev,
          colors: {
            ...prev.colors,
            [colorKey]: value as string,
          },
        };
      }
      return { ...prev, [key]: value };
    });
  };

  const handleSaveSettings = async () => {
    try {
      const settingsToSave = [
        { key: "companyName", value: settings.companyName },
        { key: "currency", value: settings.currency },
        { key: "language", value: settings.language },
        { key: "darkMode", value: settings.darkMode.toString() },
        { key: "notifications", value: settings.notifications.toString() },
        { key: "autoSave", value: settings.autoSave.toString() },
        { key: "colors.success", value: settings.colors.success },
        { key: "colors.error", value: settings.colors.error },
        { key: "colors.primary", value: settings.colors.primary },
        { key: "colors.warning", value: settings.colors.warning },
      ];

      await Promise.all(
        settingsToSave.map((setting) =>
          saveSettingMutation.mutateAsync(setting)
        )
      );

      toast({
        title: "Başarılı",
        description: "Ayarlar başarıyla kaydedildi.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ayarlar kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleSaveTargets = async () => {
    try {
      await Promise.all(
        Object.entries(targets).map(([id, monthlyTarget]) =>
          updateSalesRepMutation.mutateAsync({
            id: parseInt(id),
            monthlyTarget,
          })
        )
      );

      toast({
        title: "Başarılı",
        description: "Hedefler başarıyla kaydedildi.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Hedefler kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleTargetChange = (repId: number, target: number) => {
    setTargets((prev) => ({ ...prev, [repId]: target }));
  };

  const handleBackupData = () => {
    toast({
      title: "Bilgi",
      description: "Veri yedekleme özelliği yakında eklenecek.",
    });
  };

  const handleRestoreData = () => {
    toast({
      title: "Bilgi",
      description: "Veri geri yükleme özelliği yakında eklenecek.",
    });
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Genel Ayarlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Şirket Adı</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) =>
                    handleSettingChange("companyName", e.target.value)
                  }
                  placeholder="Şirket adını girin"
                />
              </div>
              <div>
                <Label htmlFor="currency">Para Birimi</Label>
                <Select
                  value={settings.currency}
                  onValueChange={(value) =>
                    handleSettingChange("currency", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRY">Turkish Lira (₺)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="language">Dil</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) =>
                    handleSettingChange("language", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tr">Türkçe</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="darkMode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) =>
                    handleSettingChange("darkMode", !!checked)
                  }
                />
                <Label htmlFor="darkMode">Koyu Tema</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) =>
                    handleSettingChange("notifications", !!checked)
                  }
                />
                <Label htmlFor="notifications">Bildirimler</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoSave"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) =>
                    handleSettingChange("autoSave", !!checked)
                  }
                />
                <Label htmlFor="autoSave">Otomatik Kaydet</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button
              onClick={handleSaveSettings}
              disabled={saveSettingMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Ayarları Kaydet
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Color Settings - New Comprehensive Color Management */}
      <ColorSettingsSection />

      {/* Monthly Targets */}
      <Card>
        <CardHeader>
          <CardTitle>Aylık Hedefler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesReps.map((rep) => (
              <div
                key={rep.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-900">{rep.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    className="w-20"
                    value={targets[rep.id] || rep.monthlyTarget}
                    onChange={(e) =>
                      handleTargetChange(rep.id, parseInt(e.target.value) || 0)
                    }
                    min="1"
                  />
                  <span className="text-sm text-gray-600">satış/ay</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleSaveTargets}
              disabled={updateSalesRepMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Hedefleri Kaydet
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Veri Yönetimi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="p-6 h-auto border-2 border-dashed border-gray-300 hover:border-primary"
              onClick={handleBackupData}
            >
              <div className="text-center">
                <Download className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="font-medium text-gray-900">Veri Yedekleme</p>
                <p className="text-sm text-gray-600">Tüm verileri yedekle</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="p-6 h-auto border-2 border-dashed border-gray-300 hover:border-primary"
              onClick={handleRestoreData}
            >
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="font-medium text-gray-900">Veri Geri Yükleme</p>
                <p className="text-sm text-gray-600">Yedekten geri yükle</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
