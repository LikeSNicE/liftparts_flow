import { defineStore } from "pinia";
import { ref } from "vue";
// import type {
//   Request,
//   RequestForm,
//   RepairRequestStatus,
//   NewRequest,
// } from "@/types/RepairRepairRepairRequestTypes";
import type {
  RepairRequestForm,
  RepairRequest,
  NewRepairRequest,
} from "@/types/RepairRequestTypes";
import { api } from "@/service/apiInstance";
import { getErrorMessage } from "@/utils/getErrorMessage";


export const useRepairRequestStore = defineStore("repair-requests", () => {
  // Список заявок
  const requestList = ref<RepairRequest[]>([]);

  // Получить все заявки
  const getRequests = async () => {
    try {
      const { data } = await api.get<RepairRequest[]>("/repair-requests");

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
  const createRequest = async (requestForm: RepairRequestForm) => {
    const newRequest: NewRepairRequest = {
      ...requestForm,
      createdAt: new Date().toISOString(),
    };

    try {
      const { data } = await api.post("/repair-requests", newRequest);
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
    requestForm: Partial<RepairRequestForm>,
  ) => {
    const { data } = await api.patch(`/repair-requests/${id}`, requestForm);

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
  // const updateRepairRequestStatus = async (
  //   id: number,
  //   status: StatusOption,
  // ) => {
  //   await updateRequest(id, { status });
  // };

  return {
    requestList,
    getRequests,
    createRequest,
    updateRequest,
    deleteRequest,
    getRequestById,
    // updateRepairRequestStatus,
  };
});
