import type { Option } from "@/types/OptionsTypes";

export const statusEmployeeOptionsData: Option[] = [
  {
    label: "Все",
    value: "",
  },
  {
    label: "На работе",
    value: "at_work",
    color: "bg-(--blue-bg) text-(--blue",
  },
  {
    label: "Удалённо",
    value: "remote",
    color: "bg-(--green) text-(--white)",
  },
  { label: "Перерыв", value: "break", color: "bg-(--orange) text-(--white)" },
  {
    label: "Отпуск",
    value: "vacation",
    color: "bg-(--purple-bg) text-(--purple)",
  },
  { label: "Неактивен", value: "inactive", color: "bg-(--red) text-(--white)" },
];
