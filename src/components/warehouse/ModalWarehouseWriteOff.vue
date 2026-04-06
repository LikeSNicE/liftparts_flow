<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Dialog, Button, InputNumber, Textarea } from "primevue";
import type { Part } from "@/types/PartsTypes";

const props = defineProps<{
  visible: boolean;
  part: Part;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm", quantity: number): void;
}>();

const quantity = ref(1);
const comment = ref("");
const reason = ref("");

// Сброс формы при открытии
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      quantity.value = 1;
      comment.value = "";
      reason.value = "";
    }
  },
);

const isQuantityValid = computed(() => {
  return quantity.value > 0 && quantity.value <= props.part.quantity;
});

const handleConfirm = () => {
  if (isQuantityValid.value && reason.value.trim()) {
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
    header="Списание запчасти"
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
        <p class="text-base text-(--text)">
          {{ part.quantity }} {{ part.unit }}
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-(--text) mb-2">
          Количество списания
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
          Причина списания <span class="text-red-500">*</span>
        </label>
        <Textarea
          v-model="reason"
          rows="2"
          class="w-full"
          placeholder="Укажите причину списания..."
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-(--text) mb-2">
          Дополнительный комментарий
        </label>
        <Textarea
          v-model="comment"
          rows="2"
          class="w-full"
          placeholder="Добавьте комментарий..."
        />
      </div>

      <div class="bg-red-50 p-3 rounded-lg">
        <p class="text-sm text-red-700">
          Новое количество:
          <strong>{{ part.quantity - quantity }} {{ part.unit }}</strong>
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Отмена" severity="secondary" @click="handleClose" />
        <Button
          label="Списать"
          severity="danger"
          @click="handleConfirm"
          :disabled="!isQuantityValid || !reason.trim()"
        />
      </div>
    </template>
  </Dialog>
</template>
