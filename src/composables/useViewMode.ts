import { ref } from "vue";
export type ViewModeTable = "table" | "list";

// Глобальное состояние viewMode
const viewMode = ref<ViewModeTable>(
  (localStorage.getItem("tableViewMode") as ViewModeTable) || "table",
);

export const useViewMode = () => {
  const changeViewMode = (mode: ViewModeTable) => {
    viewMode.value = mode;
    localStorage.setItem("tableViewMode", mode);
  };

  return { viewMode, changeViewMode };
};
