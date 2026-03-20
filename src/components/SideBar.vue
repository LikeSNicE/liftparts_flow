<template>
  <aside class="sidebar flex flex-col h-screen bg-white">
    <!-- Header -->
    <div
      class="flex items-center gap-2 py-2 px-4 shrink-0 border-b border-r border-(--border)"
    >
      <LogoIcon />
      <h4 class="font-bold text-2xl text-(--title)">LiftPartsFlow</h4>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto p-4 border-r border-(--border)">
      <ul class="list-none m-0 space-y-1">
        <li>
          <div
            class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
          >
            Основное
          </div>
        </li>
        <li
          class="hover:bg-(--blue) hover:text-(--white) rounded-lg px-4 py-3 transition-colors"
        >
          <router-link to="/" class="flex items-center gap-3">
            <i class="pi pi-home"></i>
            <span class="font-medium">Главная</span>
          </router-link>
        </li>
        <li
          class="hover:bg-(--blue) hover:text-(--white) rounded-lg px-4 py-3 transition-colors"
        >
          <router-link to="/requests" class="flex items-center gap-3">
            <i class="pi pi-th-large"></i>
            <span class="font-medium">Заявки</span>
          </router-link>
        </li>

        <li
          class="hover:bg-(--blue) hover:text-(--white) rounded-lg px-4 py-3 transition-colors"
        >
          <router-link to="/parts" class="flex items-center gap-3">
            <i class="pi pi-box"></i>
            <span class="font-medium">Каталог деталей</span>
          </router-link>
        </li>

        <li
          class="hover:bg-(--blue) hover:text-(--white) rounded-lg px-4 py-3 transition-colors"
        >
          <router-link to="/orders" class="flex items-center gap-3">
            <i class="pi pi-shopping-cart"></i>
            <span class="font-medium">Заказы</span>
          </router-link>
        </li>

        <li
          class="hover:bg-(--blue) hover:text-(--white) rounded-lg px-4 py-3 transition-colors"
        >
          <router-link to="/dashboard" class="flex items-center gap-3">
            <i class="pi pi-chart-line"></i>
            <span class="font-medium">Дашборд</span>
          </router-link>
        </li>

        <li>
          <div
            class="px-4 py-2 mt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
          >
            Управление
          </div>
        </li>
        <li
          class="hover:bg-(--blue) hover:text-(--white) rounded-lg px-4 py-3 transition-colors"
        >
          <router-link to="/users" class="flex items-center gap-3">
            <i class="pi pi-users"></i>
            <span class="font-medium">Сотрудники</span>
          </router-link>
        </li>
        <li
          class="hover:bg-(--blue) hover:text-(--white) rounded-lg px-4 py-3 transition-colors"
        >
          <router-link to="/settings" class="flex items-center gap-3">
            <i class="pi pi-cog"></i>
            <span class="font-medium">Настройки</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Footer with User -->
    <div
      class="shrink-0 border-t border-r border-(--border) px-4 py-4 flex flex-col gap-4"
    >
      <router-link
        to="/profile"
        class="flex items-center gap-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <Avatar
          image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
          shape="circle"
          size="normal"
        />
        <div class="flex flex-col">
          <span class="font-bold text-sm text-(--title)">Amy Elsner</span>
          <span class="text-xs text-gray-500">Administrator</span>
        </div>
      </router-link>

      <Button label="Выйти" severity="danger" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Avatar, Button } from "primevue";
import LogoIcon from "./LogoIcon.vue";
</script>

<style scoped>
.sidebar {
  width: 300px;
  min-width: 300px;
}
</style>
