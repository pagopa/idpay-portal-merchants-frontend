import { Box, Button, Grid, Typography } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, matchPath, useHistory } from 'react-router-dom';
import StoreIcon from '@mui/icons-material/Store';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { theme } from '@pagopa/mui-italia';
import ROUTES from '../../routes';
import InitiativeOverviewCard from '../components/initiativeOverviewCard';
import { getMerchantDetail } from '../../services/merchantService';
import { formatDate, formatIban } from '../../helpers';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';
import { InitiativeOverviewInfo } from './initiativeOverviewInfo';

interface MatchParams {
  id: string;
}

const InitiativeOverview = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const match = matchPath(location.pathname, {
    path: [ROUTES.OVERVIEW],
    exact: true,
    strict: false,
  });
  const { id } = (match?.params as MatchParams) || {};
  // const [amount, setAmount] = useState<number | undefined>(undefined);
  // const [refunded, setRefunded] = useState<number | undefined>(undefined);
  const [iban, setIban] = useState<string | undefined>();
  const [ibanHolder, setIbanHolder] = useState<string | undefined>();
  const [onboardingDate, setOnboardingDate] = useState<string | undefined>();
  const addError = useErrorDispatcher();

  useEffect(() => {
    getMerchantDetail(id)
      .then((response) => {
        setIban(response?.iban);
        setIbanHolder(response?.ibanHolder);
        setOnboardingDate(formatDate(response?.activationDate));
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

  // useEffect(() => {
  //   getMerchantInitiativeStatistics(id)
  //     .then((response) => {
  //       setAmount(response?.amountCents);
  //       setRefunded(response?.refundedCents);
  //     })
  //     .catch((error) => {
  //       setAmount(undefined);
  //       setRefunded(undefined);
  //       addError({
  //         id: 'GET_MERCHANT_STATISTICS',
  //         blocking: false,
  //         error,
  //         techDescription: 'An error occurred getting merchant statistics',
  //         displayableTitle: t('errors.genericTitle'),
  //         displayableDescription: t('errors.genericDescription'),
  //         toNotify: true,
  //         component: 'Toast',
  //         showCloseIcon: true,
  //       });
  //     });
  // }, [id]);

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TitleBox
            title={t('pages.initiativeOverview.title')}
            subTitle={t('pages.initiativeOverview.subtitle')}
            mbTitle={2}
            mtTitle={2}
            variantTitle="h4"
            variantSubTitle="body1"
          />
        </Grid>
        <Grid item xs={6}>
          <Box display={'flex'}>
            <InitiativeOverviewCard
              title={t('pages.initiativeOverview.information')}
              titleVariant={'h5'}
            >
              <Grid container gridColumn={'span 12'}>
                <Grid item xs={4}>
                  <Typography variant="body1">
                    {t('pages.initiativeOverview.onboardingDate')}
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightBold }}>
                    {onboardingDate?.trim() === '' || !onboardingDate
                      ? MISSING_DATA_PLACEHOLDER
                      : onboardingDate}
                  </Typography>
                </Grid>
                {/* <Grid item xs={12}>
                  <Box my={2}>
                    <Typography variant="overline">
                      {t('pages.initiativeOverview.refundsStatusTitle')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">
                    {t('pages.initiativeOverview.totalAmount')}
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightBold }}>
                    {formattedCurrency(amount, MISSING_EURO_PLACEHOLDER, true)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">
                    {t('pages.initiativeOverview.totalRefunded')}
                  </Typography>
                </Grid> 
                <Grid item xs={8}>
                  <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightBold }}>
                    {formattedCurrency(refunded, MISSING_EURO_PLACEHOLDER, true)}
                  </Typography>
                </Grid> */}

                <Grid item xs={12}>
                  <Box my={2}>
                    <Typography variant="overline">
                      {t('pages.initiativeOverview.refundsDataTitle')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">{t('pages.initiativeOverview.holder')}</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightBold }}>
                    {ibanHolder?.trim() === '' || !ibanHolder
                      ? MISSING_DATA_PLACEHOLDER
                      : ibanHolder}
                  </Typography>
                </Grid>

                <Grid item xs={4}>
                  <Typography variant="body1">{t('pages.initiativeOverview.iban')}</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography
                    variant="body1"
                    noWrap
                    sx={{ fontWeight: theme.typography.fontWeightBold }}
                  >
                    {formatIban(iban)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <InitiativeOverviewInfo />
                </Grid>
              </Grid>
            </InitiativeOverviewCard>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <InitiativeOverviewCard
            title={t('pages.initiativeOverview.stores')}
            subtitle={t('pages.initiativeOverview.storesSubtitle')}
            titleVariant={'h5'}
          >
            <Box mb={1} sx={{ display: 'grid', gridColumn: 'span 12' }}>
              <Box display="inline-block">
                <Button
                  variant="contained"
                  startIcon={<StoreIcon />}
                  onClick={() => {
                    history.push(generatePath(ROUTES.STORES_UPLOAD, { id }));
                  }}
                  // onClick={() => { history.push(`${BASE_ROUTE}/${id}/punti-vendita/censisci/`); }}
                  size="large"
                  fullWidth={false}
                  data-testid="add-stores-button"
                >
                  {t('pages.initiativeStores.uploadStores')}
                </Button>
              </Box>
            </Box>
          </InitiativeOverviewCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InitiativeOverview;
