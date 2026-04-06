<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Dialog, Button, InputNumber, Textarea, InputText } from "primevue";

interface WarehousePart {
  id: number;
  name: string;
  quantity: number;
  minQuantity: number;
  unit: string;
}

const props = defineProps<{
  visible: boolean;
  part: WarehousePart;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm", quantity: number): void;
}>();

const quantity = ref(1);
const recipient = ref("");
const comment = ref("");

// Сброс формы при открытии
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      quantity.value = 1;
      recipient.value = "";
      comment.value = "";
    }
  }
);

const isQuantityValid = computed(() => {
  return quantity.value > 0 && quantity.value <= props.part.quantity;
});

const handleConfirm = () => {
  if (isQuantityValid.value && recipient.value.trim()) {
    emit("confirm", quantity.value);
    emit("close");
  }
};

const handleClose = () => {
  emit("close");
};
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="handleClose"
    modal
    :draggable="false"
    header="Выдача запчасти"
    position="center"
    :closable="true"
    :style="{ width: '30rem' }"
  >
    <div class="flex flex-col gap-4">
      <div>
        <label class="block text-sm font-medium text-(--text) mb-2">
          Запчасть
        </label>
        <p class="text-base font-semibold text-(--title)">{{ part.name }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-(--text) mb-2">
          Текущее количество
        </label>
        <p class="text-base text-(--text)">{{ part.quantity }} {{ part.unit }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-(--text) mb-2">
          Количество выдачи
        </label>
        <InputNumber
          v-model="quantity"
          :min="1"
          :max="part.quantity"
          showButtons
          class="w-full"
        />
        <p v-if="!isQuantityValid" class="text-xs text-red-600 mt-1">
          Недостаточно запчастей на складе
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-(--text) mb-2">
          Получатель <span class="text-red-500">*</span>
        </label>
        <InputText
          v-model="recipient"
          class="w-full"
          placeholder="ФИО получателя..."
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-(--text) mb-2">
          Комментарий
        </label>
        <Textarea
          v-model="comment"
          rows="2"
          class="w-full"
          placeholder="Добавьте комментарий..."
        />
      </div>

      <div class="bg-blue-50 p-3 rounded-lg">
        <p class="text-sm text-blue-700">
          Новое количество: <strong>{{ part.quantity - quantity }} {{ part.unit }}</strong>
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Отмена" severity="secondary" @click="handleClose" />
        <Button
          label="Выдать"
          severity="info"
          @click="handleConfirm"
          :disabled="!isQuantityValid || !recipient.trim()"
        />
      </div>
    </template>
  </Dialog>
</template>
