import { useState } from "react";
import { autocompleteService, AutocompleteResponse, PlaceItem } from "../services/autocompleteService";

export function usePlacesAutocomplete() {
  const [options, setOptions] = useState<Array<PlaceItem>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query || query.trim().length < 5) {
      setOptions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res: AutocompleteResponse = await autocompleteService.places({
        QueryText: query,
        AdditionalFeatures: ["Core"],
      });
      setOptions(res.ResultItems);
    } catch (err: any) {
      console.error("Autocomplete error", err);
      setError("Errore nella ricerca");
    } finally {
      setLoading(false);
    }
  };

  return { options, loading, error, search };
}