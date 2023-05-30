import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { getMerchantInitiativeList } from '../services/merchantService';
import { useAppDispatch } from '../redux/hooks';
import { setInitiativesList } from '../redux/slices/initiativesSlice';

export const useInitiativesList = () => {
  const addError = useErrorDispatcher();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  useEffect(() => {
    getMerchantInitiativeList()
      .then((response) => {
        dispatch(setInitiativesList(response));
      })
      .catch((error) => {
        addError({
          id: 'GET_MERCHANTS_INITIATIVE_LIST',
          blocking: false,
          error,
          techDescription: 'An error occurred getting merchant initiative list',
          displayableTitle: t('errors.title'),
          displayableDescription: t('errors.desctiption'),
          toNotify: true,
          component: 'Toast',
          showCloseIcon: true,
        });
      });
  }, []);
};
