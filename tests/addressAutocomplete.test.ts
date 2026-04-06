import { describe, expect, it } from "vitest";
import { buildQueryVariants } from "../src/composables/useAddressAutocomplete";

describe("address autocomplete query variants", () => {
  it("creates multiple normalized variants", () => {
    const variants = buildQueryVariants("Астана, ул. Ыкылас Дукенулы, 29а");

    expect(variants.length).toBeGreaterThan(3);
    expect(variants.some((item) => item.includes("Казахстан"))).toBe(true);
    expect(variants.some((item) => /29а/i.test(item))).toBe(true);
  });

  it("deduplicates generated variants", () => {
    const variants = buildQueryVariants("ул. Абая, 10");
    const unique = new Set(variants);

    expect(variants.length).toBe(unique.size);
  });
});
