import React from "react";
import { FilterProvider } from "@/contexts/filter-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Filter,
  RotateCcw,
  Building,
  Users,
  Activity,
  Tag,
  MapPin,
  Calendar,
  X,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Brain,
  Trash2,
} from "lucide-react";
import { useFilters } from "@/contexts/filter-context";
import ProjectFilter from "../project-filter";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <FilterProvider>
      <div className="flex h-screen bg-gray-50">
        <FilterSidebarInner />
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </FilterProvider>
  );
}

function FilterSidebarInner() {
  const { filters, setFilters, resetFilters, clearCache, filteredLeads } =
    useFilters();

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ [key]: value });
  };

  const handleProjectChange = (project: string) => {
    setFilters({ selectedProject: project });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.selectedProject !== "all") count++;
    if (filters.selectedSalesperson !== "all") count++;
    if (filters.selectedStatus !== "all") count++;
    if (filters.selectedLeadType !== "all") count++;
    if (filters.selectedSource !== "all") count++;
    if (filters.dateFilterType !== "none") count++;
    if (filters.isRealTime) count++;
    if (filters.isAiPowered) count++;
    return count;
  };

  const clearFilter = (filterKey: string) => {
    if (filterKey === "dates") {
      setFilters({
        startDate: "",
        endDate: "",
        selectedMonth: "",
        selectedYear: "",
        dateFilterType: "none",
      });
    } else if (filterKey === "dateFilterType") {
      setFilters({
        dateFilterType: "none",
        selectedMonth: "",
        selectedYear: "",
        startDate: "",
        endDate: "",
      });
    } else {
      setFilters({ [filterKey]: filterKey.includes("is") ? false : "all" });
    }
  };

  const activeFiltersCount = getActiveFiltersCount();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const months = [
    { value: "1", label: "Ocak" },
    { value: "2", label: "Şubat" },
    { value: "3", label: "Mart" },
    { value: "4", label: "Nisan" },
    { value: "5", label: "Mayıs" },
    { value: "6", label: "Haziran" },
    { value: "7", label: "Temmuz" },
    { value: "8", label: "Ağustos" },
    { value: "9", label: "Eylül" },
    { value: "10", label: "Ekim" },
    { value: "11", label: "Kasım" },
    { value: "12", label: "Aralık" },
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Filtreler</h2>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Results Summary */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-800">
                {filteredLeads.length}
              </div>
              <div className="text-sm text-blue-600">Lead bulundu</div>
            </div>
          </CardContent>
        </Card>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-800">
                Aktif Filtreler
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {filters.selectedProject !== "all" && (
                <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                  <span className="text-sm text-gray-700">
                    Proje: {filters.selectedProject}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter("selectedProject")}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {filters.selectedSalesperson !== "all" && (
                <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                  <span className="text-sm text-gray-700">
                    Temsilci: {filters.selectedSalesperson}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter("selectedSalesperson")}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* Add more active filter displays as needed */}
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Project Filter */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Building className="h-4 w-4 text-blue-600" />
            Proje Filtresi
          </Label>
          <ProjectFilter onProjectChange={handleProjectChange} />
        </div>

        {/* Add more filters as needed */}

        {/* System Actions */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Trash2 className="h-4 w-4 text-red-600" />
            Sistem
          </Label>
          <Button
            variant="destructive"
            size="sm"
            onClick={clearCache}
            className="w-full text-xs"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Önbelleği Temizle
          </Button>
        </div>
      </div>
    </div>
  );
}
