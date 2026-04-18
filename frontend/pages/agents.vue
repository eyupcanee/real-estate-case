<script setup>
import { onMounted, ref } from "vue";
import { Plus, Mail, User, ShieldCheck } from "lucide-vue-next";
import { toast } from "vue3-toastify";

const agentStore = useAgentStore();

const isCreateModalOpen = ref(false);
const isSubmitting = ref(false);
const newAgentForm = ref({
  fullName: "",
  email: "",
});

const currentSearch = ref("");

const tableHeaders = [
  { key: "agent", label: "Agent" },
  { key: "contact", label: "Contact Info" },
  { key: "joined", label: "Joined Date" },
  { key: "actions", label: "Actions" },
];

const openCreateModal = () => {
  newAgentForm.value = { fullName: "", email: "" };
  isCreateModalOpen.value = true;
};

const submitCreateAgent = async () => {
  if (!newAgentForm.value.fullName || !newAgentForm.value.email) {
    return toast.warning("Full Name and Email are required.");
  }

  isSubmitting.value = true;
  const success = await agentStore.createAgent(newAgentForm.value);
  isSubmitting.value = false;

  if (success) {
    isCreateModalOpen.value = false;
  }
};

const handleSearch = (query) => {
  currentSearch.value = query;
  agentStore.fetchAgents(1, 10, currentSearch.value);
};

const handlePageChange = (newPage) => {
  agentStore.fetchAgents(newPage, 10, currentSearch.value);
};

onMounted(() => agentStore.fetchAgents(1, 10, currentSearch.value));
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-8">
    <div class="flex justify-between items-end">
      <div>
        <h2 class="text-3xl font-bold text-white uppercase tracking-tighter">
          Agents
        </h2>
        <p class="text-brand-muted text-sm uppercase tracking-widest mt-1">
          Team Management
        </p>
      </div>
      <UiAppButton variant="primary" @click="openCreateModal">
        <Plus class="w-4 h-4 mr-2" /> New Agent
      </UiAppButton>
    </div>

    <UiBaseTable
      :headers="tableHeaders"
      :items="agentStore.agents"
      :is-loading="agentStore.isLoading"
      :current-page="agentStore.meta?.page || 1"
      :total-pages="agentStore.meta?.totalPages || 1"
      :total-items="agentStore.meta?.total || 0"
      search-placeholder="Search by name or email..."
      @change-page="handlePageChange"
      @search="handleSearch"
    >
      <template #agent="{ item }">
        <div class="flex items-center gap-3 py-1">
          <div
            class="w-10 h-10 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-lg shadow-inner"
          >
            {{ item.fullName.charAt(0).toUpperCase() }}
          </div>
          <div class="flex flex-col">
            <span class="text-white font-bold">{{ item.fullName }}</span>
            <div
              class="flex items-center gap-1 text-[9px] text-emerald-400 font-black uppercase tracking-tighter"
            >
              <ShieldCheck class="w-2.5 h-2.5" /> Verified Agent
            </div>
          </div>
        </div>
      </template>

      <template #contact="{ item }">
        <div class="flex items-center gap-2 text-sm text-gray-300">
          <Mail class="w-3.5 h-3.5 text-brand-muted" />
          <span
            class="hover:text-brand-primary transition-colors cursor-pointer"
          >
            {{ item.email }}
          </span>
        </div>
      </template>

      <template #joined="{ item }">
        <div class="flex flex-col">
          <span class="text-brand-muted text-xs font-mono">
            {{
              new Date(item.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            }}
          </span>
          <span class="text-[9px] text-brand-muted/40 uppercase"
            >Registration Date</span
          >
        </div>
      </template>

      <template #actions="{ item }">
        <div class="flex justify-start">
          <UiAppButton
            variant="outline"
            size="sm"
            class="text-[10px] uppercase font-bold py-1 px-3"
          >
            View Details
          </UiAppButton>
        </div>
      </template>
    </UiBaseTable>

    <UiAppModal
      v-model="isCreateModalOpen"
      title="Register New Agent"
      description="Add a new real estate consultant to your agency team."
      confirm-text="Create Account"
      confirm-variant="primary"
      :is-loading="isSubmitting"
      @confirm="submitCreateAgent"
    >
      <div class="space-y-5">
        <div>
          <label
            class="block text-xs font-semibold text-brand-muted mb-1.5 uppercase tracking-widest"
          >
            Full Name *
          </label>
          <div class="relative group">
            <User
              class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted group-focus-within:text-brand-primary transition-colors"
            />
            <input
              v-model="newAgentForm.fullName"
              type="text"
              placeholder="e.g. Michael Jordan"
              class="w-full bg-[#141414] border border-brand-primary/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-brand-primary transition-all shadow-inner"
            />
          </div>
        </div>

        <div>
          <label
            class="block text-xs font-semibold text-brand-muted mb-1.5 uppercase tracking-widest"
          >
            Corporate Email *
          </label>
          <div class="relative group">
            <Mail
              class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted group-focus-within:text-brand-primary transition-colors"
            />
            <input
              v-model="newAgentForm.email"
              type="email"
              placeholder="name@agency.com"
              class="w-full bg-[#141414] border border-brand-primary/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-brand-primary transition-all shadow-inner"
            />
          </div>
          <p class="text-[10px] text-brand-muted/50 mt-2 italic">
            Note: This email will be used for transaction notifications.
          </p>
        </div>
      </div>
    </UiAppModal>
  </div>
</template>
