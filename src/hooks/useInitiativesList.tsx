import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { match } from 'react-router-dom';
import { getMerchantInitiativeList } from '../services/merchantService';
import { useAppDispatch } from '../redux/hooks';
import { setInitiativesList } from '../redux/slices/initiativesSlice';
import { StatusEnum } from '../api/generated/merchants/InitiativeDTO';
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
            (r) => r.status === StatusEnum.PUBLISHED || r.status === StatusEnum.CLOSED
          );
          dispatch(setInitiativesList(resFiltered));
        })
        .catch(() => {
          setAlert(t('errors.genericTitle'), t('errors.genericDescription'), true);
        });
    }
  }, [match]);
};
