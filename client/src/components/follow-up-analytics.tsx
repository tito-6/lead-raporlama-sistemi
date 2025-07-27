import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  Phone,
  Users,
  Building,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Target,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
} from "lucide-react";
import StandardChart from "@/components/charts/StandardChart";
import { useFilters } from "@/contexts/filter-context";
import ProjectFilter from "./project-filter";
import { filterLeadsByProject } from "@/lib/project-detector";

export default function FollowUpAnalytics() {
  const { filteredLeads, filters } = useFilters();
  // Use a local state for selectedProject if not present in filters
  const [selectedProject, setSelectedProject] = React.useState<string>(
    (filters && filters.selectedProject) || "all"
  );

  // Define follow-up statuses
  const followUpStatuses = [
    "Takipte",
    "Potansiyel - Takipte",
    "Randevulu",
    "Randevusuz",
    "Acil Takip",
    "Bilgi Verildi - Tekrar Aranacak",
    "Tekrar Aranacak",
    "Arandı - Geri Dönecek",
    "Ulaşılamıyor",
  ];

  // Filter leads that need follow-up
  const followUpLeads = useMemo(() => {
    return filteredLeads.filter((lead) => {
      const status = lead.status || "";
      return followUpStatuses.some(
        (fs) =>
          status.toLowerCase().includes(fs.toLowerCase()) ||
          fs.toLowerCase().includes(status.toLowerCase())
      );
    });
  }, [filteredLeads]);

  // Filter leads by selected project
  const projectFilteredLeads = React.useMemo(() => {
    if (selectedProject === "all") return filteredLeads;
    return filterLeadsByProject(filteredLeads, selectedProject);
  }, [filteredLeads, selectedProject]);

  // Calculate analytics (use projectFilteredLeads for all calculations)
  const analytics = useMemo(() => {
    if (!projectFilteredLeads.length) return null;

    const total = projectFilteredLeads.length;

    // Status distribution
    const statusCounts = projectFilteredLeads.reduce((acc, lead) => {
      const status = lead.status || "Tanımsız";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count as number,
      percentage: Math.round(((count as number) / total) * 100),
    }));

    // Personnel distribution
    const personnelCounts = projectFilteredLeads.reduce((acc, lead) => {
      const personnel = lead.assignedPersonnel || "Atanmamış";
      acc[personnel] = (acc[personnel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const personnelData = Object.entries(personnelCounts).map(
      ([personnel, count]) => ({
        name: personnel,
        value: count as number,
        percentage: Math.round(((count as number) / total) * 100),
      })
    );

    // Project distribution
    const projectCounts = projectFilteredLeads.reduce((acc, lead) => {
      const project =
        lead.projectName || lead.webFormNote || "Proje Belirtilmemiş";
      acc[project] = (acc[project] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const projectData = Object.entries(projectCounts).map(
      ([project, count]) => ({
        name: project,
        value: count as number,
        percentage: Math.round(((count as number) / total) * 100),
      })
    );

    // Lead type distribution
    const typeCounts = projectFilteredLeads.reduce((acc, lead) => {
      const type = lead.leadType || "Belirtilmemiş";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeData = Object.entries(typeCounts).map(([type, count]) => ({
      name:
        type === "satis" ? "Satış" : type === "kiralama" ? "Kiralama" : type,
      value: count as number,
      percentage: Math.round(((count as number) / total) * 100),
    }));

    // Source distribution
    const sourceCounts = projectFilteredLeads.reduce((acc, lead) => {
      const source =
        lead.firstCustomerSource ||
        lead.formCustomerSource ||
        "Kaynak Belirtilmemiş";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sourceData = Object.entries(sourceCounts).map(([source, count]) => ({
      name: source,
      value: count as number,
      percentage: Math.round(((count as number) / total) * 100),
    }));

    // Urgent follow-ups (more than 7 days old)
    const urgentFollowUps = projectFilteredLeads.filter((lead) => {
      if (!lead.requestDate) return false;
      const daysSince = Math.floor(
        (new Date().getTime() - new Date(lead.requestDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      return daysSince > 7;
    });

    return {
      total,
      statusData,
      personnelData,
      projectData,
      typeData,
      sourceData,
      urgentFollowUps,
    };
  }, [projectFilteredLeads]);

  // Key metrics
  const keyMetrics = useMemo(() => {
    if (!analytics) return [];

    const urgentCount = analytics.urgentFollowUps.length;
    const urgentPercentage = Math.round((urgentCount / analytics.total) * 100);

    return [
      {
        label: "Toplam Takipte",
        value: analytics.total,
        icon: Phone,
        color: "blue",
        description: "Aktif takipte olan lead sayısı",
      },
      {
        label: "Acil Takip",
        value: urgentCount,
        icon: AlertTriangle,
        color: "red",
        description: `7+ günlük takipler (${urgentPercentage}%)`,
      },
      {
        label: "Temsilci Sayısı",
        value: analytics.personnelData.length,
        icon: Users,
        color: "green",
        description: "Takipte aktif temsilci sayısı",
      },
      {
        label: "Proje Sayısı",
        value: analytics.projectData.length,
        icon: Building,
        color: "purple",
        description: "Takipte proje çeşitliliği",
      },
    ];
  }, [analytics]);

  if (!analytics) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Seçilen filtrelere göre takipte olan lead bulunmuyor. Lütfen
            filtrelerinizi kontrol ediniz.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Card className="w-full max-w-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building className="h-4 w-4 text-blue-600" />
              Proje Filtresi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectFilter
              value={selectedProject}
              onChange={setSelectedProject}
            />
          </CardContent>
        </Card>
        <Badge variant="outline" className="bg-white">
          📊 {analytics.total} Lead
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => (
          <Card
            key={index}
            className={`border-l-4 border-l-${metric.color}-500`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {metric.description}
                  </p>
                </div>
                <div className={`p-2 rounded-full bg-${metric.color}-100`}>
                  <metric.icon className={`h-5 w-5 text-${metric.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Urgent Follow-ups Alert */}
      {analytics.urgentFollowUps.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{analytics.urgentFollowUps.length} lead</strong> 7 günden
            uzun süredir takipte! Acil müdahale gerekiyor.
          </AlertDescription>
        </Alert>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Durum
          </TabsTrigger>
          <TabsTrigger value="personnel" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Personel
          </TabsTrigger>
          <TabsTrigger value="project" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Proje
          </TabsTrigger>
          <TabsTrigger value="type" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Tip
          </TabsTrigger>
          <TabsTrigger value="source" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Kaynak
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="w-full">
          <section className="w-full pt-0 pb-8">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Durum Analizi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StandardChart
                  title="Takip Durumu Dağılımı"
                  data={analytics.statusData}
                  height={400}
                  chartType="pie"
                  allowTypeChange={true}
                  showDataTable={true}
                  tableTitle="Durum Detayları"
                />
              </CardContent>
            </Card>
          </section>
          <hr className="border-t border-gray-300 dark:border-gray-700 my-4" />
        </TabsContent>

        <TabsContent value="personnel" className="w-full">
          <section className="w-full py-8">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Personel Performans Analizi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StandardChart
                  title="Personel Bazında Takip Dağılımı"
                  data={analytics.personnelData}
                  height={400}
                  chartType="bar"
                  allowTypeChange={true}
                  showDataTable={true}
                  tableTitle="Personel Detayları"
                />
              </CardContent>
            </Card>
          </section>
          <hr className="border-t border-gray-300 dark:border-gray-700 my-4" />
        </TabsContent>

        <TabsContent value="project" className="w-full">
          <section className="w-full py-8">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Proje Analizi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StandardChart
                  title="Proje Bazında Takip Dağılımı"
                  data={analytics.projectData}
                  height={400}
                  chartType="bar"
                  allowTypeChange={true}
                  showDataTable={true}
                  tableTitle="Proje Detayları"
                />
              </CardContent>
            </Card>
          </section>
          <hr className="border-t border-gray-300 dark:border-gray-700 my-4" />
        </TabsContent>

        <TabsContent value="type" className="w-full">
          <section className="w-full py-8">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Lead Tipi Analizi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StandardChart
                  title="Lead Tipi Dağılımı"
                  data={analytics.typeData}
                  height={400}
                  chartType="pie"
                  allowTypeChange={true}
                  showDataTable={true}
                  tableTitle="Tip Detayları"
                />
              </CardContent>
            </Card>
          </section>
          <hr className="border-t border-gray-300 dark:border-gray-700 my-4" />
        </TabsContent>

        <TabsContent value="source" className="w-full">
          <section className="w-full py-8">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Kaynak Analizi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StandardChart
                  title="Kaynak Bazında Takip Dağılımı"
                  data={analytics.sourceData}
                  height={400}
                  chartType="pie"
                  allowTypeChange={true}
                  showDataTable={true}
                  tableTitle="Kaynak Detayları"
                />
              </CardContent>
            </Card>
          </section>
        </TabsContent>
      </Tabs>

      {/* Urgent Follow-ups Table */}
      {analytics.urgentFollowUps.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Clock className="h-5 w-5" />
              🚨 Acil Takip Gereken Leadler
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-900">
                      Müşteri
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-900">
                      Temsilci
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-900">
                      Proje
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-900">
                      Durum
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-900">
                      Talep Tarihi
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-900">
                      Gün Sayısı
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.urgentFollowUps.map((lead, index) => {
                    const daysSince = Math.floor(
                      (new Date().getTime() -
                        new Date(lead.requestDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    );

                    return (
                      <tr
                        key={lead.id}
                        className={`hover:bg-gray-50 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="p-4 font-medium text-gray-900">
                          {lead.customerName}
                        </td>
                        <td className="p-4 text-gray-700">
                          {lead.assignedPersonnel || "Atanmamış"}
                        </td>
                        <td className="p-4 text-gray-700">
                          {lead.projectName ||
                            lead.webFormNote ||
                            "Belirtilmemiş"}
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              daysSince > 14
                                ? "destructive"
                                : daysSince > 7
                                ? "default"
                                : "secondary"
                            }
                          >
                            {lead.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-gray-700">
                          {lead.requestDate
                            ? new Date(lead.requestDate).toLocaleDateString(
                                "tr-TR"
                              )
                            : "Belirtilmemiş"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`font-bold ${
                              daysSince > 14
                                ? "text-red-600"
                                : daysSince > 7
                                ? "text-orange-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {daysSince} gün
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
