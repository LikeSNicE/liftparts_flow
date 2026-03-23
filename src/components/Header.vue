<script setup lang="ts">
import { Button } from "primevue";
import { computed, inject } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

// Props
defineProps<{
  showAddButton?: boolean;
}>();

// Динамический заголовок в зависимости от маршрута
const headerTitle = computed(() => {
  return route.meta.title || "";
});

// Получаем функцию открытия модального окна из provide
const openCreateModal = inject<() => void>("openCreateModal", () => {});

// Обработчик клика по кнопке
const handleCreateRequest = () => {
  openCreateModal();
};
</script>

<template>
  <header
    class="header! py-2 px-4 bg-(--white) flex items-center justify-between sticky top-0 border-b border-(--border) z-10"
  >
    <h5 class="text-(--title) font-semibold">{{ headerTitle }}</h5>

    <Button
      v-if="showAddButton"
      type="button"
      label="Создать заявку"
      icon="pi pi-plus-circle"
      class="create-request-btn"
      @click="handleCreateRequest"
    />
  </header>
</template>

<style scoped>
/* Кнопка "Создать заявку" - как в макете: синий фон #2563EB, белый текст, иконка плюса */
.create-request-btn {
  background-color: #2563EB !important;
  border: none !important;
  color: white !important;
  border-radius: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.create-request-btn:hover {
  background-color: #1d4ed8 !important;
}

.create-request-btn .p-button-icon {
  font-size: 1rem;
}
</style>
