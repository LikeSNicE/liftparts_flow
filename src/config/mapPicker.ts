const DEFAULT_MAP_PICKER_PATH = "/elevator-map-picker.html";

export const MAP_PICKER_PATH =
  import.meta.env.VITE_MAP_PICKER_PATH || DEFAULT_MAP_PICKER_PATH;

export const buildMapPickerUrl = (parentOrigin?: string) => {
  const origin =
    parentOrigin ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost");
  const query = new URLSearchParams({ parentOrigin: origin });
  return `${MAP_PICKER_PATH}?${query.toString()}`;
};
