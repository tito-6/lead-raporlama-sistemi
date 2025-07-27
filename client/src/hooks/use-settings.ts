import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { type Settings } from "@shared/schema";

export function useSettings() {
  return useQuery<Settings[]>({
    queryKey: ["/api/settings"],
  });
}

export function useSetting(key: string) {
  return useQuery<Settings | null>({
    queryKey: ["/api/settings", key],
    queryFn: async () => {
      const settings = await queryClient.getQueryData(["/api/settings"]) as Settings[];
      if (!settings) return null;
      return settings.find(s => s.key === key) || null;
    },
  });
}

export function useUpdateSetting() {
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await apiRequest("POST", "/api/settings", { key, value });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });
}
