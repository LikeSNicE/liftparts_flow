<script setup lang="ts">
import SideBar from "@/components/SideBar.vue";
import { RouterView, useRoute } from "vue-router";
import Header from "@/components/Header.vue";
import { computed } from "vue";

const route = useRoute();

// Показывать кнопку только на странице заявок
const showAddButton = computed(() => route.path === "/requests");
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
