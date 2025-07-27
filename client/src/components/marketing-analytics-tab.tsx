import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
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
import { Badge } from "./ui/badge";
import ProjectFilter from "./project-filter";

interface MarketingAnalyticsTabProps {
  filters?: {
    startDate?: string;
    endDate?: string;
    month?: string;
    year?: string;
    salesRep?: string;
    leadType?: string;
  };
}

export function MarketingAnalyticsTab({
  filters: parentFilters,
}: MarketingAnalyticsTabProps) {
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

  // Fetch marketing analytics data
  const {
    data: marketingData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/marketing-analytics", filters.toString(), selectedProject],
    queryFn: async () => {
      const response = await fetch(`/api/marketing-analytics?${filters}`);
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

  if (error) {
    return (
      <div>Error loading marketing analytics: {(error as Error).message}</div>
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
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>En Başarılı Hedef Kitleler</CardTitle>
                <CardDescription>
                  En yüksek dönüşüm oranına sahip hedef kitleler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketingData?.topPerformingAudiences?.map(
                    (item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <Badge variant={index < 3 ? "default" : "outline"}>
                          {index + 1}
                        </Badge>
                        <div className="flex-1 ml-3 font-medium">
                          {item.audienceType}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>En Başarılı Görseller/Videolar</CardTitle>
                <CardDescription>
                  En yüksek dönüşüm oranına sahip görsel/video türleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketingData?.topPerformingArtworks?.map(
                    (item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <Badge variant={index < 3 ? "default" : "outline"}>
                          {index + 1}
                        </Badge>
                        <div className="flex-1 ml-3 font-medium">
                          {item.artworkType}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>En Başarılı Pazarlama Kombinasyonları</CardTitle>
              <CardDescription>
                En yüksek görüşme ve satış oranına sahip hedef kitle ve
                görsel/video kombinasyonları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sıralama</TableHead>
                      <TableHead>Hedef Kitle</TableHead>
                      <TableHead>Görsel/Video</TableHead>
                      <TableHead className="text-right">Lead Sayısı</TableHead>
                      <TableHead className="text-right">
                        Görüşme Oranı
                      </TableHead>
                      <TableHead className="text-right">Satış Oranı</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marketingData?.marketingPerformance?.map(
                      (item: any, index: number) => (
                        <TableRow
                          key={`${item.audienceType}-${item.artworkType}`}
                          className={index < 3 ? "bg-muted/20" : ""}
                        >
                          <TableCell>
                            <Badge variant={index < 3 ? "default" : "outline"}>
                              {index + 1}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.audienceType}</TableCell>
                          <TableCell>{item.artworkType}</TableCell>
                          <TableCell className="text-right">
                            {item.total}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.meetingRate}%
                          </TableCell>
                          <TableCell className="text-right">
                            {item.salesRate}%
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  return <div>{content}</div>;
}

export default MarketingAnalyticsTab;
