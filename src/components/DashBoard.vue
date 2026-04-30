<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRepairRequestStore } from "@/stores/useRepairRequestStore";
import { useUserStore } from "@/stores/useUserStore";
import { useModalStore } from "@/stores/useModalStore";
import { storeToRefs } from "pinia";
import { formatDate } from "@/utils/formatDate";
import type {
  RepairRequest,
  RepairRequestForm,
} from "@/types/RepairRequestTypes";
import ModalViewRepairRequest from "./repair/ModalViewRepairRequest.vue";
import ModalEditRepairRequest from "./repair/ModalEditRepairRequest.vue";

import { getStatusColor, getStatusLabel } from "@/utils/entityHelpers";

const requestStore = useRepairRequestStore();
const userStore = useUserStore();
const modalStore = useModalStore();

const { requestList } = storeToRefs(requestStore);
const { userData } = storeToRefs(userStore);

onMounted(async () => {
  await requestStore.getRepairRequests();
});

// Статистика по статусам
const stats = computed(() => {
  const total = requestList.value.length;
  const active = requestList.value.filter(
    (r: RepairRequest) => r.status === "pending",
  ).length;
  const inProgress = requestList.value.filter(
    (r) => r.status === "in_progress",
  ).length;
  const completed = requestList.value.filter(
    (r) => r.status === "completed",
  ).length;

  return { total, active, inProgress, completed };
});

// Последние 5 заявок
const recentRequests = computed(() => {
  return [...requestList.value]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);
});

// Получить отображаемое название статуса
// const getStatusLabel = (status: RepairRequestStatus) => {
//   return statusOptionsData.find((s) => s.value === status)?.label || status;
// };

// Текущая заявка для просмотра/редактирования
const currentRequest = ref<RepairRequest | null>(null);

// Форма заявки
const requestForm = ref<RepairRequestForm | null>(null);

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

const resetRequestForm = () => {
  requestForm.value = null;
  currentRequest.value = null;
};

// Удаление заявки
const handleDeleteRequest = async (requestId: number) => {
  await requestStore.deleteRequest(requestId);
};
</script>

<template>
  <div class="dashboard-page">
    <!-- Приветствие -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-(--title) mb-1">
        Здравствуйте, {{ userData?.username }}!
      </h1>
      <p class="text-(--text)">
        Добро пожаловать в систему управления заявками LiftPartsFlow
      </p>
    </div>

    <!-- Карточки статистики -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Активные заявки -->
      <div class="stats-card">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="stats-icon-bg blue">
              <i class="pi pi-clock text-(--blue)"></i>
            </div>
            <span class="text-sm font-medium text-(--text)"
              >Активные заявки</span
            >
          </div>
        </div>
        <div class="text-3xl font-bold text-(--title)">{{ stats.active }}</div>
        <div class="text-xs text-(--placeholder) mt-1">Требуют внимания</div>
      </div>

      <!-- В работе -->
      <div class="stats-card">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="stats-icon-bg orange">
              <i class="pi pi-wrench text-orange-700"></i>
            </div>
            <span class="text-sm font-medium text-(--text)">В работе</span>
          </div>
        </div>
        <div class="text-3xl font-bold text-(--title)">
          {{ stats.inProgress }}
        </div>
        <div class="text-xs text-(--placeholder) mt-1">
          В процессе выполнения
        </div>
      </div>

      <!-- Выполнено -->
      <div class="stats-card">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="stats-icon-bg purple">
              <i class="pi pi-check-circle text-(--purple)"></i>
            </div>
            <span class="text-sm font-medium text-(--text)">Выполнено</span>
          </div>
        </div>
        <div class="text-3xl font-bold text-(--title)">
          {{ stats.completed }}
        </div>
        <div class="text-xs text-(--placeholder) mt-1">Завершённые заявки</div>
      </div>

      <!-- Всего заявок -->
      <div class="stats-card">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="stats-icon-bg green">
              <i class="pi pi-folder text-green-700"></i>
            </div>
            <span class="text-sm font-medium text-(--text)">Всего заявок</span>
          </div>
        </div>
        <div class="text-3xl font-bold text-(--title)">{{ stats.total }}</div>
        <div class="text-xs text-(--placeholder) mt-1">Общее количество</div>
      </div>
    </div>

    <!-- Последние заявки -->
    <div class="requests-table-card">
      <div
        class="flex items-center justify-between p-5 border-b border-(--border)"
      >
        <h2 class="text-lg font-semibold text-(--title)">Последние заявки по ремонту</h2>
        <router-link
          to="/repair-requests"
          class="text-sm text-(--blue) hover:underline font-medium"
        >
          Все заявки <i class="pi pi-arrow-right text-xs ml-1"></i>
        </router-link>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left bg-(--bg) text-(--text) text-sm">
              <th class="px-5 py-3 font-semibold">№</th>
              <th class="px-5 py-3 font-semibold">Дата создания</th>
              <th class="px-5 py-3 font-semibold">ID работника</th>
              <th class="px-5 py-3 font-semibold">ID лифта</th>
              <th class="px-5 py-3 font-semibold">Статус</th>
              <th class="px-5 py-3 font-semibold">Убрать</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="request in recentRequests"
              :key="request.id"
              class="border-t border-(--border) hover:bg-(--bg) cursor-pointer transition-colors"
              @click="openViewModal(request)"
            >
              <td class="px-5 py-4 text-(--text)">
                <span class="font-semibold">{{ request.id }}</span>
              </td>
              <td class="px-5 py-4 text-(--text) text-sm">
                {{ formatDate(request.createdAt) }}
              </td>
              <td class="px-5 py-4 text-(--text)">
                {{ request.authorId }}
              </td>
              <td class="px-5 py-4 text-(--text)">
                <span class="font-mono">{{ request.liftId }}</span>
              </td>
              <td class="px-5 py-4">
                <span
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="getStatusColor(request.status)"
                >
                  {{ getStatusLabel(request.status) }}
                </span>
              </td>
              <td class="px-5 py-4 text-(--text)">
                <button
                  class="w-10 h-10 p-3 rounded-full hover:text-(--red) text-center"
                  @click.stop="handleDeleteRequest(request.id)"
                >
                  <i class="pi pi-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="recentRequests.length === 0">
              <td
                :colspan="6"
                class="px-5 py-12 text-center text-(--placeholder)"
              >
                <i class="pi pi-inbox text-4xl mb-3 block"></i>
                Список заявок пуст
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Модальное окно просмотра заявки -->
    <ModalViewRepairRequest
      v-if="
        modalStore.modalState.viewRepairRequest && requestForm && currentRequest
      "
      :requestForm="requestForm"
      :current-request="currentRequest"
      @reset-request-form="resetRequestForm"
    />

    <ModalEditRepairRequest
      v-if="
        modalStore.modalState.editRepairRequest && requestForm && currentRequest
      "
      :requestForm="requestForm"
      :current-request="currentRequest"
      @reset-request-form="resetRequestForm"
    />
  </div>
</template>

<style scoped>
.dashboard-page {
  padding: 0;
}

/* Карточки статистики */
.stats-card {
  background: var(--white);
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border);
}

.stats-icon-bg {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-icon-bg.blue {
  background-color: var(--blue-bg);
}

.stats-icon-bg.orange {
  background-color: #ffedd5;
}

.stats-icon-bg.purple {
  background-color: var(--purple-bg);
}

.stats-icon-bg.green {
  background-color: #dcfce7;
}

/* Карточка таблицы заявок */
.requests-table-card {
  background: var(--white);
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border);
}

/* Заголовок "Последние заявки" */
.requests-table-card h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--title);
}

/* Hover эффект для строк таблицы */
tbody tr:hover {
  background-color: var(--bg);
}
</style>
