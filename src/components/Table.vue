<script setup lang="ts">
import type { TableHeader } from "@/types/TableTypes";

interface TableProps {
  tableHeaders?: TableHeader[];
  data?: any[];
}

const { data, tableHeaders } = defineProps<TableProps>();
</script>

<template>
  <div class="overflow-x-auto">
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
          v-for="request in data"
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
              :label="header.label"
            >
              {{ request[header.value] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <div
      v-if="data?.length === 0"
      class="text-center py-8 text-(--placeholder)"
    >
      <slot name="empty"> Данные не найдены </slot>
    </div>
  </div>
</template>
