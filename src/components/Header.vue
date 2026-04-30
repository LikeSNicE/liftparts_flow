<script setup lang="ts">
import { Button } from "primevue";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useModalStore } from "@/stores/useModalStore";

const route = useRoute();
const modalStore = useModalStore();

// Props
defineProps<{
  showAddButton?: boolean;
}>();

// Динамический заголовок в зависимости от маршрута
const headerTitle = computed(() => {
  return route.meta.title || "";
});

// Обработчик клика по кнопке
const handleHeaderBtn = () => {
  switch (route.path) {
    case "/repair-requests":
      modalStore.openModal("createRepairRequest");
      break;
    case "/parts-requests":
      modalStore.openModal("createPartsRequest");
      break;
    default:
      // На всякий случай, если кнопка будет видна на других страницах
      console.warn("Неизвестный маршрут для создания заявки:", route.path);
      break;
  }
};
</script>

<template>
  <header
    class="header! px-4 bg-(--white) flex items-center justify-between sticky top-0 border-b border-(--border) z-10 h-16"
  >
    <h4 class="text-(--title) font-semibold">{{ headerTitle }}</h4>

    <Button
      v-if="showAddButton"
      type="button"
      :label="`Создать ${route.meta.title}`"
      icon="pi pi-plus-circle"
      class="create-request-btn"
      @click="handleHeaderBtn"
    />
  </header>
</template>

<style scoped>
/* Кнопка "Создать заявку" - как в макете: синий фон #2563EB, белый текст, иконка плюса */
.create-request-btn {
  background-color: #2563eb !important;
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
  text-transform: lowercase;
}

.create-request-btn:hover {
  background-color: #1d4ed8 !important;
}

.create-request-btn .p-button-icon {
  font-size: 1rem;
}
</style>
