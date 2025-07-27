import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import StandardChart from "./StandardChart";
import {
  prepareSourceData,
  prepareMeetingData,
  preparePersonnelData,
  prepareStatusData,
  generateBadgeText,
  getChartTheme,
  handleChartClick,
} from "./chart-utils";

// Demo data
const demoSourceData = [
  { name: "Instagram", value: 103, percentage: 40 },
  { name: "Facebook", value: 87, percentage: 34 },
  { name: "Referans", value: 45, percentage: 18 },
  { name: "Website", value: 23, percentage: 9 },
];

const demoMeetingData = [
  { name: "Telefon", value: 65, percentage: 45 },
  { name: "WhatsApp", value: 48, percentage: 33 },
  { name: "Yüz Yüze", value: 32, percentage: 22 },
];

const demoPersonnelData = [
  { name: "Ahmet Yılmaz", value: 34, percentage: 28 },
  { name: "Ayşe Demir", value: 28, percentage: 23 },
  { name: "Mehmet Kaya", value: 25, percentage: 21 },
  { name: "Fatma Şahin", value: 22, percentage: 18 },
  { name: "Ali Özkan", value: 12, percentage: 10 },
];

const demoStatusData = [
  { name: "Bilgi Verildi", value: 45, percentage: 35 },
  { name: "Satış", value: 32, percentage: 25 },
  { name: "Olumsuz", value: 28, percentage: 22 },
  { name: "Takipte", value: 23, percentage: 18 },
];

export default function StandardChartDemo() {
  const [currentTab, setCurrentTab] = useState("showcase");
  const [selectedChart, setSelectedChart] = useState<string | null>(null);

  const handleChartInteraction = (data: any, chartType: string) => {
    setSelectedChart(`${chartType}: ${data.name} (${data.value})`);
    handleChartClick(data, (category) => {
      console.log(`Filtering by: ${category}`);
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🎯 StandardChart Demo</h1>
        <p className="text-gray-600">
          Kaynak Analizi sayfasından esinlenilen standart grafik bileşeni
        </p>
        {selectedChart && (
          <Alert className="max-w-md mx-auto">
            <AlertDescription>Son tıklanan: {selectedChart}</AlertDescription>
          </Alert>
        )}
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="showcase">Vitrin</TabsTrigger>
          <TabsTrigger value="themes">Temalar</TabsTrigger>
          <TabsTrigger value="features">Özellikler</TabsTrigger>
          <TabsTrigger value="comparison">Karşılaştırma</TabsTrigger>
        </TabsList>

        <TabsContent value="showcase" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">
              🎨 Kaynak Analizi Stili Vitrin
            </h2>
            <p className="text-gray-600 mb-6">
              Uygulamadaki "🎯 Kaynak Analizi" sayfasının stilini kullanan
              standart grafik örnekleri
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StandardChart
              title="Müşteri Kaynak Analizi"
              data={prepareSourceData(demoSourceData)}
              onItemClick={(data) => handleChartInteraction(data, "Kaynak")}
              chartType="3d-pie"
              showDataTable={true}
              showBadge={true}
              badgeText={generateBadgeText(demoSourceData, "records")}
              {...getChartTheme("source")}
              description="Lead kaynaklarının dağılımı"
              tableTitle="Kaynak Detayları"
            />

            <StandardChart
              title="Görüşme Tipi Dağılımı"
              data={prepareMeetingData(demoMeetingData)}
              onItemClick={(data) => handleChartInteraction(data, "Görüşme")}
              chartType="3d-pie"
              showDataTable={true}
              showBadge={true}
              badgeText={generateBadgeText(demoMeetingData, "items")}
              {...getChartTheme("meeting")}
              description="İletişim yöntemlerinin analizi"
              tableTitle="Görüşme Detayları"
            />
          </div>

          <StandardChart
            title="Personel Performans Analizi"
            data={preparePersonnelData(demoPersonnelData)}
            onItemClick={(data) => handleChartInteraction(data, "Personel")}
            chartType="bar"
            showDataTable={true}
            showBadge={true}
            badgeText={generateBadgeText(demoPersonnelData, "leads")}
            {...getChartTheme("personnel")}
            description="Personel bazında lead dağılımı"
            tableTitle="Personel Detayları"
            height={350}
          />

          <StandardChart
            title="Durum Dağılımı Analizi"
            data={prepareStatusData(demoStatusData)}
            onItemClick={(data) => handleChartInteraction(data, "Durum")}
            chartType="pie"
            showDataTable={true}
            showBadge={true}
            badgeText={generateBadgeText(demoStatusData, "leads")}
            {...getChartTheme("status")}
            description="Lead durumlarının analizi"
            tableTitle="Durum Detayları"
          />
        </TabsContent>

        <TabsContent value="themes" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">🎨 Tema Örnekleri</h2>
            <p className="text-gray-600 mb-6">
              Farklı tema stilleri ve renk paletleri
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { theme: "source", title: "Kaynak Teması", data: demoSourceData },
              {
                theme: "meeting",
                title: "Görüşme Teması",
                data: demoMeetingData,
              },
              {
                theme: "personnel",
                title: "Personel Teması",
                data: demoPersonnelData,
              },
              { theme: "status", title: "Durum Teması", data: demoStatusData },
            ].map((item, index) => (
              <Card key={index} className="p-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <StandardChart
                    title=""
                    data={item.data}
                    chartType="3d-pie"
                    showDataTable={false}
                    showBadge={false}
                    height={200}
                    {...getChartTheme(item.theme as any)}
                    className="border-0 shadow-none p-0"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">⚡ Özellik Demosu</h2>
            <p className="text-gray-600 mb-6">
              StandardChart bileşeninin gelişmiş özellikleri
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Type Switching */}
            <StandardChart
              title="Tip Değiştirme Özelliği"
              data={demoSourceData}
              chartType="3d-pie"
              allowTypeChange={true}
              showDataTable={true}
              showBadge={true}
              badgeText="Tip Değiştir"
              {...getChartTheme("source")}
              description="Kullanıcı grafik tipini değiştirebilir"
            />

            {/* Interactive Features */}
            <StandardChart
              title="Etkileşimli Özellikler"
              data={demoMeetingData}
              onItemClick={(data) => handleChartInteraction(data, "Etkileşim")}
              chartType="bar"
              showDataTable={true}
              showBadge={true}
              badgeText="Tıklanabilir"
              {...getChartTheme("meeting")}
              description="Grafik öğeleri tıklanabilir"
            />

            {/* Empty State */}
            <StandardChart
              title="Boş Veri Durumu"
              data={[]}
              chartType="pie"
              showDataTable={true}
              {...getChartTheme("general")}
              description="Veri olmadığında gösterilen durum"
              emptyStateMessage="Henüz veri eklenmedi"
              emptyStateIcon="📊"
            />

            {/* Badge Variants */}
            <StandardChart
              title="Badge Çeşitleri"
              data={demoPersonnelData}
              chartType="line"
              showDataTable={false}
              showBadge={true}
              badgeText="Premium"
              badgeVariant="default"
              {...getChartTheme("personnel")}
              description="Farklı badge stilleri"
            />
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">
              📊 Grafik Tipi Karşılaştırması
            </h2>
            <p className="text-gray-600 mb-6">
              Aynı veri ile farklı grafik tipleri
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">3D Pie Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <StandardChart
                  title=""
                  data={demoSourceData}
                  chartType="3d-pie"
                  showDataTable={false}
                  showBadge={false}
                  height={250}
                  {...getChartTheme("source")}
                  className="border-0 shadow-none p-0"
                />
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Regular Pie Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <StandardChart
                  title=""
                  data={demoSourceData}
                  chartType="pie"
                  showDataTable={false}
                  showBadge={false}
                  height={250}
                  {...getChartTheme("source")}
                  className="border-0 shadow-none p-0"
                />
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Bar Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <StandardChart
                  title=""
                  data={demoSourceData}
                  chartType="bar"
                  showDataTable={false}
                  showBadge={false}
                  height={250}
                  {...getChartTheme("source")}
                  className="border-0 shadow-none p-0"
                />
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Line Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <StandardChart
                  title=""
                  data={demoSourceData}
                  chartType="line"
                  showDataTable={false}
                  showBadge={false}
                  height={250}
                  {...getChartTheme("source")}
                  className="border-0 shadow-none p-0"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">📚 Kullanım Bilgileri</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>
            • Grafik öğelerine tıklayarak etkileşim testini yapabilirsiniz
          </li>
          <li>
            • Tip değiştirme özelliği aktif olan grafiklerde dropdown menüsünü
            kullanabilirsiniz
          </li>
          <li>• Veri tabloları otomatik olarak oluşturulur</li>
          <li>• Tüm grafikler responsive tasarımdır</li>
          <li>• Dark mode desteği mevcuttur</li>
        </ul>
      </div>
    </div>
  );
}
