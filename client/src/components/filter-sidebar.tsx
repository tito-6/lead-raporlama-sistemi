import React, { useState, useEffect } from "react";
import Draggable from "react-draggable";
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
  ChevronLeft,
  ChevronRight,
  Move,
} from "lucide-react";
import { useFilters } from "@/contexts/filter-context";

function FilterSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { filters, setFilters, resetFilters, clearCache, filteredLeads } =
    useFilters();

  // Load saved position from localStorage on component mount
  useEffect(() => {
    const savedPosition = localStorage.getItem("filterSidebarPosition");
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch (e) {
        console.error("Error loading sidebar position:", e);
      }
    }

    const savedCollapsed = localStorage.getItem("filterSidebarCollapsed");
    if (savedCollapsed) {
      setCollapsed(savedCollapsed === "true");
    }
  }, []);

  // Save position to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("filterSidebarPosition", JSON.stringify(position));
  }, [position]);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem("filterSidebarCollapsed", String(collapsed));
  }, [collapsed]);

  // Handle drag stop to save position
  const handleDragStop = (_e: any, data: any) => {
    setPosition({ x: data.x, y: data.y });
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ [key]: value });
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
    <Draggable
      handle=".sidebar-drag-handle"
      position={position}
      onStop={handleDragStop}
      bounds="body"
    >
      <div
        className={`fixed z-50 ${
          collapsed ? "w-12" : "w-64"
        } bg-white border border-gray-100 rounded-md shadow-md h-auto max-h-[95vh] overflow-y-auto transition-all duration-200`}
      >
        {/* Drag handle */}
        <div className="sidebar-drag-handle flex items-center justify-between p-1.5 bg-blue-50 border-b border-blue-100 cursor-move">
          <div className="flex items-center gap-1.5">
            <Move className="h-3 w-3 text-blue-600" />
            {!collapsed && (
              <span className="text-xs font-medium text-blue-700">
                Filtreler
              </span>
            )}
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapse}
              className="h-6 w-6 p-0 rounded-full hover:bg-blue-100"
            >
              {collapsed ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronLeft className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        {!collapsed ? (
          <div className="p-2 space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-blue-600" />
                <h2 className="text-sm font-semibold text-gray-900">
                  Filtreler
                </h2>
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 text-xs py-0 px-1.5"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-gray-500 hover:text-gray-700 h-6 w-6 p-0"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>

            {/* Results Summary */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
              <CardContent className="p-2">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-800">
                    {filteredLeads.length}
                  </div>
                  <div className="text-xs text-blue-600">Lead bulundu</div>
                </div>
              </CardContent>
            </Card>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <Card className="border-orange-100 bg-orange-50">
                <CardHeader className="py-1 px-2">
                  <CardTitle className="text-xs text-orange-700 flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Aktif Filtreler
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 p-1 space-y-1">
                  {filters.selectedProject !== "all" && (
                    <div className="flex items-center justify-between bg-white px-1.5 py-0.5 rounded border text-xs">
                      <span className="text-gray-700 truncate max-w-[85%]">
                        Proje: {filters.selectedProject}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearFilter("selectedProject")}
                        className="h-4 w-4 p-0 ml-1"
                      >
                        <X className="h-2.5 w-2.5" />
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

                  {filters.selectedStatus !== "all" && (
                    <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                      <span className="text-sm text-gray-700">
                        Durum: {filters.selectedStatus}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearFilter("selectedStatus")}
                        className="h-4 w-4 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {filters.selectedLeadType !== "all" && (
                    <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                      <span className="text-sm text-gray-700">
                        Tip:{" "}
                        {filters.selectedLeadType === "satis"
                          ? "Satış"
                          : "Kiralama"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearFilter("selectedLeadType")}
                        className="h-4 w-4 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {filters.selectedSource !== "all" && (
                    <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                      <span className="text-sm text-gray-700">
                        Kaynak: {filters.selectedSource}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearFilter("selectedSource")}
                        className="h-4 w-4 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {filters.dateFilterType !== "none" && (
                    <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                      <span className="text-sm text-gray-700">
                        Tarih:{" "}
                        {filters.dateFilterType === "month"
                          ? "Ay"
                          : filters.dateFilterType === "year"
                          ? "Yıl"
                          : "Özel"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearFilter("dateFilterType")}
                        className="h-4 w-4 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {filters.isRealTime && (
                    <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                      <span className="text-sm text-gray-700">
                        Gerçek Zamanlı: Açık
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearFilter("isRealTime")}
                        className="h-4 w-4 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {filters.isAiPowered && (
                    <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                      <span className="text-sm text-gray-700">
                        AI Destekli: Açık
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearFilter("isAiPowered")}
                        className="h-4 w-4 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
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
              <Select
                value={filters.selectedProject}
                onValueChange={(value) =>
                  handleFilterChange("selectedProject", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Proje seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Projeler</SelectItem>
                  {filters.availableProjects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Date Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-blue-600" />
                Tarih Filtresi
              </Label>
              <Select
                value={filters.dateFilterType}
                onValueChange={(value) =>
                  handleFilterChange("dateFilterType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tarih filtresini seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Filtre Yok</SelectItem>
                  <SelectItem value="month">Aylık</SelectItem>
                  <SelectItem value="year">Yıllık</SelectItem>
                  <SelectItem value="custom">Özel Aralık</SelectItem>
                </SelectContent>
              </Select>

              {filters.dateFilterType === "month" && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Select
                      value={filters.selectedMonth}
                      onValueChange={(value) =>
                        handleFilterChange("selectedMonth", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Ay" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                      value={filters.selectedYear}
                      onValueChange={(value) =>
                        handleFilterChange("selectedYear", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Yıl" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {filters.dateFilterType === "year" && (
                <div className="mt-2">
                  <Select
                    value={filters.selectedYear}
                    onValueChange={(value) =>
                      handleFilterChange("selectedYear", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Yıl" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {filters.dateFilterType === "custom" && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex flex-col">
                    <Label className="text-xs mb-1">Başlangıç</Label>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const datepicker = document.getElementById(
                            "start-date-picker"
                          ) as HTMLInputElement;
                          if (datepicker && datepicker.showPicker)
                            datepicker.showPicker();
                        }}
                        className="h-8 px-2 flex-grow-0"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Input
                        id="start-date-picker"
                        type="date"
                        value={filters.startDate}
                        onChange={(e) =>
                          handleFilterChange("startDate", e.target.value)
                        }
                        className="h-8 w-full text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs mb-1">Bitiş</Label>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const datepicker = document.getElementById(
                            "end-date-picker"
                          ) as HTMLInputElement;
                          if (datepicker && datepicker.showPicker)
                            datepicker.showPicker();
                        }}
                        className="h-8 px-2 flex-grow-0"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Input
                        id="end-date-picker"
                        type="date"
                        value={filters.endDate}
                        onChange={(e) =>
                          handleFilterChange("endDate", e.target.value)
                        }
                        className="h-8 w-full text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Salesperson Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4 text-blue-600" />
                Temsilci Filtresi
              </Label>
              <Select
                value={filters.selectedSalesperson}
                onValueChange={(value) =>
                  handleFilterChange("selectedSalesperson", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Temsilci seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Temsilciler</SelectItem>
                  {filters.availableSalesReps &&
                    filters.availableSalesReps.map((person: any) => (
                      <SelectItem
                        key={person.id || person}
                        value={person.name || person}
                      >
                        {person.name || person}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Activity className="h-4 w-4 text-blue-600" />
                Durum Filtresi
              </Label>
              <Select
                value={filters.selectedStatus}
                onValueChange={(value) =>
                  handleFilterChange("selectedStatus", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  {filters.availableStatuses &&
                    filters.availableStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Lead Type Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Tag className="h-4 w-4 text-blue-600" />
                Lead Tipi
              </Label>
              <Select
                value={filters.selectedLeadType}
                onValueChange={(value) =>
                  handleFilterChange("selectedLeadType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Lead tipi seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Tipler</SelectItem>
                  <SelectItem value="satis">Satış</SelectItem>
                  <SelectItem value="kiralama">Kiralama</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Source Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4 text-blue-600" />
                Kaynak Filtresi
              </Label>
              <Select
                value={filters.selectedSource}
                onValueChange={(value) =>
                  handleFilterChange("selectedSource", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kaynak seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kaynaklar</SelectItem>
                  {filters.availableSources &&
                    filters.availableSources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <Separator className="my-1 h-px bg-gray-100" />

            {/* Chart Type Controls */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium">
                <BarChart3 className="h-3 w-3 text-blue-600" />
                Grafik Tipi
              </Label>
              <div className="grid grid-cols-3 gap-1">
                <Button
                  variant={filters.chartType === "pie" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ chartType: "pie" })}
                  className="flex flex-col items-center h-auto py-1 px-0.5"
                >
                  <PieChart className="w-3 h-3" />
                  <span className="text-[10px]">Pasta</span>
                </Button>
                <Button
                  variant={filters.chartType === "bar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ chartType: "bar" })}
                  className="flex flex-col items-center h-auto py-1 px-0.5"
                >
                  <BarChart3 className="w-3 h-3" />
                  <span className="text-[10px]">Çubuk</span>
                </Button>
                <Button
                  variant={filters.chartType === "line" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ chartType: "line" })}
                  className="flex flex-col items-center h-auto py-1 px-0.5"
                >
                  <LineChart className="w-3 h-3" />
                  <span className="text-[10px]">Çizgi</span>
                </Button>
              </div>
            </div>

            <Separator className="my-1 h-px bg-gray-100" />

            {/* Advanced Options */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium">
                <Activity className="h-3 w-3 text-blue-600" />
                Gelişmiş Seçenekler
              </Label>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs">Gerçek Zamanlı</span>
                  </div>
                  <Button
                    variant={filters.isRealTime ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setFilters({ isRealTime: !filters.isRealTime })
                    }
                    className="text-[10px] h-5 py-0"
                  >
                    {filters.isRealTime ? "Açık" : "Kapalı"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Brain className="h-3 w-3 text-purple-500" />
                    <span className="text-xs">AI Destekli</span>
                  </div>
                  <Button
                    variant={filters.isAiPowered ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setFilters({ isAiPowered: !filters.isAiPowered })
                    }
                    className="text-[10px] h-5 py-0"
                  >
                    {filters.isAiPowered ? "Açık" : "Kapalı"}
                  </Button>
                </div>
              </div>
            </div>

            <Separator className="my-1 h-px bg-gray-100" />

            {/* System Actions */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium">
                <Trash2 className="h-3 w-3 text-red-600" />
                Sistem
              </Label>
              <Button
                variant="destructive"
                size="sm"
                onClick={clearCache}
                className="w-full text-[10px] h-6 py-0.5"
              >
                <Trash2 className="w-2.5 h-2.5 mr-1" />
                Önbelleği Temizle
              </Button>
            </div>
          </div>
        ) : (
          // Collapsed sidebar with icons only
          <div className="flex flex-col items-center p-1 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full w-8 h-8 flex items-center justify-center"
              onClick={() => handleFilterChange("chartType", "pie")}
            >
              <PieChart className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full w-8 h-8 flex items-center justify-center"
              onClick={() => handleFilterChange("chartType", "bar")}
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full w-8 h-8 flex items-center justify-center"
              onClick={() => handleFilterChange("chartType", "line")}
            >
              <LineChart className="h-3.5 w-3.5" />
            </Button>
            <Separator className="w-full my-1 h-px bg-gray-100" />
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full w-8 h-8 flex items-center justify-center"
              onClick={resetFilters}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full w-8 h-8 flex items-center justify-center text-red-600"
              onClick={clearCache}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </Draggable>
  );
}

export default FilterSidebar;
