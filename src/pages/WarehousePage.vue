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

const partsStore = usePartsStore();
const { partsList } = storeToRefs(partsStore);

const modalStore = useModalStore();
// Модальные окна
const isWriteOffModalVisible = ref(false);
const isIssueModalVisible = ref(false);

// Текущая выбранная запчасть
const selectedPart = ref<Part | null>(null);

// Поиск
const searchQuery = ref("");

// Данные склада на основе partOptions
const warehouseParts = ref(partsList);

// Фильтрация по поиску
const filteredParts = computed(() => {
  if (!searchQuery.value.trim()) {
    return warehouseParts.value;
  }
  const query = searchQuery.value.toLowerCase();
  return warehouseParts.value.filter((part) =>
    part.name.toLowerCase().includes(query),
  );
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

const openIssueModal = (part: Part) => {
  selectedPart.value = part;
  isIssueModalVisible.value = true;
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
    <div class="warehouse-card bg-white rounded-lg p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-(--title)">Склад запчастей</h2>
      </div>

      <!-- Поиск -->
      <div class="flex gap-4 mb-4">
        <div class="flex-auto">
          <InputText
            v-model="searchQuery"
            placeholder="Поиск по названию запчасти..."
            class="w-full"
          />
        </div>
      </div>

      <!-- Таблица -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-(--border)">
              <th class="text-left py-3 px-4 text-sm font-medium text-(--text)">
                ID
              </th>
              <th class="text-left py-3 px-4 text-sm font-medium text-(--text)">
                Название
              </th>
              <th class="text-left py-3 px-4 text-sm font-medium text-(--text)">
                Количество
              </th>
              <th class="text-left py-3 px-4 text-sm font-medium text-(--text)">
                Единица
              </th>
              <th class="text-left py-3 px-4 text-sm font-medium text-(--text)">
                Статус
              </th>
              <th class="text-left py-3 px-4 text-sm font-medium text-(--text)">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="part in filteredParts"
              :key="part.id"
              class="border-b border-(--border) hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-4 text-sm text-(--text)">{{ part.id }}</td>
              <td class="py-3 px-4 text-sm text-(--text)">{{ part.name }}</td>
              <td class="py-3 px-4 text-sm text-(--text)">
                {{ part.quantity }}
              </td>
              <td class="py-3 px-4 text-sm text-(--text)">{{ part.unit }}</td>
              <td class="py-3 px-4 text-sm">
                <span v-if="part.quantity === 0">
                  <span
                    class="px-2 py-1 bg-gray-400 text-(--white) rounded-full text-xs"
                  >
                    Нет в наличии
                  </span>
                </span>
                <span
                  v-else-if="
                    part.quantity > 0 && part.quantity <= part.minQuantity
                  "
                  class="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700"
                >
                  Низкий остаток
                </span>
                <span
                  v-else
                  class="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700"
                >
                  В наличии
                </span>
              </td>
              <td class="py-3 px-4">
                <div class="flex gap-2">
                  <Button
                    label="Приход"
                    size="small"
                    severity="success"
                    @click="openIncomeModal(part)"
                  />
                  <Button
                    label="Списание"
                    size="small"
                    severity="danger"
                    @click="openWriteOffModal(part)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div
          v-if="filteredParts.length === 0"
          class="text-center py-8 text-(--placeholder)"
        >
          Запчасти не найдены
        </div>
      </div>
    </div>

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
