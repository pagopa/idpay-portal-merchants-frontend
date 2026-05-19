import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { useInitiativesList } from '../useInitiativesList';
import { getMerchantInitiativeList } from '../../services/merchantService';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setInitiativesList } from '../../redux/slices/initiativesSlice';
import { match } from 'react-router-dom';
import useScopedTranslation from '../useScopedTranslation';
import useScopedTranslation from '../useScopedTranslation';

type InitiativeDTO = {
  initiativeId: string;
  initiativeName: string;
  status: StatusEnum;
};

const StatusEnum = {
  PUBLISHED: 'PUBLISHED',
  CLOSED: 'CLOSED',
  DRAFT: 'DRAFT',
} as const;

type StatusEnum = (typeof StatusEnum)[keyof typeof StatusEnum];

jest.mock('../../services/merchantService', () => ({
  getMerchantInitiativeList: jest.fn(),
}));
const mockedGetMerchantInitiativeList = getMerchantInitiativeList as jest.Mock;

jest.mock('react-i18next');

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

jest.mock('../useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => 'initiative-1',
}));
jest.mock('../useScopedTranslation', () => ({
  useScopedTranslation: jest.fn(),
}));

jest.mock('../../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: jest.fn(), 
}));

jest.mock('../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn()
}));

describe('useInitiativesList', () => {
    (useAppSelector as jest.Mock).mockReturnValue([{initiativeId: 'initiative-1'}])
    (useAppDispatch as jest.Mock)
    (useScopedTranslation as jest.Mock)
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAppDispatch.mockReturnValue(mockDispatch);
    useScopedTranslation.mockReturnValue({ t: (key: string) => key } as any);
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
