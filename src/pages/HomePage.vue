<script setup lang="ts">
import SideBar from "@/components/SideBar.vue";
import { RouterView, useRoute } from "vue-router";
import Header from "@/components/Header.vue";
import { computed, ref, provide } from "vue";

const route = useRoute();

// Ref для хранения метода из EmployeesPage
const openAddEmployeeFn = ref<(() => void) | null>(null);

// Предоставляем функцию для регистрации метода
provide("registerOpenAddEmployee", (fn: () => void) => {
  openAddEmployeeFn.value = fn;
});

// Обработчик кнопки из Header
const handleAddEmployee = () => {
  openAddEmployeeFn.value?.();
};

// Показывать кнопку только на странице сотрудников
const showAddButton = computed(() => route.path === "/users");
</script>

<template>
  <div class="home-layout">
    <SideBar />

    <Header 
      :show-add-button="showAddButton"
      @add-employee="handleAddEmployee"
    />
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
