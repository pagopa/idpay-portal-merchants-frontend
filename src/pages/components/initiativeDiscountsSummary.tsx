import { Box, Card, CardContent, Typography } from '@mui/material';
import { useErrorDispatcher } from '@pagopa/selfcare-common-frontend';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getMerchantDetail, getMerchantInitiativeStatistics } from '../../services/merchantService';

type Props = {
  id: string;
  setInitiativeName: Dispatch<SetStateAction<string | undefined>>;
};

const InitiativeDiscountsSummary = ({ id, setInitiativeName }: Props) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [refunded, setRefunded] = useState<number | undefined>(undefined);
  const [iban, setIban] = useState<string | undefined>();
  const addError = useErrorDispatcher();

  useEffect(() => {
    if (typeof id === 'string') {
      getMerchantDetail(id)
        .then((response) => {
          setInitiativeName(response?.initiativeName);
          setIban(response?.iban);
        })
        .catch((error) =>
          addError({
            id: 'GET_MERCHANT_DETAIL',
            blocking: false,
            error,
            techDescription: 'An error occurred getting merchant detail',
            displayableTitle: t('errors.title'),
            displayableDescription: t('errors.getDataDescription'),
            toNotify: true,
            component: 'Toast',
            showCloseIcon: true,
          })
        );
    }
  }, [id]);

  useEffect(() => {
    if (typeof id === 'string') {
      getMerchantInitiativeStatistics(id)
        .then((response) => {
          setAmount(response?.amount);
          setRefunded(response?.refunded);
        })
        .catch((error) =>
          addError({
            id: 'GET_MERCHANT_INITATIVE_STATISTICS',
            blocking: false,
            error,
            techDescription: 'An error occurred getting merchant initative statistics',
            displayableTitle: t('errors.title'),
            displayableDescription: t('errors.getDataDescription'),
            toNotify: true,
            component: 'Toast',
            showCloseIcon: true,
          })
        );
    }
  }, [id]);

  const formatedCurrency = (number: number | undefined, symbol: string = '-') => {
    if (number) {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(number);
    }
    return symbol;
  };

  const formatIban = (iban: string | undefined) => {
    if (iban) {
      return `${iban.slice(0, 2)} ${iban.slice(2, 4)} ${iban.slice(4, 5)} ${iban.slice(
        5,
        10
      )} ${iban.slice(10, 15)} ${iban.slice(15, 32)}`;
    }
    return '';
  };

  return (
    <Card sx={{ display: 'grid', gridColumn: 'span 12' }}>
      <CardContent
        sx={{
          p: 3,
          display: 'grid',
          width: '100%',
          gridTemplateColumns: 'repeat(12, 1fr)',
          alignItems: 'center',
          rowGap: 1,
        }}
      >
        <Box sx={{ display: 'grid', gridColumn: 'span 6', rowGap: 1 }}>
          <Typography
            sx={{ fontWeight: 700, display: 'grid', gridColumn: 'span 6', mb: 1 }}
            variant="overline"
            color="text.primary"
          >
            Stato rimborsi
          </Typography>
          <Typography
            sx={{ fontWeight: 400, display: 'grid', gridColumn: 'span 1' }}
            variant="body2"
            color="text.primary"
          >
            Totale erogato
          </Typography>
          <Typography
            sx={{ fontWeight: 700, display: 'grid', gridColumn: 'span 5' }}
            variant="body2"
          >
            {formatedCurrency(amount, '0,00 €')}
          </Typography>

          <Typography
            sx={{ fontWeight: 400, display: 'grid', gridColumn: 'span 1' }}
            variant="body2"
            color="text.primary"
          >
            Totale rimborsato
          </Typography>
          <Typography
            sx={{ fontWeight: 700, display: 'grid', gridColumn: 'span 5' }}
            variant="body2"
          >
            {formatedCurrency(refunded, '0,00 €')}
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', gridColumn: 'span 6', rowGap: 1 }}>
          <Typography
            sx={{ fontWeight: 700, display: 'grid', gridColumn: 'span 6', mb: 1 }}
            variant="overline"
            color="text.primary"
          >
            DATI RIMBORSO
          </Typography>
          <Typography
            sx={{ fontWeight: 400, display: 'grid', gridColumn: 'span 1' }}
            variant="body2"
            color="text.primary"
          >
            IBAN
          </Typography>
          <Typography
            sx={{ fontWeight: 700, display: 'grid', gridColumn: 'span 5' }}
            variant="body2"
          >
            {formatIban(iban)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InitiativeDiscountsSummary;
