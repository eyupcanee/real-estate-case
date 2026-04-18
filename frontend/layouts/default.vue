<script setup>
import { ref } from "vue";
import {
  Menu,
  X,
  Home,
  ArrowRightLeft,
  Building2,
  Users,
} from "lucide-vue-next";

const isSidebarOpen = ref(false);
</script>

<template>
  <div class="flex h-screen bg-brand-dark font-sans text-white overflow-hidden">
    <div
      v-if="isSidebarOpen"
      @click="isSidebarOpen = false"
      class="fixed inset-0 bg-black/80 z-20 md:hidden transition-opacity"
    ></div>

    <aside
      :class="[
        'fixed inset-y-0 left-0 z-30 w-64 bg-brand-surface border-r border-brand-primary/10 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <div
        class="flex items-center justify-between p-6 border-b border-brand-primary/10"
      >
        <div class="text-2xl font-bold tracking-wide">
          <span class="text-brand-primary">Estate</span>Admin
        </div>
        <button
          @click="isSidebarOpen = false"
          class="md:hidden text-brand-muted hover:text-brand-primary transition-colors"
        >
          <X class="w-6 h-6" />
        </button>
      </div>

      <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
        <NuxtLink
          to="/"
          @click="isSidebarOpen = false"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-brand-muted hover:bg-brand-primary/5 hover:text-brand-primary transition-all"
          active-class="bg-brand-primary/15 text-brand-primary font-medium"
        >
          <Home class="w-5 h-5" />
          Dashboard
        </NuxtLink>

        <NuxtLink
          to="/transactions"
          @click="isSidebarOpen = false"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-brand-muted hover:bg-brand-primary/5 hover:text-brand-primary transition-all"
          active-class="bg-brand-primary/15 text-brand-primary font-medium"
        >
          <ArrowRightLeft class="w-5 h-5" />
          Transactions
        </NuxtLink>

        <NuxtLink
          to="/properties"
          @click="isSidebarOpen = false"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-brand-muted hover:bg-brand-primary/5 hover:text-brand-primary transition-all"
          active-class="bg-brand-primary/15 text-brand-primary font-medium"
        >
          <Building2 class="w-5 h-5" />
          Properties
        </NuxtLink>

        <NuxtLink
          to="/agents"
          @click="isSidebarOpen = false"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-brand-muted hover:bg-brand-primary/5 hover:text-brand-primary transition-all"
          active-class="bg-brand-primary/15 text-brand-primary font-medium"
        >
          <Users class="w-5 h-5" />
          Agents
        </NuxtLink>
      </nav>
    </aside>

    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header
        class="h-16 bg-brand-surface border-b border-brand-primary/10 flex items-center justify-between px-4 sm:px-8 shadow-sm z-10"
      >
        <div class="flex items-center gap-4">
          <button
            @click="isSidebarOpen = true"
            class="md:hidden p-2 rounded-md text-brand-muted hover:bg-brand-primary/10 hover:text-brand-primary transition-colors"
          >
            <Menu class="w-6 h-6" />
          </button>
          <h1 class="text-xl font-semibold text-white hidden sm:block">
            Management Portal
          </h1>
        </div>

        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold border border-brand-primary/30"
          >
            A
          </div>
          <span class="text-sm font-medium text-gray-300 hidden sm:block">
            Administrator
          </span>
        </div>
      </header>

      <div class="flex-1 overflow-auto p-4 sm:p-8">
        <slot />
      </div>
    </main>
  </div>
</template>
