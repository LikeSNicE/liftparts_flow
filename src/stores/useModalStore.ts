import { defineStore } from "pinia";
import { ref } from "vue";

export type ModalType =
  | "viewRequest"
  | "createRequest"
  | "editRequest"
  | "deleteRequest";

export const useModalStore = defineStore("modal", () => {
  const modalState = ref<Record<ModalType, boolean>>({
    createRequest: false,
    viewRequest: false,
    editRequest: false,
    deleteRequest: false,
  });

  const openModal = (type: ModalType) => {
    modalState.value[type] = true;
  };

  const closeModal = (type: ModalType) => {
    modalState.value[type] = false;
  };

  const closeAllModals = () => {
    modalState.value = {
      createRequest: false,
      viewRequest: false,
      editRequest: false,
      deleteRequest: false,
    };
  };

  return { modalState, openModal, closeModal, closeAllModals };
});
