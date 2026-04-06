import {
  MAP_MESSAGE_TYPE,
  type AddressSelectedMessage,
} from "@/constants/mapMessages";

export const isAddressSelectedMessage = (
  value: unknown,
): value is AddressSelectedMessage => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as {
    type?: unknown;
    data?: {
      lat?: unknown;
      lon?: unknown;
      address?: unknown;
    };
  };

  if (message.type !== MAP_MESSAGE_TYPE.ADDRESS_SELECTED || !message.data) {
    return false;
  }

  return (
    typeof message.data.lat === "number" &&
    Number.isFinite(message.data.lat) &&
    typeof message.data.lon === "number" &&
    Number.isFinite(message.data.lon) &&
    typeof message.data.address === "string" &&
    message.data.address.trim().length > 0
  );
};

export const isTrustedMapOrigin = (origin: string) => {
  if (typeof window === "undefined") {
    return true;
  }

  return origin === window.location.origin;
};
