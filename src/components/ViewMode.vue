<script setup lang="ts">
import { useViewMode } from "@/composables/useViewMode";

const { viewMode, changeViewMode } = useViewMode();
</script>

<template>
  <div class="flex items-center gap-2">
    <button
      type="button"
      class="view-mode-btn"
      title="Таблица"
      @click="changeViewMode('table')"
      :class="viewMode === 'table' ? 'active' : ''"
    >
      <i class="pi pi-table"></i>
    </button>
    <button
      type="button"
      class="view-mode-btn"
      title="Список"
      @click="changeViewMode('list')"
      :class="viewMode === 'list' ? 'active' : ''"
    >
      <i class="pi pi-list"></i>
    </button>
  </div>
</template>

<style scoped>
.view-mode-btn {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.view-mode-btn:hover {
  background: var(--blue-bg);
  color: var(--blue);
}

.view-mode-btn.active {
  background: var(--blue);
  color: white;
  border-color: var(--blue);
}
</style>
