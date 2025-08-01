﻿import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import StandardChart from "@/components/charts/StandardChart";
import { useQuery } from "@tanstack/react-query";
import GenerateReport from './GenerateReport';
import { DownloadIcon, FileIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useFilters } from "@/contexts/filter-context";

export default function ExportTab() {
  // Use the global filter context instead of local state
  const { filters, filteredLeads, setChartType } = useFilters();
  
  const [showTable, setShowTable] = useState(true);
  const [includeLeadDataInReport, setIncludeLeadDataInReport] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");

  // Use chart types from global context instead of local state
  const projectChartType = filters.chartTypes.project;
  const statusChartType = filters.chartTypes.status;
  const personnelChartType = filters.chartTypes.personnel;
  const leadTypeChartType = filters.chartTypes.leadType;

  // Use the filtered leads from the global filter context
  const leads = filteredLeads;
  
  // Fetch expense data based on selected project from filters
  const { data: expenses = [] } = useQuery({
    queryKey: ["/api/lead-expenses", filters.selectedProject !== "all" ? filters.selectedProject : undefined],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.selectedProject && filters.selectedProject !== "all") {
        params.append("projectName", filters.selectedProject);
      }
      const response = await fetch(`/api/lead-expenses?${params.toString()}`);
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

  // Prepare lead type distribution data
  const leadTypeCounts = leads.reduce((acc: any, lead: any) => {
    const type = lead.leadType || "Tanımsız";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const leadTypeChartData = Object.entries(leadTypeCounts).map(([name, value]: any) => ({
    name,
    value,
    percentage: leads.length > 0 ? Math.round((value / leads.length) * 100) : 0,
  }));

  // Calculate expense statistics based on current filters with proper date-proportional logic
  const calculateProportionalCosts = () => {
    // Get date range for filtering
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    
    if (filters.dateFilterType === 'custom' && filters.startDate && filters.endDate) {
      startDate = new Date(filters.startDate);
      endDate = new Date(filters.endDate);
    } else if (filters.dateFilterType === 'month' && filters.selectedMonth && filters.selectedYear) {
      const [year, month] = [parseInt(filters.selectedYear), parseInt(filters.selectedMonth)];
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0); // Last day of month
    } else if (filters.dateFilterType === 'year' && filters.selectedYear) {
      const year = parseInt(filters.selectedYear);
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
    }

    let totalCost = 0;
    const costBreakdown = { agency: 0, ads: 0 };

    // Filter expenses based on selected project first
    const projectFilteredExpenses = filters.selectedProject === 'all' 
      ? expenses 
      : expenses.filter((expense: any) => expense.projectName === filters.selectedProject);

    // Debug: Log filtering information
    console.log('Date filtering debug:', {
      dateFilterType: filters.dateFilterType,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      selectedMonth: filters.selectedMonth,
      selectedYear: filters.selectedYear,
      customDates: { start: filters.startDate, end: filters.endDate },
      projectFilteredExpensesCount: projectFilteredExpenses.length,
      leadsCount: leads.length
    });

    // If we have a date range, calculate proportional costs
    if (startDate && endDate) {
      // Group filtered expenses by month
      const expensesByMonth = projectFilteredExpenses.reduce((acc: any, expense: any) => {
        if (!acc[expense.month]) acc[expense.month] = { agency_fee: 0, ads_expense: 0 };
        acc[expense.month][expense.expenseType] += Number(expense.amountTL || 0);
        return acc;
      }, {});

      // Calculate proportional costs for each month that overlaps with the date range
      Object.entries(expensesByMonth).forEach(([monthStr, costs]: [string, any]) => {
        const [year, month] = monthStr.split('-').map(Number);
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0);
        const monthDays = monthEnd.getDate();

        // Calculate overlap between filter range and this month
        const overlapStart = new Date(Math.max(startDate!.getTime(), monthStart.getTime()));
        const overlapEnd = new Date(Math.min(endDate!.getTime(), monthEnd.getTime()));
        
        if (overlapStart <= overlapEnd) {
          const overlapDays = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          
          // Calculate proportional agency fees based on days
          const dayProportion = overlapDays / monthDays;
          const proportionalAgencyFee = costs.agency_fee * dayProportion;
          totalCost += proportionalAgencyFee;
          costBreakdown.agency += proportionalAgencyFee;
          
          // Calculate proportional ad expenses based on leads in that month
          // Get leads for this specific month
          const monthLeads = leads.filter((lead: any) => {
            const leadDate = new Date(lead.requestDate);
            return leadDate.getFullYear() === year && 
                   leadDate.getMonth() === month - 1;
          });
          
          // Get leads that fall within the selected date range for this month
          const selectedPeriodLeads = leads.filter((lead: any) => {
            const leadDate = new Date(lead.requestDate);
            return leadDate >= overlapStart && leadDate <= overlapEnd;
          });
          
          // Calculate ads expense proportion based on leads
          let proportionalAdExpense = 0;
          if (monthLeads.length > 0 && costs.ads_expense > 0) {
            const costPerLead = costs.ads_expense / monthLeads.length;
            proportionalAdExpense = costPerLead * selectedPeriodLeads.length;
          }
          
          totalCost += proportionalAdExpense;
          costBreakdown.ads += proportionalAdExpense;
          
          // Debug: Log proportional calculation
          console.log(`Month ${monthStr} proportional calculation:`, {
            monthStart: monthStart.toISOString().split('T')[0],
            monthEnd: monthEnd.toISOString().split('T')[0],
            overlapStart: overlapStart.toISOString().split('T')[0],
            overlapEnd: overlapEnd.toISOString().split('T')[0],
            overlapDays,
            monthDays,
            dayProportion: dayProportion.toFixed(4),
            monthLeadsCount: monthLeads.length,
            selectedPeriodLeadsCount: selectedPeriodLeads.length,
            originalAgencyFee: costs.agency_fee,
            originalAdExpense: costs.ads_expense,
            costPerLead: monthLeads.length > 0 ? (costs.ads_expense / monthLeads.length).toFixed(2) : 0,
            proportionalAgencyFee: proportionalAgencyFee.toFixed(2),
            proportionalAdExpense: proportionalAdExpense.toFixed(2)
          });
        }
      });
    } else {
      // No date filtering - use project filtered expenses
      totalCost = projectFilteredExpenses.reduce((sum: number, expense: any) => {
        const amount = Number(expense.amountTL || 0);
        if (expense.expenseType === 'agency_fee') {
          costBreakdown.agency += amount;
        } else {
          costBreakdown.ads += amount;
        }
        return sum + amount;
      }, 0);
    }

    return { totalCost, costBreakdown };
  };

  const { totalCost: totalExpenses, costBreakdown } = calculateProportionalCosts();

  // Debug: Log final calculation results
  console.log('Final cost calculation results:', {
    totalExpenses: totalExpenses.toFixed(2),
    costBreakdown,
    leadsCount: leads.length,
    costPerLead: leads.length > 0 ? (totalExpenses / leads.length).toFixed(2) : 0
  });
  
  // Filter expenses for table display based on selected project
  const filteredExpenses = filters.selectedProject === 'all' 
    ? expenses 
    : expenses.filter((expense: any) => expense.projectName === filters.selectedProject);
  
  // Calculate sales based on filtered leads
  const sales = leads.filter((lead: any) => 
    lead.wasSaleMade?.toLowerCase() === "evet" ||
    lead.wasSaleMade === true || 
    lead.wasSaleMade === 1
  ).length;
  
  // Calculate cost metrics
  const costPerLead = leads.length > 0 ? totalExpenses / leads.length : 0;
  const costPerSale = sales > 0 ? totalExpenses / sales : 0;
  const conversionRate = leads.length > 0 ? (sales / leads.length * 100) : 0;

  // Prepare cost metrics data
  const costMetricsData = [
    { name: "Toplam Gider (TL)", value: totalExpenses.toFixed(2) },
    { name: "└ Ajans Ücreti (TL)", value: costBreakdown.agency.toFixed(2) },
    { name: "└ Reklam Gideri (TL)", value: costBreakdown.ads.toFixed(2) },
    { name: "Lead Başına Maliyet (TL)", value: costPerLead.toFixed(2) },
    { name: "Satış Başına Maliyet (TL)", value: costPerSale.toFixed(2) },
    { name: "Toplam Lead Sayısı", value: leads.length },
    { name: "Toplam Satış Sayısı", value: sales },
    { name: "Dönüşüm Oranı", value: `%${conversionRate.toFixed(2)}` },
  ];

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
    leadTypes: leadTypeChartData.map(item => ({
      name: item.name,
      count: item.value,
      percent: item.percentage + '%',
    })),
    // Ensure cost metrics are properly formatted for the report
    costMetrics: [
      { name: "Toplam Gider (TL)", value: totalExpenses.toFixed(2) },
      { name: "└ Ajans Ücreti (TL)", value: costBreakdown.agency.toFixed(2) },
      { name: "└ Reklam Gideri (TL)", value: costBreakdown.ads.toFixed(2) },
      { name: "Lead Başına Maliyet (TL)", value: costPerLead.toFixed(2) },
      { name: "Satış Başına Maliyet (TL)", value: costPerSale.toFixed(2) },
      { name: "Toplam Lead Sayısı", value: leads.length.toString() },
      { name: "Toplam Satış Sayısı", value: sales.toString() },
      { name: "Dönüşüm Oranı", value: `%${leads.length > 0 ? (sales / leads.length * 100).toFixed(2) : 0}` },
    ],
    includeLeadData: includeLeadDataInReport,
    leadData: includeLeadDataInReport ? leads : []
  };

  // UI
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Proje Bazlı Rapor Dışa Aktarımı</CardTitle>
          <CardDescription>Lead sayıları, durum dağılımı, personel analizi ve maliyet metrikleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Export Format Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="PDF" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="word">Word</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground mt-2">
                  Kullanılan filtreler: 
                  {filters.selectedProject !== 'all' && <Badge variant="outline" className="ml-1">{filters.selectedProject}</Badge>}
                  {filters.selectedSalesperson !== 'all' && <Badge variant="outline" className="ml-1">{filters.selectedSalesperson}</Badge>}
                  {filters.selectedLeadType !== 'all' && <Badge variant="outline" className="ml-1">{filters.selectedLeadType}</Badge>}
                  {filters.dateFilterType === 'custom' && filters.startDate && filters.endDate && 
                    <Badge variant="outline" className="ml-1">{`${filters.startDate} - ${filters.endDate}`}</Badge>}
                </p>
              </div>
            </div>
            
            {/* Chart Type Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs">Proje Grafik Tipi</Label>
                <Select value={projectChartType} onValueChange={(value) => setChartType('project', value as 'bar' | 'pie' | 'line' | '3d-pie')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Çubuk</SelectItem>
                    <SelectItem value="pie">Pasta</SelectItem>
                    <SelectItem value="line">Çizgi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Durum Grafik Tipi</Label>
                <Select value={statusChartType} onValueChange={(value) => setChartType('status', value as 'bar' | 'pie' | 'line' | '3d-pie')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Çubuk</SelectItem>
                    <SelectItem value="pie">Pasta</SelectItem>
                    <SelectItem value="line">Çizgi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Personel Grafik Tipi</Label>
                <Select value={personnelChartType} onValueChange={(value) => setChartType('personnel', value as 'bar' | 'pie' | 'line' | '3d-pie')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Çubuk</SelectItem>
                    <SelectItem value="pie">Pasta</SelectItem>
                    <SelectItem value="line">Çizgi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Lead Tip Grafik Tipi</Label>
                <Select value={leadTypeChartType} onValueChange={(value) => setChartType('leadType', value as 'bar' | 'pie' | 'line' | '3d-pie')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Çubuk</SelectItem>
                    <SelectItem value="pie">Pasta</SelectItem>
                    <SelectItem value="line">Çizgi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Summary Card */}
            <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
              <CardHeader className="pb-0">
                <CardTitle>Özet Metrikler</CardTitle>
                <CardDescription>
                  {filters.selectedProject !== 'all' ? `${filters.selectedProject} projesi için metrikler` : 'Tüm projeler için metrikler'}
                  {filters.selectedSalesperson !== 'all' ? `, ${filters.selectedSalesperson} personeli` : ''}
                  {filters.selectedLeadType !== 'all' ? `, ${filters.selectedLeadType} tipi` : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex flex-col p-2 bg-white dark:bg-blue-900 rounded shadow-sm">
                    <span className="text-sm text-muted-foreground">Toplam Lead</span>
                    <span className="text-2xl font-bold">{leads.length}</span>
                  </div>
                  <div className="flex flex-col p-2 bg-white dark:bg-blue-900 rounded shadow-sm">
                    <span className="text-sm text-muted-foreground">Toplam Satış</span>
                    <span className="text-2xl font-bold">{sales}</span>
                  </div>
                  <div className="flex flex-col p-2 bg-white dark:bg-blue-900 rounded shadow-sm">
                    <span className="text-sm text-muted-foreground">Toplam Maliyet</span>
                    <span className="text-2xl font-bold">{totalExpenses.toFixed(2)} TL</span>
                  </div>
                  <div className="flex flex-col p-2 bg-white dark:bg-blue-900 rounded shadow-sm">
                    <span className="text-sm text-muted-foreground">Lead Başı Maliyet</span>
                    <span className="text-2xl font-bold">{costPerLead.toFixed(2)} TL</span>
                  </div>
                  <div className="flex flex-col p-2 bg-white dark:bg-blue-900 rounded shadow-sm">
                    <span className="text-sm text-muted-foreground">Satış Başı Maliyet</span>
                    <span className="text-2xl font-bold">{costPerSale.toFixed(2)} TL</span>
                  </div>
                  <div className="flex flex-col p-2 bg-white dark:bg-blue-900 rounded shadow-sm">
                    <span className="text-sm text-muted-foreground">Dönüşüm Oranı</span>
                    <span className="text-2xl font-bold">%{leads.length > 0 ? (sales / leads.length * 100).toFixed(2) : 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => setShowTable((v) => !v)}>
                  {showTable ? "Tabloyu Gizle" : "Tabloyu Göster"}
                </Button>
                <div className="flex items-center space-x-2 border rounded-md p-2">
                  <Label htmlFor="includeLeadData" className="text-sm cursor-pointer">
                    Lead Verilerini Rapora Ekle
                  </Label>
                  <Input
                    id="includeLeadData"
                    type="checkbox"
                    className="w-4 h-4 cursor-pointer"
                    checked={includeLeadDataInReport}
                    onChange={(e) => setIncludeLeadDataInReport(e.target.checked)}
                  />
                </div>
                {filters.selectedProject !== 'all' && <Badge variant="outline" className="px-2">{filters.selectedProject}</Badge>}
              </div>
              
              <div className="flex space-x-2">
                <GenerateReport
                  data={{
                    ...reportData,
                    chartTypes: {
                      projects: projectChartType,
                      status: statusChartType,
                      personnel: personnelChartType,
                      leadTypes: leadTypeChartType
                    }
                  }}
                  projectName={filters.selectedProject === 'all' ? 'Tümü' : filters.selectedProject}
                  salesRep={filters.selectedSalesperson === 'all' ? 'Tümü' : filters.selectedSalesperson}
                  leadType={filters.selectedLeadType === 'all' ? 'Tümü' : filters.selectedLeadType}
                  dateRange={
                    filters.dateFilterType === 'custom' && filters.startDate && filters.endDate
                      ? `${filters.startDate} - ${filters.endDate}`
                      : filters.dateFilterType === 'month' && filters.selectedMonth && filters.selectedYear
                        ? `${filters.selectedMonth}/${filters.selectedYear}`
                        : filters.dateFilterType === 'year' && filters.selectedYear
                          ? `${filters.selectedYear}`
                          : '- - -'
                  }
                  format={exportFormat as "pdf" | "excel" | "word"}
                  includeLeadData={includeLeadDataInReport}
                />
              </div>
            </div>
            
            <div className="flex items-center mt-3 p-2 bg-blue-50 rounded-md">
              <span className="text-xs text-blue-700">
                <strong>İpucu:</strong> Yukarıdaki grafik tipi seçimleri hem gösterilen grafikleri hem de dışa aktarılmış raporları etkiler.
                Grafik tiplerini değiştirerek ve dışa aktararak özelleştirilmiş raporlar oluşturabilirsiniz.
              </span>
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
                    <TableHead>Lead Tipi</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Satış Durumu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>{lead.customerName}</TableCell>
                      <TableCell>{lead.projectName}</TableCell>
                      <TableCell>{lead.assignedPersonnel}</TableCell>
                      <TableCell>{lead.leadType}</TableCell>
                      <TableCell>{lead.status}</TableCell>
                      <TableCell>{lead.requestDate}</TableCell>
                      <TableCell>{lead.wasSaleMade === "evet" ? "" : ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* All Reports in One Unified View */}
          <div className="mt-8 space-y-8" id="unified-report-sections">
            {/* Genel Bakış - Projects */}
            <Card id="overview-section">
              <CardHeader className="bg-muted/20">
                <CardTitle>Genel Bakış</CardTitle>
                <CardDescription>Projelere göre lead dağılımı</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div id="project-section-pdf">
                  <StandardChart
                    title="Proje Bazlı Lead Dağılımı"
                    data={projectChartData}
                    chartType={projectChartType}
                    gradientColors={["from-blue-50", "to-indigo-100"]}
                    borderColor="border-blue-100 dark:border-blue-800"
                    icon=""
                    showDataTable={true}
                    tableTitle="Proje Detayları"
                    canvasId="project-chart-canvas"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Status Distribution */}
            <Card id="status-section">
              <CardHeader className="bg-muted/20">
                <CardTitle>Durum Analizi</CardTitle>
                <CardDescription>Lead durumlarının dağılımı</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div id="status-section-pdf">
                  <StandardChart
                    title="Durum Dağılımı"
                    data={statusChartData}
                    chartType={statusChartType}
                    gradientColors={["from-yellow-50", "to-orange-100"]}
                    borderColor="border-yellow-100 dark:border-yellow-800"
                    icon=""
                    showDataTable={true}
                    tableTitle="Durum Detayları"
                    canvasId="status-chart-canvas"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Personnel Analysis */}
            <Card id="personnel-section">
              <CardHeader className="bg-muted/20">
                <CardTitle>Personel Analizi</CardTitle>
                <CardDescription>Personel bazında lead ve satış dağılımı</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div id="salesrep-section-pdf">
                  <StandardChart
                    title="Personel Dağılımı"
                    data={salesRepChartData}
                    chartType={personnelChartType}
                    gradientColors={["from-green-50", "to-emerald-100"]}
                    borderColor="border-green-100 dark:border-green-800"
                    icon=""
                    showDataTable={true}
                    tableTitle="Personel Detayları"
                    canvasId="salesrep-chart-canvas"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Lead Type Analysis */}
            <Card id="lead-types-section">
              <CardHeader className="bg-muted/20">
                <CardTitle>Lead Tip Analizi</CardTitle>
                <CardDescription>Lead tiplerinin dağılımı (Kiralama, Satış, Diğer)</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div id="leadtype-section-pdf">
                  <StandardChart
                    title="Lead Tip Dağılımı"
                    data={leadTypeChartData}
                    chartType={leadTypeChartType}
                    gradientColors={["from-purple-50", "to-violet-100"]}
                    borderColor="border-purple-100 dark:border-purple-800"
                    icon=""
                    showDataTable={true}
                    tableTitle="Lead Tip Detayları"
                    canvasId="leadtype-chart-canvas"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Cost Analysis */}
            <Card id="costs-section">
              <CardHeader className="bg-muted/20">
                <CardTitle>Maliyet Analizi</CardTitle>
                <CardDescription>Toplam maliyet, lead başına ve satış başına maliyet</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <Table id="cost-metrics-table">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Maliyet Metriği</TableHead>
                          <TableHead>Değer</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {costMetricsData.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Expense breakdown if there are expenses */}
                  {filteredExpenses.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Gider Detayları</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ay</TableHead>
                            <TableHead>Gider Türü</TableHead>
                            <TableHead>Proje</TableHead>
                            <TableHead>Miktar (TL)</TableHead>
                            <TableHead>Açıklama</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredExpenses.map((expense: any, i: number) => (
                            <TableRow key={i}>
                              <TableCell>{expense.month}</TableCell>
                              <TableCell>{expense.expenseType === 'agency_fee' ? 'Ajans Ücreti' : 'Reklam Gideri'}</TableCell>
                              <TableCell>{expense.projectName || 'Genel'}</TableCell>
                              <TableCell>{parseFloat(expense.amountTL).toFixed(2)} TL</TableCell>
                              <TableCell>{expense.description}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
