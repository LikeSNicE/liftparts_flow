import { defineStore } from "pinia";
import { ref } from "vue";

export type ModalType =
  | "viewRepairRequest"
  | "createRepairRequest"
  | "editRepairRequest"
  | "deleteRepairRequest"
  | "warehouseIncome"
  | "createPartsRequest"
  | "editPartsRequest"

export const useModalStore = defineStore("modal", () => {
  const modalState = ref<Record<ModalType, boolean>>({
    createRepairRequest: false,
    viewRepairRequest: false,
    editRepairRequest: false,
    deleteRepairRequest: false,
    warehouseIncome: false,
    createPartsRequest: false,
    editPartsRequest: false,
  });

  const openModal = (type: ModalType) => {
    modalState.value[type] = true;
  };

  const closeModal = (type: ModalType) => {
    modalState.value[type] = false;
  };

  const closeAllModals = () => {
    modalState.value = {
      createRepairRequest: false,
      viewRepairRequest: false,
      editRepairRequest: false,
      deleteRepairRequest: false,
      warehouseIncome: false,
      createPartsRequest: false,
      editPartsRequest: false,
    };
  };

  return { modalState, openModal, closeModal, closeAllModals };
});
