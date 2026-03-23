<script setup lang="ts">
import SideBar from "@/components/SideBar.vue";
import { RouterView, useRoute } from "vue-router";
import Header from "@/components/Header.vue";
import { computed, ref, provide } from "vue";

const route = useRoute();

// Показывать кнопку только на странице заявок
const showAddButton = computed(() => route.path === "/requests");

// Храним функцию открытия модального окна
const openCreateModalFn = ref<(() => void) | null>(null);

// Функция открытия модального окна создания заявки
const handleCreateRequest = () => {
  if (openCreateModalFn.value) {
    openCreateModalFn.value();
  }
};

// Предоставляем функцию для дочерних компонентов через provide
provide("openCreateModal", handleCreateRequest);

// Регистрируем функцию открытия модального окна
const registerOpenModal = (fn: () => void) => {
  openCreateModalFn.value = fn;
};

// Предоставляем функцию регистрации для дочерних компонентов
provide("registerOpenModal", registerOpenModal);
</script>

<template>
  <div class="home-layout">
    <SideBar />

    <Header :show-add-button="showAddButton" />
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<style scoped>
.home-layout {
  display: grid;
  grid-template-areas:
    "sidebar header "
    "sidebar content";
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
}

.sidebar {
  grid-area: sidebar;
}

.header {
  grid-area: header;
}

.content {
  grid-area: content;
  padding: 2rem;
}
</style>
