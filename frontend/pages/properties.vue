<script setup>
import { onMounted, ref } from "vue";
import { Plus, MapPin, Tag, Home, Building2, Trees } from "lucide-vue-next";
import { toast } from "vue3-toastify";

const propertyStore = usePropertyStore();

const isCreateModalOpen = ref(false);
const isSubmitting = ref(false);
const newPropertyForm = ref({
  title: "",
  location: "",
  price: null,
  type: "RESIDENTIAL",
});

const currentSearch = ref("");

const tableHeaders = [
  { key: "property", label: "Property Details" },
  { key: "type", label: "Type" },
  { key: "price", label: "Price" },
  { key: "actions", label: "Actions" },
];

const getTypeIcon = (type) => {
  if (type === "COMMERCIAL") return Building2;
  if (type === "LAND") return Trees;
  return Home;
};

const openCreateModal = () => {
  newPropertyForm.value = {
    title: "",
    location: "",
    price: null,
    type: "RESIDENTIAL",
  };
  isCreateModalOpen.value = true;
};

const submitCreateProperty = async () => {
  if (!newPropertyForm.value.title || !newPropertyForm.value.price) {
    return toast.warning("Title and Price are required.");
  }

  isSubmitting.value = true;
  const success = await propertyStore.createProperty(newPropertyForm.value);
  isSubmitting.value = false;

  if (success) isCreateModalOpen.value = false;
};

const handleSearch = (query) => {
  currentSearch.value = query;
  propertyStore.fetchProperties(1, 10, currentSearch.value);
};

const handlePageChange = (newPage) => {
  propertyStore.fetchProperties(newPage, 10, currentSearch.value);
};

onMounted(() => propertyStore.fetchProperties(1, 10, currentSearch.value));
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-8">
    <div class="flex justify-between items-end">
      <div>
        <h2 class="text-3xl font-bold text-white uppercase tracking-tighter">
          Properties
        </h2>
        <p class="text-brand-muted text-sm uppercase tracking-widest mt-1">
          Inventory Management
        </p>
      </div>
      <UiAppButton variant="primary" @click="openCreateModal">
        <Plus class="w-4 h-4 mr-2" /> Add Property
      </UiAppButton>
    </div>

    <UiBaseTable
      :headers="tableHeaders"
      :items="propertyStore.properties"
      :is-loading="propertyStore.isLoading"
      :current-page="propertyStore.meta?.page || 1"
      :total-pages="propertyStore.meta?.totalPages || 1"
      :total-items="propertyStore.meta?.total || 0"
      search-placeholder="Search by title or location..."
      @change-page="handlePageChange"
      @search="handleSearch"
    >
      <template #property="{ item }">
        <div class="flex flex-col py-1">
          <span class="text-white font-bold text-base">{{ item.title }}</span>
          <div
            class="flex items-center gap-1 text-brand-muted text-[11px] mt-0.5"
          >
            <MapPin class="w-3 h-3" />
            {{ item.location }}
          </div>
        </div>
      </template>

      <template #type="{ item }">
        <div
          class="flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/5 border border-brand-primary/10 w-fit"
        >
          <component
            :is="getTypeIcon(item.type)"
            class="w-3.5 h-3.5 text-brand-primary"
          />
          <span
            class="text-[10px] font-black text-white uppercase tracking-tighter"
            >{{ item.type }}</span
          >
        </div>
      </template>

      <template #price="{ item }">
        <div class="flex flex-col">
          <span class="text-white font-mono font-bold text-lg">
            {{ new Intl.NumberFormat("en-US").format(item.price) }} ₺
          </span>
          <span class="text-[9px] text-brand-muted uppercase"
            >Market Value</span
          >
        </div>
      </template>

      <template #actions="{ item }">
        <UiAppButton
          variant="outline"
          size="sm"
          class="text-[10px] font-bold uppercase"
        >
          Manage
        </UiAppButton>
      </template>
    </UiBaseTable>

    <UiAppModal
      v-model="isCreateModalOpen"
      title="Add New Listing"
      description="Enter the details of the new property to add it to your inventory."
      confirm-text="Save Property"
      confirm-variant="primary"
      :is-loading="isSubmitting"
      @confirm="submitCreateProperty"
    >
      <div class="grid grid-cols-1 gap-5">
        <div>
          <label
            class="block text-xs font-semibold text-brand-muted mb-1.5 uppercase"
            >Listing Title *</label
          >
          <input
            v-model="newPropertyForm.title"
            type="text"
            placeholder="e.g. Sea View Villa"
            class="w-full bg-[#141414] border border-brand-primary/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-primary transition-all"
          />
        </div>

        <div>
          <label
            class="block text-xs font-semibold text-brand-muted mb-1.5 uppercase"
            >Location *</label
          >
          <input
            v-model="newPropertyForm.location"
            type="text"
            placeholder="City, District"
            class="w-full bg-[#141414] border border-brand-primary/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-primary transition-all"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label
              class="block text-xs font-semibold text-brand-muted mb-1.5 uppercase"
              >Type</label
            >
            <select
              v-model="newPropertyForm.type"
              class="w-full bg-[#141414] border border-brand-primary/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-primary transition-all"
            >
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="LAND">Land</option>
            </select>
          </div>
          <div>
            <label
              class="block text-xs font-semibold text-brand-muted mb-1.5 uppercase"
              >Price (₺) *</label
            >
            <input
              v-model="newPropertyForm.price"
              type="number"
              placeholder="0.00"
              class="w-full bg-[#141414] border border-brand-primary/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-primary transition-all"
            />
          </div>
        </div>
      </div>
    </UiAppModal>
  </div>
</template>
