import type { RequestStatus } from "@/types/RequestTypes";

export interface StatusOption {
  label: string;
  value: RequestStatus | "";
  color?: string;
}

export interface PartOption {
  label: string;
  value: string;
}

export interface EmergencyProblem {
  label: string;
  value: string;
}

// Статусы заявок с отображаемыми названиями и цветами
export const statusOptions: StatusOption[] = [
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

// Список деталей для выбора
export const partOptions: PartOption[] = [
  { label: "Трос лебедки 8мм", value: "Трос лебедки 8мм" },
  { label: "Кнопка вызова 22мм", value: "Кнопка вызова 22мм" },
  { label: "Ремень привода дверей", value: "Ремень привода дверей" },
  { label: "Лампа LED 12В", value: "Лампа LED 12В" },
  { label: "Контактор главного привода", value: "Контактор главного привода" },
  { label: "Датчик положения кабины", value: "Датчик положения кабины" },
  { label: "Подшипник вала", value: "Подшипник вала" },
  { label: "Муфта сцепления", value: "Муфта сцепления" },
  { label: "Тормозная колодка", value: "Тормозная колодка" },
  { label: "Реле безопасности", value: "Реле безопасности" },
];

// Список проблем для аварийной заявки
export const emergencyProblems: EmergencyProblem[] = [
  { label: "Застрял лифт (люди внутри)", value: "Застрял лифт (люди внутри)" },
  { label: "Застрял лифт (без людей)", value: "Застрял лифт (без людей)" },
  { label: "Затопление / прорыв трубы", value: "Затопление / прорыв трубы" },
  {
    label: "Пожар / запах дыма / возгорание",
    value: "Пожар / запах дыма / возгорание",
  },
  {
    label: "Авария электроснабжения (отключение света)",
    value: "Авария электроснабжения (отключение света)",
  },
  { label: "Прорыв канализации", value: "Прорыв канализации" },
  {
    label: "Обрушение конструкции / трещина",
    value: "Обрушение конструкции / трещина",
  },
  {
    label: "Медицинская помощь (сердце, потеря сознание и т.д.)",
    value: "Медицинская помощь (сердце, потеря сознание и т.д.)",
  },
  { label: "Другое", value: "other" },
];
