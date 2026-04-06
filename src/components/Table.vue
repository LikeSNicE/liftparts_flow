<script setup lang="ts">
import type { StatusOption } from "@/data/statusOptionsData";
import type { TableHeader } from "@/types/TableTypes";
import { Dropdown, InputText } from "primevue";
import { useViewModeTable } from "@/composables/useViewModeTable";

import { getStatusColor } from "@/utils/getStatusColor";
import { getStatusLabel } from "@/utils/getStatusLabel";
import { formatDate } from "@/utils/formatDate";
import { getUrgencyColor } from "@/utils/getUrgencyOption";
import { getUrgencyLabel } from "@/utils/getUrgencyLabel";

interface TableProps {
  headerTitle?: string;
  searchQuery?: string;
  selectedStatus?: string;
  statusOptions?: StatusOption[];
  tableHeaders?: TableHeader[];
  filteredRequests?: any[];
  showFilters?: boolean;
}

const {
  headerTitle,
  searchQuery,
  selectedStatus,
  statusOptions,
  filteredRequests,
  tableHeaders,
  showFilters = true,
} = defineProps<TableProps>();

const emit = defineEmits<{
  (e: "update:searchQuery", value: string): void;
  (e: "update:selectedStatus", value: string): void;
}>();

const { viewMode, changeViewMode } = useViewModeTable();
</script>

<template>
  <div class="bg-white rounded-lg p-6 shadow-sm">
    <slot name="header">
      <div class="flex items-center justify-between mb-4">
        <h5 v-if="headerTitle" class="font-semibold text-(--title)">
          {{ headerTitle }}
        </h5>

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
      </div>
    </slot>

    <slot name="filters" v-if="showFilters">
      <div class="flex gap-4 mb-4">
        <div class="flex-auto">
          <input-text
            :model-value="searchQuery"
            @update:model-value="emit('update:searchQuery', $event ?? '')"
            placeholder="Поиск по id, ФИО автора"
            class="w-full"
          ></input-text>
        </div>
        <dropdown
          :model-value="selectedStatus"
          @update:model-value="emit('update:selectedStatus', $event)"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          placeholder="Статус"
          class="w-48"
        ></dropdown>
      </div>
    </slot>

    <slot name="table">
      <div v-if="viewMode === 'table'" class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <slot name="thead">
              <tr class="text-left bg-(--bg) text-(--text)">
                <th
                  class="px-4 py-3 font-semibold"
                  v-for="th in tableHeaders"
                  :key="th.label"
                >
                  {{ th.label }}
                </th>
              </tr>
            </slot>
          </thead>

          <tbody>
            <tr
              class="border-t border-(--border) hover:bg-(--bg) cursor-pointer"
              v-for="request in filteredRequests"
              :key="request.id"
            >
              <td
                v-for="header in tableHeaders"
                :key="header.value"
                class="px-4 py-3 text-(--text) text-sm"
              >
                <slot
                  :name="`cell-${header.value}`"
                  :item="request"
                  :value="request[header.value]"
                  :label="header.value"
                >
                  {{ request[header.value] }}
                </slot>
              </td>
            </tr>
          </tbody>
        </table>

        <div
          v-if="filteredRequests?.length === 0"
          class="text-center py-8 text-(--placeholder)"
        >
          <slot name="empty"> Данные не найдены </slot>
        </div>
      </div>
    </slot>

    <!-- <slot name="list">
      <div v-if="viewMode === 'list'" class="flex flex-col gap-4">
        <div
          v-for="request in filteredRequests"
          :key="request.id"
          class="bg-(--bg) rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors flex flex-col gap-3"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-auto">
              <div class="flex flex-wrap gap-3 text-sm text-(--text)">
                <span
                  ><span class="text-gray-500">Автор:</span>
                  {{ request.author }}</span
                >
                <span v-if="request.liftId"
                  ><span class="text-gray-500">ID лифта:</span>
                  <span class="font-mono">{{ request.liftId }}</span></span
                >
                <span
                  ><span class="text-gray-500">Дата:</span>
                  {{ formatDate(request.createdAt) }}</span
                >
              </div>
            </div>
            <div class="flex gap-2 items-center">
              <div
                class="rounded-full text-xs font-medium whitespace-nowrap px-3 py-1"
                :class="getUrgencyColor(request.urgency)"
              >
                {{ getUrgencyLabel(request.urgency) }}
              </div>

              <div
                class="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                :class="getStatusColor(request.status)"
              >
                {{ getStatusLabel(request.status) }}
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </slot> -->
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
