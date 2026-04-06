import { describe, expect, it } from "vitest";
import { MAP_MESSAGE_TYPE } from "../src/constants/mapMessages";
import {
  isAddressSelectedMessage,
  isTrustedMapOrigin,
} from "../src/utils/mapMessageProtocol";

describe("map message protocol", () => {
  it("validates ADDRESS_SELECTED payload", () => {
    const message = {
      type: MAP_MESSAGE_TYPE.ADDRESS_SELECTED,
      data: {
        lat: 51.1282,
        lon: 71.4304,
        address: "Астана, ул. Ыкылас Дукенулы, 29",
      },
    };

    expect(isAddressSelectedMessage(message)).toBe(true);
  });

  it("rejects malformed payload", () => {
    const message = {
      type: MAP_MESSAGE_TYPE.ADDRESS_SELECTED,
      data: {
        lat: "51.1282",
        lon: 71.4304,
        address: "",
      },
    };

    expect(isAddressSelectedMessage(message)).toBe(false);
  });

  it("treats origin as trusted without window", () => {
    expect(isTrustedMapOrigin("https://example.com")).toBe(true);
  });
});
