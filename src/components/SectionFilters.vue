<script setup lang="ts">
import type { Option } from "@/types/OptionsTypes";
import { Dropdown, InputText } from "primevue";

interface SectionFiltersProps {
  searchQuery: string;
  selectedStatus: string;
  statusOptionsData: Option[];
}

const { searchQuery, selectedStatus, statusOptionsData } =
  defineProps<SectionFiltersProps>();

const emit = defineEmits<{
  (e: "update:searchQuery", value: string): void;
  (e: "update:selectedStatus", value: string): void;
}>();
</script>

<template>
  <div class="flex gap-4 mb-4">
    <div class="flex-auto">
      <input-text
        :model-value="searchQuery"
        @update:model-value="emit('update:searchQuery', $event ?? '')"
        placeholder="Поиск..."
        class="w-full"
      ></input-text>
    </div>
    <dropdown
      :model-value="selectedStatus"
      @update:model-value="emit('update:selectedStatus', $event)"
      :options="statusOptionsData"
      option-label="label"
      option-value="value"
      placeholder="Статус"
      class="w-48"
    ></dropdown>
  </div>
</template>
