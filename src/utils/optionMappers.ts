type Option = {
  value: string;
  label: string;
  color?: string;
};

/**
 * Создает функцию для получения свойства из массива опций
 */
const createOptionMapper = <T extends Option>(
  options: T[],
  property: keyof T,
  defaultValue: string = ""
) => {
  return (value: string): string => {
    const option = options.find((opt) => opt.value === value);
    return option ? (option[property] as string) : defaultValue;
  };
};

/**
 * Создает набор функций (label и color) для работы с опциями
 */
export const createOptionHelpers = <T extends Option>(options: T[]) => {
  return {
    getLabel: createOptionMapper(options, "label", ""),
    getColor: createOptionMapper(options, "color", "bg-gray-100 text-gray-700"),
  };
};
