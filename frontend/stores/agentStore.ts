import { defineStore } from "pinia";
import { ref } from "vue";
import type { Agent, ApiResponse } from "~/types";
import { toast } from "vue3-toastify";

export const useAgentStore = defineStore("agents", () => {
  const agents = ref<Agent[]>([]);
  const isLoading = ref(false);
  const api = useApi();
  const meta = ref({ total: 0, totalPages: 1, page: 1 });
  const fetchAgents = async (page = 1, limit = 10, search = "") => {
    isLoading.value = true;
    try {
      const response = await api<ApiResponse<{ data: Agent[]; meta: any }>>(
        "/agents",
        {
          params: { page, limit, search },
        },
      );

      if (response.success) {
        agents.value = response.data.data;
        meta.value = response.data.meta;
      }
    } catch (error) {
      console.error("Danışmanlar çekilemedi:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const createAgent = async (payload: { fullName: string; email: string }) => {
    isLoading.value = true;
    try {
      const response = await api<ApiResponse<Agent>>("/agents", {
        method: "POST",
        body: payload,
      });

      if (response.success) {
        toast.success("Agent added successfully!");
        await fetchAgents(1);
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to add agent");
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return { agents, isLoading, meta, fetchAgents, createAgent };
});
