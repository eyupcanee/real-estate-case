<script setup>
import { onMounted } from "vue";
import {
  Banknote,
  ArrowRightLeft,
  Building2,
  Users,
  TrendingUp,
  History,
  Activity,
  ShieldCheck,
} from "lucide-vue-next";
import { TransactionStage } from "~/enums";

const transactionStore = useTransactionStore();
const propertyStore = usePropertyStore();
const agentStore = useAgentStore();
const auditStore = useAuditStore();

onMounted(async () => {
  await Promise.all([
    transactionStore.fetchTransactions(),
    propertyStore.fetchProperties(),
    agentStore.fetchAgents(),
    auditStore.fetchLogs(10),
  ]);
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
};

const getLogStatusClass = (action) => {
  if (action.includes("COMPLETED"))
    return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  if (action.includes("CREATED"))
    return "text-blue-400 bg-blue-400/10 border-blue-400/20";
  if (action.includes("CANCELLED"))
    return "text-red-400 bg-red-400/10 border-red-400/20";
  return "text-amber-400 bg-amber-400/10 border-amber-400/20";
};
</script>

<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-3xl font-bold text-white tracking-tight">
        Dashboard Overview
      </h2>
      <p class="text-brand-muted mt-1">
        Real-time system performance and audit tracking.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <UiStatCard
        title="Total Agency Revenue"
        :value="formatCurrency(transactionStore.totalAgencyRevenue)"
        :icon="Banknote"
        value-color="text-brand-primary"
      />
      <UiStatCard
        title="Active Transactions"
        :value="transactionStore.activeTransactions.length"
        :icon="ArrowRightLeft"
      />
      <UiStatCard
        title="Total Properties"
        :value="propertyStore.properties.length"
        :icon="Building2"
      />
      <UiStatCard
        title="Active Agents"
        :value="agentStore.agents.length"
        :icon="Users"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div
        class="lg:col-span-8 bg-brand-surface border border-brand-primary/10 rounded-xl p-6 shadow-xl relative overflow-hidden"
      >
        <div class="flex items-center justify-between mb-8">
          <div>
            <h3 class="text-xl font-bold text-white flex items-center gap-2">
              <History class="w-5 h-5 text-brand-primary" />
              Audit Trail
            </h3>
            <p
              class="text-[10px] text-brand-muted uppercase tracking-widest mt-1"
            >
              Cryptographic Activity Log
            </p>
          </div>
          <div
            class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand-primary/5 border border-brand-primary/10 rounded-lg"
          >
            <ShieldCheck class="w-3.5 h-3.5 text-brand-primary" />
            <span class="text-[10px] text-brand-primary font-black uppercase"
              >Hash-Chain Validated</span
            >
          </div>
        </div>

        <div class="space-y-6">
          <div v-if="auditStore.isLoading" class="animate-pulse space-y-4">
            <div
              v-for="i in 5"
              :key="i"
              class="h-16 bg-white/5 rounded-lg w-full"
            ></div>
          </div>

          <div
            v-else
            v-for="(log, idx) in auditStore.logs"
            :key="log._id"
            class="relative pl-8 group"
          >
            <div
              v-if="idx !== auditStore.logs.length - 1"
              class="absolute left-[11px] top-6 bottom-[-24px] w-[1px] bg-brand-primary/10 group-hover:bg-brand-primary/30 transition-colors"
            ></div>

            <div
              class="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-brand-dark border border-brand-primary/20 flex items-center justify-center z-10 shadow-lg"
            >
              <div
                class="w-2 h-2 rounded-full"
                :class="
                  getLogStatusClass(log.action)
                    .split(' ')[0]
                    .replace('text-', 'bg-')
                "
              ></div>
            </div>

            <div
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] group-hover:bg-brand-primary/[0.03] group-hover:border-brand-primary/10 transition-all"
            >
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-white">{{
                    log.action.replace(/_/g, " ")
                  }}</span>
                  <span
                    class="text-[9px] px-2 py-0.5 rounded-md uppercase font-bold"
                    :class="getLogStatusClass(log.action)"
                    >{{ log.entityType }}</span
                  >
                </div>
                <div class="flex items-center gap-2 mt-1">
                  <p class="text-[11px] text-brand-muted font-mono">
                    ID: {{ log.entityId.slice(-6) }}
                  </p>
                  <span class="text-white/10 text-xs">|</span>
                  <p class="text-[10px] text-brand-muted italic">
                    Hash: {{ log.currentHash.slice(0, 8) }}...
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs text-brand-primary font-mono">
                  {{
                    new Date(log.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }}
                </p>
                <p class="text-[9px] text-brand-muted uppercase">
                  {{ new Date(log.createdAt).toLocaleDateString() }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-4 space-y-6">
        <div
          class="bg-brand-surface border border-brand-primary/10 rounded-xl p-6 shadow-lg"
        >
          <h3
            class="text-lg font-semibold text-white mb-6 border-b border-brand-primary/10 pb-4"
          >
            Inventory Mix
          </h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-brand-muted">Residential</span>
              <span class="text-white font-medium">{{
                propertyStore.propertiesByType("RESIDENTIAL").length
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-brand-muted">Commercial</span>
              <span class="text-white font-medium">{{
                propertyStore.propertiesByType("COMMERCIAL").length
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-brand-muted">Land</span>
              <span class="text-white font-medium">{{
                propertyStore.propertiesByType("LAND").length
              }}</span>
            </div>
            <div
              class="pt-4 border-t border-brand-primary/10 flex justify-between items-center"
            >
              <span class="text-brand-muted font-medium">Deals Closed</span>
              <span class="text-emerald-400 font-bold text-xl">{{
                transactionStore.transactions.filter(
                  (t) => t.stage === TransactionStage.COMPLETED,
                ).length
              }}</span>
            </div>
          </div>
        </div>

        <NuxtLink
          to="/transactions"
          class="block p-6 rounded-xl bg-gradient-to-br from-brand-primary/20 to-transparent border border-brand-primary/20 group hover:border-brand-primary transition-all"
        >
          <TrendingUp
            class="w-8 h-8 text-brand-primary mb-4 group-hover:scale-110 transition-transform"
          />
          <h4 class="text-white font-bold">Manage Transactions</h4>
          <p class="text-xs text-brand-muted mt-1">
            Monitor commissions and deal stages in real-time.
          </p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
