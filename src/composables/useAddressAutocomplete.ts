import { ref } from "vue";

export interface AddressSuggestion {
  displayName: string;
  latitude: number;
  longitude: number;
}

interface NominatimSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

const cityAliases: Record<string, string[]> = {
  Астана: ["астана", "astana", "нур султан", "нур-султан", "nur sultan", "nur-sultan"],
  Алматы: ["алматы", "almaty", "alma ata", "alma-ata"],
  Шымкент: ["шымкент", "shymkent", "chimkent"],
};

const matchesCity = (displayName: string, city?: string) => {
  if (!city) {
    return true;
  }

  const normalizedName = displayName.toLowerCase();
  const variants = cityAliases[city] || [city.toLowerCase()];
  return variants.some((variant) => normalizedName.includes(variant));
};

export const buildQueryVariants = (rawQuery: string) => {
  const trimmed = rawQuery.trim();
  const noCity = trimmed
    .replace(/^г\.\s*астана,?\s*/i, "")
    .replace(/^астана,?\s*/i, "")
    .trim();

  const noStreetPrefix = noCity
    .replace(/\bулица\b/gi, "")
    .replace(/\bул\.\b/gi, "")
    .replace(/\bул\b/gi, "")
    .replace(/\bпроспект\b/gi, "")
    .replace(/\bпр-т\b/gi, "")
    .replace(/\bпр\.\b/gi, "")
    .replace(/\bпр\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const compact = noStreetPrefix.replace(/,/g, " ").replace(/\s+/g, " ").trim();

  const houseMatch = compact.match(/\b\d+[а-яa-z]?\b/i);
  const words = compact
    .split(" ")
    .map((item) => item.trim())
    .filter((item) => item && !/^\d+[а-яa-z]?$/i.test(item));

  const targetedVariants: string[] = [];
  if (houseMatch && words.length > 0) {
    targetedVariants.push(`${words[words.length - 1]} ${houseMatch[0]}`);
  }
  if (houseMatch && words.length > 1) {
    targetedVariants.push(`${words[words.length - 2]} ${houseMatch[0]}`);
  }

  const variants = [
    trimmed,
    `${trimmed}, Казахстан`,
    noCity,
    `${noCity}, Казахстан`,
    noStreetPrefix,
    `${noStreetPrefix}, Казахстан`,
    compact,
    ...targetedVariants,
  ];

  return variants.filter(
    (item, index, arr) => item.length >= 3 && arr.indexOf(item) === index,
  );
};

export const useAddressAutocomplete = () => {
  const suggestions = ref<AddressSuggestion[]>([]);
  const isLoading = ref(false);
  const lastQuery = ref("");
  let abortController: AbortController | null = null;

  const clearSuggestions = () => {
    suggestions.value = [];
  };

  const searchAddresses = async (query: string, city?: string) => {
    const trimmedQuery = query.trim();
    lastQuery.value = trimmedQuery;

    if (trimmedQuery.length < 3) {
      clearSuggestions();
      return;
    }

    abortController?.abort();
    abortController = new AbortController();
    isLoading.value = true;

    try {
      const variants = buildQueryVariants(trimmedQuery);
      const aggregated: NominatimSuggestion[] = [];

      for (const variant of variants) {
        const params = new URLSearchParams({
          format: "json",
          q: variant,
          addressdetails: "1",
          limit: "8",
          "accept-language": "ru",
          countrycodes: "kz",
        });

        const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
          signal: abortController.signal,
          headers: {
            "Accept-Language": "ru",
          },
        });

        if (!response.ok) {
          continue;
        }

        const data = (await response.json()) as NominatimSuggestion[];
        if (Array.isArray(data) && data.length > 0) {
          aggregated.push(...data);
        }

        if (aggregated.length >= 12) {
          break;
        }
      }

      if (lastQuery.value !== trimmedQuery) {
        return;
      }

      const seen = new Set<string>();
      const uniqueData = aggregated.filter((item) => {
        const key = `${item.display_name}:${item.lat}:${item.lon}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });

      suggestions.value = uniqueData
        .filter((item) => matchesCity(item.display_name, city))
        .map((item) => ({
          displayName: item.display_name,
          latitude: Number.parseFloat(item.lat),
          longitude: Number.parseFloat(item.lon),
        }));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      clearSuggestions();
    } finally {
      isLoading.value = false;
    }
  };

  return {
    suggestions,
    isLoading,
    searchAddresses,
    clearSuggestions,
  };
};
