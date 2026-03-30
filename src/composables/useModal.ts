import { ref } from "vue";

type ModalType =
  | "viewRequest"
  | "createRequest"
  | "editRequest"
  | "deleteRequest";

interface ModalState {
  createRequest: boolean;
  viewRequest: boolean;
  editRequest: boolean;
  deleteRequest: boolean;
}

export const useModal = () => {
  const modalState = ref<ModalState>({
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

  return { modalState, openModal, closeModal };
};
