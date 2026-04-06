<script setup lang="ts">
import { ref, onMounted, computed } from "vue";

import { InputText } from "primevue";
import { Dropdown } from "primevue";

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
import { statusOptions } from "@/data/statusOptionsData";
import ModalNewRequest from "@/components/repair/ModalNewRequest.vue";
import ModalViewRequest from "@/components/repair/ModalViewRequest.vue";
import { useModalStore } from "@/stores/useModalStore";
import ModalEditRequest from "@/components/repair/ModalEditRequest.vue";
import { getStatusColor } from "@/utils/getStatusColor";
import { getStatusLabel } from "@/utils/getStatusLabel";

type ViewMode = "table" | "list";

const requestStore = useRepairRequestStore();
const userStore = useUserStore();
const elevatorStore = useElevatorStore();
const { can } = useRole();
const modalStore = useModalStore();

const { requestList } = storeToRefs(requestStore);
const { userData } = storeToRefs(userStore);
const { elevatorList } = storeToRefs(elevatorStore);

onMounted(async () => {
  await requestStore.getRequests();
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

// Поиск по названию
const searchQuery = ref("");
// Фильтр по статусу
const selectedStatus = ref("");

// Вид отображения: 'table' или 'list'
const viewMode = ref<ViewMode>(
  (localStorage.getItem("requestsViewMode") as ViewMode) || "table",
);

const changeViewMode = (mode: ViewMode) => {
  localStorage.setItem("requestsViewMode", mode);
  viewMode.value = mode;
};

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
        r.author.toLowerCase().includes(query) ||
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
  <!-- Карточка со списком заявок -->
  <div class="bg-white rounded-lg p-6 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h5 class="font-semibold text-(--title)">Список заявок по ремонту</h5>

      <div class="flex items-center gap-2">
        <!-- Переключатель вида -->
        <button
          type="button"
          class="view-mode-btn"
          :class="viewMode === 'table' ? 'active' : ''"
          @click="changeViewMode('table')"
          title="Таблица"
        >
          <i class="pi pi-table"></i>
        </button>
        <button
          type="button"
          class="view-mode-btn"
          :class="viewMode === 'list' ? 'active' : ''"
          @click="changeViewMode('list')"
          title="Список"
        >
          <i class="pi pi-list"></i>
        </button>
      </div>
    </div>

    <!-- Поиск и фильтры -->
    <div class="flex gap-4 mb-4">
      <div class="flex-auto">
        <InputText
          v-model="searchQuery"
          placeholder="Поиск по id, автору или ID лифта..."
          class="w-full"
        />
      </div>
      <Dropdown
        v-model="selectedStatus"
        :options="statusOptions"
        option-label="label"
        option-value="value"
        placeholder="Статус"
        class="w-48"
      />
    </div>

    <!-- Вид: Таблица -->
    <div v-if="viewMode === 'table'" class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="text-left bg-(--bg) text-(--text)">
            <th class="px-4 py-3 font-semibold rounded-tl-lg">№</th>
            <th class="px-4 py-3 font-semibold">Дата создания</th>

            <th class="px-4 py-3 font-semibold">ID работника</th>
            <th class="px-4 py-3 font-semibold">ID лифта</th>
            <th class="px-4 py-3 font-semibold">Статус</th>

            <th class="px-4 py-3 font-semibold rounded-tr-lg">Убрать</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="request in filteredRequests"
            :key="request.id"
            class="border-t border-(--border) hover:bg-(--bg) cursor-pointer"
            @click="openViewModal(request)"
          >
            <td class="px-4 py-3 text-(--text)">
              <span class="font-semibold">{{ request.id }}</span>
            </td>
            <td class="px-4 py-3 text-(--text) text-sm">
              {{ formatDate(request.createdAt) }}
            </td>

            <td class="px-4 py-3 text-(--text)">
              {{ request.authorId }}
            </td>
            <td class="px-4 py-3 text-(--text)">
              <span>{{ request.liftId }}</span>
            </td>

            <td class="px-4 py-3">
              <span
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="getStatusColor(request.status)"
              >
                {{ getStatusLabel(request.status) }}
              </span>
            </td>

            <td class="px-4 py-3 text-(--text) text-sm">
              <button
                class="w-10 h-10 p-3 rounded-full hover:text-(--red) text-center"
                @click.stop="handleDeleteRequest(request.id)"
              >
                <i class="pi pi-trash"></i>
              </button>
            </td>
          </tr>
          <tr v-if="filteredRequests.length === 0">
            <td :colspan="6" class="px-4 py-8 text-center text-(--placeholder)">
              Список заявок пуст
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Вид: Список -->
    <div v-else class="flex flex-col gap-3">
      <div
        v-for="request in filteredRequests"
        :key="request.id"
        class="request-item bg-(--bg) rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors"
        @click="openViewModal(request)"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-auto">
            <h4 class="font-semibold text-(--title) mb-1">
              <!-- {{ request.title }} -->
            </h4>
            <div class="flex flex-wrap gap-3 text-sm text-(--text)">
              <span
                ><span class="text-gray-500">Автор:</span>
                {{ request.author }}</span
              >
              <span
                ><span class="text-gray-500">ID лифта:</span>
                <span class="font-mono">{{ request.liftId }}</span></span
              >
              <span
                ><span class="text-gray-500">Дата:</span>
                {{ formatDate(request.createdAt) }}</span
              >
            </div>
          </div>
          <span
            class="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
            :class="getStatusColor(request.status)"
          >
            {{ getStatusLabel(request.status) }}
          </span>
        </div>
      </div>
      <div
        v-if="filteredRequests.length === 0"
        class="text-center text-(--placeholder) py-8"
      >
        Список заявок пуст
      </div>
    </div>
  </div>

  <!-- Модальное окно просмотра/редактирования заявки -->
  <ModalViewRequest
    v-if="modalStore.modalState.viewRepairRequest"
    :requestForm="requestForm"
    :current-request="currentRequest"
    @reset-request-form="resetRequestForm"
  />

  <ModalEditRequest
    v-if="modalStore.modalState.editRepairRequest"
    :requestForm="requestForm"
    :current-request="currentRequest"
    @reset-request-form="resetRequestForm"
  />

  <!-- Модальное окно создания новой заявки -->
  <ModalNewRequest
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
