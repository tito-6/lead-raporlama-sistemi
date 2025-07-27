import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import StandardChart from "@/components/charts/StandardChart";
import { useQuery } from "@tanstack/react-query";
import GenerateReport from './GenerateReport';

export default function ExportTab() {
  // Filter states
  const [dateFilters, setDateFilters] = useState({
    startDate: "",
    endDate: "",
    month: "",
    year: "",
  });
  // Change default state for project and salesRep to "all"
  const [project, setProject] = useState("all");
  const [status, setStatus] = useState("");
  const [salesRep, setSalesRep] = useState("all");
  const [showTable, setShowTable] = useState(true);

  // Data fetching
  const { data: leads = [] } = useQuery({
    queryKey: ["/api/leads", { ...dateFilters, project, status, salesRep }],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(dateFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      if (project && project !== "all") params.append("project", project);
      if (status) params.append("status", status);
      if (salesRep && salesRep !== "all") params.append("salesRep", salesRep);
      const response = await fetch(`/api/leads?${params.toString()}`);
      return response.json();
        },
      });

  const { data: salesReps = [] } = useQuery({
    queryKey: ["/api/sales-reps"],
    queryFn: async () => {
      const response = await fetch("/api/sales-reps");
      return response.json();
    },
  });

  // Extract unique projects and statuses from leads
  const uniqueProjects = Array.from(new Set<string>(leads.map((lead: any) => lead.projectName).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set<string>(leads.map((lead: any) => lead.status).filter(Boolean)));

  // Prepare chart data (status distribution)
  const statusCounts = leads.reduce((acc: any, lead: any) => {
    const s = lead.status || "Tanımsız";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const statusChartData = Object.entries(statusCounts).map(([name, value]: any) => ({
    name,
    value,
    percentage: leads.length > 0 ? Math.round((value / leads.length) * 100) : 0,
  }));

  // Prepare chart data (project distribution)
  const projectCounts = leads.reduce((acc: any, lead: any) => {
    const p = lead.projectName || "Tanımsız";
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});
  const projectChartData = Object.entries(projectCounts).map(([name, value]: any) => ({
    name,
    value,
    percentage: leads.length > 0 ? Math.round((value / leads.length) * 100) : 0,
  }));

  // Prepare chart data (salesperson distribution)
  const salesRepCounts = leads.reduce((acc: any, lead: any) => {
    const rep = lead.assignedPersonnel || "Tanımsız";
    acc[rep] = (acc[rep] || 0) + 1;
    return acc;
  }, {});
  const salesRepChartData = Object.entries(salesRepCounts).map(([name, value]: any) => ({
    name,
    value,
    percentage: leads.length > 0 ? Math.round((value / leads.length) * 100) : 0,
  }));

  // Prepare data for GenerateReport
  const reportData = {
    status: statusChartData.map(item => ({
      name: item.name,
      count: item.value,
      percent: item.percentage + '%',
    })),
    projects: projectChartData.map(item => ({
      name: item.name,
      count: item.value,
      percent: item.percentage + '%',
    })),
    personnel: salesRepChartData.map(item => ({
      name: item.name,
      count: item.value,
      percent: item.percentage + '%',
    })),
  };

  // UI
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rapor Dışa Aktarımı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filters */}
              <div>
              <Label>Başlangıç Tarihi</Label>
              <Input
                type="date"
                value={dateFilters.startDate}
                  onChange={e => setDateFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
              <div>
              <Label>Bitiş Tarihi</Label>
              <Input
                type="date"
                value={dateFilters.endDate}
                  onChange={e => setDateFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
              <div>
                <Label>Proje</Label>
                <Select value={project} onValueChange={setProject}>
                <SelectTrigger>
                    <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    {uniqueProjects.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
              <div>
              <Label>Personel</Label>
                <Select value={salesRep} onValueChange={setSalesRep}>
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {salesReps.map((rep: any) => (
                      <SelectItem key={rep.id} value={rep.name}>{rep.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:ml-4 mt-4 md:mt-0">
              <Button variant="outline" onClick={() => setShowTable((v) => !v)}>
                {showTable ? "Tabloyu Gizle" : "Tabloyu Göster"}
                        </Button>
              <GenerateReport
                data={reportData}
                projectName={project === 'all' ? 'Tümü' : project}
                salesRep={salesRep === 'all' ? 'Tümü' : salesRep}
                dateRange={
                  dateFilters.startDate && dateFilters.endDate
                    ? `${dateFilters.startDate} - ${dateFilters.endDate}`
                    : '- - -'
                }
              />
            </div>
          </div>

          {/* Table of leads */}
          {showTable && (
            <div className="overflow-x-auto mb-8" id="leads-table-pdf">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>Proje</TableHead>
                    <TableHead>Personel</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Tarih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>{lead.customerName}</TableCell>
                      <TableCell>{lead.projectName}</TableCell>
                      <TableCell>{lead.assignedPersonnel}</TableCell>
                      <TableCell>{lead.status}</TableCell>
                      <TableCell>{lead.requestDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                              </div>
                            )}

          {/* Charts */}
          <div className="space-y-8 mb-8">
            <div id="status-section-pdf">
              <StandardChart
                title="Durum Dağılımı"
                data={statusChartData}
                chartType="pie"
                gradientColors={["from-yellow-50", "to-orange-100"]}
                borderColor="border-yellow-100 dark:border-yellow-800"
                icon="📊"
                showDataTable={true}
                tableTitle="Durum Detayları"
                canvasId="status-chart-canvas"
              />
                                    </div>
            <div id="project-section-pdf">
              <StandardChart
                title="Proje Dağılımı"
                data={projectChartData}
                chartType="bar"
                gradientColors={["from-blue-50", "to-indigo-100"]}
                borderColor="border-blue-100 dark:border-blue-800"
                icon="🏢"
                showDataTable={true}
                tableTitle="Proje Detayları"
                canvasId="project-chart-canvas"
              />
                                    </div>
            <div id="salesrep-section-pdf">
              <StandardChart
                title="Personel Dağılımı"
                data={salesRepChartData}
                chartType="bar"
                gradientColors={["from-green-50", "to-emerald-100"]}
                borderColor="border-green-100 dark:border-green-800"
                icon="👥"
                showDataTable={true}
                tableTitle="Personel Detayları"
                canvasId="salesrep-chart-canvas"
              />
                              </div>
                              </div>

          {/* Export Button */}
          <div className="flex justify-end">
            <GenerateReport
              data={reportData}
              projectName={project === 'all' ? 'Tümü' : project}
              salesRep={salesRep === 'all' ? 'Tümü' : salesRep}
              dateRange={
                dateFilters.startDate && dateFilters.endDate
                  ? `${dateFilters.startDate} - ${dateFilters.endDate}`
                  : '- - -'
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
