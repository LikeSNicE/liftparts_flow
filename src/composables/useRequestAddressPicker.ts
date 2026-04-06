import { computed, onBeforeUnmount, ref } from "vue";
import type { RepairRequestForm } from "@/types/RepairRequestTypes";
import {
  useAddressAutocomplete,
  type AddressSuggestion,
} from "@/composables/useAddressAutocomplete";
import { buildMapPickerUrl } from "@/config/mapPicker";
import {
  isAddressSelectedMessage,
  isTrustedMapOrigin,
} from "@/utils/mapMessageProtocol";

const DEFAULT_CITY = "Астана";
const CITY_OPTIONS = ["Астана", "Алматы", "Шымкент"];

export const useRequestAddressPicker = (requestForm: RepairRequestForm) => {
  const addressError = ref("");
  const selectedAddress = ref<AddressSuggestion | null>(null);
  const isMapDialogVisible = ref(false);
  const isSuggestionsVisible = ref(false);
  let addressSearchTimeout: ReturnType<typeof setTimeout> | null = null;

  const {
    suggestions: addressSuggestions,
    isLoading: addressLoading,
    searchAddresses,
    clearSuggestions,
  } = useAddressAutocomplete();

  const mapPickerUrl = computed(() => buildMapPickerUrl());

  const hasAddressSuggestions = computed(
    () => isSuggestionsVisible.value && addressSuggestions.value.length > 0,
  );

  const isAddressFixed = computed(
    () =>
      Boolean(selectedAddress.value) &&
      requestForm.latitude !== null &&
      requestForm.latitude !== undefined &&
      requestForm.longitude !== null &&
      requestForm.longitude !== undefined,
  );

  const fixedCoordinatesLabel = computed(() => {
    if (!isAddressFixed.value) {
      return "";
    }

    return `${Number(requestForm.latitude).toFixed(6)}, ${Number(requestForm.longitude).toFixed(6)}`;
  });

  const clearAddressSearchTimeout = () => {
    if (addressSearchTimeout) {
      clearTimeout(addressSearchTimeout);
      addressSearchTimeout = null;
    }
  };

  const resetAddressState = () => {
    requestForm.latitude = null;
    requestForm.longitude = null;
    requestForm.objectAddress = "";
    selectedAddress.value = null;
    addressError.value = "";
    isSuggestionsVisible.value = false;
    clearSuggestions();
    clearAddressSearchTimeout();
  };

  const clearAddressFeedback = () => {
    selectedAddress.value = null;
    requestForm.latitude = null;
    requestForm.longitude = null;
    addressError.value = "";
  };

  const handleAddressInput = () => {
    clearAddressFeedback();
    clearAddressSearchTimeout();

    addressSearchTimeout = setTimeout(async () => {
      await searchAddresses(requestForm.objectAddress || "", requestForm.city);
      isSuggestionsVisible.value = addressSuggestions.value.length > 0;

      if (
        (requestForm.objectAddress || "").trim().length >= 3 &&
        addressSuggestions.value.length === 0
      ) {
        addressError.value = "Адреса не найдены";
      }
    }, 300);
  };

  const handleAddressFocus = () => {
    isSuggestionsVisible.value = addressSuggestions.value.length > 0;
  };

  const handleAddressBlur = () => {
    setTimeout(() => {
      isSuggestionsVisible.value = false;
    }, 120);
  };

  const handleCityChange = () => {
    resetAddressState();
  };

  const applyAddressSuggestion = (suggestion: AddressSuggestion) => {
    selectedAddress.value = suggestion;
    requestForm.objectAddress = suggestion.displayName;
    requestForm.latitude = suggestion.latitude;
    requestForm.longitude = suggestion.longitude;
    isSuggestionsVisible.value = false;
    clearSuggestions();
    addressError.value = "";
  };

  const openMapPicker = () => {
    isMapDialogVisible.value = true;
  };

  const closeMapPicker = () => {
    isMapDialogVisible.value = false;
  };

  const handleMapMessage = (event: MessageEvent) => {
    if (!isTrustedMapOrigin(event.origin)) {
      return;
    }

    if (!isAddressSelectedMessage(event.data)) {
      return;
    }

    const payload = event.data.data;
    const latitude = payload.lat;
    const longitude = payload.lon;
    const address = payload.address;

    requestForm.objectAddress = address;
    requestForm.latitude = latitude;
    requestForm.longitude = longitude;
    selectedAddress.value = {
      displayName: address,
      latitude,
      longitude,
    };

    clearSuggestions();
    isSuggestionsVisible.value = false;
    addressError.value = "";
    closeMapPicker();
  };

  const validateAddressSelection = () => {
    requestForm.objectAddress = (requestForm.objectAddress || "").trim();

    if (
      !requestForm.objectAddress ||
      requestForm.latitude === null ||
      requestForm.latitude === undefined ||
      requestForm.longitude === null ||
      requestForm.longitude === undefined
    ) {
      addressError.value =
        "Выберите адрес из подсказок, чтобы заявка и карта были синхронизированы";
      return false;
    }

    return true;
  };

  if (!requestForm.city) {
    requestForm.city = DEFAULT_CITY;
  }

  if (typeof window !== "undefined") {
    window.addEventListener("message", handleMapMessage);
  }

  onBeforeUnmount(() => {
    clearAddressSearchTimeout();

    if (typeof window !== "undefined") {
      window.removeEventListener("message", handleMapMessage);
    }
  });

  return {
    cityOptions: CITY_OPTIONS,
    defaultCity: DEFAULT_CITY,
    addressError,
    isMapDialogVisible,
    mapPickerUrl,
    addressSuggestions,
    addressLoading,
    hasAddressSuggestions,
    isAddressFixed,
    fixedCoordinatesLabel,
    handleAddressInput,
    handleAddressFocus,
    handleAddressBlur,
    handleCityChange,
    applyAddressSuggestion,
    openMapPicker,
    closeMapPicker,
    resetAddressState,
    validateAddressSelection,
  };
};
