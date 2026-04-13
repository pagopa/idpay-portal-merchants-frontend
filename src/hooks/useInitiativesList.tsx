import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { match } from 'react-router-dom';
import { getMerchantInitiativeList } from '../services/merchantService';
import { useAppDispatch } from '../redux/hooks';
import { setInitiativesList } from '../redux/slices/initiativesSlice';
import { InitiativeDTO } from '../api/generated/merchants/data-contracts';
import { useAlert } from './useAlert';

export const useInitiativesList = (match: match | null) => {
  const { setAlert } = useAlert();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (match !== null) {
      getMerchantInitiativeList()
        .then((response) => {
          const resFiltered = response.filter(
            (r: InitiativeDTO) => r.status === 'PUBLISHED' || r.status === 'CLOSED'
          );
          dispatch(setInitiativesList(resFiltered));
        })
        .catch(() => {
          setAlert({
            title: t('errors.genericTitle'),
            text: t('errors.genericDescription'),
            isOpen: true,
            severity: 'error',
          });
        });
    }
  }, [match]);
};
