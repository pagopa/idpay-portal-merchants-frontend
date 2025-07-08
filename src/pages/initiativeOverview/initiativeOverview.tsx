import { Box, Alert, Button, Typography } from '@mui/material';
import { TitleBox} from '@pagopa/selfcare-common-frontend';
import { useTranslation } from 'react-i18next';
import { matchPath } from 'react-router-dom';
import StoreIcon from '@mui/icons-material/Store';
import { useEffect, useState } from 'react';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import ROUTES from '../../routes';
import { genericContainerStyle } from '../../styles';
import InitiativeOverviewCard from '../components/initiativeOverviewCard';
import { getMerchantDetail, getMerchantInitiativeStatistics } from '../../services/merchantService';
import { formatIban, formattedCurrency } from '../../helpers';


interface MatchParams {
  id: string;
}

const InitiativeOverview = () => {
  const { t } = useTranslation();
  const match = matchPath(location.pathname, {
    path: [ROUTES.OVERVIEW],
    exact: true,
    strict: false,
  });
  const { id } = (match?.params as MatchParams) || {};
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [refunded, setRefunded] = useState<number | undefined>(undefined);
  const [iban, setIban] = useState<string | undefined>();
  const [holder, setHolder] = useState<string | undefined>();
  const addError = useErrorDispatcher();

  useEffect(() => {
    setIban(undefined);
    setHolder(undefined);
    getMerchantDetail(id)
      .then((response) => {
        setIban(response?.iban);
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
  }, [id]);

  useEffect(() => {
    setAmount(undefined);
    setRefunded(undefined);
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
  }, [id]);
  

  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <Box sx={{ ...genericContainerStyle, alignItems: 'baseline' }}>
        <Box sx={{ display: 'grid', gridColumn: 'span 8', mt: 2 }}>
          <TitleBox
            title={t('pages.initiativeOverview.title')}
            subTitle={t('pages.initiativeOverview.subtitle')}
            mbTitle={2}
            mtTitle={2}
            mbSubTitle={5}
            variantTitle="h4"
            variantSubTitle="body1"
          />
        </Box>
      </Box>
      <Alert
        variant="outlined"
        severity="warning"
        sx={{ bgcolor: 'background.paper' }}
        action={
          <Button size="medium" variant="text">{t('pages.initiativeOverview.insertIban')}</Button>
        }
      >
        {t('pages.initiativeOverview.missingIban')}
      </Alert>
      <Box sx={{ display: 'flex', gridColumn: 'span 6', gap: 2, mt: 2 }}>
        <Box flex="1">
           <InitiativeOverviewCard title={t('pages.initiativeOverview.information')}>
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
                 variant="body1"
                 color="text.primary"
               >
                 {t('pages.initiativeOverview.totalAmount')}
               </Typography>
               <Typography
                 sx={{ fontWeight: 700, display: 'grid', gridArea: 'value1', justifyContent: 'start' }}
                 variant="body1"
               >
                 {formattedCurrency(amount, '0,00 €', true)}
               </Typography>

               <Typography
                 sx={{ fontWeight: 400, display: 'grid', gridArea: 'label2' }}
                 variant="body1"
                 color="text.primary"
               >
                 {t('pages.initiativeOverview.totalRefunded')}
               </Typography>
               <Typography
                 sx={{ fontWeight: 700, display: 'grid', gridArea: 'value2', justifyContent: 'start'}}
                 variant="body1"
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
                 variant="body1"
                 color="text.primary"
               >
                 {t('pages.initiativeOverview.holder')}
               </Typography>
               <Typography
                 sx={{ fontWeight: 700, display: 'grid', gridColumn: 'span 3' ,justifyContent: 'start'}}
                 variant="body1"
               >
                 {holder ?? "-"}
               </Typography>
               <Typography
                 sx={{ fontWeight: 400, display: 'grid', gridColumn: 'span 3' }}
                 variant="body1"
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
           </InitiativeOverviewCard>
        </Box>
        <Box flex="1">
          <InitiativeOverviewCard
            title={t('pages.initiativeOverview.stores')}
            subtitle={t('pages.initiativeOverview.storesSubtitle')}
          >
            <Box
              sx={{
                display: 'grid',
                gridColumn: 'span 12',
                mb: 5
              }}
            >
              <Box display="inline-block">
                <Button
                  variant="contained"
                  startIcon={<StoreIcon />}
                  size="large"
                  fullWidth={false}
                >
                  {t('pages.initiativeOverview.storesSubtitle')}
                </Button>
              </Box>
            </Box>
          </InitiativeOverviewCard>
        </Box>
      </Box>
    </Box>
  );
};

export default InitiativeOverview;
