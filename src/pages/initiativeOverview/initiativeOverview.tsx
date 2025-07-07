import { Box,Alert, Button } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';
import { initiativeSelector } from '../../redux/slices/initiativesSlice';
import ROUTES from '../../routes';
import { genericContainerStyle } from '../../styles';
import InitiativeOverviewSummary from './initiativeOverviewSummary';
import InitiativeOverviewStores from './initiativeOverviewStores';

interface MatchParams {
  id: string;
}

const InitiativeOverview = () => {
  const { t } = useTranslation();
  const selectedInitiative = useAppSelector(initiativeSelector);
  const match = matchPath(location.pathname, {
    path: [ROUTES.OVERVIEW],
    exact: true,
    strict: false,
  });
  const { id } = (match?.params as MatchParams) || {};

  useEffect(() => {
    // const dates = mapDatesFromPeriod(selectedInitiative?.spendingPeriod);
    // setStartDate(dates?.startDate);
    // setEndDate(dates?.endDate);
    // setValue(0);
  }, [id, JSON.stringify(selectedInitiative)]);

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
          <Button size="small" variant="text">{t('pages.initiativeOverview.insertIban')}</Button>
        }
      >
        {t('pages.initiativeOverview.missingIban')}
      </Alert>
      <Box sx={{ display: 'flex', gridColumn: 'span 6', gap: 2, mt: 2 }}>
        <Box flex="1">
          <InitiativeOverviewSummary id={id} />
        </Box>
        <Box flex="1">
          <InitiativeOverviewStores />
        </Box>
      </Box>
    </Box>
  );
};

export default InitiativeOverview;
