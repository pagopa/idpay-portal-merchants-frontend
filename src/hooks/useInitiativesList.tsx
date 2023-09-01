import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { match } from 'react-router-dom';
import { getMerchantInitiativeList } from '../services/merchantService';
import { useAppDispatch } from '../redux/hooks';
import { setInitiativesList } from '../redux/slices/initiativesSlice';
import { StatusEnum } from '../api/generated/merchants/InitiativeDTO';

export const useInitiativesList = (match: match | null) => {
  const addError = useErrorDispatcher();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (match !== null) {
      getMerchantInitiativeList()
        .then((response) => {
          const resFiltered = response.filter(
            (r) => r.status === StatusEnum.PUBLISHED || r.status === StatusEnum.CLOSED
          );
          dispatch(setInitiativesList(resFiltered));
        })
        .catch((error) => {
          addError({
            id: 'GET_MERCHANTS_INITIATIVE_LIST',
            blocking: false,
            error,
            techDescription: 'An error occurred getting merchant initiative list',
            displayableTitle: t('errors.genericTitle'),
            displayableDescription: t('errors.genericDescription'),
            toNotify: true,
            component: 'Toast',
            showCloseIcon: true,
          });
        });
    }
  }, [match]);
};
