<script setup>
const props = defineProps({
  variant: { type: String, default: "primary" },
  isLoading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});

const variantStyles = computed(() => {
  switch (props.variant) {
    case "primary":
      return "bg-brand-primary text-brand-dark hover:bg-[#ffe5a3] font-semibold border border-transparent";
    case "outline":
      return "bg-transparent text-brand-primary border border-brand-primary hover:bg-brand-primary/10";
    case "danger":
      return "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all";
    default:
      return "";
  }
});
</script>

<template>
  <button
    :disabled="disabled || isLoading"
    :class="[
      'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200',
      variantStyles,
      disabled || isLoading
        ? 'opacity-50 cursor-not-allowed'
        : 'cursor-pointer',
    ]"
  >
    <svg
      v-if="isLoading"
      class="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>

    <slot v-if="!isLoading" />
    <span v-else>Processing...</span>
  </button>
</template>
