import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Target,
  Megaphone,
  CheckSquare,
  TrendingUp,
  BarChart3,
  PieChart,
} from "lucide-react";

export default function ModernDashboard() {
  const kpiData = [
    {
      title: "Toplam Ziyaretçi",
      value: "40,000",
      icon: Users,
      color: "blue",
      change: "+12%",
    },
    {
      title: "Dönüşüm Oranı",
      value: "12.5%",
      icon: Target,
      color: "green",
      change: "+2.3%",
    },
    {
      title: "Aktif Kampanyalar",
      value: "8",
      icon: Megaphone,
      color: "cyan",
      change: "+1",
    },
    {
      title: "Bekleyen Görevler",
      value: "18",
      icon: CheckSquare,
      color: "orange",
      change: "-5",
    },
  ];

  const campaignData = [
    {
      name: "Yaz Kampanyası 2024",
      status: "Aktif",
      startDate: "2024-06-01",
      endDate: "2024-08-31",
      budget: "₺10,000",
      spent: "₺4,500",
      statusColor: "green",
    },
    {
      name: "Okula Dönüş",
      status: "Planlandı",
      startDate: "2024-09-01",
      endDate: "2024-09-30",
      budget: "₺7,500",
      spent: "₺0",
      statusColor: "yellow",
    },
    {
      name: "Kış İndirimleri",
      status: "Bitti",
      startDate: "2024-01-10",
      endDate: "2024-02-10",
      budget: "₺12,000",
      spent: "₺11,850",
      statusColor: "gray",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                Modern Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Kapsamlı analiz ve raporlama sistemi
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">📊 Gerçek Zamanlı</Badge>
              <Badge variant="outline">🔄 Otomatik Güncelleme</Badge>
            </div>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi, index) => (
            <Card
              key={index}
              className={`border-l-4 border-l-${kpi.color}-500 hover:shadow-md transition-shadow`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {kpi.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {kpi.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span
                        className={`${
                          kpi.change.startsWith("+")
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {kpi.change}
                      </span>{" "}
                      son ay
                    </p>
                  </div>
                  <div className={`p-2 rounded-full bg-${kpi.color}-100`}>
                    <kpi.icon className={`h-5 w-5 text-${kpi.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Ziyaretçi Trendi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Grafik Alanı</p>
                  <p className="text-sm text-gray-400">
                    Chart.js ile entegre edilecek
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Trafik Kaynakları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Pie Chart</p>
                  <p className="text-sm text-gray-400">Kaynak dağılımı</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Detaylı Rapor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 p-3 text-left font-semibold">
                      Kampanya Adı
                    </th>
                    <th className="border border-gray-200 p-3 text-left font-semibold">
                      Durum
                    </th>
                    <th className="border border-gray-200 p-3 text-left font-semibold">
                      Başlangıç Tarihi
                    </th>
                    <th className="border border-gray-200 p-3 text-left font-semibold">
                      Bitiş Tarihi
                    </th>
                    <th className="border border-gray-200 p-3 text-left font-semibold">
                      Bütçe
                    </th>
                    <th className="border border-gray-200 p-3 text-left font-semibold">
                      Harcama
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {campaignData.map((campaign, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-200 p-3 font-medium">
                        {campaign.name}
                      </td>
                      <td className="border border-gray-200 p-3">
                        <Badge
                          variant={
                            campaign.statusColor === "green"
                              ? "default"
                              : "secondary"
                          }
                          className={`
                            ${
                              campaign.statusColor === "green"
                                ? "bg-green-100 text-green-800"
                                : ""
                            }
                            ${
                              campaign.statusColor === "yellow"
                                ? "bg-yellow-100 text-yellow-800"
                                : ""
                            }
                            ${
                              campaign.statusColor === "gray"
                                ? "bg-gray-100 text-gray-800"
                                : ""
                            }
                          `}
                        >
                          {campaign.status}
                        </Badge>
                      </td>
                      <td className="border border-gray-200 p-3">
                        {campaign.startDate}
                      </td>
                      <td className="border border-gray-200 p-3">
                        {campaign.endDate}
                      </td>
                      <td className="border border-gray-200 p-3 font-medium">
                        {campaign.budget}
                      </td>
                      <td className="border border-gray-200 p-3">
                        {campaign.spent}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
