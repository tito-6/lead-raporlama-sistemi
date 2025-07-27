import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { Lead, SalesRep } from "@shared/schema";
import {
  detectProjectFromWebFormNotu,
  extractProjectsFromLeads,
} from "@/lib/project-detector";

export interface FilterState {
  selectedProject: string;
  selectedSalesperson: string;
  selectedStatus: string;
  selectedLeadType: string;
  selectedSource: string;
  selectedMonth: string;
  selectedYear: string;
  startDate: string;
  endDate: string;
  dateFilterType: "none" | "month" | "year" | "custom";
  chartType: "pie" | "bar" | "line";
  isRealTime: boolean;
  isAiPowered: boolean;
  availableProjects: string[];
  availableSalesReps: SalesRep[];
  availableStatuses: string[];
  availableSources: string[];
}

export interface FilterContextType {
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  clearCache: () => void;
  filteredLeads: Lead[];
  isLoading: boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const initialFilters: FilterState = {
  selectedProject: "all",
  selectedSalesperson: "all",
  selectedStatus: "all",
  selectedLeadType: "all",
  selectedSource: "all",
  selectedMonth: "",
  selectedYear: "",
  startDate: "",
  endDate: "",
  dateFilterType: "none",
  chartType: "pie",
  isRealTime: false,
  isAiPowered: false,
  availableProjects: [],
  availableSalesReps: [],
  availableStatuses: [],
  availableSources: [],
};

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<FilterState>(initialFilters);

  const { data: allLeads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const response = await fetch("/api/leads");
      return response.json();
    },
  });

  const { data: salesReps = [] } = useQuery<SalesRep[]>({
    queryKey: ["/api/sales-reps"],
  });

  useEffect(() => {
    if (allLeads.length > 0) {
      // Extract projects from WebForm Notu using our specialized detection
      const detectedProjects = extractProjectsFromLeads(
        allLeads.map((lead) => ({
          "WebForm Notu": lead.webFormNote || "",
        }))
      );

      // Combine with existing projects from lead data
      const existingProjects = Array.from(
        new Set(
          allLeads
            .map((lead) => lead.projectName || "")
            .filter((project) => project.trim() !== "")
        )
      );

      const projects = Array.from(
        new Set([...detectedProjects, ...existingProjects])
      ).sort();

      const statuses = Array.from(
        new Set(allLeads.map((lead) => lead.status).filter((status) => status))
      ).sort();

      const sources = Array.from(
        new Set(
          allLeads
            .map(
              (lead) =>
                lead.firstCustomerSource || lead.formCustomerSource || ""
            )
            .filter((source) => source.trim() !== "")
        )
      ).sort();

      setFiltersState((prev) => ({
        ...prev,
        availableProjects: projects,
        availableSalesReps: salesReps,
        availableStatuses: statuses,
        availableSources: sources,
      }));
    }
  }, [allLeads, salesReps]);

  const filteredLeads = useMemo(() => {
    if (!allLeads.length) return [];

    return allLeads.filter((lead) => {
      if (filters.selectedProject !== "all") {
        // Check if project matches using our specialized detection
        const detectedProject = detectProjectFromWebFormNotu(
          lead.webFormNote || ""
        );

        // Check for match in either detected project or explicit project name
        const projectMatch =
          detectedProject === filters.selectedProject ||
          (lead.projectName || "").toLowerCase() ===
            filters.selectedProject.toLowerCase();

        if (!projectMatch) return false;
      }

      if (
        filters.selectedSalesperson !== "all" &&
        lead.assignedPersonnel !== filters.selectedSalesperson
      ) {
        return false;
      }

      if (
        filters.selectedStatus !== "all" &&
        lead.status !== filters.selectedStatus
      ) {
        return false;
      }

      if (
        filters.selectedLeadType !== "all" &&
        lead.leadType !== filters.selectedLeadType
      ) {
        return false;
      }

      if (filters.selectedSource !== "all") {
        const sourceMatch = (
          lead.firstCustomerSource ||
          lead.formCustomerSource ||
          ""
        )
          .toLowerCase()
          .includes(filters.selectedSource.toLowerCase());
        if (!sourceMatch) return false;
      }

      if (lead.requestDate) {
        const leadDate = new Date(lead.requestDate);

        if (filters.dateFilterType === "month" && filters.selectedMonth) {
          const leadMonth = leadDate.getMonth() + 1;
          const leadYear = leadDate.getFullYear();
          const selectedMonth = parseInt(filters.selectedMonth);
          const selectedYear = filters.selectedYear
            ? parseInt(filters.selectedYear)
            : leadYear;

          if (leadMonth !== selectedMonth || leadYear !== selectedYear) {
            return false;
          }
        }

        if (filters.dateFilterType === "year" && filters.selectedYear) {
          const leadYear = leadDate.getFullYear();
          const selectedYear = parseInt(filters.selectedYear);

          if (leadYear !== selectedYear) {
            return false;
          }
        }

        if (filters.dateFilterType === "custom") {
          if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            if (leadDate < startDate) return false;
          }

          if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            if (leadDate > endDate) return false;
          }
        }
      }

      return true;
    });
  }, [allLeads, filters]);

  const setFilters = (newFilters: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFiltersState((prev) => ({
      ...initialFilters,
      availableProjects: prev.availableProjects,
      availableSalesReps: prev.availableSalesReps,
      availableStatuses: prev.availableStatuses,
      availableSources: prev.availableSources,
    }));
  };

  const clearCache = () => {
    localStorage.removeItem("leadTrackerCache");
    resetFilters();
    window.location.reload();
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilters,
        resetFilters,
        clearCache,
        filteredLeads,
        isLoading,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}
