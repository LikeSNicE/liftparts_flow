import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  Request,
  RequestForm,
  RequestStatus,
  NewRequest,
} from "@/types/RequestTypes";
import { api } from "@/service/apiInstance";
import { getErrorMessage } from "@/utils/getErrorMessage";

export const useRequestStore = defineStore("requests", () => {
  // Список заявок
  const requestList = ref<Request[]>([
    // {
    //   id: 1,
    //   title: "Замена троса лебедки",
    //   author: "Иванов П.С.",
    //   authorId: 1,
    //   status: "pending",
    //   liftId: "ELT-001",
    //   type: "planned",
    //   partName: "Трос лебедки 8мм",
    //   quantity: 2,
    //   objectAddress: "ул. Ленина 42, лифт №7",
    //   comment: "Износ троса более 50%",
    //   createdAt: "2026-03-20T10:00:00",
    // },
  ]);

  // Получить все заявки
  const getRequests = async () => {
    try {
      const { data } = await api.get<Request[]>("/requests");

      if (!data || !Array.isArray(data)) {
        throw new Error("Некорректный формат данных от сервера");
      }

      requestList.value = data;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.log("Ошибка при загрузке заявок:", errorMessage);
      throw new Error(
        "Не удалось загрузить заявки. Пожалуйста, попробуйте позже.",
      );
    }
  };

  // Создать новую заявку
  const createRequest = async (requestForm: RequestForm) => {
    const newRequest: NewRequest = {
      ...requestForm,
      createdAt: new Date().toISOString(),
    };

    try {
      const { data } = await api.post("/requests", newRequest);
      requestList.value.push(data);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.log("Ошибка при создании заявки:", errorMessage);

      throw new Error(
        "Не удалось создать заявку. Пожалуйста, попробуйте позже.",
      );
    }
  };

  // Обновить заявку
  const updateRequest = async (
    id: number,
    requestForm: Partial<RequestForm>,
  ) => {
    const { data } = await api.patch(`/requests/${id}`, requestForm);

    const index = requestList.value.findIndex((r) => r.id === id);
    if (index !== -1) {
      console.log("Данные от сервера после обновления заявки:", data);

      requestList.value[index] = {
        ...data,
        ...requestForm,
        updatedAt: new Date().toISOString(),
      };
    }
  };

  // Удалить заявку
  const deleteRequest = async (id: number) => {
    try {
      await api.delete(`/requests/${id}`);
      requestList.value = requestList.value.filter(
        (request) => request.id !== id,
      );
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.log("Ошибка при удалении заявки:", errorMessage);
      throw new Error(
        "Не удалось удалить заявку. Пожалуйста, попробуйте позже.",
      );
    }
  };

  // Получить заявку по ID
  const getRequestById = (id: number) => {
    return requestList.value.find((r) => r.id === id);
  };

  // Обновить статус заявки
  const updateRequestStatus = async (id: number, status: RequestStatus) => {
    await updateRequest(id, { status });
  };

  return {
    requestList,
    getRequests,
    createRequest,
    updateRequest,
    deleteRequest,
    getRequestById,
    updateRequestStatus,
  };
});
