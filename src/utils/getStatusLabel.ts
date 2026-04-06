import { statusOptions } from "@/data/statusOptionsData";
import type { StatusOption } from "@/data/statusOptionsData";

// Получить отображаемое название статуса
export const getStatusLabel = (status: string) => {
  const option = statusOptions.find((s) => s.value === status);
  return option ? option.label : status;
};
