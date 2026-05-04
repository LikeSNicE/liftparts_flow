<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  Dialog,
  Button,
  Dropdown,
  InputText,
  Textarea,
  InputNumber,
} from "primevue";
import type { PartsRequestForm } from "@/types/PartsRequestTypes";

import { useUserStore } from "@/stores/useUserStore";
import { storeToRefs } from "pinia";
import { useModalStore } from "@/stores/useModalStore";
import { usePartsRequestStore } from "@/stores/usePartsRequestStore";
import { usePartsStore } from "@/stores/usePartsStore";
import { urgencyOptions } from "@/data/partsRequestData";
import { getUrgencyColor } from "@/utils/entityHelpers";

const modalStore = useModalStore();
const partsRequestStore = usePartsRequestStore();
const partsStore = usePartsStore();
const { partsList } = storeToRefs(partsStore);

const userStore = useUserStore();
const { userData } = storeToRefs(userStore);

// Опции срочности

// Форма заявки
const form = ref<PartsRequestForm>({
  author: userData.value?.username || "",
  authorId: userData.value?.id || 0,
  status: "pending",
  parts: [],
  purpose: "",
  urgency: "medium",
  comment: "",
});

const resetForm = () => {
  form.value = {
    author: userData.value?.username || "",
    authorId: userData.value?.id || 0,
    status: "pending",
    parts: [],
    purpose: "",
    urgency: "medium",
    comment: "",
  };
};

// Управление списком запчастей
const addPartRow = () => {
  form.value.parts.push({ partName: "", quantity: 1, partId: 0 });
};

const removePartRow = (index: number) => {
  if (form.value.parts.length > 1) {
    form.value.parts.splice(index, 1);
  }
};

// Валидация формы
const isFormValid = computed(() => {
  const hasParts = form.value.parts.length > 0;
  const allPartsValid = form.value.parts.every(
    (part) => part.partId && part.quantity > 0,
  );
  const hasPurpose = form.value.purpose.trim().length > 0;

  return hasParts && allPartsValid && hasPurpose;
});

// Обработчики
const handleCloseModal = () => {
  resetForm();
  modalStore.closeModal("createPartsRequest");
};

const handleCreate = () => {
  if (isFormValid.value) {
    partsRequestStore.createRequest(form.value);
    handleCloseModal();
  }
};

const updatePartSelection = (index: number, partId: number) => {
  const selectedPart = partsList.value.find((p) => p.id === partId);

  if (selectedPart) {
    form.value.parts[index].partId = selectedPart.id;
    form.value.parts[index].partName = selectedPart.name;
  }
};

onMounted(() => {
  partsStore.getParts();
});
</script>

<template>
  <Dialog
    :visible="modalStore.modalState.createPartsRequest"
    @update:visible="handleCloseModal()"
    modal
    :draggable="false"
    header="Создать заявку на запчасти"
    position="center"
    :closable="true"
    :style="{ width: '35rem' }"
  >
    <div class="flex flex-col gap-4">
      <!-- Автор (readonly) -->
      <div>
        <label class="block text-sm font-medium text-(--text) mb-2">
          Автор заявки
        </label>
        <InputText v-model="form.author" class="w-full" disabled />
      </div>

      <!-- Назначение -->
      <div>
        <label class="block text-sm font-medium text-(--text) mb-2">
          Назначение <span class="text-red-500">*</span>
        </label>
        <InputText
          v-model="form.purpose"
          class="w-full"
          placeholder="Например: Для ремонта лифта №5, замена двигателя"
        />
      </div>

      <!-- Срочность -->
      <div>
        <label class="block text-sm font-medium text-(--text) mb-2">
          Срочность <span class="text-red-500">*</span>
        </label>
        <Dropdown
          v-model="form.urgency"
          :options="urgencyOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        >
          <template #value="{ value }">
            <span :class="getUrgencyColor(value)">
              {{ urgencyOptions.find((o) => o.value === value)?.label }}
            </span>
          </template>
        </Dropdown>
      </div>

      <!-- Список запчастей -->

      <div class="flex flex-col gap-2">
        <label class="block text-sm font-medium text-(--text)">
          Детали <span class="text-red-500">*</span>
        </label>
        <div class="flex flex-col gap-3">
          <div
            v-for="(part, index) in form.parts"
            :key="index"
            class="flex gap-2 items-center"
          >
            <div class="flex-1">
              <Dropdown
                :model-value="part.partId"
                @update:model-value="
                  (value: number) => updatePartSelection(index, value)
                "
                :options="partsList"
                option-label="name"
                option-value="id"
                placeholder="Выберите запчасть"
                class="w-full"
                filter
              />
            </div>
            <div class="w-32">
              <InputNumber
                v-model="part.quantity"
                :min="1"
                :max="1000"
                showButtons
                class="w-full"
                placeholder="Кол-во"
                :use-grouping="false"
              />
            </div>
            <Button
              v-if="form.parts.length > 1"
              type="button"
              icon="pi pi-trash"
              class="p-button-danger p-button-rounded p-button-text"
              @click="removePartRow(index)"
            />
          </div>
        </div>

        <Button
          type="button"
          label="Добавить деталь"
          icon="pi pi-plus"
          class="p-button-text"
          @click="addPartRow"
        />
      </div>

      <!-- Связь с ремонтом (опционально) -->
      <div>
        <label class="block text-sm font-medium text-(--text) mb-2">
          ID заявки на ремонт (если есть)
        </label>
        <InputNumber
          v-model="form.relatedRepairRequestId"
          class="w-full"
          placeholder="Оставьте пустым, если не связано с ремонтом"
          :min="1"
          :use-grouping="false"
        />
      </div>

      <!-- Комментарий -->
      <div>
        <label class="block text-sm font-medium text-(--text) mb-2">
          Комментарий
        </label>
        <Textarea
          v-model="form.comment"
          rows="3"
          class="w-full"
          placeholder="Дополнительная информация..."
        />
      </div>

      <!-- Информационное сообщение -->
      <div class="bg-blue-50 p-3 rounded-lg">
        <p class="text-sm text-blue-700">
          <i class="pi pi-info-circle mr-2"></i>
          Заявка будет отправлена на склад для обработки.
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Отмена" severity="secondary" @click="handleCloseModal" />
        <Button
          label="Создать заявку"
          severity="primary"
          @click="handleCreate"
          :disabled="!isFormValid"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
:deep(.p-inputnumber-input) {
  width: 100%;
}
</style>
