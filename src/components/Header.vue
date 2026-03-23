<script setup lang="ts">
import { Button } from "primevue";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

// Props и Emits
defineProps<{
  showAddButton?: boolean;
}>();

// Динамический заголовок в зависимости от маршрута
const headerTitle = computed(() => {
  return route.meta.title || "";
});
</script>

<template>
  <header
    class="header! py-2 px-4 bg-(--white) flex items-center justify-between sticky top-0 border-b border-(--border) z-10"
  >
    <h5 class="text-(--title) font-semibold">{{ headerTitle }}</h5>

    <Button
      type="button"
      label="Новая заявка"
      icon="pi pi-plus-circle"
      class="add-employee-btn"
    />
  </header>
</template>

<style scoped>
/* Кнопка "Добавить сотрудника" - стиль как у "Новая заявка" */
.add-employee-btn {
  background-color: var(--blue) !important;
  border: none !important;
  color: white !important;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
}

.add-employee-btn:hover {
  background-color: #1d4ed8 !important;
}
</style>
