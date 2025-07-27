import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DateFilter from "@/components/ui/date-filter";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useQuery } from "@tanstack/react-query";
import { Lead } from "@shared/schema";
import {
  ChevronDown,
  Copy,
  Users,
  AlertTriangle,
  Trash2,
  Eye,
  CheckCircle,
} from "lucide-react";
import StandardChart from "@/components/charts/StandardChart";

interface DuplicateGroup {
  id: string;
  leads: Lead[];
  matchType: "customer_id" | "contact_id" | "name" | "multiple";
  matchValue: string;
  severity: "high" | "medium" | "low";
}

export default function DuplicateDetectionTab() {
  // Import DateFilter component at the top of the file
  const [dateFilters, setDateFilters] = useState({
    startDate: "",
    endDate: "",
    month: "",
    year: "",
  });

  // Use date filters in the API query
  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads", dateFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(dateFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await fetch(`/api/leads?${params.toString()}`);
      return response.json();
    },
  });

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [chartType, setChartType] = useState<"pie" | "bar" | "line">("pie");

  // Detect duplicates based on multiple criteria
  const duplicateGroups = useMemo(() => {
    if (!leads.length) return [];

    const groups: DuplicateGroup[] = [];
    const processedLeads = new Set<number>();

    // Helper function to normalize names for comparison
    const normalizeName = (name: string) => {
      return (
        name
          ?.toLowerCase()
          .replace(/[^a-zöçşğüıİ\s]/g, "")
          .replace(/\s+/g, " ")
          .trim() || ""
      );
    };

    // Helper function to determine match severity
    const getMatchSeverity = (
      leads: Lead[],
      matchType: string
    ): "high" | "medium" | "low" => {
      if (matchType === "customer_id" || matchType === "contact_id")
        return "high";
      if (matchType === "multiple") return "high";
      if (leads.length > 3) return "high";
      if (leads.length > 2) return "medium";
      return "low";
    };

    leads.forEach((lead) => {
      if (processedLeads.has(lead.id)) return;

      const potentialDuplicates: Lead[] = [];
      let matchType: DuplicateGroup["matchType"] = "name";
      let matchValue = "";

      // Find duplicates based on Customer ID
      if (lead.customerId) {
        const customerIdMatches = leads.filter(
          (l) => !processedLeads.has(l.id) && l.customerId === lead.customerId
        );
        if (customerIdMatches.length > 1) {
          potentialDuplicates.push(...customerIdMatches);
          matchType = "customer_id";
          matchValue = lead.customerId;
        }
      }

      // Find duplicates based on Contact ID
      if (potentialDuplicates.length === 0 && lead.contactId) {
        const contactIdMatches = leads.filter(
          (l) => !processedLeads.has(l.id) && l.contactId === lead.contactId
        );
        if (contactIdMatches.length > 1) {
          potentialDuplicates.push(...contactIdMatches);
          matchType = "contact_id";
          matchValue = lead.contactId;
        }
      }

      // Find duplicates based on normalized customer name
      if (potentialDuplicates.length === 0 && lead.customerName) {
        const normalizedName = normalizeName(lead.customerName);
        if (normalizedName.length > 2) {
          const nameMatches = leads.filter(
            (l) =>
              !processedLeads.has(l.id) &&
              l.customerName &&
              normalizeName(l.customerName) === normalizedName
          );
          if (nameMatches.length > 1) {
            potentialDuplicates.push(...nameMatches);
            matchType = "name";
            matchValue = lead.customerName;
          }
        }
      }

      // If we found duplicates, create a group
      if (potentialDuplicates.length > 1) {
        // Check for multiple match types
        const hasCustomerId = potentialDuplicates.some(
          (l) => l.customerId === lead.customerId
        );
        const hasContactId = potentialDuplicates.some(
          (l) => l.contactId === lead.contactId
        );
        const hasNameMatch = true; // Already filtered by name

        if (
          (hasCustomerId && hasContactId) ||
          (hasCustomerId && hasNameMatch) ||
          (hasContactId && hasNameMatch)
        ) {
          matchType = "multiple";
        }

        const groupId = `duplicate_${groups.length + 1}`;
        groups.push({
          id: groupId,
          leads: potentialDuplicates,
          matchType,
          matchValue,
          severity: getMatchSeverity(potentialDuplicates, matchType),
        });

        // Mark all leads in this group as processed
        potentialDuplicates.forEach((l) => processedLeads.add(l.id));
      }
    });

    return groups.sort((a, b) => {
      // Sort by severity first, then by number of duplicates
      const severityOrder = { high: 3, medium: 2, low: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return b.leads.length - a.leads.length;
    });
  }, [leads]);

  // Chart data for duplicate distribution
  const duplicateChartData = useMemo(() => {
    if (!duplicateGroups.length) return [];

    const severityCounts = duplicateGroups.reduce((acc, group) => {
      acc[group.severity] = (acc[group.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = duplicateGroups.length;
    const colors = {
      high: "#EF4444",
      medium: "#F59E0B",
      low: "#10B981",
    };

    return Object.entries(severityCounts).map(([severity, count]) => ({
      name:
        severity === "high"
          ? "Yüksek Risk"
          : severity === "medium"
          ? "Orta Risk"
          : "Düşük Risk",
      value: count,
      percentage: Math.round((count / total) * 100),
      color: colors[severity as keyof typeof colors],
    }));
  }, [duplicateGroups]);

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // Toggle lead selection
  const toggleLeadSelection = (leadId: number) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  // Get match type display info
  const getMatchTypeInfo = (matchType: DuplicateGroup["matchType"]) => {
    switch (matchType) {
      case "customer_id":
        return { label: "Müşteri ID", icon: "🆔", color: "text-red-600" };
      case "contact_id":
        return { label: "İletişim ID", icon: "📞", color: "text-orange-600" };
      case "name":
        return { label: "İsim Benzerliği", icon: "👤", color: "text-blue-600" };
      case "multiple":
        return { label: "Çoklu Eşleşme", icon: "🔗", color: "text-purple-600" };
    }
  };

  // Get severity display info
  const getSeverityInfo = (severity: DuplicateGroup["severity"]) => {
    switch (severity) {
      case "high":
        return {
          label: "Yüksek Risk",
          color: "bg-red-100 text-red-800 border-red-200",
          icon: "🚨",
        };
      case "medium":
        return {
          label: "Orta Risk",
          color: "bg-orange-100 text-orange-800 border-orange-200",
          icon: "⚠️",
        };
      case "low":
        return {
          label: "Düşük Risk",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: "📋",
        };
    }
  };

  const chartTypeOptions = [
    { value: "pie" as const, label: "Pasta Grafik", icon: "🥧" },
    { value: "bar" as const, label: "Sütun Grafik", icon: "📊" },
    { value: "line" as const, label: "Çizgi Grafik", icon: "📈" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <DateFilter onFilterChange={setDateFilters} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              🔍 Duplicate Analizi
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Müşteri ID, İletişim ID ve isim benzerliği ile otomatik duplicate
              tespit
            </p>
          </div>

          {/* Chart Type Selector */}
          <div className="flex space-x-2">
            {chartTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setChartType(option.value)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  chartType === option.value
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {option.icon} {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {selectedLeads.size > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Seçili Leadleri Sil ({selectedLeads.size})
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              Detaylı İncele
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Duplicate Değil Olarak İşaretle
            </Button>
          </div>
        )}
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
          <div className="flex items-center">
            <div className="p-2 bg-red-500 rounded-lg">
              <Copy className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Mükerrer Leadler
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {duplicateGroups.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <div className="flex items-center">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Etkilenen Lead
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {duplicateGroups.reduce(
                  (sum, group) => sum + group.leads.length,
                  0
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Yüksek Risk
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {duplicateGroups.filter((g) => g.severity === "high").length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Duplicate Oranı
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {leads.length > 0
                  ? Math.round(
                      (duplicateGroups.reduce(
                        (sum, group) => sum + group.leads.length,
                        0
                      ) /
                        leads.length) *
                        100
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Chart */}
      {duplicateChartData.length > 0 && (
        <Card className="p-6 shadow-lg border-2 border-blue-100 dark:border-blue-800">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              📊 Risk Seviyesi Dağılımı
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mükerrer Leadlerlarının risk seviyelerine göre dağılımı
            </p>
          </div>
          <StandardChart
            title=""
            data={duplicateChartData}
            height={300}
            chartType={chartType}
          />
        </Card>
      )}

      {/* Duplicate Groups */}
      <div className="space-y-4">
        {duplicateGroups.map((group) => {
          const matchTypeInfo = getMatchTypeInfo(group.matchType);
          const severityInfo = getSeverityInfo(group.severity);
          const isExpanded = expandedGroups.has(group.id);

          return (
            <Card
              key={group.id}
              className="shadow-lg border-2 border-gray-100 dark:border-gray-800"
            >
              <Collapsible>
                <CollapsibleTrigger
                  className="w-full"
                  onClick={() => toggleGroup(group.id)}
                >
                  <CardHeader className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <ChevronDown
                            className={`w-5 h-5 transition-transform ${
                              isExpanded ? "transform rotate-180" : ""
                            }`}
                          />
                          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Mükerrer Leadler #{group.id.split("_")[1]}
                          </span>
                        </div>

                        <Badge className={severityInfo.color}>
                          {severityInfo.icon} {severityInfo.label}
                        </Badge>

                        <Badge
                          variant="outline"
                          className={matchTypeInfo.color}
                        >
                          {matchTypeInfo.icon} {matchTypeInfo.label}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {group.leads.length} lead
                        </span>
                        <Badge variant="secondary">
                          {group.matchValue.length > 30
                            ? group.matchValue.substring(0, 30) + "..."
                            : group.matchValue}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left p-3">
                              <input
                                type="checkbox"
                                className="rounded"
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const newSelected = new Set(selectedLeads);
                                    group.leads.forEach((lead) =>
                                      newSelected.add(lead.id)
                                    );
                                    setSelectedLeads(newSelected);
                                  } else {
                                    const newSelected = new Set(selectedLeads);
                                    group.leads.forEach((lead) =>
                                      newSelected.delete(lead.id)
                                    );
                                    setSelectedLeads(newSelected);
                                  }
                                }}
                              />
                            </th>
                            <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">
                              Müşteri
                            </th>
                            <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">
                              Müşteri ID
                            </th>
                            <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">
                              İletişim ID
                            </th>
                            <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">
                              Personel
                            </th>
                            <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">
                              Durum
                            </th>
                            <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">
                              Tarih
                            </th>
                            <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">
                              Proje
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.leads.map((lead, index) => (
                            <tr
                              key={lead.id}
                              className={`border-b border-gray-100 dark:border-gray-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 ${
                                index % 2 === 0
                                  ? "bg-gray-50 dark:bg-gray-800/50"
                                  : "bg-white dark:bg-gray-900"
                              } ${
                                selectedLeads.has(lead.id)
                                  ? "bg-blue-50 dark:bg-blue-900/20"
                                  : ""
                              }`}
                            >
                              <td className="p-3">
                                <input
                                  type="checkbox"
                                  className="rounded"
                                  checked={selectedLeads.has(lead.id)}
                                  onChange={() => toggleLeadSelection(lead.id)}
                                />
                              </td>
                              <td className="p-3 font-medium text-gray-900 dark:text-gray-100">
                                {lead.customerName}
                              </td>
                              <td className="p-3 text-gray-700 dark:text-gray-300 font-mono text-sm">
                                {lead.customerId || "-"}
                              </td>
                              <td className="p-3 text-gray-700 dark:text-gray-300 font-mono text-sm">
                                {lead.contactId || "-"}
                              </td>
                              <td className="p-3 text-gray-700 dark:text-gray-300">
                                {lead.assignedPersonnel}
                              </td>
                              <td className="p-3">
                                <Badge variant="outline" className="text-xs">
                                  {lead.status}
                                </Badge>
                              </td>
                              <td className="p-3 text-gray-700 dark:text-gray-300 text-sm">
                                {lead.requestDate
                                  ? new Date(
                                      lead.requestDate
                                    ).toLocaleDateString("tr-TR")
                                  : "-"}
                              </td>
                              <td className="p-3 text-gray-700 dark:text-gray-300 text-sm max-w-xs truncate">
                                {lead.projectName || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {duplicateGroups.length === 0 && (
        <Card className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Duplicate Lead Bulunamadı
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Müşteri ID, İletişim ID ve isim benzerliği kontrolünde duplicate
              lead tespit edilmedi.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
