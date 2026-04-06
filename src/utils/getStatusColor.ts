import type { StatusOption } from "@/data/statusOptionsData";
import { statusOptions } from "@/data/statusOptionsData";

// Получить цвет статуса
export const getStatusColor = (status: string) => {
  const option = statusOptions.find((s: StatusOption) => s.value === status);
  return option?.color || "bg-gray-100 text-gray-700";
};
