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
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { Skeleton } from "./ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
// We'll use a simple date range selector instead of DatePickerWithRange
import { addDays, format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { InfoIcon } from "lucide-react";

interface MeetingAnalyticsTabProps {
  filters?: {
    startDate?: string;
    endDate?: string;
    month?: string;
    year?: string;
    salesRep?: string;
    leadType?: string;
  };
}

interface MeetingAnalyticsData {
  totalLeads: number;
  totalMeetings: number;
  meetingsPercentage: number;
  avgDaysToMeeting: string;
  minDaysToMeeting: number;
  maxDaysToMeeting: number;
  meetingsByPersonnel: {
    personnel: string;
    count: number;
    percentage: number;
  }[];
  meetingTimeDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
}

interface ChartItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface TimeChartItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export function MeetingAnalyticsTab({
  filters: parentFilters,
}: MeetingAnalyticsTabProps) {
  // State for filters
  const [date, setDate] = React.useState({
    from: parentFilters?.startDate
      ? new Date(parentFilters.startDate)
      : addDays(new Date(), -30),
    to: parentFilters?.endDate ? new Date(parentFilters.endDate) : new Date(),
  });
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
  const [filterType, setFilterType] = React.useState<"month" | "dateRange">(
    parentFilters?.month ? "month" : "dateRange"
  );
  const [chartType, setChartType] = React.useState<"bar" | "pie" | "line">(
    "bar"
  );

  // Function to generate random colors for charts if needed
  const getRandomColor = () => {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  };

  // Get personnel colors
  const getPersonnelColor = (name: string) => {
    const colors = [
      "#4ade80",
      "#60a5fa",
      "#f59e0b",
      "#f97316",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
      "#14b8a6",
      "#06b6d4",
      "#6366f1",
    ];

    // Create a stable color based on the string
    const index =
      name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  // Fetch sales reps
  const { data: salesReps = [] } = useQuery({
    queryKey: ["/api/sales-reps"],
    queryFn: async () => {
      const response = await fetch("/api/sales-reps");
      return response.json();
    },
  });

  // Build the filter params
  const filters = React.useMemo(() => {
    const params = new URLSearchParams();

    if (filterType === "dateRange" && date.from && date.to) {
      params.append("startDate", format(date.from, "yyyy-MM-dd"));
      params.append("endDate", format(date.to, "yyyy-MM-dd"));
    } else if (filterType === "month") {
      params.append("month", month);
      params.append("year", year);
    }

    if (parentFilters?.salesRep) {
      params.append("salesRep", parentFilters.salesRep);
    } else if (selectedSalesRep !== "all") {
      params.append("salesRep", selectedSalesRep);
    }

    if (parentFilters?.leadType) {
      params.append("leadType", parentFilters.leadType);
    }

    return params;
  }, [
    date.from,
    date.to,
    month,
    year,
    selectedSalesRep,
    filterType,
    parentFilters,
  ]);

  const { data: meetingAnalytics, isLoading } = useQuery<MeetingAnalyticsData>({
    queryKey: ["/api/meeting-analytics", filters.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/meeting-analytics?${filters}`);
      if (!response.ok) {
        throw new Error("Failed to fetch meeting analytics");
      }
      return response.json();
    },
  });

  // Prepare chart data for meeting by personnel
  const meetingsByPersonnelData = React.useMemo(() => {
    if (!meetingAnalytics?.meetingsByPersonnel) return [];

    return meetingAnalytics.meetingsByPersonnel.map((item) => ({
      name: item.personnel,
      value: item.count,
      percentage: item.percentage,
      color: getPersonnelColor(item.personnel),
    }));
  }, [meetingAnalytics]);

  // Prepare chart data for meeting time distribution
  const meetingTimeData = React.useMemo(() => {
    if (!meetingAnalytics?.meetingTimeDistribution) return [];

    return meetingAnalytics.meetingTimeDistribution.map((item) => ({
      name: item.range,
      count: item.count,
      percentage: item.percentage,
      // Use a color gradient from green (fast meetings) to red (slow meetings)
      color: item.range.includes("0-3")
        ? "#4ade80" // green for fast meetings
        : item.range.includes("4-7")
        ? "#60a5fa" // blue for medium speed
        : item.range.includes("8-14")
        ? "#f59e0b" // amber for slower
        : item.range.includes("15-30")
        ? "#f97316" // orange for slow
        : "#ef4444", // red for very slow
    }));
  }, [meetingAnalytics]);

  // Calculate aggregated stats
  const aggregatedStats = React.useMemo(() => {
    if (!meetingAnalytics) return null;

    return {
      meetingPercentage: meetingAnalytics.meetingsPercentage || 0,
      totalMeetings: meetingAnalytics.totalMeetings || 0,
      totalLeads: meetingAnalytics.totalLeads || 0,
      avgDaysToMeeting: meetingAnalytics.avgDaysToMeeting || "0",
      meetingRateData: [
        {
          name: "Toplantı Yapıldı",
          value: meetingAnalytics.totalMeetings || 0,
          percentage: meetingAnalytics.meetingsPercentage || 0,
          color: "#4ade80",
        },
        {
          name: "Toplantı Yapılmadı",
          value:
            (meetingAnalytics.totalLeads || 0) -
            (meetingAnalytics.totalMeetings || 0),
          percentage: 100 - (meetingAnalytics.meetingsPercentage || 0),
          color: "#ef4444",
        },
      ],
    };
  }, [meetingAnalytics]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (!meetingAnalytics) {
    return (
      <div className="text-center p-4">
        <p>Toplantı verisi bulunamadı.</p>
      </div>
    );
  }

  const renderChartByType = (
    data: ChartItem[] | TimeChartItem[],
    dataKey: string = "value"
  ) => {
    switch (chartType) {
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={120}
                fill="#8884d8"
                dataKey={dataKey}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || getRandomColor()}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any) => {
                  const item = data.find((d) => d.name === name);
                  return [`${value} (${item?.percentage || 0}%)`, name];
                }}
              />
              <Legend layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: any, name: any) => {
                  const item = data.find((d) => d.name === name);
                  return [`${value} (${item?.percentage || 0}%)`, name];
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
      default:
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: any, name: any) => {
                  const item = data.find((d) => d.name === name);
                  return [`${value} (${item?.percentage || 0}%)`, name];
                }}
              />
              <Legend />
              <Bar dataKey={dataKey}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || getRandomColor()}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart type selection */}
      <div className="flex justify-end space-x-2">
        <Select
          value={chartType}
          onValueChange={(value: any) =>
            setChartType(value as "bar" | "pie" | "line")
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Grafik Tipi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bar">Bar Grafik</SelectItem>
            <SelectItem value="pie">Pasta Grafik</SelectItem>
            <SelectItem value="line">Çizgi Grafik</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium">Toplam Lead</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregatedStats?.totalLeads}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium">
              Toplam Toplantı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregatedStats?.totalMeetings}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium">
              Toplantı Oranı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              %{aggregatedStats?.meetingPercentage}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium">
              Ort. Toplantı Zamanı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregatedStats?.avgDaysToMeeting} gün
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Toplantı Genel Bakış</TabsTrigger>
          <TabsTrigger value="personnel">Personel Analizi</TabsTrigger>
          <TabsTrigger value="timing">Toplantı Zamanlama</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Toplantı Oranı</CardTitle>
              <CardDescription>
                Lead'lerin ne kadarı ile toplantı yapıldı?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  {renderChartByType(aggregatedStats?.meetingRateData || [])}
                </div>
                <div>
                  <div className="space-y-4">
                    <Alert>
                      <InfoIcon className="h-4 w-4" />
                      <AlertTitle>Toplantı İstatistikleri</AlertTitle>
                      <AlertDescription>
                        <p>
                          Toplam {aggregatedStats?.totalLeads} lead'den{" "}
                          {aggregatedStats?.totalMeetings} tanesi ile toplantı
                          yapılmıştır.
                        </p>
                        <p className="mt-2">
                          Toplantı oranı: %{aggregatedStats?.meetingPercentage}
                        </p>
                        <p className="mt-2">
                          Ortalama toplantı zamanı:{" "}
                          {aggregatedStats?.avgDaysToMeeting} gün
                        </p>
                      </AlertDescription>
                    </Alert>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Detaylı Analiz</h4>
                      <p className="text-sm text-muted-foreground">
                        Toplantı yapılan lead'lerin diğer lead'lere göre dönüşüm
                        oranı daha yüksektir. Toplantı süreçlerini hızlandırmak
                        için ekip koordinasyonunu geliştirin.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personnel">
          <Card>
            <CardHeader>
              <CardTitle>Personel Toplantı Analizi</CardTitle>
              <CardDescription>
                Personel bazında toplantı dağılımı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  {renderChartByType(meetingsByPersonnelData)}
                </div>
                <div>
                  <div className="space-y-4">
                    <h3 className="font-medium">
                      Personel Performans Detayları
                    </h3>
                    <div className="space-y-2">
                      {meetingsByPersonnelData.map((item, index) => (
                        <div
                          key={`personnel-${index}`}
                          className="flex justify-between items-center"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: item.color || getRandomColor(),
                              }}
                            />
                            <span>{item.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <span>{item.value} toplantı</span>
                            <span className="text-muted-foreground">
                              ({item.percentage}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing">
          <Card>
            <CardHeader>
              <CardTitle>Toplantı Zamanlama Analizi</CardTitle>
              <CardDescription>
                Lead'in gelişinden toplantıya kadar geçen süre dağılımı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  {renderChartByType(meetingTimeData, "count")}
                </div>
                <div>
                  <div className="space-y-4">
                    <Alert>
                      <InfoIcon className="h-4 w-4" />
                      <AlertTitle>Zamanlama Önemi</AlertTitle>
                      <AlertDescription>
                        Lead'in gelişinden itibaren ilk 7 gün içinde toplantı
                        yapılması dönüşüm oranını artırır.
                        {meetingTimeData.some(
                          (item) => item.name === "0-3 days"
                        ) && (
                          <p className="mt-2">
                            İlk 3 gün içindeki toplantılar:{" "}
                            {meetingTimeData.find(
                              (item) => item.name === "0-3 days"
                            )?.count || 0}{" "}
                            adet
                          </p>
                        )}
                      </AlertDescription>
                    </Alert>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">
                        Detaylı Zaman Analizi
                      </h4>
                      <div className="space-y-2">
                        {meetingTimeData.map((item, index) => (
                          <div
                            key={`timing-${index}`}
                            className="flex justify-between items-center"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span>{item.name}</span>
                            </div>
                            <div className="flex gap-2">
                              <span>{item.count} toplantı</span>
                              <span className="text-muted-foreground">
                                ({item.percentage}%)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
