import { defineStore } from "pinia";
import type { Elevator } from "@/types/ElevatorTypes";
import { ref } from "vue";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { api } from "@/service/apiInstance";

export const useElevatorStore = defineStore("elevator", () => {
  const elevatorList = ref<Elevator[]>([]);

  const getElevators = async () => {
    try {
      const { data } = await api.get<Elevator[]>("/elevators");

      if (!data || !Array.isArray(data)) {
        throw new Error("Некорректный формат данных от сервера");
      }

      elevatorList.value = data;
    } catch (error: unknown) {
      const errrorMessage = getErrorMessage(error);
      console.log(errrorMessage);
      throw new Error(
        "Не удалось загрузить лифты. Пожалуйста, попробуйте позже.",
      );
    }
  };

  return {
    elevatorList,
    getElevators,
  };
});
