import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { useInitiativesList } from '../useInitiativesList';
import { getMerchantInitiativeList } from '../../services/merchantService';
import { useAppDispatch } from '../../redux/hooks';
import { setInitiativesList } from '../../redux/slices/initiativesSlice';
import { InitiativeDTO, StatusEnum } from '../../api/generated/merchants/InitiativeDTO';
import { match } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

jest.mock('../../services/merchantService', () => ({
  getMerchantInitiativeList: jest.fn(),
}));
const mockedGetMerchantInitiativeList = getMerchantInitiativeList as jest.Mock;

jest.mock('../../redux/hooks');
const mockedUseAppDispatch = useAppDispatch as jest.Mock;

jest.mock('react-i18next');
const mockedUseTranslation = useTranslation as jest.Mock;

const mockInitiatives: Array<InitiativeDTO> = [
  { initiativeId: '1', initiativeName: 'Iniziativa Pubblicata', status: StatusEnum.PUBLISHED },
  { initiativeId: '2', initiativeName: 'Iniziativa Chiusa', status: StatusEnum.CLOSED },
  { initiativeId: '3', initiativeName: 'Iniziativa in Bozza', status: StatusEnum.DRAFT },
];

const mockMatchObject: match = {
  path: '/path',
  url: '/url',
  isExact: true,
  params: {},
};

describe('useInitiativesList', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAppDispatch.mockReturnValue(mockDispatch);
    mockedUseTranslation.mockReturnValue({ t: (key: string) => key } as any);
  });

  test('should do nothing if match is null', () => {
    renderHook(() => useInitiativesList(null));

    expect(mockedGetMerchantInitiativeList).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  test('should fetch, filter, and dispatch initiatives on success', async () => {
    const expectedFilteredList = [
      { initiativeId: '1', initiativeName: 'Iniziativa Pubblicata', status: StatusEnum.PUBLISHED },
      { initiativeId: '2', initiativeName: 'Iniziativa Chiusa', status: StatusEnum.CLOSED },
    ];
    mockedGetMerchantInitiativeList.mockResolvedValue(mockInitiatives);

    renderHook(() => useInitiativesList(mockMatchObject));

    await waitFor(() => {
      expect(mockedGetMerchantInitiativeList).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith(setInitiativesList(expectedFilteredList));
    });
  });

  test('should call addError when getMerchantInitiativeList fails', async () => {
    const mockError = new Error('API Failure');
    mockedGetMerchantInitiativeList.mockRejectedValue(mockError);

    renderHook(() => useInitiativesList(mockMatchObject));

    await waitFor(() => {
      expect(mockedGetMerchantInitiativeList).toHaveBeenCalledTimes(1);
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });
});
