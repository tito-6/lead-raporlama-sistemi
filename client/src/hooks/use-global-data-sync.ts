import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Custom hook to handle global data synchronization across all components
 * This ensures that when lead data is updated anywhere in the app,
 * all components that depend on that data are refreshed automatically
 */
export const useGlobalDataSync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Listen for custom events that signal data updates
    const handleLeadDataUpdate = () => {
      console.log('🔄 Global lead data update detected - refreshing all components');
      
      // Invalidate ALL lead-related queries immediately
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/salesperson'] });
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expense-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/negative-analysis'] });
      queryClient.invalidateQueries({ queryKey: ['/api/meeting-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/target-audience-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/artwork-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/marketing-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/birebir-gorusme/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/birebir-gorusme/recent'] });
      
      // Force refetch EVERYTHING to ensure immediate updates
      queryClient.refetchQueries({ queryKey: ['/api/leads'] });
      queryClient.refetchQueries({ queryKey: ['/api/enhanced-stats'] });
      queryClient.refetchQueries({ queryKey: ['/api/salesperson'] });
      queryClient.refetchQueries({ queryKey: ['/api/birebir-gorusme/stats'] });
      
      // NOTE: Removed the server-side cache clear call as it was clearing actual data, not just cache
      // Server-side cache management should be handled differently if needed
    };

    // Listen for the custom event
    window.addEventListener('leadDataUpdated', handleLeadDataUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('leadDataUpdated', handleLeadDataUpdate);
    };
  }, [queryClient]);

  // Function to trigger global data update (to be used by update components)
  const triggerGlobalDataUpdate = () => {
    console.log('🚀 Triggering global data update from component');
    window.dispatchEvent(new CustomEvent('leadDataUpdated'));
  };

  return { triggerGlobalDataUpdate };
};

/**
 * Utility function to trigger global data updates from anywhere in the app
 */
export const triggerGlobalLeadDataUpdate = () => {
  console.log('🚀 Triggering global lead data update');
  window.dispatchEvent(new CustomEvent('leadDataUpdated'));
};
