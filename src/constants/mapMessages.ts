export const MAP_MESSAGE_TYPE = {
  ADDRESS_SELECTED: "ADDRESS_SELECTED",
} as const;

export type MapMessageType =
  (typeof MAP_MESSAGE_TYPE)[keyof typeof MAP_MESSAGE_TYPE];

export interface AddressSelectedPayload {
  lat: number;
  lon: number;
  address: string;
}

export interface AddressSelectedMessage {
  type: typeof MAP_MESSAGE_TYPE.ADDRESS_SELECTED;
  data: AddressSelectedPayload;
}
