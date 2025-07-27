import { useQuery } from "@tanstack/react-query";
import { type Lead, type SalesRep } from "@shared/schema";

export function useLeads(filters?: {
  startDate?: string;
  endDate?: string;
  salesRep?: string;
  leadType?: string;
  status?: string;
}) {
  return useQuery<Lead[]>({
    queryKey: ["/api/leads", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      const response = await fetch(`/api/leads?${params.toString()}`);
      return response.json();
    },
  });
}

export function useSalesReps() {
  return useQuery<SalesRep[]>({
    queryKey: ["/api/sales-reps"],
  });
}

export function useStats(filters?: {
  startDate?: string;
  endDate?: string;
  salesRep?: string;
  leadType?: string;
}) {
  return useQuery({
    queryKey: ["/api/stats", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      const response = await fetch(`/api/stats?${params.toString()}`);
      const data = await response.json();
      
      // Calculate additional stats
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      return {
        totalLeads: data.totalLeads,
        thisMonth: data.totalLeads, // This should be filtered by month in real implementation
        sales: data.byStatus?.satis || 0,
        byStatus: data.byStatus,
        byType: data.byType,
        bySalesRep: data.bySalesRep,
      };
    },
  });
}
