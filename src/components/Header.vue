<script setup lang="ts">
import { Button } from "primevue";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

// Props и Emits
defineProps<{
  showAddButton?: boolean;
}>();

const emit = defineEmits<{
  addEmployee: [];
}>();

// Динамический заголовок в зависимости от маршрута
const headerTitle = computed(() => {
  const titles: Record<string, string> = {
    "/": "Главная",
    "/users": "Сотрудники",
    "/admin": "Панель администратора",
    "/mechanic": "Механик",
    "/manager": "Менеджер",
    "/dashboard": "Дашборд",
    "/requests": "Заявки",
    "/parts": "Каталог деталей",
    "/orders": "Заказы",
    "/settings": "Настройки",
  };
  return titles[route.path] || "Заголовок";
});

const handleAddEmployee = () => {
  emit("addEmployee");
};
</script>

<template>
  <header class="header! py-2 px-4 bg-(--white) flex items-center justify-between border-b border-(--border) sticky top-0">
    <h5 class="text-(--title) font-semibold">{{ headerTitle }}</h5>

    <Button
      v-if="showAddButton"
      type="button"
      label="Добавить сотрудника"
      icon="pi pi-plus"
      class="add-employee-btn"
      @click="handleAddEmployee"
    />
    <Button
      v-else
      type="button"
      label="Новая заявка"
      icon="pi pi-plus-circle"
      class="bg-(--blue)! border-none!"
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
