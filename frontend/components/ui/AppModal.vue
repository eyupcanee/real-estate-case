<script setup>
defineProps({
  modelValue: Boolean,
  title: String,
  description: String,
  confirmText: { type: String, default: "Onayla" },
  confirmVariant: { type: String, default: "primary" },
  isLoading: Boolean,
});

const emit = defineEmits(["update:modelValue", "confirm"]);
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/90"
          @click="emit('update:modelValue', false)"
        ></div>

        <div
          class="relative bg-brand-surface border border-brand-primary/20 w-full max-w-md rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <h3 class="text-xl font-bold text-white mb-2">{{ title }}</h3>

          <p
            v-if="description"
            class="text-brand-muted mb-8 text-sm leading-relaxed"
          >
            {{ description }}
          </p>

          <div class="mb-8">
            <slot></slot>
          </div>

          <div class="flex justify-end gap-3">
            <UiAppButton
              variant="outline"
              @click="emit('update:modelValue', false)"
            >
              Cancel
            </UiAppButton>
            <UiAppButton
              :variant="confirmVariant"
              :is-loading="isLoading"
              @click="emit('confirm')"
            >
              {{ confirmText }}
            </UiAppButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
