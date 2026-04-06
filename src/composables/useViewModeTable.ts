import { ref } from "vue";
import type { ViewModeTable } from "@/types/TableTypes";

export const useViewModeTable = () => {
  const viewMode = ref<ViewModeTable>(localStorage.getItem("tableViewMode") as ViewModeTable || "table");

  const changeViewMode = (mode: ViewModeTable) => {
    viewMode.value = mode;
    localStorage.setItem("tableViewMode", mode);
  }

  return { viewMode, changeViewMode };
}
