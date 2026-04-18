import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Transaction, ApiResponse } from "~/types";
import { TransactionStage } from "~/enums";
import { toast } from "vue3-toastify";

export const useTransactionStore = defineStore("transactions", () => {
  const transactions = ref<Transaction[]>([]);
  const isLoading = ref(false);
  const api = useApi();
  const meta = ref({ total: 0, totalPages: 1, page: 1 });

  const extractErrorMessage = (error: any) => {
    return (
      error.data?.message ||
      error.response?.data?.message ||
      error.message ||
      "An error occurred."
    );
  };

  const fetchTransactions = async (page = 1, limit = 10, search = "") => {
    isLoading.value = true;
    try {
      const response = await api<
        ApiResponse<{ data: Transaction[]; meta: any }>
      >("/transactions", { params: { page, limit, search } });

      if (response.success) {
        transactions.value = response.data.data;
        console.log(response);
        meta.value = response.data.meta;
      }
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      isLoading.value = false;
    }
  };

  const updateTransactionStage = async (id: string, newStage: string) => {
    try {
      const response = await api<ApiResponse<Transaction>>(
        `/transactions/${id}/stage`,
        { method: "PATCH", body: { newStage } },
      );

      if (response.success) {
        const index = transactions.value.findIndex((t) => t._id === id);
        if (index !== -1) {
          transactions.value[index].stage = response.data.stage;
          if (response.data.financialBreakdown) {
            transactions.value[index].financialBreakdown =
              response.data.financialBreakdown;
          }
        }
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(extractErrorMessage(error));
    }
  };

  const cancelTransaction = async (id: string) => {
    try {
      const response = await api<ApiResponse<Transaction>>(
        `/transactions/${id}/cancel`,
        { method: "PATCH" },
      );

      if (response.success) {
        const index = transactions.value.findIndex((t) => t._id === id);
        if (index !== -1) {
          transactions.value[index].stage = response.data.stage;
        }
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(extractErrorMessage(error));
    }
  };

  const createTransaction = async (payload: any) => {
    try {
      const response = await api<ApiResponse<Transaction>>("/transactions", {
        method: "POST",
        body: payload,
      });

      if (response.success) {
        await fetchTransactions(1);
        toast.success(response.message);
        return true;
      } else {
        toast.error(response.message);
        return false;
      }
    } catch (error: any) {
      toast.error(extractErrorMessage(error));
      return false;
    }
  };

  const activeTransactions = computed(() =>
    transactions.value.filter(
      (t) =>
        t.stage !== TransactionStage.COMPLETED &&
        t.stage !== TransactionStage.CANCELLED,
    ),
  );

  const totalAgencyRevenue = computed(() => {
    return transactions.value
      .filter(
        (t) => t.stage === TransactionStage.COMPLETED && t.financialBreakdown,
      )
      .reduce((sum, t) => sum + (t.financialBreakdown?.agencyCut || 0), 0);
  });

  return {
    transactions,
    isLoading,
    meta,
    activeTransactions,
    totalAgencyRevenue,
    fetchTransactions,
    updateTransactionStage,
    cancelTransaction,
    createTransaction,
  };
});
