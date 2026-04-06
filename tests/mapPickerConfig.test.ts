import { describe, expect, it } from "vitest";
import { buildMapPickerUrl, MAP_PICKER_PATH } from "../src/config/mapPicker";

describe("map picker config", () => {
  it("builds picker url with explicit parent origin", () => {
    const url = buildMapPickerUrl("https://app.example.com");

    expect(url.startsWith(MAP_PICKER_PATH)).toBe(true);
    expect(url).toContain("parentOrigin=https%3A%2F%2Fapp.example.com");
  });
});
