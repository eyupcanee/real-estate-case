<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: [Object, Function], required: true },
  valueColor: { type: String, default: "text-white" },
});
</script>

<template>
  <div
    class="bg-brand-surface border border-brand-primary/10 rounded-xl p-6 flex items-start justify-between hover:border-brand-primary/30 transition-colors"
  >
    <div>
      <h3 class="text-brand-muted text-sm font-medium mb-2">{{ title }}</h3>
      <p :class="['text-3xl font-bold tracking-tight', valueColor]">
        {{ value }}
      </p>
    </div>
    <div
      class="p-3 bg-brand-dark rounded-lg text-brand-primary border border-brand-primary/5"
    >
      <component :is="icon" class="w-6 h-6" />
    </div>
  </div>
</template>
