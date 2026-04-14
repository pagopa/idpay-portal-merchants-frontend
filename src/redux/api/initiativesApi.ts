import { createApi } from '@reduxjs/toolkit/query/react';
import { getMerchantInitiativeList } from '../../services/merchantService';
import { StatusEnum } from '../../api/generated/merchants/InitiativeDTO';
import { setInitiativesList } from '../slices/initiativesSlice';

/**
 * RTK Query API layer introduced in BRIDGE MODE.
 * 
 * IMPORTANT:
 * - Does NOT change existing business logic.
 * - Keeps initiativesSlice as source of truth.
 * - Only adds caching + deduplication.
 * - Dispatches setInitiativesList to preserve current behavior.
 */

export const initiativesApi = createApi({
  reducerPath: 'initiativesApi',
  baseQuery: async () => ({ data: {} }),
  tagTypes: ['Initiatives'],
  endpoints: (builder) => ({
    getInitiatives: builder.query<Array<any>, { enabled: boolean }>({
      async queryFn(arg, { dispatch }) {
        try {
          if (!arg?.enabled) {
            return { data: [] };
          }

          const response = await getMerchantInitiativeList();

          const filtered = response.filter(
            (r) =>
              r.status === StatusEnum.PUBLISHED ||
              r.status === StatusEnum.CLOSED
          );

          // Bridge: keep existing slice behavior
          dispatch(setInitiativesList(filtered));

          return { data: filtered };
        } catch (error: any) {
          return { error };
        }
      },
      providesTags: ['Initiatives'],
    }),
  }),
});

export const { useGetInitiativesQuery } = initiativesApi;
