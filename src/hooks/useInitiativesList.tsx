import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { match } from 'react-router-dom';
import { getMerchantInitiativeList } from '../services/merchantService';
import { useAppDispatch } from '../redux/hooks';
import { setInitiativesList } from '../redux/slices/initiativesSlice';

export const useInitiativesList = (match: match | null) => {
  const addError = useErrorDispatcher();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (match !== null) {
      getMerchantInitiativeList()
        .then((response) => {
          console.log(response);
          dispatch(setInitiativesList(response));
        })
        .catch((error) => {
          addError({
            id: 'GET_MERCHANTS_INITIATIVE_LIST',
            blocking: false,
            error,
            techDescription: 'An error occurred getting merchant initiative list',
            displayableTitle: t('errors.title'),
            displayableDescription: t('errors.getDataDescription'),
            toNotify: true,
            component: 'Toast',
            showCloseIcon: true,
          });
        });
    }
  }, [match]);
};
