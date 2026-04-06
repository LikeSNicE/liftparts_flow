<script setup lang="ts">
import { ref } from "vue";
import { Dialog, Button, InputNumber } from "primevue";
import type { Part } from "@/types/PartsTypes";
import { useModalStore } from "@/stores/useModalStore";
import { storeToRefs } from "pinia";
import { usePartsStore } from "@/stores/usePartsStore";

const modalStore = useModalStore();
const { modalState } = storeToRefs(modalStore);

const partsStore = usePartsStore();

const { part } = defineProps<{
  part: Part;
}>();

const quantity = ref(1);
const handleConfirm = async () => {
  await partsStore.updatePart(part.id, {
    quantity: part.quantity + quantity.value,
  });
  modalStore.closeModal("warehouseIncome");
};

const handleClose = () => {
  modalStore.closeModal("warehouseIncome");
};
</script>

<template>
  <Dialog
    :visible="modalState.warehouseIncome"
    @update:visible="handleClose"
    modal
    :draggable="false"
    header="Приход запчасти"
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
          Количество прихода
        </label>
        <InputNumber
          v-model="quantity"
          :min="1"
          :max="1000"
          showButtons
          class="w-full"
        />
      </div>

      <div class="bg-green-50 p-3 rounded-lg">
        <p class="text-sm text-green-700">
          Новое количество:
          <strong>{{ part.quantity + quantity }} {{ part.unit }}</strong>
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Отмена" severity="secondary" @click="handleClose" />
        <Button label="Подтвердить" severity="success" @click="handleConfirm" />
      </div>
    </template>
  </Dialog>
</template>
