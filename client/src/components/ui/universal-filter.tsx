import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, X, Filter, Building, Users, Target } from "lucide-react";
import ProjectFilter from "../../components/project-filter";

export interface UniversalFilters {
  startDate: string;
  endDate: string;
  month: string;
  year: string;
  leadType: string;
  projectName: string;
  salesRep: string;
  status: string;
}

interface UniversalFilterProps {
  onFilterChange?: (filters: UniversalFilters) => void;
  initialFilters?: Partial<UniversalFilters>;
  className?: string;
  availableProjects?: string[];
  availableSalesReps?: string[];
  availableStatuses?: string[];
  showProjectFilter?: boolean;
  showSalesRepFilter?: boolean;
  showStatusFilter?: boolean;
  showLeadTypeFilter?: boolean;
}

export default function UniversalFilter({
  onFilterChange,
  initialFilters,
  className,
  availableProjects = [],
  availableSalesReps = [],
  availableStatuses = [],
  showProjectFilter = true,
  showSalesRepFilter = true,
  showStatusFilter = true,
  showLeadTypeFilter = true,
}: UniversalFilterProps) {
  const [filters, setFilters] = useState<UniversalFilters>({
    startDate: "",
    endDate: "",
    month: "",
    year: "all-years",
    leadType: "all-types",
    projectName: "all-projects",
    salesRep: "all-personnel",
    status: "all-statuses",
    ...initialFilters,
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

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

  const leadTypes = [
    { value: "satis", label: "Satılık" },
    { value: "kiralama", label: "Kiralık" },
  ];

  const handleFilterChange = (key: keyof UniversalFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange && typeof onFilterChange === "function") {
      onFilterChange(newFilters);
    }
  };

  const handleProjectChange = (project: string) => {
    handleFilterChange("projectName", project);
  };

  const clearFilters = () => {
    const clearedFilters: UniversalFilters = {
      startDate: "",
      endDate: "",
      month: "",
      year: "all-years",
      leadType: "all-types",
      projectName: "all-projects",
      salesRep: "all-personnel",
      status: "all-statuses",
    };
    setFilters(clearedFilters);
    if (onFilterChange && typeof onFilterChange === "function") {
      onFilterChange(clearedFilters);
    }
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "startDate" || key === "endDate" || key === "month")
      return value !== "";
    return !value.startsWith("all-");
  });
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "startDate" || key === "endDate" || key === "month")
      return value !== "";
    return !value.startsWith("all-");
  }).length;

  return (
    <Card className={`border-blue-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Kapsamlı Filtreler
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount} aktif
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Project Filter */}
        {showProjectFilter && (
          <ProjectFilter
            onProjectChange={handleProjectChange}
            availableProjects={availableProjects}
          />
        )}
        {/* Date Filters */}
        <div className="space-y-3">
          <Label className="text-xs font-medium flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Tarih Filtreleri
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <Label htmlFor="month-filter" className="text-xs">
                Ay
              </Label>
              <Select
                value={filters.month}
                onValueChange={(value) => handleFilterChange("month", value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Ay seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-months">Tüm aylar</SelectItem>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="year-filter" className="text-xs">
                Yıl
              </Label>
              <Select
                value={filters.year}
                onValueChange={(value) => handleFilterChange("year", value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Yıl seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-years">Tüm yıllar</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start-date" className="text-xs">
                Başlangıç
              </Label>
              <Input
                id="start-date"
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="h-9"
              />
            </div>

            <div>
              <Label htmlFor="end-date" className="text-xs">
                Bitiş
              </Label>
              <Input
                id="end-date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        </div>

        {/* Lead Type and Content Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {showLeadTypeFilter && (
            <div>
              <Label className="text-xs font-medium flex items-center gap-1">
                <Target className="h-3 w-3" />
                Lead Tipi
              </Label>
              <Select
                value={filters.leadType}
                onValueChange={(value) => handleFilterChange("leadType", value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Tip seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">Tüm tipler</SelectItem>
                  {leadTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showProjectFilter && (
            <div>
              <Label className="text-xs font-medium flex items-center gap-1">
                <Building className="h-3 w-3" />
                Proje
              </Label>
              <Select
                value={filters.projectName}
                onValueChange={(value) =>
                  handleFilterChange("projectName", value)
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Proje seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-projects">Tüm projeler</SelectItem>
                  {availableProjects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project.length > 30
                        ? project.substring(0, 30) + "..."
                        : project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showSalesRepFilter && (
            <div>
              <Label className="text-xs font-medium flex items-center gap-1">
                <Users className="h-3 w-3" />
                Satış Personeli
              </Label>
              <Select
                value={filters.salesRep}
                onValueChange={(value) => handleFilterChange("salesRep", value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Personel seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-personnel">Tüm personel</SelectItem>
                  {availableSalesReps.map((rep) => (
                    <SelectItem key={rep} value={rep}>
                      {rep}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showStatusFilter && (
            <div>
              <Label className="text-xs font-medium flex items-center gap-1">
                <Target className="h-3 w-3" />
                Durum
              </Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-statuses">Tüm durumlar</SelectItem>
                  {availableStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="h-8 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Filtreleri Temizle ({activeFilterCount})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
