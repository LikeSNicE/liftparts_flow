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
import { elevatorMonitorApi } from "@/service/elevatorMonitorInstance";
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

  const syncRequestToMonitor = async (request: RepairRequest) => {
    const payload = {
      address: request.objectAddress,
      latitude: request.latitude,
      longitude: request.longitude,
      elevator_id: request.liftId ? String(request.liftId) : undefined,
      priority: request.type === "emergency" ? "high" : "medium",
      description:
        request.comment?.trim() ||
        request.selectedProblems?.join(", ") ||
        "Заявка на ремонт лифта",
      contact: `${request.author} (ID: ${request.authorId})`,
      city: request.city,
    };

    const { data } = await elevatorMonitorApi.post("/requests", payload);
    return data?.data?.request_id as string | undefined;
  };

  // Создать новую заявку
  const createRequest = async (requestForm: RepairRequestForm) => {
    const newRequest: NewRepairRequest = {
      ...requestForm,
      createdAt: new Date().toISOString(),
      monitorSyncStatus: "pending",
    };

    try {
      const { data } = await api.post<RepairRequest>("/repair-requests", newRequest);
      requestList.value.push(data);

      const requestId = data.id;

      void syncRequestToMonitor(data)
        .then((monitorRequestId) => {
          const index = requestList.value.findIndex((item) => item.id === requestId);

          if (index !== -1) {
            requestList.value[index] = {
              ...requestList.value[index],
              monitorRequestId,
              monitorSyncStatus: monitorRequestId ? "synced" : "failed",
            };
          }
        })
        .catch((syncError: unknown) => {
          const errorMessage = getErrorMessage(syncError);
          console.log("Ошибка синхронизации заявки с картой:", errorMessage);

          const index = requestList.value.findIndex((item) => item.id === requestId);
          if (index !== -1) {
            requestList.value[index] = {
              ...requestList.value[index],
              monitorSyncStatus: "failed",
            };
          }
        });
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
