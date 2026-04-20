import { useState } from 'react';
import { autocompleteService } from '../services/autocompleteService';
import { browserConsole } from '../utils/consoleLogger';
import {
  AddressAutocompleteResponseDTO,
  AddressAutocompleteResultItemDTO,
} from '../api/generated/autocomplete/data-contracts';

export function usePlacesAutocomplete() {
  const [options, setOptions] = useState<Array<AddressAutocompleteResultItemDTO>>([]);
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
      const res: AddressAutocompleteResponseDTO = await autocompleteService.getAddresses({
        QueryText: query,
      });
      setOptions([...(res?.ResultItems ?? [])]);
    } catch (err: any) {
      browserConsole.error('Autocomplete error', err);
      setError('Errore nella ricerca');
    } finally {
      setLoading(false);
    }
  };

  return { options, loading, error, search };
}
