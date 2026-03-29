<script setup lang="ts">
import { ref } from "vue";
import { OverlayPanel } from "primevue";
import type { OverlayPanel as OverlayPanelType } from "primevue";
import LogoIcon from "./LogoIcon.vue";
import { useAuthStore } from "@/stores/useAuthStore";
import { router } from "@/router/router";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/useUserStore";
import { storeToRefs } from "pinia";
import { useRole } from "@/composables/useRole";

const route = useRoute();
const authStore = useAuthStore();
const userStore = useUserStore();
const { can } = useRole();

const { userData } = storeToRefs(userStore);

// Проверка активного маршрута для подсветки
const isActiveRoute = (path: string) => {
  return route.path === path;
};

// Выпадающее меню пользователя
const userMenuOpen = ref(false);
const op = ref<InstanceType<typeof OverlayPanelType> | null>(); // Ссылка на OverlayPanel

const toggleUserMenu = (event: Event) => {
  op.value?.toggle(event);
  userMenuOpen.value = !userMenuOpen.value;
};

const closeUserMenu = () => {
  userMenuOpen.value = false;
  op.value?.hide();
};

const goToSettings = () => {
  closeUserMenu();
  router.push("/settings");
};

const handleLogout = () => {
  closeUserMenu();
  authStore.clearToken();
  userStore.clearUserData();
  router.push({ name: "login" });
};
</script>

<template>
  <aside class="sidebar flex flex-col h-screen bg-white sticky top-0">
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
          :class="
            isActiveRoute('/')
              ? 'bg-(--blue) text-(--white)'
              : 'hover:bg-(--blue) hover:text-(--white)'
          "
          class="rounded-lg px-4 py-3 transition-colors"
        >
          <router-link to="/" class="flex items-center gap-3">
            <i class="pi pi-home"></i>
            <span class="font-medium">Главная</span>
          </router-link>
        </li>
        <li
          :class="
            isActiveRoute('/requests')
              ? 'bg-(--blue) text-(--white)'
              : 'hover:bg-(--blue) hover:text-(--white)'
          "
          class="rounded-lg px-4 py-3 transition-colors"
        >
          <router-link to="/requests" class="flex items-center gap-3">
            <i class="pi pi-th-large"></i>
            <span class="font-medium">Заявки</span>
          </router-link>
        </li>

        <li
          v-if="can(['admin', 'warehouse_operator'])"
          :class="
            isActiveRoute('/parts')
              ? 'bg-(--blue) text-(--white)'
              : 'hover:bg-(--blue) hover:text-(--white)'
          "
          class="rounded-lg px-4 py-3 transition-colors"
        >
          <router-link to="/parts" class="flex items-center gap-3">
            <i class="pi pi-box"></i>
            <span class="font-medium">Каталог деталей</span>
          </router-link>
        </li>

        <li
          v-if="can(['admin', 'warehouse_operator'])"
          :class="
            isActiveRoute('/orders')
              ? 'bg-(--blue) text-(--white)'
              : 'hover:bg-(--blue) hover:text-(--white)'
          "
          class="rounded-lg px-4 py-3 transition-colors"
        >
          <router-link to="/orders" class="flex items-center gap-3">
            <i class="pi pi-shopping-cart"></i>
            <span class="font-medium">Заказы</span>
          </router-link>
        </li>

        <li
          :class="
            isActiveRoute('/dashboard')
              ? 'bg-(--blue) text-(--white)'
              : 'hover:bg-(--blue) hover:text-(--white)'
          "
          class="rounded-lg px-4 py-3 transition-colors"
        >
          <router-link to="/dashboard" class="flex items-center gap-3">
            <i class="pi pi-chart-line"></i>
            <span class="font-medium">Дашборд</span>
          </router-link>
        </li>
      </ul>

      <ul v-if="can('admin')" class="mt-4">
        <li>
          <div
            class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
          >
            Управление
          </div>
        </li>

        <li
          :class="
            isActiveRoute('/users')
              ? 'bg-(--blue) text-(--white)'
              : 'hover:bg-(--blue) hover:text-(--white)'
          "
          class="rounded-lg px-4 py-3 transition-colors"
        >
          <router-link to="/users" class="flex items-center gap-3">
            <i class="pi pi-users"></i>
            <span class="font-medium">Сотрудники</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Footer with User -->
    <div class="shrink-0 border-t border-r border-(--border) px-4 py-4">
      <!-- Профиль пользователя с выпадающим меню -->
      <div class="relative">
        <div
          @click="toggleUserMenu"
          class="flex items-center gap-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors p-2 cursor-pointer"
        >
          <div>
            <i class="pi pi-user" style="font-size: 1.5rem"></i>
          </div>
          <div class="flex flex-col flex-1">
            <span class="font-bold text-sm text-(--title)">{{
              userData?.username
            }}</span>
            <span class="text-xs text-gray-500 capitalize">{{
              userData?.userrole
            }}</span>
          </div>
          <i
            class="pi pi-chevron-up text-xs text-gray-400 transition-transform"
            :class="[!userMenuOpen ? 'rotate-180!' : '']"
          ></i>
        </div>

        <!-- Выпадающее меню -->
        <OverlayPanel ref="op" :showCloseIcon="false" class="user-menu-panel">
          <div class="flex flex-col gap-1">
            <button
              @click="goToSettings"
              class="flex items-center gap-2 px-4 py-2 text-sm text-(--text) hover:bg-(--bg) rounded-lg transition-colors w-full text-left"
            >
              <i class="pi pi-cog text-(--blue)"></i>
              <span>Настройки</span>
            </button>
            <hr class="border-(--border) my-1" />
            <button
              @click="handleLogout"
              class="flex items-center gap-2 px-4 py-2 text-sm text-(--red) hover:bg-red-50 rounded-lg transition-colors w-full text-left"
            >
              <i class="pi pi-sign-out"></i>
              <span>Выйти из аккаунта</span>
            </button>
          </div>
        </OverlayPanel>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 300px;
  min-width: 300px;
}

/* Стили для выпадающего меню пользователя */
.user-menu-panel :deep(.p-overlaypanel-content) {
  padding: 0.5rem;
}

.rotate-180 {
  transform: rotate(180deg);
}

.capitalize {
  text-transform: capitalize;
}
</style>
