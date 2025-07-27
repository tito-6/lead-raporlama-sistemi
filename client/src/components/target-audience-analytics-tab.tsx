import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "./ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "./layouts/app-layout";
import ProjectFilter from "./project-filter";

interface DateRange {
  from: Date;
  to: Date;
}

interface TargetAudienceAnalyticsTabProps {
  filters?: {
    startDate?: string;
    endDate?: string;
    month?: string;
    year?: string;
    salesRep?: string;
    leadType?: string;
    project?: string;
  };
}

export function TargetAudienceAnalyticsTab({
  filters: parentFilters,
}: TargetAudienceAnalyticsTabProps) {
  // State for filters
  const [month, setMonth] = React.useState<string>(
    parentFilters?.month ||
      (new Date().getMonth() + 1).toString().padStart(2, "0")
  );
  const [year, setYear] = React.useState<string>(
    parentFilters?.year || new Date().getFullYear().toString()
  );
  const [selectedSalesRep, setSelectedSalesRep] = React.useState<string>(
    parentFilters?.salesRep || "all"
  );
  const [selectedProject, setSelectedProject] = React.useState<string>(
    parentFilters?.project || "all"
  );
  const [filterType, setFilterType] = React.useState<"month" | "dateRange">(
    parentFilters?.month ? "month" : "dateRange"
  );

  const { toast } = useToast();

  // Fetch sales reps
  const { data: salesReps = [] } = useQuery({
    queryKey: ["/api/sales-reps"],
    queryFn: async () => {
      const response = await fetch("/api/sales-reps");
      return response.json();
    },
  });

  // Add selectedProject to query key and API params
  const filters = React.useMemo(() => {
    const params = new URLSearchParams();

    if (filterType === "month") {
      params.append("month", month);
      params.append("year", year);
    }

    if (selectedSalesRep !== "all") {
      params.append("salesRep", selectedSalesRep);
    }

    if (selectedProject !== "all") {
      params.append("project", selectedProject);
    }

    return params;
  }, [filterType, month, year, selectedSalesRep, selectedProject]);

  // Fetch target audience analytics data
  const {
    data: audienceData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "/api/target-audience-analytics",
      filters.toString(),
      selectedProject,
    ],
    queryFn: async () => {
      const response = await fetch(`/api/target-audience-analytics?${filters}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    },
  });

  // Generate months for the dropdown
  const months = [
    { value: "01", label: "Ocak" },
    { value: "02", label: "Şubat" },
    { value: "03", label: "Mart" },
    { value: "04", label: "Nisan" },
    { value: "05", label: "Mayıs" },
    { value: "06", label: "Haziran" },
    { value: "07", label: "Temmuz" },
    { value: "08", label: "Ağustos" },
    { value: "09", label: "Eylül" },
    { value: "10", label: "Ekim" },
    { value: "11", label: "Kasım" },
    { value: "12", label: "Aralık" },
  ];

  // Generate years for the dropdown (last 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) =>
    (currentYear - 4 + i).toString()
  );

  // Generate colors for the pie chart
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#8dd1e1",
    "#a4de6c",
    "#d0ed57",
  ];

  if (error) {
    return (
      <div>Error loading audience analytics: {(error as Error).message}</div>
    );
  }

  const content = (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <ProjectFilter value={selectedProject} onChange={setSelectedProject} />
        <Tabs
          value={filterType}
          onValueChange={(v) => setFilterType(v as "month" | "dateRange")}
          className="w-full sm:w-auto"
        >
          <TabsList>
            <TabsTrigger value="month">Ay/Yıl</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Ay Seçin" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Yıl Seçin" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Select value={selectedSalesRep} onValueChange={setSelectedSalesRep}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Personel Seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Personel</SelectItem>
            {salesReps.map((rep: any) => (
              <SelectItem key={rep.name} value={rep.name}>
                {rep.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      ) : (
        <>
          <div className="flex flex-row gap-8 w-full">
            <div className="flex-1">
              <Card>
                <CardHeader>
                  <CardTitle>Hedef Kitle Dağılımı</CardTitle>
                  <CardDescription>
                    İnfo Form Geliş Yeri 2 alanında belirtilen hedef kitle dağılımı
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={audienceData?.audienceAnalysis.slice(0, 10) || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="audience"
                          label={({ name, percent }) => `${name}`}
                        >
                          {audienceData?.audienceAnalysis
                            .slice(0, 10)
                            .map((entry: any, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-2">
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="w-2" /> {/* Divider space */}
            <div className="flex-1">
              <Card>
                <CardHeader>
                  <CardTitle>Hedef Kitle Başarı Oranları</CardTitle>
                  <CardDescription>
                    Her hedef kitlenin görüşme ve satış başarı oranları
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full" style={{ minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height={Math.max(400, (audienceData?.audienceAnalysis.length || 1) * 60)}>
                      <BarChart
                        layout="vertical"
                        data={
                          audienceData?.audienceAnalysis
                            .filter((a: any) => a.audience !== "Belirtilmemiş")
                            .slice(0, 8) || []
                        }
                        margin={{
                          top: 20,
                          right: 40,
                          left: 100, // More space for category names
                          bottom: 20,
                        }}
                      >
                        <XAxis type="number" />
                        <YAxis
                          dataKey="audience"
                          type="category"
                          width={150}
                          tick={{ fontSize: 14 }}
                        />
                        <Tooltip />
                        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        <Bar
                          dataKey="meetingRate"
                          name="Görüşme Oranı (%)"
                          fill="#8884d8"
                          barSize={20}
                        />
                        <Bar
                          dataKey="salesRate"
                          name="Satış Oranı (%)"
                          fill="#82ca9d"
                          barSize={20}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hedef Kitle Detayları</CardTitle>
              <CardDescription>
                Tüm hedef kitlelerin detaylı istatistikleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hedef Kitle</TableHead>
                      <TableHead className="text-right">Lead Sayısı</TableHead>
                      <TableHead className="text-right">Yüzde</TableHead>
                      <TableHead className="text-right">Görüşmeler</TableHead>
                      <TableHead className="text-right">
                        Görüşme Oranı
                      </TableHead>
                      <TableHead className="text-right">Satışlar</TableHead>
                      <TableHead className="text-right">Satış Oranı</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audienceData?.audienceAnalysis.map((item: any) => (
                      <TableRow key={item.audience}>
                        <TableCell>{item.audience}</TableCell>
                        <TableCell className="text-right">
                          {item.count}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.percentage}%
                        </TableCell>
                        <TableCell className="text-right">
                          {item.meetings}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.meetingRate}%
                        </TableCell>
                        <TableCell className="text-right">
                          {item.sales}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.salesRate}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  return <AppLayout>{content}</AppLayout>;
}

export default TargetAudienceAnalyticsTab;
