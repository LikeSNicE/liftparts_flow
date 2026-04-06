import type {
  PartsRequestUrgency,
} from "@/types/PartsRequestTypes";
import type { TableHeader } from "@/types/TableTypes";
import type { StatusOption } from "@/data/statusOptionsData";

export interface UrgencyOption {
  label: string;
  value: PartsRequestUrgency;
  color?: string;
}

// Статусы заявок на запчасти
export const partsRequestStatusOptions: StatusOption[] = [
  { label: "Все статусы", value: "" },
  {
    label: "Ожидает обработки",
    value: "pending",
    color: "bg-blue-100 text-blue-700",
  },
  {
    label: "Одобрено",
    value: "approved",
    color: "bg-green-100 text-green-700",
  },
  {
    label: "Отклонено",
    value: "rejected",
    color: "bg-red-100 text-red-700",
  },
  {
    label: "Выдано",
    value: "issued",
    color: "bg-purple-100 text-purple-700",
  },
  {
    label: "Завершено",
    value: "completed",
    color: "bg-gray-100 text-gray-700",
  },
];

// Уровни срочности
export const urgencyOptions: UrgencyOption[] = [
  {
    label: "Низкая",
    value: "low",
    color: "bg-green-100 text-green-700",
  },
  {
    label: "Средняя",
    value: "medium",
    color: "bg-orange-100 text-orange-700",
  },
  {
    label: "Высокая",
    value: "high",
    color: "bg-red-100 text-red-700",
  },
];

export const partsRequestTableHeaders: TableHeader[] = [
  {
    label: "№",
    value: "id",
  },
  {
    label: "Дата создания",
    value: "createdAt",
  },
  {
    label: "Автор",
    value: "author",
  },

  { value: "urgency", label: "Срочность" },

  {
    label: "Статус",
    value: "status",
  },
  { label: "Запчасти", value: "parts" },
  { label: "Назначение", value: "purpose" },
  { label: "Действия", value: "actions" },
];
