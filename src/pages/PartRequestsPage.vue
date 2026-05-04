<script setup lang="ts">
import ModalNewPartsRequest from "@/components/parts/ModalNewPartsRequest.vue";
import { storeToRefs } from "pinia";
import { usePartsRequestStore } from "@/stores/usePartsRequestStore";
import { useUserStore } from "@/stores/useUserStore";

import { useRole } from "@/composables/useRole";
import type { PartsRequest } from "@/types/PartsRequestTypes";
import { ref, computed, onMounted } from "vue";
import { formatDate } from "@/utils/formatDate";
import Table from "@/components/Table.vue";
import { useFilter } from "@/composables/useFilter";
import { statusOptionsData } from "@/data/statusOptionsData";
import { partsRequestTableHeaders } from "@/data/partsRequestData";

import {
  getStatusColor,
  getStatusLabel,
  getUrgencyColor,
  getUrgencyLabel,
} from "@/utils/entityHelpers";
import { Button } from "primevue";
import ModalEditPartsRequest from "@/components/parts/ModalEditPartsRequest.vue";
import { useModalStore } from "@/stores/useModalStore";
import Card from "@/components/Card.vue";
import ViewMode from "@/components/ViewMode.vue";
import SectionFilters from "@/components/SectionFilters.vue";
import { useViewMode } from "@/composables/useViewMode";
import List from "@/components/List.vue";

const { searchQuery, selectedStatus } = useFilter();

const partsRequestStore = usePartsRequestStore();
const { partsRequestList } = storeToRefs(partsRequestStore);

const userStore = useUserStore();
const { userData } = storeToRefs(userStore);

const { can } = useRole();

const modalStore = useModalStore();

const { viewMode } = useViewMode();

const userFilteredRequests = computed(() => {
  if (can(["admin", "warehouse_operator"])) {
    return partsRequestList.value;
  }

  return partsRequestList.value.filter(
    (request: PartsRequest) => request.authorId === userData.value?.id,
  );
});

const filteredRequests = computed(() => {
  let result = userFilteredRequests.value;

  if (selectedStatus.value) {
    result = result.filter(
      (request) => request.status === selectedStatus.value,
    );
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((r) => {
      return (
        r.id.toString().toLowerCase().includes(query) ||
        r.purpose.toLowerCase().includes(query) ||
        r.author.toLowerCase().includes(query)
      );
    });
  }

  return result;
});

const currentPartRequest = ref<PartsRequest | null>(null);

const openEditModal = (request: PartsRequest) => {
  currentPartRequest.value = request;
  modalStore.openModal("editPartsRequest");
};

const handleDeleteRequest = async (requestId: number) => {
  await partsRequestStore.deleteRequest(requestId);
};

onMounted(() => partsRequestStore.getPartsRequests());
</script>

<template>
  <Card>
    <div class="mb-4 flex items-center justify-between">
      <h5 class="font-semibold text-(--title)">Список заявок по запчястам</h5>
      <ViewMode />
    </div>

    <SectionFilters
      @update:searchQuery="searchQuery = $event"
      @update:selectedStatus="selectedStatus = $event"
      :search-query="searchQuery"
      :selected-status="selectedStatus"
      :status-options-data="statusOptionsData"
    />
    <Table
      v-if="viewMode === 'table'"
      :table-headers="partsRequestTableHeaders"
      :data="filteredRequests"
    >
      <template #cell-createdAt="{ value }">
        {{ formatDate(value) }}
      </template>

      <!-- Кастомизируем ячейку автора -->
      <template #cell-author="{ item }">
        <div class="flex flex-col">
          <span class="font-medium">{{ item.author }}</span>
        </div>
      </template>

      <!-- Кастомизируем ячейку срочности -->
      <template #cell-urgency="{ value }">
        <span
          class="px-2 py-1 rounded-full text-xs"
          :class="[getUrgencyColor(value)]"
        >
          {{ getUrgencyLabel(value) }}
        </span>
      </template>

      <!-- Кастомизируем ячейку статуса -->
      <template #cell-status="{ value }">
        <span
          class="px-2 py-1 rounded-full text-xs"
          :class="[getStatusColor(value)]"
        >
          {{ getStatusLabel(value) }}
        </span>
      </template>

      <!-- Кастомизируем ячейку запчастей -->
      <template #cell-parts="{ value }">
        {{ value.length }}
      </template>

      <!-- Кастомизируем ячейку действий -->
      <template #cell-actions="{ item }">
        <div class="flex gap-2">
          <Button
            @click.stop="openEditModal(item)"
            label="Просмотр"
            severity="success"
            type="button"
            size="small"
          />
          <Button
            @click.stop="handleDeleteRequest(item.id)"
            label="Удалить"
            severity="danger"
            type="button"
            size="small"
          />
        </div>
      </template>

      <!-- Кастомное пустое состояние -->
      <template #empty>
        <div class="text-center py-12">
          <i class="pi pi-inbox text-6xl text-gray-300"></i>
          <p class="mt-4 text-gray-600">Заявок пока нет</p>
        </div>
      </template>
    </Table>

    <List v-if="viewMode === 'list'" :data="filteredRequests">
      <template #list-content="{ item }">
        <div class="flex flex-col gap-2">
          <div class="flex flex-wrap gap-3 text-sm text-(--text)">
            <span>
              <span class="text-gray-500">Автор:</span>
              {{ item.author }}
            </span>
            <span v-if="item.liftId">
              <span class="text-gray-500">ID лифта:</span>
              <span class="font-mono">{{ item.liftId }}</span>
            </span>
            <span>
              <span class="text-gray-500">Дата:</span>
              {{ formatDate(item.createdAt) }}
            </span>
          </div>

          <div class="flex gap-2">
            <span
              class="rounded-full text-xs font-medium whitespace-nowrap px-3 py-1"
              :class="getUrgencyColor(item.urgency)"
            >
              {{ getUrgencyLabel(item.urgency) }}
            </span>

            <span
              class="rounded-full text-xs font-medium whitespace-nowrap px-3 py-1"
              :class="getStatusColor(item.status)"
            >
              {{ getStatusLabel(item.status) }}
            </span>
          </div>
        </div>
      </template>

      <template #list-actions="{ item }">
        <div class="flex gap-2">
          <Button
            @click.stop="openEditModal(item)"
            severity="success"
            type="button"
            size="small"
            icon="pi pi-eye"
          />
          <Button
            @click.stop="handleDeleteRequest(item.id)"
            severity="danger"
            type="button"
            size="small"
            icon="pi pi-trash"
          />
        </div>
      </template>
    </List>
  </Card>

  <modal-new-parts-request></modal-new-parts-request>

  <ModalEditPartsRequest
    v-if="currentPartRequest"
    :request="currentPartRequest"
  />
</template>
