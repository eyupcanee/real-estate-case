import type { ApiResponse } from "~/types";

export const useApi = () => {
  const config = useRuntimeConfig();

  const apiFetch = $fetch.create({
    baseURL: config.public.apiBase as string,

    async onResponse({ response }) {
      const resData = response._data as ApiResponse;
    },

    async onResponseError({ response }) {
      const resData = response._data as ApiResponse;

      const errorMessage =
        resData?.message || "Bilinmeyen bir API hatası oluştu.";

      console.error("[API Error]:", errorMessage);
    },
  });

  return apiFetch;
};
