import { defineStore } from "pinia";
import { ref } from "vue";
import type { Request, RequestForm, RequestStatus } from "@/types/RequestTypes";

export const useRequestStore = defineStore("requests", () => {
  // Список заявок
  const requestList = ref<Request[]>([
    {
      id: 1,
      title: "Замена троса лебедки",
      author: "Иванов П.С.",
      authorId: 1,
      status: "pending",
      liftId: "ELT-001",
      type: "planned",
      partName: "Трос лебедки 8мм",
      quantity: 2,
      objectAddress: "ул. Ленина 42, лифт №7",
      comment: "Износ троса более 50%",
      createdAt: "2026-03-20T10:00:00",
    },
    {
      id: 2,
      title: "Замена кнопки вызова",
      author: "Петров А.И.",
      authorId: 2,
      status: "in_progress",
      liftId: "ELT-005",
      type: "emergency",
      partName: "Кнопка вызова 22мм",
      quantity: 1,
      objectAddress: "пр. Мира 15, лифт №3",
      createdAt: "2026-03-21T14:30:00",
    },
    {
      id: 3,
      title: "Ремонт привода дверей",
      author: "Сидоров В.К.",
      authorId: 3,
      status: "approved",
      liftId: "ELT-012",
      type: "planned",
      partName: "Ремень привода дверей",
      quantity: 1,
      objectAddress: "ул. Гагарина 8, лифт №1",
      comment: "Стук при открытии дверей",
      createdAt: "2026-03-22T09:15:00",
    },
    {
      id: 4,
      title: "Замена лампы освещения",
      author: "Иванов П.С.",
      authorId: 1,
      status: "completed",
      liftId: "ELT-003",
      type: "planned",
      partName: "Лампа LED 12В",
      quantity: 2,
      objectAddress: "ул. Ленина 42, лифт №5",
      createdAt: "2026-03-18T11:00:00",
      updatedAt: "2026-03-19T16:00:00",
    },
    {
      id: 5,
      title: "Замена контактора",
      author: "Петров А.И.",
      authorId: 2,
      status: "rejected",
      liftId: "ELT-007",
      type: "emergency",
      partName: "Контактор главного привода",
      quantity: 1,
      objectAddress: "ул. Пушкина 22, лифт №2",
      comment: "Отказано: деталь снята с производства",
      createdAt: "2026-03-19T08:45:00",
      updatedAt: "2026-03-19T12:00:00",
    },
  ]);

  // Получить все заявки
  const getRequests = async () => {
    // В будущем здесь будет API запрос
    return requestList.value;
  };

  // Создать новую заявку
  const createRequest = async (requestForm: RequestForm) => {
    const newRequest: Request = {
      ...requestForm,
      id: Math.max(...requestList.value.map((r) => r.id), 0) + 1,
      createdAt: new Date().toISOString(),
    };
    requestList.value.push(newRequest);
    return newRequest;
  };

  // Обновить заявку
  const updateRequest = async (id: number, requestForm: Partial<RequestForm>) => {
    const index = requestList.value.findIndex((r) => r.id === id);
    if (index !== -1) {
      requestList.value[index] = {
        ...requestList.value[index],
        ...requestForm,
        updatedAt: new Date().toISOString(),
      };
    }
  };

  // Удалить заявку
  const deleteRequest = async (id: number) => {
    requestList.value = requestList.value.filter((r) => r.id !== id);
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
