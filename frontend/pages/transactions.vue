<script setup>
import { onMounted, ref } from "vue";
import { TransactionStage } from "~/enums";
import { Trash2, ChevronRight, Plus, CheckCircle2 } from "lucide-vue-next";

const transactionStore = useTransactionStore();
const propertyStore = usePropertyStore();
const agentStore = useAgentStore();

const isCancelModalOpen = ref(false);
const idToCancel = ref(null);

const isCreateModalOpen = ref(false);
const isSubmitting = ref(false);
const newTxForm = ref({
  propertyId: "",
  listingAgentId: "",
  sellingAgentId: "",
  totalServiceFee: null,
});

const currentSearch = ref("");

const tableHeaders = [
  { key: "property", label: "Property" },
  { key: "type", label: "Type" },
  { key: "listingAgent", label: "Listing Agent (L)" },
  { key: "sellingAgent", label: "Selling Agent (S)" },
  { key: "fee", label: "Service Fee" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];

const getNextAction = (currentStage) => {
  const transitions = {
    [TransactionStage.AGREEMENT]: {
      next: TransactionStage.EARNEST_MONEY,
      label: "To Earnest Money",
    },
    [TransactionStage.EARNEST_MONEY]: {
      next: TransactionStage.TITLE_DEED,
      label: "Start Title Deed",
    },
    [TransactionStage.TITLE_DEED]: {
      next: TransactionStage.COMPLETED,
      label: "Complete",
    },
  };
  return transitions[currentStage] || null;
};

const handleCancelClick = (id) => {
  idToCancel.value = id;
  isCancelModalOpen.value = true;
};

const confirmCancel = async () => {
  if (idToCancel.value) {
    await transactionStore.cancelTransaction(idToCancel.value);
    isCancelModalOpen.value = false;
  }
};

const openCreateModal = async () => {
  await Promise.all([
    propertyStore.fetchProperties(1, 100),
    agentStore.fetchAgents(1, 100),
  ]);
  isCreateModalOpen.value = true;
};
const submitCreate = async () => {
  if (!newTxForm.value.propertyId || !newTxForm.value.totalServiceFee)
    return alert("Please fill in the required fields.");

  isSubmitting.value = true;
  const success = await transactionStore.createTransaction(newTxForm.value);
  isSubmitting.value = false;

  if (success) {
    isCreateModalOpen.value = false;
    newTxForm.value = {
      propertyId: "",
      listingAgentId: "",
      sellingAgentId: "",
      totalServiceFee: null,
    };
  }
};

const handleSearch = (query) => {
  currentSearch.value = query;
  transactionStore.fetchTransactions(1, 10, currentSearch.value);
};

const handlePageChange = (newPage) => {
  transactionStore.fetchTransactions(newPage, 10, currentSearch.value);
};

onMounted(() => transactionStore.fetchTransactions(1, 10, currentSearch.value));
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-8">
    <div class="flex justify-between items-end">
      <div>
        <h2 class="text-3xl font-bold text-white uppercase tracking-tighter">
          Transactions
        </h2>
        <p class="text-brand-muted text-sm uppercase tracking-widest mt-1">
          Manage all property transactions and their stages.
        </p>
      </div>
      <UiAppButton variant="primary" @click="openCreateModal">
        <Plus class="w-4 h-4 mr-2" /> New Record
      </UiAppButton>
    </div>

    <UiBaseTable
      :headers="tableHeaders"
      :items="transactionStore.transactions"
      :is-loading="transactionStore.isLoading"
      :current-page="transactionStore.meta?.page || 1"
      :total-pages="transactionStore.meta?.totalPages || 1"
      :total-items="transactionStore.meta?.total || 0"
      search-placeholder="Search properties or agents..."
      @change-page="handlePageChange"
      @search="handleSearch"
    >
      <template #property="{ item }">
        <div class="flex flex-col py-1">
          <span class="text-white font-bold">{{
            item.propertyId?.title || "Deleted Property"
          }}</span>
          <span class="text-[10px] text-brand-muted uppercase">{{
            item.propertyId?.location || "No Location"
          }}</span>
        </div>
      </template>

      <template #type="{ item }">
        <div class="flex items-center">
          <span
            :class="
              item.transactionType === 'SALE'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
            "
            class="text-[10px] px-2.5 py-1 rounded-md border uppercase font-bold tracking-widest shadow-sm"
          >
            {{ item.transactionType || "SALE" }}
          </span>
        </div>
      </template>

      <template #listingAgent="{ item }">
        <div class="flex items-center gap-1.5 text-[11px] text-gray-300">
          <div class="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
          {{ item.listingAgentId?.fullName || "---" }}
        </div>
      </template>

      <template #sellingAgent="{ item }">
        <div class="flex items-center gap-1.5 text-[11px] text-brand-muted">
          <div class="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
          {{ item.sellingAgentId?.fullName || "---" }}
        </div>
      </template>

      <template #fee="{ item }">
        <div class="flex flex-col">
          <span class="text-brand-primary font-mono font-bold text-lg">
            {{ new Intl.NumberFormat("en-US").format(item.totalServiceFee) }} ₺
          </span>

          <div
            v-if="
              item.stage === TransactionStage.COMPLETED &&
              item.financialBreakdown
            "
            class="mt-2 p-2.5 bg-brand-dark/50 rounded-lg border border-brand-primary/10 text-[10px] space-y-1.5 shadow-inner"
          >
            <div class="flex justify-between items-center text-brand-muted">
              <span class="font-medium">Agency Cut:</span>
              <span class="text-white font-mono"
                >{{
                  new Intl.NumberFormat("en-US").format(
                    item.financialBreakdown.agencyCut,
                  )
                }}
                ₺</span
              >
            </div>
            <div class="flex justify-between items-center text-brand-muted">
              <span class="font-medium">L. Agent (Gold):</span>
              <span class="text-brand-primary font-mono"
                >{{
                  new Intl.NumberFormat("en-US").format(
                    item.financialBreakdown.listingAgentCut,
                  )
                }}
                ₺</span
              >
            </div>
            <div class="flex justify-between items-center text-brand-muted">
              <span class="font-medium">S. Agent (Blue):</span>
              <span class="text-blue-400 font-mono"
                >{{
                  new Intl.NumberFormat("en-US").format(
                    item.financialBreakdown.sellingAgentCut,
                  )
                }}
                ₺</span
              >
            </div>
          </div>
        </div>
      </template>

      <template #status="{ item }">
        <UiStatusBadge :stage="item.stage" />
      </template>

      <template #actions="{ item }">
        <div class="flex justify-start items-center gap-3">
          <template v-if="getNextAction(item.stage)">
            <button
              @click="handleCancelClick(item._id)"
              class="p-2 text-brand-muted hover:text-red-500"
              title="Cancel Transaction"
            >
              <Trash2 class="w-4 h-4" />
            </button>
            <UiAppButton
              variant="outline"
              size="sm"
              @click="
                transactionStore.updateTransactionStage(
                  item._id,
                  getNextAction(item.stage).next,
                )
              "
            >
              {{ getNextAction(item.stage).label }}
            </UiAppButton>
          </template>
          <div v-else class="text-[10px] font-bold opacity-30 uppercase px-4">
            Closed
          </div>
        </div>
      </template>
    </UiBaseTable>

    <UiAppModal
      v-model="isCancelModalOpen"
      title="Cancel Transaction"
      description="Are you sure you want to cancel this transaction? The property will become active again."
      confirm-text="Yes, Cancel"
      confirm-variant="danger"
      @confirm="confirmCancel"
    />

    <UiAppModal
      v-model="isCreateModalOpen"
      title="Start New Transaction"
      confirm-text="Save and Start"
      confirm-variant="primary"
      :is-loading="isSubmitting"
      @confirm="submitCreate"
    >
      <div class="space-y-4">
        <div>
          <label
            class="block text-xs font-semibold text-brand-muted mb-1 uppercase tracking-wider"
            >Select Property *</label
          >
          <select
            v-model="newTxForm.propertyId"
            class="w-full bg-[#1A1A1A] border border-brand-primary/20 rounded-lg p-2.5 text-sm text-white outline-none focus:border-brand-primary transition-colors"
          >
            <option value="" disabled>Select...</option>
            <option
              v-for="prop in propertyStore.properties"
              :key="prop._id"
              :value="prop._id"
            >
              {{ prop.title }} ({{
                new Intl.NumberFormat("en-US").format(prop.price)
              }}
              ₺)
            </option>
          </select>
        </div>

        <div>
          <label
            class="block text-xs font-semibold text-brand-muted mb-1 uppercase tracking-wider"
            >Listing Agent</label
          >
          <select
            v-model="newTxForm.listingAgentId"
            class="w-full bg-[#1A1A1A] border border-brand-primary/20 rounded-lg p-2.5 text-sm text-white outline-none focus:border-brand-primary transition-colors"
          >
            <option value="">Unassigned</option>
            <option
              v-for="agent in agentStore.agents"
              :key="agent._id"
              :value="agent._id"
            >
              {{ agent.fullName }}
            </option>
          </select>
        </div>

        <div>
          <label
            class="block text-xs font-semibold text-brand-muted mb-1 uppercase tracking-wider"
            >Selling Agent</label
          >
          <select
            v-model="newTxForm.sellingAgentId"
            class="w-full bg-[#1A1A1A] border border-brand-primary/20 rounded-lg p-2.5 text-sm text-white outline-none focus:border-brand-primary transition-colors"
          >
            <option value="">Unassigned</option>
            <option
              v-for="agent in agentStore.agents"
              :key="agent._id"
              :value="agent._id"
            >
              {{ agent.fullName }}
            </option>
          </select>
        </div>

        <div>
          <label
            class="block text-xs font-semibold text-brand-muted mb-1 uppercase tracking-wider"
          >
            Transaction Type *
          </label>
          <select
            v-model="newTxForm.transactionType"
            class="w-full bg-[#1A1A1A] border border-brand-primary/20 rounded-lg p-2.5 text-sm text-white outline-none focus:border-brand-primary transition-colors"
          >
            <option value="SALE">Sale</option>
            <option value="RENTAL">Rental</option>
          </select>
        </div>

        <div>
          <label
            class="block text-xs font-semibold text-brand-muted mb-1 uppercase tracking-wider"
            >Service Fee (₺) *</label
          >
          <input
            type="number"
            v-model="newTxForm.totalServiceFee"
            placeholder="E.g. 150000"
            class="w-full bg-[#1A1A1A] border border-brand-primary/20 rounded-lg p-2.5 text-sm text-white outline-none focus:border-brand-primary transition-colors"
          />
        </div>
      </div>
    </UiAppModal>
  </div>
</template>
