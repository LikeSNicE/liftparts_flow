import type { Option } from "@/types/OptionsTypes";

export const urgencyOptions: Option[] = [
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
