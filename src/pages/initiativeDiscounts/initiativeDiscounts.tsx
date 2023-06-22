import { Box, Button, Typography, Tabs, Tab } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath, useHistory } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import ROUTES, { BASE_ROUTE } from '../../routes';
import { genericContainerStyle, pagesTableContainerStyle } from '../../styles';
import BreadcrumbsBox from '../components/BreadcrumbsBox';
import { setSelectedName } from '../../redux/slices/initiativesSlice';
import InitiativeDiscountsSummary from './InitiativeDiscountsSummary';
import MerchantTransactions from './MerchantTransactions';
import MerchantTransactionsProcessed from './MerchantTransactionsProcessed';

interface MatchParams {
  id: string;
}

const InitiativeDiscounts = () => {
  const { t } = useTranslation();
  const [initiativeName, setInitativeName] = useState<string | undefined>();
  const [value, setValue] = useState(0);
  const history = useHistory();
  const dispatch = useAppDispatch();
  const match = matchPath(location.pathname, {
    path: [ROUTES.DISCOUNTS],
    exact: true,
    strict: false,
  });
  const { id } = (match?.params as MatchParams) || {};

  useEffect(() => {
    setValue(0);
  }, [id]);

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`tabpanel-${index}`}
        aria-labelledby={`tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ pt: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  };

  const a11yProps = (index: number) => ({
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  });

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <Box sx={{ ...genericContainerStyle, alignItems: 'baseline' }}>
        <BreadcrumbsBox
          backUrl={`${BASE_ROUTE}`}
          backLabel={t('commons.backBtn')}
          items={[
            t('pages.initiativesList.title'),
            initiativeName,
            t('pages.initiativeDiscounts.title'),
          ]}
        />
      </Box>
      <Box sx={{ ...genericContainerStyle, alignItems: 'baseline' }}>
        <Box sx={{ display: 'grid', gridColumn: 'span 10', mt: 2 }}>
          <TitleBox
            title={t('pages.initiativeDiscounts.title')}
            subTitle={t('pages.initiativeDiscounts.subtitle')}
            mbTitle={2}
            mtTitle={2}
            mbSubTitle={5}
            variantTitle="h4"
            variantSubTitle="body1"
          />
        </Box>
        <Box sx={{ display: 'grid', gridColumn: 'span 2', mt: 2, justifyContent: 'right' }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              dispatch(setSelectedName(initiativeName));
              history.replace(`${BASE_ROUTE}/crea-sconto/${id}`);
            }}
            data-testid="goToWizard-btn-test"
          >
            {t('pages.initiativeDiscounts.createBtn')}
          </Button>
        </Box>
      </Box>

      <InitiativeDiscountsSummary id={id} setInitiativeName={setInitativeName} />

      <Box sx={{ display: 'grid', gridColumn: 'span 12', mt: 4, mb: 3 }}>
        <Typography variant="h6">{t('pages.initiativeDiscounts.listTitle')}</Typography>
      </Box>
      <Box
        sx={{
          ...pagesTableContainerStyle,
          mt: 3,
        }}
      >
        <Box sx={{ display: 'grid', gridColumn: 'span 12', height: '100%' }}>
          <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="merchant transactions tabs">
              <Tab
                label={t('pages.initiativeDiscounts.currentMerchantTransactions')}
                {...a11yProps(0)}
                data-testid="merchant-transactions-1"
              />
              <Tab
                label={t('pages.initiativeDiscounts.processedMerchantTransactions')}
                {...a11yProps(1)}
                data-testid="merchant-transactions-2"
              />
            </Tabs>
          </Box>
          <Box sx={{ width: '100%' }}>
            <TabPanel value={value} index={0}>
              <MerchantTransactions id={id} />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <MerchantTransactionsProcessed id={id} />
            </TabPanel>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default InitiativeDiscounts;
