import { configureStore } from '@reduxjs/toolkit';
import { initiativesApi } from '../initiativesApi';
import * as merchantService from '../../../services/merchantService';
import { StatusEnum } from '../../../api/generated/merchants/InitiativeDTO';
import { setInitiativesList } from '../../slices/initiativesSlice';

/**
 * NOTE:
 * We use jest.spyOn instead of jest.mock factory because
 * initiativesApi imports the function directly.
 */

describe('initiativesApi - getInitiatives', () => {
  const createTestStore = () =>
    configureStore({
      reducer: {
        [initiativesApi.reducerPath]: initiativesApi.reducer,
      },
      middleware: (gDM) => gDM().concat(initiativesApi.middleware),
    });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should return empty array and NOT call service if enabled is false', async () => {
    const store = createTestStore();

    const spy = jest.spyOn(
      merchantService,
      'getMerchantInitiativeList'
    );

    const result = await store.dispatch(
      initiativesApi.endpoints.getInitiatives.initiate({ enabled: false })
    );

    expect(result.data).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should call service, filter by PUBLISHED and CLOSED and dispatch setInitiativesList', async () => {
    const store = createTestStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const mockResponse = [
      { id: '1', status: StatusEnum.PUBLISHED },
      { id: '2', status: StatusEnum.CLOSED },
      { id: '3', status: StatusEnum.DRAFT },
    ];

    const spy = jest
      .spyOn(merchantService, 'getMerchantInitiativeList')
      .mockResolvedValue(mockResponse);

    const result = await store.dispatch(
      initiativesApi.endpoints.getInitiatives.initiate({ enabled: true })
    );

    const expectedFiltered = [
      { id: '1', status: StatusEnum.PUBLISHED },
      { id: '2', status: StatusEnum.CLOSED },
    ];

    expect(spy).toHaveBeenCalledTimes(1);
    expect(result.data).toEqual(expectedFiltered);

    expect(dispatchSpy).toHaveBeenCalledWith(
      setInitiativesList(expectedFiltered)
    );
  });

  it('should return error if service throws', async () => {
    const store = createTestStore();

    const mockError = new Error('API error');

    const spy = jest
      .spyOn(merchantService, 'getMerchantInitiativeList')
      .mockRejectedValue(mockError);

    const result = await store.dispatch(
      initiativesApi.endpoints.getInitiatives.initiate({ enabled: true })
    );

    expect(spy).toHaveBeenCalledTimes(1);
    expect(result.error).toBeDefined();
  });
});
