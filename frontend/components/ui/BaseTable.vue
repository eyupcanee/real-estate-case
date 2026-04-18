<script setup>
import { ref } from "vue";
import { ChevronLeft, ChevronRight, Search } from "lucide-vue-next";

const props = defineProps({
  headers: { type: Array, required: true },
  items: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  totalItems: { type: Number, default: 0 },
  searchPlaceholder: { type: String, default: "Ara..." },
});

const emit = defineEmits(["change-page", "search"]);

const searchQuery = ref("");
let debounceTimer = null;

const onSearchInput = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    emit("search", searchQuery.value);
  }, 500);
};

const handlePageChange = (newPage) => {
  if (newPage >= 1 && newPage <= props.totalPages) {
    emit("change-page", newPage);
  }
};
</script>

<template>
  <div class="w-full space-y-4">
    <div
      class="flex justify-between items-center bg-brand-surface p-4 rounded-xl border border-brand-primary/10 shadow-lg"
    >
      <div class="relative w-full max-w-sm">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted"
        />
        <input
          v-model="searchQuery"
          @input="onSearchInput"
          type="text"
          :placeholder="searchPlaceholder"
          class="w-full bg-[#1A1A1A] border border-brand-primary/20 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-brand-primary transition-colors"
        />
      </div>
      <div
        class="hidden sm:block text-xs text-brand-muted font-mono bg-[#1A1A1A] px-3 py-1.5 rounded-md border border-brand-primary/5"
      >
        Total Records:
        <span class="text-brand-primary font-bold">{{ totalItems }}</span>
      </div>
    </div>

    <div
      class="bg-brand-surface border border-brand-primary/10 rounded-xl overflow-hidden shadow-xl"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead
            class="bg-brand-dark/40 text-brand-muted text-[10px] uppercase tracking-widest border-b border-brand-primary/10"
          >
            <tr>
              <th v-for="h in headers" :key="h.key" class="px-6 py-4 font-bold">
                {{ h.label }}
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-brand-primary/5">
            <tr v-if="isLoading" v-for="i in 5" :key="i" class="animate-pulse">
              <td
                :colspan="headers.length"
                class="px-6 py-6 bg-brand-primary/5"
              ></td>
            </tr>

            <tr v-else-if="items.length === 0">
              <td
                :colspan="headers.length"
                class="px-6 py-12 text-center text-brand-muted italic"
              >
                Görüntülenecek veri bulunamadı.
              </td>
            </tr>

            <tr
              v-else
              v-for="(item, idx) in items"
              :key="item._id || idx"
              class="hover:bg-brand-primary/5 transition-colors group"
            >
              <td v-for="h in headers" :key="h.key" class="px-6 py-4">
                <slot :name="h.key" :item="item">
                  <span class="text-gray-300 text-sm">{{ item[h.key] }}</span>
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        class="px-6 py-4 bg-brand-dark/20 border-t border-brand-primary/10 flex items-center justify-between"
      >
        <div class="text-xs text-brand-muted italic hidden sm:block">
          Page {{ currentPage }} / {{ totalPages }}
        </div>

        <div class="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            @click="handlePageChange(currentPage - 1)"
            :disabled="currentPage === 1 || isLoading"
            class="p-2 rounded-lg border border-brand-primary/10 hover:bg-brand-primary/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft class="w-4 h-4 text-brand-primary" />
          </button>
          <button
            @click="handlePageChange(currentPage + 1)"
            :disabled="currentPage === totalPages || isLoading"
            class="p-2 rounded-lg border border-brand-primary/10 hover:bg-brand-primary/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight class="w-4 h-4 text-brand-primary" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
