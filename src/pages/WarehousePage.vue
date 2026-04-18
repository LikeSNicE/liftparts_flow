<script setup lang="ts">
import { ref, computed } from "vue";
import { InputText, Button } from "primevue";
import ModalWarehouseIncome from "@/components/warehouse/ModalWarehouseIncome.vue";
import ModalWarehouseWriteOff from "@/components/warehouse/ModalWarehouseWriteOff.vue";
import ModalWarehouseIssue from "@/components/warehouse/ModalWarehouseIssue.vue";
import type { Part } from "@/types/PartsTypes";
import { usePartsStore } from "@/stores/usePartsStore";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import { useModalStore } from "@/stores/useModalStore";

import Table from "@/components/Table.vue";
import { warehouseTableHeaders } from "@/data/warehouseTableData";
import { useFilter } from "@/composables/useFilter";
import { getPartStatus } from "@/utils/getPartStatus";
import { getPartColor } from "@/utils/getPartColor";
import { warehouseStatusPart } from "@/data/warehouseTableData";

const partsStore = usePartsStore();
const { partsList } = storeToRefs(partsStore);

const modalStore = useModalStore();
// Модальные окна
const isWriteOffModalVisible = ref(false);
const isIssueModalVisible = ref(false);

// Текущая выбранная запчасть
const selectedPart = ref<Part | null>(null);

const { searchQuery, selectedStatus } = useFilter();

// Данные склада на основе partOptions
const warehouseParts = ref(partsList);

// Фильтрация по поиску
const filteredParts = computed(() => {
  let result = warehouseParts.value;

  if (selectedStatus.value) {
    result = result.filter(
      (part) => part.status === selectedStatus.value,
    );
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
  <div class="warehouse-page flex flex-col gap-6">
    <Table
      header-title="Склад запчастей"
      :search-query="searchQuery"
      :table-headers="warehouseTableHeaders"
      :selected-status="selectedStatus"
      :status-options-data="warehouseStatusPart"
      :data="filteredParts"
      @update:searchQuery="searchQuery = $event"
      :show-view-mode="false"
      @update:selectedStatus="selectedStatus = $event"
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
    </Table>

  

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
