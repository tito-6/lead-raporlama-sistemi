import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ChartLine,
  Plus,
  BarChart,
  Download,
  Settings,
  Moon,
  UserCircle,
  TrendingDown,
  Clock,
  Grid,
  Home,
  Phone,
  DollarSign,
  Target,
} from "lucide-react";
import DataEntryTab from "@/components/data-entry-tab";
import ReportsTab from "@/components/reports-tab";
import ExportTab from "@/components/export-tab";
import OlumsuzAnaliziTab from "@/components/olumsuz-analizi-tab-clean";
import FollowUpAnalyticsTab from "@/components/follow-up-analytics-tab";
import RefactoredTakipAnaliziTab from "@/components/refactored-takip-analizi-tab";
import SimplifiedSettingsTab from "@/components/simplified-settings-tab";
import ExcelInputTab from "@/components/excel-input-tab";
import DuplicateDetectionTab from "@/components/duplicate-detection-tab";
import OverviewDashboardTab from "@/components/overview-dashboard-tab";
import EnhancedOverviewDashboardTab from "@/components/enhanced-overview-dashboard-tab";
import SalespersonPerformanceTab from "@/components/salesperson-performance-tab";
import UnifiedExpenseManagementTab from "@/components/unified-expense-management-tab";
import SalespersonPage from "@/components/salesperson-page";
import FilterSidebar from "@/components/filter-sidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { useQuery } from "@tanstack/react-query";
import { useGlobalDataSync } from "@/hooks/use-global-data-sync";
import { SalesRep } from "@shared/schema";
import UnifiedDataInputTab from "@/components/unified-data-input-tab";

export default function Dashboard() {
  // Initialize global data synchronization
  useGlobalDataSync();
  
  const [activeTab, setActiveTab] = useState("overview");

  const { data: salesReps = [] } = useQuery<SalesRep[]>({
    queryKey: ["/api/sales-reps"],
  });

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Floating Filter Sidebar */}
      <FilterSidebar />
      
      {/* Header */}
      <header className="bg-gradient-to-r from-white to-blue-50 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-gray-200 shadow-sm">
                <img
                  src="/attached_assets/innogylogo.png"
                  alt="İNNO Gayrimenkul Logo"
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "block";
                  }}
                />
                <Home className="w-8 h-8 text-blue-600 hidden" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  İNNO Gayrimenkul Yatırım A.Ş.
                </h1>
                <p className="text-sm text-blue-600 font-medium">
                  Lead Raporlama Sistemi
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Moon className="h-5 w-5" />
              </Button>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-6 space-y-4">
            {/* Main Navigation Tabs - Organized in two rows */}
            <div className="space-y-2">
              {/* Row 1: Core Functions */}
              <TabsList className="grid w-full grid-cols-5 h-auto p-1">
                <TabsTrigger
                  value="overview"
                  className="flex items-center space-x-2 p-3"
                >
                  <Home className="h-4 w-4" />
                  <span>Proje Bazlı Analiz</span>
                </TabsTrigger>
                <TabsTrigger
                  value="unified-data-input"
                  className="flex items-center space-x-2 p-3"
                >
                  <Grid className="h-4 w-4" />
                  <span>Veri Girişi</span>
                </TabsTrigger>
                <TabsTrigger
                  value="reports"
                  className="flex items-center space-x-2 p-3"
                >
                  <BarChart className="h-4 w-4" />
                  <span>Raporlar</span>
                </TabsTrigger>
                <TabsTrigger
                  value="export"
                  className="flex items-center space-x-2 p-3"
                >
                  <Download className="h-4 w-4" />
                  <span>Dışa Aktar</span>
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center space-x-2 p-3"
                >
                  <Settings className="h-4 w-4" />
                  <span>⚙️ Satış Hedefleri</span>
                </TabsTrigger>
              </TabsList>

              {/* Row 2: Analysis Functions */}
              <TabsList className="grid w-full grid-cols-5 h-auto p-1">
                <TabsTrigger
                  value="expense-management"
                  className="flex items-center space-x-2 p-3"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>💰 Gider Yönetimi</span>
                </TabsTrigger>
                <TabsTrigger
                  value="olumsuz-analizi"
                  className="flex items-center space-x-2 p-3"
                >
                  <TrendingDown className="h-4 w-4" />
                  <span>Olumsuz Analizi</span>
                </TabsTrigger>
                <TabsTrigger
                  value="follow-up-analytics"
                  className="flex items-center space-x-2 p-3"
                >
                  <Phone className="h-4 w-4" />
                  <span>📊 Takip Analizi</span>
                </TabsTrigger>
                <TabsTrigger
                  value="duplicate-detection"
                  className="flex items-center space-x-2 p-3"
                >
                  <Grid className="h-4 w-4" />
                  <span>Duplicate Analizi</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Dynamic Salesperson Tabs - Separate TabsList */}
            {salesReps.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Satış Temsilcisi Performans Raporları:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {salesReps.map((rep) => (
                    <Button
                      key={`salesperson-${rep.id}`}
                      variant={
                        activeTab === `salesperson-${rep.id}`
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => setActiveTab(`salesperson-${rep.id}`)}
                      className="flex items-center space-x-2"
                    >
                      <UserCircle className="h-3 w-3" />
                      <span>{rep.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <TabsContent value="overview">
            <EnhancedOverviewDashboardTab />
          </TabsContent>

          <TabsContent value="unified-data-input">
            <UnifiedDataInputTab />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>

          <TabsContent value="expense-management">
            <UnifiedExpenseManagementTab />
          </TabsContent>

          <TabsContent value="olumsuz-analizi">
            <OlumsuzAnaliziTab />
          </TabsContent>

          <TabsContent value="follow-up-analytics">
            <RefactoredTakipAnaliziTab />
          </TabsContent>

          <TabsContent value="duplicate-detection">
            <DuplicateDetectionTab />
          </TabsContent>

          <TabsContent value="export">
            <ExportTab />
          </TabsContent>

          <TabsContent value="settings">
            <SimplifiedSettingsTab />
          </TabsContent>

          {/* Dynamic Salesperson Tabs */}
          {salesReps.map((rep) => (
            <TabsContent
              key={`salesperson-${rep.id}`}
              value={`salesperson-${rep.id}`}
            >
              <SalespersonPage salespersonName={rep.name} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
