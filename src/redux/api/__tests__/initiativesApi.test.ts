/**
 * IMPORTANT:
 * We fully mock merchantService to avoid circular dependency
 * (merchantService -> MerchantsApiClient -> store -> initiativesApi).
 * This prevents reducerPath undefined errors.
 */
jest.mock('../../../services/merchantService', () => ({
  getMerchantInitiativeList: jest.fn(),
}));

import { configureStore } from '@reduxjs/toolkit';
import * as merchantService from '../../../services/merchantService';
import { StatusEnum } from '../../../api/generated/merchants/InitiativeDTO';
import { setInitiativesList } from '../../slices/initiativesSlice';

/**
 * IMPORTANT:
 * We require initiativesApi AFTER the mock,
 * to prevent circular dependency evaluation.
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { initiativesApi } = require('../initiativesApi');

describe('initiativesApi - getInitiatives', () => {
  const createTestStore = () =>
    configureStore({
      reducer: {
        [initiativesApi.reducerPath]: initiativesApi.reducer,
      },
      middleware: (gDM) => gDM().concat(initiativesApi.middleware),
    });

  const mockedGetMerchantInitiativeList =
    merchantService.getMerchantInitiativeList as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty array and NOT call service if enabled is false', async () => {
    const store = createTestStore();

    const result = await store.dispatch(
      initiativesApi.endpoints.getInitiatives.initiate({ enabled: false })
    );

    expect(result.data).toEqual([]);
    expect(mockedGetMerchantInitiativeList).not.toHaveBeenCalled();
  });

  it('should call service, filter by PUBLISHED and CLOSED and dispatch setInitiativesList', async () => {
    const store = createTestStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const mockResponse = [
      { id: '1', status: StatusEnum.PUBLISHED },
      { id: '2', status: StatusEnum.CLOSED },
      { id: '3', status: StatusEnum.DRAFT },
    ];

    mockedGetMerchantInitiativeList.mockResolvedValue(mockResponse);

    const result = await store.dispatch(
      initiativesApi.endpoints.getInitiatives.initiate({ enabled: true })
    );

    const expectedFiltered = [
      { id: '1', status: StatusEnum.PUBLISHED },
      { id: '2', status: StatusEnum.CLOSED },
    ];

    expect(mockedGetMerchantInitiativeList).toHaveBeenCalledTimes(1);
    expect(result.data).toEqual(expectedFiltered);

    expect(dispatchSpy).toHaveBeenCalledWith(
      setInitiativesList(expectedFiltered)
    );
  });

  it('should return error if service throws', async () => {
    const store = createTestStore();

    const mockError = new Error('API error');

    mockedGetMerchantInitiativeList.mockRejectedValue(mockError);

    const result = await store.dispatch(
      initiativesApi.endpoints.getInitiatives.initiate({ enabled: true })
    );

    expect(mockedGetMerchantInitiativeList).toHaveBeenCalledTimes(1);
    expect(result.error).toBeDefined();
  });
});
