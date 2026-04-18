import type { TableHeader } from "@/types/TableTypes";

export const repairRequestTableHeaders: TableHeader[] = [
  {
    label: "№",
    value: "id",
  },
  {
    label: "Дата создания",
    value: "createdAt",
  },
  {
    label: "ID работника",
    value: "authorId",
  },
  {
    label: "ID лифта",
    value: "liftId",
  },
  {
    label: "Cтатус",
    value: "status",
  },
  {
    label: "Действия",
    value: "actions",
  }
];
