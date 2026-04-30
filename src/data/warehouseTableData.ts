import type { TableHeader } from "@/types/TableTypes";
import type { Option } from "@/types/OptionsTypes";

export const warehouseTableHeaders: TableHeader[] = [
  {
    label: "№",
    value: "id",
  },
  {
    label: "Название",
    value: "name",
  },
  {
    label: "Количество",
    value: "quantity",
  },
  {
    label: "Единица",
    value: "unit",
  },
  {
    label: "Статус",
    value: "status",
  },
  {
    label: "Действия",
    value: "actions",
  },
];

export const warehouseStatusPartData: Option[] = [
  {
    label: "Все",
    value: "",
  },
  {
    label: "В наличии",
    value: "in_stock",
    color: "bg-green-100 text-green-700",
  },
  {
    label: "Низкий остаток",
    value: "low_stock",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    label: "Нет в наличии",
    value: "out_of_stock",
    color: "bg-red-100 text-red-700",
  },
];
