<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import {
  Dialog,
  Button,
  Dropdown,
  InputText,
  Textarea,
  InputNumber,
} from "primevue";
import type { PartsRequest } from "@/types/PartsRequestTypes";
import { useModalStore } from "@/stores/useModalStore";
import { usePartsRequestStore } from "@/stores/usePartsRequestStore";
import { useRole } from "@/composables/useRole";
import { statusOptionsData } from "@/data/statusOptionsData";
import {
  getStatusColor,
  getStatusLabel,
  getUrgencyLabel,
  getUrgencyColor,
} from "@/utils/entityHelpers";
import { urgencyOptions } from "@/data/partsRequestData";

import { formatDate } from "@/utils/formatDate";
import { useUserStore } from "@/stores/useUserStore";
import { storeToRefs } from "pinia";
import { usePartsStore } from "@/stores/usePartsStore";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { api } from "@/service/apiInstance";

interface Props {
  request: PartsRequest | null;
}

const props = defineProps<Props>();

const modalStore = useModalStore();
const partsRequestStore = usePartsRequestStore();
const { can } = useRole();

const userStore = useUserStore();
const { userData } = storeToRefs(userStore);

const partsStore = usePartsStore();
const { partsList } = storeToRefs(partsStore);

// Опции статуса для admin и warehouse_operator
const partsstatusOptionsData = statusOptionsData.filter(
  (option) => option.value !== "",
);

// Проверка прав доступа для изменения статуса
const canChangeStatus = computed(() => can(["admin", "warehouse_operator"]));

// Хранилище для наличия запчастей на складе
const warehouseStock = ref<Record<number, { quantity: number; name: string }>>(
  {},
);
const loadingStock = ref(false);

const loadWarehouseStock = async () => {
  if (form.value.status === "in_progress" && form.value.parts.length > 0) {
    loadingStock.value = true;
    try {
      for (const part of form.value.parts) {
        if (part.partId) {
          const { data } = await api.get(`/parts/${part.partId}`);
          warehouseStock.value[part.partId] = {
            quantity: data.quantity,
            name: data.name,
          };
        }
      }
    } catch (error) {
      console.error("Error loading warehouse stock:", error);
    } finally {
      loadingStock.value = false;
    }
  }
};

// Проверка достаточности запчастей
const hasEnoughStock = computed(() => {
  if (form.value.status !== "in_progress") return true;

  return form.value.parts.every((part) => {
    const stock = warehouseStock.value[part.partId];
    return stock && stock.quantity >= part.quantity;
  });
});

// Форма редактирования
const form = ref<PartsRequest>({
  id: 0,
  author: "",
  authorId: 0,
  status: "pending",
  parts: [],
  purpose: "",
  urgency: "medium",
  comment: "",
  createdAt: "",
});

// Следим за изменением props.request
watch(
  () => props.request,
  (newRequest) => {
    if (newRequest) {
      form.value = {
        ...newRequest,
        parts: [...newRequest.parts.map((p) => ({ ...p }))],
      };
      // Загружаем данные о складе при открытии модалки
      loadWarehouseStock();
    }
  },
  { immediate: true, deep: true },
);

// Следим за изменением статуса
watch(() => form.value.status, loadWarehouseStock);

const resetForm = () => {
  if (props.request) {
    form.value = {
      ...props.request,
      parts: [...props.request.parts.map((p) => ({ ...p }))],
    };
  }
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

  // Если статус rejected, требуем причину отклонения
  if (form.value.status === "rejected" && canChangeStatus.value) {
    const hasRejectionReason =
      form.value.rejectionReason &&
      form.value.rejectionReason.trim().length > 0;
    return hasParts && allPartsValid && hasPurpose && hasRejectionReason;
  }

  return hasParts && allPartsValid && hasPurpose;
});

// Обработчики
const handleCloseModal = () => {
  resetForm();
  modalStore.closeModal("editPartsRequest");
};

const handleUpdate = async () => {
  if (!isFormValid.value || !props.request) return;

  try {
    // Проверяем, изменился ли статус
    const statusChanged = form.value.status !== props.request.status;

    if (statusChanged && canChangeStatus.value) {
      // Если статус изменился, используем специальные методы
      switch (form.value.status) {
        case "in_progress":
          partsRequestStore.inProgressRequest(form.value.id);
          break;
        case "approved":
          partsRequestStore.approveRequest(form.value.id);
          break;
        case "rejected":
          // Для отклонения нужна причина
          const reason = form.value.rejectionReason || "Не указана";
          partsRequestStore.rejectRequest(form.value.id, reason);
          break;

        case "completed":
          partsRequestStore.completeRequest(form.value.id);
          break;
      }
    }

    // Обновляем остальные поля (parts, purpose, urgency, comment и т.д.)
    await partsRequestStore.updateRequest(form.value.id, {
      parts: form.value.parts,
      purpose: form.value.purpose,
      urgency: form.value.urgency,
      comment: form.value.comment,
      relatedRepairRequestId: form.value.relatedRepairRequestId,
      objectAddress: form.value.objectAddress,
      liftId: form.value.liftId,
      status: form.value.status,
    });

    handleCloseModal();
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Error message:", errorMessage);

    throw new Error(`Ошибка при обновлении заявки: ${errorMessage}`);
  }
};

const updatePartSection = (index: number, partId: number) => {
  const selectedPart = partsList.value.find((p) => p.id === partId);
  if (selectedPart) {
    form.value.parts[index].partId = selectedPart.id;
    form.value.parts[index].partName = selectedPart.name;
  }
};

onMounted(() => partsStore.getParts());
</script>

<template>
  <Dialog
    :visible="modalStore.modalState.editPartsRequest"
    @update:visible="handleCloseModal()"
    modal
    :draggable="false"
    header="Редактировать заявку на запчасти"
    position="center"
    :closable="true"
    :style="{ width: '35rem' }"
  >
    <div class="flex flex-col gap-4">
      <!-- ID заявки (readonly) -->
      <div>
        <label class="block text-sm font-medium text-(--text) mb-2">
          ID заявки
        </label>
        <InputNumber v-model="form.id" class="w-full" disabled />
      </div>

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
            <span
              class="rounded-full px-2 py-1"
              :class="getUrgencyColor(value)"
            >
              {{ getUrgencyLabel(value) }}
            </span>
          </template>
        </Dropdown>
      </div>

      <!-- Статус (только для admin и warehouse_operator) -->
      <div v-if="canChangeStatus">
        <label class="block text-sm font-medium text-(--text) mb-2">
          Статус <span class="text-red-500">*</span>
        </label>
        <Dropdown
          v-model="form.status"
          :options="partsstatusOptionsData"
          option-label="label"
          option-value="value"
          class="w-full"
        >
          <template #value="{ value }">
            <span
              class="px-2 py-1 rounded-full"
              :class="[getStatusColor(value)]"
            >
              {{ getStatusLabel(value) }}
            </span>
          </template>
          <template #option="{ option }">
            <span class="px-2 py-1 rounded-full" :class="[option.color]">
              {{ option.label }}
            </span>
          </template>
        </Dropdown>
      </div>

      <!-- Причина отклонения (только если статус = rejected) -->
      <div v-if="canChangeStatus && form.status === 'rejected'">
        <label class="block text-sm font-medium text-(--text) mb-2">
          Причина отклонения <span class="text-red-500">*</span>
        </label>
        <Textarea
          v-model="form.rejectionReason"
          rows="3"
          class="w-full"
          placeholder="Укажите причину отклонения заявки..."
        />
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
            class="flex gap-2 items-start"
          >
            <div class="flex-1">
              <Dropdown
                :model-value="part.partId"
                @update:model-value="
                  (value: number) => updatePartSection(index, value)
                "
                :options="partsList"
                option-label="name"
                option-value="id"
                placeholder="Выберите запчасть"
                class="w-full"
                filter
              />
              <!-- Показываем наличие на складе для статуса in_progress -->
              <div
                v-if="
                  form.status === 'in_progress' &&
                  part.partId &&
                  warehouseStock[part.partId]
                "
                class="mt-1 text-xs"
              >
                <span
                  :class="[
                    warehouseStock[part.partId].quantity >= part.quantity
                      ? 'text-green-600'
                      : 'text-red-600',
                  ]"
                >
                  <i
                    :class="[
                      warehouseStock[part.partId].quantity >= part.quantity
                        ? 'pi pi-check-circle'
                        : 'pi pi-exclamation-triangle',
                    ]"
                  ></i>
                  На складе: {{ warehouseStock[part.partId].quantity }} шт
                  <span
                    v-if="warehouseStock[part.partId].quantity < part.quantity"
                  >
                    (не хватает
                    {{ part.quantity - warehouseStock[part.partId].quantity }}
                    шт)
                  </span>
                </span>
              </div>
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

      <!-- Детали будут выданы (только если статус = in_progress) -->
      <div
        v-if="form.status === 'in_progress'"
        class="bg-blue-50 p-4 rounded-lg"
      >
        <h3 class="text-sm font-semibold text-blue-800 mb-3">
          📦 Информация о выдаче
        </h3>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-blue-700 mb-1">
              Детали будут выданы
            </label>
            <InputText disabled v-model="form.author" class="w-full" />
          </div>

          <div v-if="userData">
            <label class="block text-xs font-medium text-blue-700 mb-1">
              Одобрит
            </label>
            <InputText disabled v-model="userData.username" class="w-full" />
          </div>
        </div>

        <!-- Предупреждение если не хватает запчастей -->
        <div
          v-if="!hasEnoughStock"
          class="mt-3 p-3 bg-red-50 rounded border border-red-200"
        >
          <p class="text-sm text-red-700">
            <i class="pi pi-exclamation-triangle mr-2"></i>
            <strong>Внимание!</strong> Недостаточно запчастей на складе для
            выполнения заявки.
          </p>
        </div>

        <!-- Успешное сообщение если все ОК -->
        <div
          v-else
          class="mt-3 p-3 bg-green-50 rounded border border-green-200"
        >
          <p class="text-sm text-green-700">
            <i class="pi pi-check-circle mr-2"></i>
            Все запчасти доступны на складе. Можно одобрить заявку.
          </p>
        </div>
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

      <!-- Адрес объекта -->
      <div v-if="form.objectAddress">
        <label class="block text-sm font-medium text-(--text) mb-2">
          Адрес объекта
        </label>
        <InputText v-model="form.objectAddress" class="w-full" />
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

      <!-- История статусов заявки -->
      <div v-if="form.status !== 'pending'" class="border-t pt-4">
        <h3 class="text-sm font-semibold text-(--text) mb-3">
          История изменений статуса
        </h3>

        <div class="grid grid-cols-2 gap-2">
          <!-- Одобрено -->
          <div
            v-if="form.approvedBy && form.approvedByName"
            class="bg-green-50 p-3 rounded-lg mb-2 flex gap-2"
          >
            <div class="flex items-start gap-2">
              <i class="pi pi-check-circle text-green-600 mt-0.5"></i>
              <div class="flex-1">
                <p class="text-sm font-medium text-green-800">
                  Заявка одобрена
                </p>
                <p class="text-xs text-green-700 mt-1">
                  Одобрил: {{ form.approvedByName }}
                </p>
                <p class="text-xs text-green-600" v-if="form.approvedAt">
                  {{ formatDate(form.approvedAt) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Отклонено -->
          <div
            v-if="form.status === 'rejected' && form.rejectionReason"
            class="bg-red-50 p-3 rounded-lg mb-2"
          >
            <div class="flex items-start gap-2">
              <i class="pi pi-times-circle text-red-600 mt-0.5"></i>
              <div class="flex-1">
                <p class="text-sm font-medium text-red-800">Заявка отклонена</p>
                <p class="text-xs text-red-700 mt-1">
                  Причина: {{ form.rejectionReason }}
                </p>
              </div>
            </div>
          </div>

          <!-- Выдано -->
          <div
            v-if="form.issuedTo && form.issuedToName"
            class="bg-blue-50 p-3 rounded-lg mb-2"
          >
            <div class="flex items-start gap-2">
              <i class="pi pi-box text-blue-600 mt-0.5"></i>
              <div class="flex-1">
                <p class="text-sm font-medium text-blue-800">Запчасти выданы</p>
                <p class="text-xs text-blue-700 mt-1">
                  Выдано: {{ form.issuedToName }}
                </p>
                <p class="text-xs text-blue-600" v-if="form.issuedAt">
                  {{ formatDate(form.issuedAt) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Завершено -->
          <div
            v-if="form.status === 'completed'"
            class="bg-purple-50 p-3 rounded-lg col-span-2"
          >
            <div class="flex items-start gap-2">
              <i class="pi pi-check text-purple-600 mt-0.5"></i>
              <div class="flex-1">
                <p class="text-sm font-medium text-purple-800">
                  Заявка завершена
                </p>
                <p class="text-xs text-purple-600" v-if="form.updatedAt">
                  {{ formatDate(form.updatedAt) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Информационное сообщение -->
      <div class="bg-blue-50 p-3 rounded-lg">
        <p class="text-sm text-blue-700">
          <i class="pi pi-info-circle mr-2"></i>
          Изменения будут сохранены в заявке. Статус заявки:
          {{ getStatusLabel(form.status) }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Отмена" severity="secondary" @click="handleCloseModal" />
        <Button
          label="Сохранить изменения"
          severity="primary"
          @click="handleUpdate"
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
