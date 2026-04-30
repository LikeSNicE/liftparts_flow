<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Button } from "primevue";
import ModalWarehouseIncome from "@/components/warehouse/ModalWarehouseIncome.vue";
import ModalWarehouseWriteOff from "@/components/warehouse/ModalWarehouseWriteOff.vue";
import ModalWarehouseIssue from "@/components/warehouse/ModalWarehouseIssue.vue";
import type { Part } from "@/types/PartsTypes";
import { usePartsStore } from "@/stores/usePartsStore";
import { storeToRefs } from "pinia";
import { useModalStore } from "@/stores/useModalStore";

import Table from "@/components/Table.vue";
import List from "@/components/List.vue";
import Card from "@/components/Card.vue";
import ViewMode from "@/components/ViewMode.vue";
import SectionFilters from "@/components/SectionFilters.vue";
import { warehouseTableHeaders } from "@/data/warehouseTableData";
import { useFilter } from "@/composables/useFilter";
import { useViewMode } from "@/composables/useViewMode";

import { getPartColor, getPartStatus } from "@/utils/entityHelpers";
import { warehouseStatusPartData } from "@/data/warehouseTableData";

const partsStore = usePartsStore();
const { partsList } = storeToRefs(partsStore);

const modalStore = useModalStore();

const { searchQuery, selectedStatus } = useFilter();
const { viewMode } = useViewMode();

// Модальные окна
const isWriteOffModalVisible = ref(false);
const isIssueModalVisible = ref(false);

// Текущая выбранная запчасть
const selectedPart = ref<Part | null>(null);

// Данные склада на основе partOptions
const warehouseParts = ref(partsList);

// Фильтрация по поиску
const filteredParts = computed(() => {
  let result = warehouseParts.value;

  if (selectedStatus.value) {
    result = result.filter((part) => part.status === selectedStatus.value);
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((part) => part.name.toLowerCase().includes(query));
  }

  return result;
});

// Открытие модальных окон
const openIncomeModal = (part: Part) => {
  selectedPart.value = part;
  modalStore.openModal("warehouseIncome");
};

const openWriteOffModal = (part: Part) => {
  selectedPart.value = part;
  isWriteOffModalVisible.value = true;
};

// Обработчики операций

const handleWriteOff = (quantity: number) => {
  if (selectedPart.value) {
    const part = warehouseParts.value.find(
      (p) => p.id === selectedPart.value!.id,
    );
    if (part && part.quantity >= quantity) {
      part.quantity -= quantity;
    }
  }
  isWriteOffModalVisible.value = false;
};

const handleIssue = (quantity: number) => {
  if (selectedPart.value) {
    const part = warehouseParts.value.find(
      (p) => p.id === selectedPart.value!.id,
    );
    if (part && part.quantity >= quantity) {
      part.quantity -= quantity;
    }
  }
  isIssueModalVisible.value = false;
};

onMounted(() => partsStore.getParts());
</script>

<template>
  <div class="warehouse-page">
    <Card>
      <div class="mb-4 flex items-center justify-between">
        <h5 class="font-semibold text-(--title)">Склад запчастей</h5>
        <ViewMode />
      </div>

      <SectionFilters
        @update:searchQuery="searchQuery = $event"
        @update:selectedStatus="selectedStatus = $event"
        :search-query="searchQuery"
        :selected-status="selectedStatus"
        :status-options-data="warehouseStatusPartData"
      />

      <Table
        v-if="viewMode === 'table'"
        :table-headers="warehouseTableHeaders"
        :data="filteredParts"
      >
        <template #cell-status="{ item }">
          <span
            class="px-2 py-1 rounded-full text-xs"
            :class="getPartColor(item.status)"
          >
            {{ getPartStatus(item.status) }}
          </span>
        </template>

        <template #cell-actions="{ item }">
          <div class="flex gap-2">
            <Button
              label="Приход"
              size="small"
              severity="success"
              @click="openIncomeModal(item)"
            />
            <Button
              label="Списание"
              size="small"
              severity="danger"
              @click="openWriteOffModal(item)"
            />
          </div>
        </template>

        <template #empty>
          <div class="text-center py-12">
            <i class="pi pi-inbox text-6xl text-gray-300"></i>
            <p class="mt-4 text-gray-600">Запчастей пока нет</p>
          </div>
        </template>
      </Table>

      <List v-if="viewMode === 'list'" :data="filteredParts">
        <template #list-content="{ item }">
          <div class="flex flex-col gap-2">
            <div class="flex flex-wrap gap-3 text-sm text-(--text)">
              <span>
                <span class="text-gray-500">Название:</span>
                {{ item.name }}
              </span>
              <span>
                <span class="text-gray-500">Количество:</span>
                {{ item.quantity }}
              </span>
              <span>
                <span class="text-gray-500">Единица:</span>
                {{ item.unit }}
              </span>
            </div>

            <div class="flex gap-2">
              <span
                class="rounded-full text-xs font-medium whitespace-nowrap px-3 py-1"
                :class="getPartColor(item.status)"
              >
                {{ getPartStatus(item.status) }}
              </span>
            </div>
          </div>
        </template>

        <template #list-actions="{ item }">
          <div class="flex gap-2">
            <Button
              @click.stop="openIncomeModal(item)"
              severity="success"
              type="button"
              size="small"
              icon="pi pi-plus"
            />
            <Button
              @click.stop="openWriteOffModal(item)"
              severity="danger"
              type="button"
              size="small"
              icon="pi pi-minus"
            />
          </div>
        </template>
      </List>
    </Card>

    <!-- Модальные окна -->
    <ModalWarehouseIncome v-if="selectedPart" :part="selectedPart" />

    <ModalWarehouseWriteOff
      v-if="selectedPart"
      :visible="isWriteOffModalVisible"
      :part="selectedPart"
      @close="isWriteOffModalVisible = false"
      @confirm="handleWriteOff"
    />

    <ModalWarehouseIssue
      v-if="selectedPart"
      :visible="isIssueModalVisible"
      :part="selectedPart"
      @close="isIssueModalVisible = false"
      @confirm="handleIssue"
    />
  </div>
</template>

<style scoped>
.warehouse-card {
  border: 1px solid var(--border);
}

table {
  border-collapse: collapse;
}

th {
  font-weight: 600;
}
</style>
