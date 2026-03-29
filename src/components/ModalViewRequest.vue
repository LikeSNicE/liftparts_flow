<script setup lang="ts">
import type { Request, RequestForm } from "@/types/RequestTypes";
import { Dialog, Dropdown, InputText, Button, Textarea } from "primevue";
import { computed } from "vue";
import {
  partOptions,
  emergencyProblems,
  statusOptions,
} from "@/data/requestData";
import { useRole } from "@/composables/useRole";
import { useUserStore } from "@/stores/useUserStore";
import { storeToRefs } from "pinia";
import { useModalStore } from "@/stores/useModalStore";

const { requestForm, currentRequest } = defineProps<{
  requestForm: RequestForm;
  currentRequest: Request | null;
}>();

const emit = defineEmits<{
  (e: "resetRequestForm"): void;
}>();

const modalStore = useModalStore();

const isModalVisible = computed(() => modalStore.modalState.viewRequest);

const handleCloseModal = () => {
  if (currentRequest) {
    emit("resetRequestForm");
    modalStore.closeModal("viewRequest");
  }
};
const { userData } = storeToRefs(useUserStore());

const addViewPartRow = () => {
  requestForm.parts.push({ partName: "", quantity: "1" });
};

const removeViewPartRow = (index: number) => {
  if (requestForm.parts.length > 1) {
    requestForm.parts.splice(index, 1);
  }
};

const { can } = useRole();

const canEditRequest = (request: Request) => {
  if (!request) return false;
  return (
    can(["admin", "mechanic", "warehouse_operator"]) ||
    request.authorId === userData.value?.id
  );
};

const handleOpenModalEditRequest = () => {
  modalStore.openModal("editRequest");
};
</script>

<template>
  <Dialog
    :visible="isModalVisible"
    @update:visible="handleCloseModal"
    modal
    :draggable="false"
    header="Просмотр заявки"
    position="center"
    :closable="true"
    :style="{ width: '35rem' }"
  >
    <div class="flex flex-col gap-4">
      <div
        class="flex gap-0 rounded-lg overflow-hidden border border-(--border)"
      >
        <button
          type="button"
          class="flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-200"
          :class="
            requestForm.type === 'planned'
              ? 'planned-active'
              : 'planned-inactive'
          "
          disabled
        >
          Плановая
        </button>
        <button
          type="button"
          class="flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-200"
          :class="
            requestForm.type === 'emergency'
              ? 'emergency-active'
              : 'emergency-inactive'
          "
          disabled
        >
          Аварийная
        </button>
      </div>

      <div v-if="requestForm.type === 'planned'" class="flex flex-col gap-2">
        <label class="text-sm font-semibold text-(--title)">
          ДЕТАЛИ <span class="text-(--red)">*</span>
        </label>

        <div class="flex flex-col gap-3">
          <div
            v-for="(part, index) in requestForm.parts"
            :key="index"
            class="flex items-start gap-2"
          >
            <Dropdown
              v-model="part.partName"
              :options="partOptions"
              option-label="label"
              option-value="value"
              class="flex-auto"
              placeholder="Деталь"
              disabled
              show-clear
              filter
            />
            <InputText
              v-model="part.quantity"
              type="number"
              min="1"
              class="w-20"
              disabled
              placeholder="Кол-во"
            />
            <Button
              v-if="requestForm.parts.length > 1"
              type="button"
              icon="pi pi-trash"
              class="p-button-danger p-button-rounded p-button-text"
              @click="removeViewPartRow(index)"
            />
          </div>
        </div>

        <Button
          type="button"
          label="Добавить деталь"
          icon="pi pi-plus"
          class="p-button-text p-button-sm"
          @click="addViewPartRow"
          disabled
        />
      </div>

      <div v-else class="flex flex-col gap-2">
        <label class="text-sm font-semibold text-(--title)">
          ПРОБЛЕМА
          <span class="text-(--red)">*</span>
        </label>
        <div
          class="border border-(--border) rounded-lg p-3 max-h-64 overflow-y-auto"
        >
          <div
            v-for="problem in emergencyProblems"
            :key="problem.value"
            class="flex items-start gap-2 py-1.5"
          >
            <input
              type="checkbox"
              :id="'view-problem-' + problem.value"
              :value="problem.value"
              v-model="requestForm.selectedProblems"
              class="w-4 h-4 text-(--red) rounded focus:ring-(--red) mt-0.5 shrink-0"
              disabled
            />
            <label
              :for="'view-problem-' + problem.value"
              class="text-sm text-(--text) cursor-pointer flex-1 wrap-break-word"
            >
              {{ problem.label }}
            </label>
          </div>
        </div>
      </div>

      <div v-if="requestForm.emergencyOtherProblem" class="flex flex-col gap-2">
        <label
          for="viewObjectAddress"
          class="text-sm font-semibold text-(--title) uppercase"
        >
          другая проблема
          <span class="text-(--red)">*</span>
        </label>
        <InputText
          v-model="requestForm.emergencyOtherProblem"
          placeholder="Опишите проблему..."
          class="w-full"
          disabled
        />
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="viewObjectAddress"
          class="text-sm font-semibold text-(--title)"
        >
          АДРЕС ОБЪЕКТА <span class="text-(--red)">*</span>
        </label>
        <InputText
          id="viewObjectAddress"
          v-model="requestForm.objectAddress"
          class="w-full"
          placeholder="Например: ул. Ленина 42, лифт №7"
          disabled
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="viewComment" class="text-sm font-semibold text-(--title)">
          КОММЕНТАРИЙ
        </label>
        <Textarea
          id="viewComment"
          v-model="requestForm.comment"
          class="w-full"
          rows="3"
          disabled
        />
        <span class="text-xs text-(--placeholder)">
          Необязательно, но помогает ускорить обработку заявки
        </span>
      </div>

      <div v-if="can(['admin', 'mechanic'])" class="flex flex-col gap-2">
        <label for="viewStatus" class="text-sm font-semibold text-(--title)">
          СТАТУС
        </label>
        <Dropdown
          id="viewStatus"
          v-model="requestForm.status"
          :options="statusOptions.slice(1)"
          option-label="label"
          option-value="value"
          class="w-full"
          placeholder="Выберите статус"
          disabled
        />
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <Button
          v-if="canEditRequest(currentRequest!)"
          type="button"
          label="Редактировать"
          class="edit-btn"
          @click="handleOpenModalEditRequest"
        />
        <Button
          type="button"
          label="Закрыть"
          severity="secondary"
          @click="handleCloseModal"
        />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
/* Отключаем cursor для кнопок внутри переключателя */
button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
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
</style>
