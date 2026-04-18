import { defineStore } from "pinia";
import { ref } from "vue";
import type { ApiResponse } from "~/types";

export const useAuditStore = defineStore("audit", () => {
  const logs = ref<any[]>([]);
  const isLoading = ref(false);
  const api = useApi();

  const fetchLogs = async (limit = 10) => {
    isLoading.value = true;
    try {
      const response = await api<ApiResponse<any[]>>("/audit-logs", {
        params: { limit },
      });

      if (response.success) {
        logs.value = response.data;
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      isLoading.value = false;
    }
  };

  return { logs, isLoading, fetchLogs };
});
