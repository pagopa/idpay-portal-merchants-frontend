import { Box, Card, CardContent, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getMerchantDetail, getMerchantInitiativeStatistics } from '../../services/merchantService';
import { formatIban, formattedCurrency } from '../../helpers';
import { useAlert } from '../../hooks/useAlert';

type Props = {
  id: string;
};

const InitiativeDiscountsSummary = ({ id }: Props) => {
  const {setAlert} = useAlert();
  const { t } = useTranslation();
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [refunded, setRefunded] = useState<number | undefined>(undefined);
  const [iban, setIban] = useState<string | undefined>();

  useEffect(() => {
    if (typeof id === 'string') {
      setIban(undefined);
      getMerchantDetail(id)
        .then((response) => {
          setIban(response?.iban);
        })
        .catch(() =>
          setAlert(t('errors.genericTitle'), t('errors.genericDescription'), true)
        );
    }
  }, [id]);

  useEffect(() => {
    setAmount(undefined);
    setRefunded(undefined);
    if (typeof id === 'string') {
      getMerchantInitiativeStatistics(id)
        .then((response) => {
          setAmount(response?.amountCents);
          setRefunded(response?.refundedCents);
        })
        .catch(() => {
          setAmount(undefined);
          setRefunded(undefined);
          setAlert(t('errors.genericTitle'), t('errors.genericDescription'), true);
        });
    }
  }, [id]);

  return (
    <Card sx={{ display: 'grid', gridColumn: 'span 12' }}>
      <CardContent
        sx={{
          p: 3,
          display: 'grid',
          width: '100%',
          gridTemplateColumns: 'repeat(12, 1fr)',
          alignItems: 'baseline',
          rowGap: 1,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridColumn: 'span 6',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridTemplateRows: '3',
            gridTemplateAreas: `"title title title title title title title title title title title title"  
              "label1 label1 label1 value1 value1 . . . . . . ." 
              "label2 label2 label2 value2 value2 . . . . . . ."`,
            rowGap: 1,
          }}
        >
          <Typography
            sx={{ fontWeight: 700, display: 'grid', gridArea: 'title', mb: 1 }}
            variant="overline"
            color="text.primary"
          >
            {t('pages.initiativeDiscounts.refundsStatusTitle')}
          </Typography>

          <Typography
            sx={{ fontWeight: 400, display: 'grid', gridArea: 'label1' }}
            variant="body2"
            color="text.primary"
          >
            {t('pages.initiativeDiscounts.totalAmount')}
          </Typography>
          <Typography
            sx={{ fontWeight: 700, display: 'grid', gridArea: 'value1', justifyContent: 'end' }}
            variant="body2"
          >
            {formattedCurrency(amount, '0,00 €', true)}
          </Typography>

          <Typography
            sx={{ fontWeight: 400, display: 'grid', gridArea: 'label2' }}
            variant="body2"
            color="text.primary"
          >
            {t('pages.initiativeDiscounts.totalRefunded')}
          </Typography>
          <Typography
            sx={{ fontWeight: 700, display: 'grid', gridArea: 'value2', justifyContent: 'end' }}
            variant="body2"
          >
            {formattedCurrency(refunded, '0,00 €', true)}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridColumn: 'span 6', rowGap: 1 }}>
          <Typography
            sx={{ fontWeight: 700, display: 'grid', gridColumn: 'span 6', mb: 1 }}
            variant="overline"
            color="text.primary"
          >
            {t('pages.initiativeDiscounts.refundsDataTitle')}
          </Typography>
          <Typography
            sx={{ fontWeight: 400, display: 'grid', gridColumn: 'span 2' }}
            variant="body2"
            color="text.primary"
          >
            {t('pages.initiativeDiscounts.iban')}
          </Typography>
          <Typography
            sx={{ fontWeight: 700, display: 'grid', gridColumn: 'span 4' }}
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
