import type { Option } from "@/types/OptionsTypes";

export const statusOptionsData: Option[] = [
  { label: "Все статусы", value: "" },
  {
    label: "В ожидании",
    value: "pending",
    color: "bg-(--blue-bg) text-(--blue)",
  },
  {
    label: "В работе",
    value: "in_progress",
    color: "bg-orange-100 text-orange-700",
  },
  {
    label: "Согласовано",
    value: "approved",
    color: "bg-green-100 text-green-700",
  },
  { label: "Отклонено", value: "rejected", color: "bg-red-100 text-red-700" },
  {
    label: "Выполнено",
    value: "completed",
    color: "bg-(--purple-bg) text-(--purple)",
  },
];
