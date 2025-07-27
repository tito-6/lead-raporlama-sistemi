import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StandardChart from "@/components/charts/StandardChart";

// Example component showing how to use the StandardChart component
// This demonstrates the Kaynak Analizi page style with multiple charts
export default function StandardChartExample() {
  const [chartType, setChartType] = useState<"pie" | "bar" | "line" | "3d-pie">(
    "3d-pie"
  );

  // Example data - this would come from your API
  const sourceData = [
    { name: "Instagram", value: 103, percentage: 40, color: "#9b51e0" },
    { name: "Facebook", value: 87, percentage: 34, color: "#3498db" },
    { name: "Referans", value: 45, percentage: 18, color: "#2ecc71" },
    { name: "Website", value: 23, percentage: 9, color: "#e74c3c" },
  ];

  const meetingTypeData = [
    { name: "Telefon", value: 65, percentage: 45, color: "#8B5CF6" },
    { name: "WhatsApp", value: 48, percentage: 33, color: "#EC4899" },
    { name: "Yüz Yüze", value: 32, percentage: 22, color: "#06B6D4" },
  ];

  const personnelData = [
    { name: "Ahmet Yılmaz", value: 34, percentage: 28, color: "#10B981" },
    { name: "Ayşe Demir", value: 28, percentage: 23, color: "#F59E0B" },
    { name: "Mehmet Kaya", value: 25, percentage: 21, color: "#EF4444" },
    { name: "Fatma Şahin", value: 22, percentage: 18, color: "#6366F1" },
    { name: "Ali Özkan", value: 12, percentage: 10, color: "#8B5A2B" },
  ];

  const statusData = [
    { name: "Bilgi Verildi", value: 45, percentage: 35, color: "#4CAF50" },
    { name: "Satış", value: 32, percentage: 25, color: "#2196F3" },
    { name: "Olumsuz", value: 28, percentage: 22, color: "#F44336" },
    { name: "Takipte", value: 23, percentage: 18, color: "#FF9800" },
  ];

  const handleChartClick = (data: any) => {
    console.log("Chart clicked:", data);
    // You can add navigation or filtering logic here
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          🎯 Kaynak Analizi - StandardChart Örneği
        </h1>
        <Badge variant="outline" className="text-green-600">
          258 Toplam Kayıt
        </Badge>
      </div>

      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="charts">Grafik Analizi</TabsTrigger>
          <TabsTrigger value="comparison">Karşılaştırma</TabsTrigger>
          <TabsTrigger value="detailed">Detaylı Analiz</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          {/* Main Charts Grid - Similar to Kaynak Analizi page */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Source Analysis */}
            <StandardChart
              title="Müşteri Kaynak Analizi"
              data={sourceData}
              onItemClick={handleChartClick}
              showDataTable={true}
              showBadge={true}
              badgeText={`${sourceData.reduce(
                (sum, item) => sum + item.value,
                0
              )} Kayıt`}
              gradientColors={["from-blue-50", "to-indigo-100"]}
              borderColor="border-blue-100 dark:border-blue-800"
              height={300}
              chartType="3d-pie"
              allowTypeChange={true}
              description="Lead kaynaklarının dağılımı"
              icon="📱"
              tableTitle="Kaynak Detayları"
            />

            {/* Meeting Type Distribution */}
            <StandardChart
              title="Görüşme Tipi Dağılımı"
              data={meetingTypeData}
              onItemClick={handleChartClick}
              showDataTable={true}
              showBadge={true}
              badgeText={`${meetingTypeData.reduce(
                (sum, item) => sum + item.value,
                0
              )} Görüşme`}
              gradientColors={["from-purple-50", "to-pink-100"]}
              borderColor="border-purple-100 dark:border-purple-800"
              height={300}
              chartType="3d-pie"
              allowTypeChange={true}
              description="İletişim yöntemlerinin analizi"
              icon="🤝"
              tableTitle="Görüşme Detayları"
            />
          </div>

          {/* Personnel Performance */}
          <StandardChart
            title="Personel Performans Analizi"
            data={personnelData}
            onItemClick={handleChartClick}
            showDataTable={true}
            showBadge={true}
            badgeText={`${personnelData.length} Personel`}
            gradientColors={["from-green-50", "to-emerald-100"]}
            borderColor="border-green-100 dark:border-green-800"
            height={350}
            chartType="bar"
            allowTypeChange={true}
            description="Personel bazında lead dağılımı"
            icon="👥"
            tableTitle="Personel Detayları"
          />

          {/* Status Distribution */}
          <StandardChart
            title="Durum Dağılımı Analizi"
            data={statusData}
            onItemClick={handleChartClick}
            showDataTable={true}
            showBadge={true}
            badgeText={`${statusData.reduce(
              (sum, item) => sum + item.value,
              0
            )} Lead`}
            gradientColors={["from-yellow-50", "to-orange-100"]}
            borderColor="border-yellow-100 dark:border-yellow-800"
            height={300}
            chartType="pie"
            allowTypeChange={true}
            description="Lead durumlarının analizi"
            icon="📊"
            tableTitle="Durum Detayları"
          />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {/* Comparison view with multiple chart types */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Pie Chart Görünümü</CardTitle>
              </CardHeader>
              <CardContent>
                <StandardChart
                  title="Kaynak Dağılımı"
                  data={sourceData}
                  chartType="pie"
                  showDataTable={false}
                  height={250}
                  gradientColors={["from-blue-50", "to-blue-100"]}
                  borderColor="border-blue-200"
                />
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle>3D Pie Chart Görünümü</CardTitle>
              </CardHeader>
              <CardContent>
                <StandardChart
                  title="Kaynak Dağılımı"
                  data={sourceData}
                  chartType="3d-pie"
                  showDataTable={false}
                  height={250}
                  gradientColors={["from-purple-50", "to-purple-100"]}
                  borderColor="border-purple-200"
                />
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle>Bar Chart Görünümü</CardTitle>
              </CardHeader>
              <CardContent>
                <StandardChart
                  title="Kaynak Dağılımı"
                  data={sourceData}
                  chartType="bar"
                  showDataTable={false}
                  height={250}
                  gradientColors={["from-green-50", "to-green-100"]}
                  borderColor="border-green-200"
                />
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle>Line Chart Görünümü</CardTitle>
              </CardHeader>
              <CardContent>
                <StandardChart
                  title="Kaynak Dağılımı"
                  data={sourceData}
                  chartType="line"
                  showDataTable={false}
                  height={250}
                  gradientColors={["from-red-50", "to-red-100"]}
                  borderColor="border-red-200"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          {/* Detailed analysis with full features */}
          <StandardChart
            title="Detaylı Kaynak Analizi"
            data={sourceData}
            onItemClick={handleChartClick}
            showDataTable={true}
            showBadge={true}
            badgeText="Aktif Veri"
            badgeVariant="default"
            gradientColors={["from-indigo-50", "to-indigo-100"]}
            borderColor="border-indigo-100 dark:border-indigo-800"
            height={400}
            chartType="3d-pie"
            allowTypeChange={true}
            description="Bu grafik, müşteri kaynaklarının detaylı analizini gösterir. Her kaynağın performansı ve dağılımı hakkında bilgi verir."
            icon="🔍"
            tableTitle="Detaylı Kaynak Raporu"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
