import { Box, Card, CardContent, Typography } from '@mui/material';
import { TitleBox, useErrorDispatcher } from '@pagopa/selfcare-common-frontend';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getMerchantDetail, getMerchantInitiativeStatistics } from '../../services/merchantService';
import { formatIban, formattedCurrency } from '../../helpers';

type Props = {
  id: string;
};

const InitiativeOverviewSummary = ({ id }: Props) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [refunded, setRefunded] = useState<number | undefined>(undefined);
  const [iban, setIban] = useState<string | undefined>();
  const [holder, setHolder] = useState<string | undefined>();
  const addError = useErrorDispatcher();

  useEffect(() => {
    if (typeof id === 'string') {
      setIban(undefined);
      setHolder(undefined);
      getMerchantDetail(id)
        .then((response) => {
          setIban(response?.iban);
          setHolder(undefined);
        })
        .catch((error) =>
          addError({
            id: 'GET_MERCHANT_DETAIL',
            blocking: false,
            error,
            techDescription: 'An error occurred getting merchant detail',
            displayableTitle: t('errors.genericTitle'),
            displayableDescription: t('errors.genericDescription'),
            toNotify: true,
            component: 'Toast',
            showCloseIcon: true,
          })
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
        .catch((error) => {
          setAmount(undefined);
          setRefunded(undefined);
          addError({
            id: 'GET_MERCHANT_STATISTICS',
            blocking: false,
            error,
            techDescription: 'An error occurred getting merchant statistics',
            displayableTitle: t('errors.genericTitle'),
            displayableDescription: t('errors.genericDescription'),
            toNotify: true,
            component: 'Toast',
            showCloseIcon: true,
          });
        });
    }
  }, [id]);

  return (
    <Card sx={{ width:'100%', display: 'grid', gridColumn: 'span 12' }}>
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
        <Box sx={{ display: 'grid', gridColumn: 'span 8', mt: 2 }}>
          <TitleBox
            title={t('pages.initiativeOverview.information')}
            mbTitle={2}
            mtTitle={2}
            mbSubTitle={5}
            variantTitle="h5"
          />
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridColumn: 'span 12',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gridTemplateRows: '3',
            gridTemplateAreas: `"title title title title title title title title title title title title"  
              "label1 label1 label1 value1 value1 . . . . . . ." 
              "label2 label2 label2 value2 value2 . . . . . . ."`,
            rowGap: 3,
            mb: 5
          }}
        >
          <Typography
            sx={{ fontWeight: 700, display: 'grid', gridArea: 'title', mb: 1 }}
            variant="overline"
            color="text.primary"
          >
            {t('pages.initiativeOverview.refundsStatusTitle')}
          </Typography>

          <Typography
            sx={{ fontWeight: 400, display: 'grid', gridArea: 'label1' }}
            variant="body2"
            color="text.primary"
          >
            {t('pages.initiativeOverview.totalAmount')}
          </Typography>
          <Typography
            sx={{ fontWeight: 700, display: 'grid', gridArea: 'value1', justifyContent: 'start' }}
            variant="body2"
          >
            {formattedCurrency(amount, '0,00 €', true)}
          </Typography>

          <Typography
            sx={{ fontWeight: 400, display: 'grid', gridArea: 'label2' }}
            variant="body2"
            color="text.primary"
          >
            {t('pages.initiativeOverview.totalRefunded')}
          </Typography>
          <Typography
            sx={{ fontWeight: 700, display: 'grid', gridArea: 'value2', justifyContent: 'start'}}
            variant="body2"
          >
            {formattedCurrency(refunded, '0,00 €', true)}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridColumn: 'span 12', rowGap: 3 , mb: 5}}>
          <Typography
            sx={{ fontWeight: 700, display: 'grid', gridColumn: 'span 6', mb: 1 }}
            variant="overline"
            color="text.primary"
          >
            {t('pages.initiativeOverview.refundsDataTitle')}
          </Typography>
          <Typography
            sx={{ fontWeight: 400, display: 'grid', gridColumn: 'span 3' }}
            variant="body2"
            color="text.primary"
          >
            {t('pages.initiativeOverview.holder')}
          </Typography>
          <Typography
            sx={{ fontWeight: 700, display: 'grid', gridColumn: 'span 3' ,justifyContent: 'start'}}
            variant="body2"
          >
            {holder ?? "-"}
          </Typography>
          <Typography
            sx={{ fontWeight: 400, display: 'grid', gridColumn: 'span 3' }}
            variant="body2"
            color="text.primary"
          >
            {t('pages.initiativeOverview.iban')}
          </Typography>
          <Typography
            sx={{ fontWeight: 700, display: 'grid', gridColumn: 'span 3', justifyContent: 'start' }}
            variant="body2"
          >
            {formatIban(iban)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InitiativeOverviewSummary;
