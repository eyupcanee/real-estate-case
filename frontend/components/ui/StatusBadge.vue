<script setup>
import { TransactionStage } from "~/enums";

const props = defineProps({
  stage: { type: String, required: true },
});

const styles = {
  [TransactionStage.AGREEMENT]:
    "bg-blue-500/10 text-blue-400 border-blue-500/20",
  [TransactionStage.EARNEST_MONEY]:
    "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
  [TransactionStage.TITLE_DEED]:
    "bg-purple-500/10 text-purple-400 border-purple-500/20",
  [TransactionStage.COMPLETED]:
    "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
  [TransactionStage.CANCELLED]: "bg-red-500/10 text-red-400 border-red-500/20",
};
</script>

<template>
  <span
    :class="[
      'px-3 py-1 text-[10px] uppercase tracking-tighter font-bold rounded-md border transition-all',
      styles[stage],
    ]"
  >
    {{ stage.replace("_", " ") }}
  </span>
</template>
