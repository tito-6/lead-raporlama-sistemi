import { useState, useEffect } from 'react';

export interface SalesTarget {
  target: number;
  period: 'monthly' | 'bimonthly';
  description: string;
}

export interface SalesTargetData {
  salesTargets: {
    default: Record<string, SalesTarget>;
    personnel: Record<string, Record<string, SalesTarget>>;
    lastUpdated: string;
  };
}

export interface SalesTargetAnalytics {
  period: {
    startDate?: string;
    endDate?: string;
    month?: string;
    year?: string;
  };
  totalLeads: number;
  totalSales: number;
  totalTargets: number;
  overallAchievement: number;
  personnelAnalytics: Array<{
    personnel: string;
    totalLeads: number;
    salesCount: number;
    target: number;
    achievement: number;
    status: 'Met' | 'Below Target';
  }>;
  targets: {
    default: Record<string, SalesTarget>;
    personnel: Record<string, Record<string, SalesTarget>>;
    lastUpdated: string;
  };
}

const API_BASE = '/api';

export const useSalesTargets = () => {
  const [targets, setTargets] = useState<SalesTargetData | null>(null);
  const [analytics, setAnalytics] = useState<SalesTargetAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load targets from API
  const loadTargets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/sales-targets`);
      
      if (!response.ok) {
        throw new Error(`Failed to load targets: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTargets(data);
    } catch (err) {
      console.error('Error loading sales targets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load targets');
    } finally {
      setLoading(false);
    }
  };

  // Save targets to API
  const saveTargets = async (newTargets: SalesTargetData) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE}/sales-targets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTargets),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save targets: ${response.statusText}`);
      }
      
      const updatedData = await response.json();
      setTargets(updatedData);
      return updatedData;
    } catch (err) {
      console.error('Error saving sales targets:', err);
      setError(err instanceof Error ? err.message : 'Failed to save targets');
      throw err;
    }
  };

  // Update personnel target
  const updatePersonnelTarget = async (
    personnelName: string, 
    monthlyTarget: number, 
    projectName: string = 'Model Sanayi Merkezi'
  ) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE}/sales-targets/personnel/${encodeURIComponent(personnelName)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          monthlyTarget, 
          projectName 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update personnel target: ${response.statusText}`);
      }
      
      const updatedData = await response.json();
      setTargets(updatedData);
      return updatedData;
    } catch (err) {
      console.error('Error updating personnel target:', err);
      setError(err instanceof Error ? err.message : 'Failed to update personnel target');
      throw err;
    }
  };

  // Remove personnel override
  const removePersonnelTarget = async (personnelName: string) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE}/sales-targets/personnel/${encodeURIComponent(personnelName)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to remove personnel target: ${response.statusText}`);
      }
      
      const updatedData = await response.json();
      setTargets(updatedData);
      return updatedData;
    } catch (err) {
      console.error('Error removing personnel target:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove personnel target');
      throw err;
    }
  };

  // Load analytics
  const loadAnalytics = async (filters: {
    startDate?: string;
    endDate?: string;
    month?: string;
    year?: string;
  } = {}) => {
    try {
      setError(null);
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.month) params.append('month', filters.month);
      if (filters.year) params.append('year', filters.year);
      
      const response = await fetch(`${API_BASE}/sales-targets/analytics?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load analytics: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAnalytics(data);
      return data;
    } catch (err) {
      console.error('Error loading sales target analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      throw err;
    }
  };

  // Calculate achievement percentage
  const getAchievementPercentage = (salesCount: number, target: number): number => {
    if (target === 0) return 0;
    return Math.round((salesCount / target) * 100);
  };

  // Get status color based on achievement
  const getStatusColor = (achievement: number): string => {
    if (achievement >= 100) return 'text-green-600';
    if (achievement >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get status text
  const getStatusText = (achievement: number): string => {
    if (achievement >= 100) return 'Target Met';
    if (achievement >= 75) return 'On Track';
    if (achievement >= 50) return 'Behind Target';
    return 'Critical';
  };

  // Initialize on mount
  useEffect(() => {
    loadTargets();
  }, []);

  return {
    // Data
    targets,
    analytics,
    loading,
    error,
    
    // Actions
    loadTargets,
    saveTargets,
    updatePersonnelTarget,
    removePersonnelTarget,
    loadAnalytics,
    
    // Utilities
    getAchievementPercentage,
    getStatusColor,
    getStatusText,
  };
};

export default useSalesTargets;
