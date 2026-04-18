<script setup lang="ts">
import ModalNewPartsRequest from "@/components/parts/ModalNewPartsRequest.vue";
import { storeToRefs } from "pinia";
import { usePartsRequestStore } from "@/stores/usePartsRequestStore";
import { useUserStore } from "@/stores/useUserStore";
import { computed } from "vue";
import { useRole } from "@/composables/useRole";
import type { PartsRequest } from "@/types/PartsRequestTypes";
import { ref } from "vue";
import { onMounted } from "vue";
import { formatDate } from "@/utils/formatDate";
import Table from "@/components/Table.vue";
import { useFilter } from "@/composables/useFilter";
import { statusOptionsData } from "@/data/statusOptionsData";
import { partsRequestTableHeaders } from "@/data/partsRequestData";
import { getStatusLabel } from "@/utils/getStatusLabel";
import { getStatusColor } from "@/utils/getStatusColor";
import { getUrgencyColor } from "@/utils/getUrgencyOption";
import { getUrgencyLabel } from "@/utils/getUrgencyLabel";
import { Button } from "primevue";
import ModalEditPartsRequest from "@/components/parts/ModalEditPartsRequest.vue";
import { useModalStore } from "@/stores/useModalStore";

const { searchQuery, selectedStatus } = useFilter();

const partsRequestStore = usePartsRequestStore();
const { partsRequestList } = storeToRefs(partsRequestStore);

const userStore = useUserStore();
const { userData } = storeToRefs(userStore);

const { can } = useRole();

const modalStore = useModalStore();

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

onMounted(() => partsRequestStore.getPartsRequests());
</script>

<template>
  <Table
    header-title="Список заявок по запчястам"
    :search-query="searchQuery"
    :selected-status="selectedStatus"
    :status-options-data="statusOptionsData"
    :table-headers="partsRequestTableHeaders"
    :data="filteredRequests"
    @update:searchQuery="searchQuery = $event"
    @update:selectedStatus="selectedStatus = $event"
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
      <Button
        @click.stop="openEditModal(item)"
        label="Просмотр"
        severity="success"
        type="button"
        size="small"
      />
    </template>

    <!-- Кастомное пустое состояние -->
    <template #empty>
      <div class="text-center py-12">
        <i class="pi pi-inbox text-6xl text-gray-300"></i>
        <p class="mt-4 text-gray-600">Заявок пока нет</p>
      </div>
    </template>
  </Table>

  <modal-new-parts-request></modal-new-parts-request>

  <ModalEditPartsRequest
    v-if="currentPartRequest"
    :request="currentPartRequest"
  />
</template>
