import { act, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { usePlacesAutocomplete } from '../useAutocomplete';
import { autocompleteService } from '../../services/autocompleteService';
import { AddressDTO } from '../../api/generated/autocomplete/AddressDTO';

jest.mock('../../services/autocompleteService');

const mockedAutocompleteService = autocompleteService as jest.Mocked<typeof autocompleteService>;

describe('usePlacesAutocomplete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return the initial state correctly', () => {
    const { result } = renderHook(() => usePlacesAutocomplete());

    expect(result.current.options).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should not call the api and should clear options if query is too short', async () => {
    const { result } = renderHook(() => usePlacesAutocomplete());

    await act(async () => {
      await result.current.search('abc');
    });

    expect(mockedAutocompleteService.getAddresses).not.toHaveBeenCalled();
    expect(result.current.options).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  test('should call the api and update options on successful search', async () => {
    const mockAddresses: Array<AddressDTO> = [
      { FullAddress: 'Via Roma 1, 00100 Roma RM' },
      { FullAddress: 'Via Roma 2, 00100 Roma RM' },
    ];
    mockedAutocompleteService.getAddresses.mockResolvedValue({ ResultItems: mockAddresses });

    const { result } = renderHook(() => usePlacesAutocomplete());

    act(() => {
      result.current.search('via roma 1');
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(mockedAutocompleteService.getAddresses).toHaveBeenCalledWith({
        QueryText: 'via roma 1',
      });
      expect(result.current.options).toEqual(mockAddresses);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  test('should handle API errors gracefully', async () => {
    const mockError = new Error('Network Error');
    mockedAutocompleteService.getAddresses.mockRejectedValue(mockError);

    const { result } = renderHook(() => usePlacesAutocomplete());
    act(() => {
      result.current.search('query che causa errore');
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(mockedAutocompleteService.getAddresses).toHaveBeenCalledWith({
        QueryText: 'query che causa errore',
      });
      expect(result.current.error).toBe('Errore nella ricerca');
      expect(result.current.loading).toBe(false);
      expect(result.current.options).toEqual([]);
    });
  });
});
