import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Property, ApiResponse } from "~/types";
import { toast } from "vue3-toastify";

export const usePropertyStore = defineStore("properties", () => {
  const properties = ref<Property[]>([]);
  const isLoading = ref(false);
  const api = useApi();
  const meta = ref({ total: 0, totalPages: 1, page: 1 });

  const fetchProperties = async (page = 1, limit = 10, search = "") => {
    isLoading.value = true;
    try {
      const response = await api<ApiResponse<{ data: Property[]; meta: any }>>(
        "/properties",
        {
          params: { page, limit, search },
        },
      );
      if (response.success) {
        properties.value = response.data.data;
        meta.value = response.data.meta;
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const createProperty = async (payload: {
    title: string;
    location: string;
    price: number;
    type: string;
  }) => {
    isLoading.value = true;
    try {
      const response = await api<ApiResponse<Property>>("/properties", {
        method: "POST",
        body: payload,
      });

      if (response.success) {
        toast.success("Property added successfully!");
        await fetchProperties(1);
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(
        error.data?.message ||
          error.response?.data?.message ||
          "Failed to add property",
      );
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const propertiesByType = computed(() => {
    return (type: string) => properties.value.filter((p) => p.type === type);
  });

  return {
    properties,
    meta,
    isLoading,
    fetchProperties,
    createProperty,
    propertiesByType,
  };
});
