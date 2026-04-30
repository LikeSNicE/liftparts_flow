<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Button } from "primevue";

import type {
  RepairRequest,
  RepairRequestForm,
} from "@/types/RepairRequestTypes";
import { useRepairRequestStore } from "@/stores/useRepairRequestStore";
import { useUserStore } from "@/stores/useUserStore";
import { storeToRefs } from "pinia";
import { useRole } from "@/composables/useRole";
import { formatDate } from "@/utils/formatDate";
import { useElevatorStore } from "@/stores/useElevatorStore";
import { statusOptionsData } from "@/data/statusOptionsData";
import ModalNewRepairRequest from "@/components/repair/ModalNewRepairRequest.vue";
import ModalViewRepairRequest from "@/components/repair/ModalViewRepairRequest.vue";
import ModalEditRepairRequest from "@/components/repair/ModalEditRepairRequest.vue";

import { useModalStore } from "@/stores/useModalStore";

import { getStatusColor, getStatusLabel } from "@/utils/entityHelpers";
import Table from "@/components/Table.vue";
import List from "@/components/List.vue";
import Card from "@/components/Card.vue";
import ViewMode from "@/components/ViewMode.vue";
import SectionFilters from "@/components/SectionFilters.vue";
import { useFilter } from "@/composables/useFilter";
import { useViewMode } from "@/composables/useViewMode";
import { repairRequestTableHeaders } from "@/data/repairRequestData";

const { searchQuery, selectedStatus } = useFilter();

const requestStore = useRepairRequestStore();
const userStore = useUserStore();
const elevatorStore = useElevatorStore();
const { can } = useRole();
const modalStore = useModalStore();

const { viewMode } = useViewMode();

const { requestList } = storeToRefs(requestStore);
const { userData } = storeToRefs(userStore);
const { elevatorList } = storeToRefs(elevatorStore);

onMounted(async () => {
  await requestStore.getRepairRequests();
  await elevatorStore.getElevators();
});

// Фильтрация заявок: админ и склад видят все, механик только свои
const userFilteredRequests = computed(() => {
  if (can(["admin", "warehouse_operator"])) {
    return requestList.value;
  }
  // Механик видит только свои заявки
  return requestList.value.filter(
    (request) => request.authorId === userData.value?.id,
  );
});

// Итоговая фильтрация (поиск + статус)
const filteredRequests = computed(() => {
  let result = userFilteredRequests.value;

  // Фильтр по статусу
  if (selectedStatus.value) {
    result = result.filter((r) => r.status === selectedStatus.value);
  }

  // Поиск по названию, автору или ID лифта
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (r) =>
        r.id.toString().toLowerCase().includes(query) ||
        r.authorId.toString().toLowerCase().includes(query) ||
        r.liftId.toString().toLowerCase().includes(query),
    );
  }

  return result;
});

// Текущая заявка для просмотра/ редактирования
const currentRequest = ref<RepairRequest | null>(null);

// форма заявки
const createRequestEmptyForm = (): RepairRequestForm => ({
  author: userData.value?.username || "",
  authorId: userData.value?.id || 0,
  status: "pending",
  liftId: 0,
  type: "planned",
  parts: [],
  objectAddress: "",
  city: "Астана",
  latitude: null,
  longitude: null,
  comment: "",
  selectedProblems: [],
  emergencyOtherProblem: "",
});

const requestForm = ref<RepairRequestForm>(createRequestEmptyForm());

const resetRequestForm = () => {
  requestForm.value = {
    author: "",
    authorId: 0,
    status: "pending",
    liftId: 0,
    type: "planned",
    parts: [],
    objectAddress: "",
    city: "Астана",
    latitude: null,
    longitude: null,
    comment: "",
    selectedProblems: [],
    emergencyOtherProblem: "",
  };
};

// Открыть модальное окно для просмотра/редактирования
const openViewModal = (request: RepairRequest) => {
  currentRequest.value = request;

  requestForm.value = {
    author: request.author,
    authorId: request.authorId,
    status: request.status,
    liftId: request.liftId,
    type: request.type,
    parts: request.parts,
    objectAddress: request.objectAddress,
    city: request.city || "Астана",
    latitude: request.latitude ?? null,
    longitude: request.longitude ?? null,
    comment: request.comment || "",
    selectedProblems: request.selectedProblems,
    emergencyOtherProblem: request.emergencyOtherProblem,
  };

  modalStore.openModal("viewRepairRequest");
};

// Удаление заявки из списка заявок
const handleDeleteRequest = async (requestId: number) => {
  requestStore.deleteRequest(requestId);
};
</script>

<template>
  <Card>
    <div class="mb-4 flex items-center justify-between">
      <h5 class="font-semibold text-(--title)">Список заявок по ремонту</h5>
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
      :table-headers="repairRequestTableHeaders"
      :data="filteredRequests"
    >
      <template #cell-createdAt="{ item }">
        {{ formatDate(item.createdAt) }}
      </template>

      <template #cell-status="{ item }">
        <span
          class="px-3 py-1 rounded-full text-xs font-medium"
          :class="getStatusColor(item.status)"
        >
          {{ getStatusLabel(item.status) }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex gap-2">
          <Button
            label="Просмотр"
            size="small"
            @click.stop="openViewModal(item)"
          />
          <Button
            label="Удалить"
            size="small"
            severity="danger"
            @click.stop="handleDeleteRequest(item.id)"
          />
        </div>
      </template>

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
            <span>
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
            @click.stop="openViewModal(item)"
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

  <!-- Модальное окно просмотра/редактирования заявки -->
  <ModalViewRepairRequest
    v-if="modalStore.modalState.viewRepairRequest"
    :requestForm="requestForm"
    :current-request="currentRequest"
    @reset-request-form="resetRequestForm"
  />

  <ModalEditRepairRequest
    v-if="modalStore.modalState.editRepairRequest"
    :requestForm="requestForm"
    :current-request="currentRequest"
    @reset-request-form="resetRequestForm"
  />

  <!-- Модальное окно создания новой заявки -->
  <ModalNewRepairRequest
    v-if="modalStore.modalState.createRepairRequest"
    :requestForm="requestForm"
    :elevatorList="elevatorList"
  />
</template>

<style scoped>
.requests-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Заголовок "Список заявок" */
.requests-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

/* Кнопка "Сохранить" - синяя #2563EB */
.save-btn {
  background-color: #2563eb !important;
  border: none !important;
  color: white !important;
  border-radius: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-weight: 500;
}

.save-btn:hover {
  background-color: #1d4ed8 !important;
}

/* Кнопка "Редактировать" */
.edit-btn {
  background-color: #2563eb !important;
  border: none !important;
  color: white !important;
  border-radius: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-weight: 500;
}

.edit-btn:hover {
  background-color: #1d4ed8 !important;
}

/* Кнопка "Отправить заявку" - как в макете */
.submit-btn {
  background-color: #2563eb !important;
  border: none !important;
  color: white !important;
  border-radius: 0.5rem;
  padding: 0.625rem 2rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.submit-btn:hover {
  background-color: #1d4ed8 !important;
}

/* Кнопка "Отмена" */
:deep(.submit-btn + .p-button) {
  color: #94a3b8;
}

/* Hover эффект для строк таблицы */
tbody tr:hover {
  background-color: #f1f5f9;
}

/* Отключаем cursor для кнопок внутри переключателя */
button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Стили для модального окна */
:deep(.p-dialog-header) {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.p-dialog-header .p-dialog-title) {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

:deep(.p-dialog-content) {
  padding: 1.5rem;
  overflow-x: hidden;
  overflow-y: auto;
  max-height: calc(100vh - 200px); /* Высота модального окна - 200px */
}

:deep(.p-dialog-footer) {
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #e2e8f0;
}

:deep(.p-dialog) {
  max-width: 35rem;
}

/* Поля ввода */
:deep(.p-inputtext) {
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
}

:deep(.p-inputtext:focus) {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Textarea */
:deep(.p-textarea) {
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  resize: vertical;
}

/* Dropdown */
:deep(.p-dropdown) {
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

:deep(.p-dropdown:not(.p-disabled).p-focus) {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Лейблы */
label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

/* Переключатель Плановая/Аварийная */
button[class*="transition-colors"] {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Кнопка "Плановая" - активная (синяя) */
.planned-active {
  background-color: #2563eb !important;
  color: white !important;
  border: none;
}

.planned-active:hover {
  background-color: #1d4ed8 !important;
}

/* Кнопка "Плановая" - неактивная */
.planned-inactive {
  background-color: white !important;
  color: #94a3b8 !important;
  border: none;
}

.planned-inactive:hover {
  background-color: #f1f5f9 !important;
  color: #2563eb !important;
}

/* Кнопка "Аварийная" - активная (красная) */
.emergency-active {
  background-color: #dc2626 !important;
  color: white !important;
  border: none;
}

.emergency-active:hover {
  background-color: #b91c1c !important;
}

/* Кнопка "Аварийная" - неактивная */
.emergency-inactive {
  background-color: white !important;
  color: #94a3b8 !important;
  border: none;
}

.emergency-inactive:hover {
  background-color: #f1f5f9 !important;
  color: #dc2626 !important;
}

/* Кнопки переключателя вида (таблица/список) */
.view-mode-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background-color: white;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.view-mode-btn:hover {
  background-color: #f1f5f9;
  color: #2563eb;
}

.view-mode-btn.active {
  background-color: #2563eb;
  border-color: #2563eb;
  color: white;
}

/* Элемент списка заявок */
.request-item {
  transition: all 0.2s;
}

.request-item:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
