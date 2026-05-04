import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  PartsRequest,
  PartsRequestForm,
  NewPartsRequest,
} from "@/types/PartsRequestTypes";
import { useUserStore } from "./useUserStore";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { api } from "@/service/apiInstance";

export const usePartsRequestStore = defineStore("partsRequest", () => {
  const userStore = useUserStore();

  const partsRequestList = ref<PartsRequest[]>([]);

  const getPartsRequests = async () => {
    try {
      const { data } = await api.get<PartsRequest[]>("/parts-requests");
      partsRequestList.value = data;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.error("Error fetching parts requests:", errorMessage.message);
      throw new Error(
        "Не удалось загрузить заявки на детали. Пожалуйста, попробуйте позже.",
      );
    }
  };

  // Создать заявку
  const createRequest = async (form: PartsRequestForm) => {
    const newRequest: NewPartsRequest = {
      ...form,
      createdAt: new Date().toISOString(),
    };
    try {
      const { data } = await api.post<PartsRequest>(
        "/parts-requests",
        newRequest,
      );
      partsRequestList.value.push(data);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.error("Error creating new parts request:", errorMessage.message);
      throw new Error(
        "Не удалось создать заявку на детали. Пожалуйста, попробуйте позже.",
      );
    }
  };

  // Взять заявку в работу
  const inProgressRequest = async (requestId: number) => {
    const request = partsRequestList.value.find((r) => r.id === requestId);
    if (request && request.status === "pending") {
      const updatedRequest: PartsRequest = {
        ...request,
        status: "in_progress",
        updatedAt: new Date().toISOString(),
      };

      try {
        const { data } = await api.patch<PartsRequest>(
          `/parts-requests/${requestId}`,
          updatedRequest,
        );

        const index = partsRequestList.value.findIndex(
          (r) => r.id === requestId,
        );
        if (index !== -1) {
          partsRequestList.value[index] = data;
        }
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        console.error(
          "Error updating request to in_progress:",
          errorMessage.message,
        );
        throw new Error("Не удалось взять заявку в работу.");
      }
    }
  };

  // Одобрить заявку
  const approveRequest = async (requestId: number) => {
    const request = partsRequestList.value.find((r) => r.id === requestId);
    if (request && request.status === "in_progress") {
      try {
        // 1. Проверяем наличие всех запчастей на складе
        for (const part of request.parts) {
          const { data: warehousePart } = await api.get(
            `/parts/${part.partId}`,
          );

          if (!warehousePart) {
            throw new Error(`Запчасть "${part.partName}" не найдена на складе`);
          }

          if (warehousePart.quantity < part.quantity) {
            throw new Error(
              `Недостаточно запчастей "${part.partName}". ` +
                `Запрошено: ${part.quantity}, доступно: ${warehousePart.quantity}`,
            );
          }
        }

        // 2. Уменьшаем количество запчастей на складе
        for (const part of request.parts) {
          const { data: warehousePart } = await api.get(
            `/parts/${part.partId}`,
          );
          const newQuantity = warehousePart.quantity - part.quantity;

          await api.patch(`/parts/${part.partId}`, {
            quantity: newQuantity,
          });
        }

        // 3. Обновляем статус заявки
        const updatedRequest: PartsRequest = {
          ...request,
          status: "approved",
          issuedTo: request.authorId,
          issuedToName: request.author,
          issuedAt: new Date().toISOString(),
          approvedBy: userStore.userData?.id,
          approvedByName: userStore.userData?.username,
          approvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const { data } = await api.patch<PartsRequest>(
          `/parts-requests/${requestId}`,
          updatedRequest,
        );

        const index = partsRequestList.value.findIndex(
          (r) => r.id === requestId,
        );
        if (index !== -1) {
          partsRequestList.value[index] = data;
        }
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        console.error("Error approving request:", errorMessage.message);
        throw error;
      }
    }
  };

  // Отклонить заявку
  const rejectRequest = async (requestId: number, reason: string) => {
    const request = partsRequestList.value.find((r) => r.id === requestId);
    if (
      request &&
      (request.status === "pending" || request.status === "in_progress")
    ) {
      const updatedRequest: PartsRequest = {
        ...request,
        status: "rejected",
        rejectionReason: reason,
        updatedAt: new Date().toISOString(),
      };

      try {
        const { data } = await api.patch<PartsRequest>(
          `/parts-requests/${requestId}`,
          updatedRequest,
        );

        const index = partsRequestList.value.findIndex(
          (r) => r.id === requestId,
        );
        if (index !== -1) {
          partsRequestList.value[index] = data;
        }
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        console.error("Error rejecting request:", errorMessage.message);
        throw new Error("Не удалось отклонить заявку.");
      }
    }
  };

  // Завершить заявку
  const completeRequest = async (requestId: number) => {
    const request = partsRequestList.value.find((r) => r.id === requestId);
    if (request && request.status === "approved") {
      const updatedRequest: PartsRequest = {
        ...request,
        status: "completed",
        updatedAt: new Date().toISOString(),
      };

      try {
        const { data } = await api.patch<PartsRequest>(
          `/parts-requests/${requestId}`,
          updatedRequest,
        );

        const index = partsRequestList.value.findIndex(
          (r) => r.id === requestId,
        );
        if (index !== -1) {
          partsRequestList.value[index] = data;
        }
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        console.error("Error completing request:", errorMessage.message);
        throw new Error("Не удалось завершить заявку.");
      }
    }
  };

  // Обновить заявку (для редактирования основных полей без изменения статуса)
  const updateRequest = async (
    requestId: number,
    updatedData: Partial<PartsRequest>,
  ) => {
    try {
      const request = partsRequestList.value.find((r) => r.id === requestId);

      if (!request) {
        throw new Error("Заявка не найдена");
      }

      const updatedRequest: PartsRequest = {
        ...request,
        ...updatedData,
        id: requestId, // АЗащита от изменения ID
        updatedAt: new Date().toISOString(),
      };

      const { data } = await api.patch<PartsRequest>(
        `/parts-requests/${requestId}`,
        updatedRequest,
      );

      const index = partsRequestList.value.findIndex((r) => r.id === requestId);
      if (index !== -1) {
        partsRequestList.value[index] = data;
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.error("Error updating parts request:", errorMessage.message);
      throw new Error(
        "Не удалось обновить заявку. Пожалуйста, попробуйте позже.",
      );
    }
  };

  // Получить заявку по ID
  const getRequestById = (id: number) => {
    return partsRequestList.value.find((r) => r.id === id);
  };

  // Удалить заявку
  const deleteRequest = async (requestId: number) => {
    try {

      await api.delete(`/parts-requests/${requestId}`);


      partsRequestList.value = partsRequestList.value.filter(
        (r) => r.id !== requestId,
      );

      
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);  
      console.error(errorMessage.message);
      throw new Error("Не удалось удалить заявку по запчастям.");
      
    }
  };

  return {
    partsRequestList,
    getPartsRequests,
    createRequest,
    inProgressRequest,
    approveRequest,
    rejectRequest,
    completeRequest,
    updateRequest,
    getRequestById,
    deleteRequest,
  };
});
