import { useEffect } from 'react';
import { match } from 'react-router-dom';
import { getMerchantInitiativeList } from '../services/merchantService';
import { useAppDispatch } from '../redux/hooks';
import { setInitiativesList } from '../redux/slices/initiativesSlice';

const PUBLISHED = 'PUBLISHED';
const CLOSED = 'CLOSED';

/**
 * Fetches, filters, and stores the merchant's initiative list in Redux.
 *
 * - Does nothing when `match` is null (route not matched).
 * - Filters to PUBLISHED and CLOSED statuses only.
 * - On error, dispatching is skipped (error is handled silently).
 */
export const useInitiativesList = (matchObj: match | null): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!matchObj) {
      return;
    }

    getMerchantInitiativeList()
      .then((list) => {
        const filtered = list.filter((item) => item.status === PUBLISHED || item.status === CLOSED);
        dispatch(setInitiativesList(filtered));
      })
      .catch(() => {
        // error handled silently; no dispatch on failure
      });
  }, [matchObj]);
};
