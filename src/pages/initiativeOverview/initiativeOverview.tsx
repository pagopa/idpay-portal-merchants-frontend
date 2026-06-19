import { Box, Button, IconButton, Typography } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useEffect, useMemo, useState } from 'react';
import { generatePath, useHistory } from 'react-router-dom';
import StoreIcon from '@mui/icons-material/Store';
import { theme } from '@pagopa/mui-italia/theme';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import ROUTES from '../../routes';
import InitiativeOverviewCard from '../components/initiativeOverviewCard';
import { getMerchantDetail, updateMerchantData } from '../../services/merchantService';
import { formatDate, formatIban } from '../../helpers';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';
import { useAlert } from '../../hooks/useAlert';
import { useCurrentInitiativeId } from '../../hooks/useCurrentInitiativeId';
import { MerchantDetailDTO, MerchantIbanPatchDTO } from '../../api/generated/merchants/data-contracts';
import { InfoBanner } from '../../components/InfoBanner/InfoBanner';
import { InitiativeOverviewInfo } from './initiativeOverviewInfo';
import { EditEmailModal } from './EditEmailModal';
import { EditIbanModal } from './EditIbanModal';

const InitiativeOverview = () => {
  const history = useHistory();
  const { t } = useScopedTranslation();
  const { initiativeId } = useCurrentInitiativeId();
  const { setAlert } = useAlert();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isIbanModalOpen, setIsIbanModalOpen] = useState(false);
  const [data, setData] = useState<MerchantDetailDTO & { onboardingDate: string } | undefined>();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const obscuredText = useMemo(() => ({
    iban: "•".repeat((data?.iban || '').length),
    ibanHolder: "•".repeat((data?.ibanHolder || '').length)
  }), [data]);

  const loadDetails = async () => {
    if (!initiativeId) {
      return;
    }
    try {
      const response = await getMerchantDetail(initiativeId);
      setData({
        ...response,
        onboardingDate: formatDate(response?.activationDate ? new Date(response.activationDate) : undefined)
      });
    } catch {
      setAlert({
        title: t('errors.genericTitle'),
        text: t('errors.genericDescription'),
        isOpen: true,
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setIsVisible(false);
    void loadDetails();
  }, [initiativeId]);

  const onUpdate = async (merchantData: MerchantIbanPatchDTO) => {
    setIsEmailModalOpen(false);
    setIsIbanModalOpen(false);
    setIsLoading(true);
    try {
      await updateMerchantData(initiativeId || '', merchantData).then(() => loadDetails());
      setAlert({
        text: t('pages.initiativeOverview.successAlert'),
        isOpen: true,
        severity: 'success',
      });
    } catch {
      setAlert({
        title: t('errors.genericTitle'),
        text: t('errors.genericDescription'),
        isOpen: true,
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" flexDirection="column" rowGap="0.5rem">
            <TitleBox
              title={t('pages.initiativeOverview.title')}
              subTitle={t('pages.initiativeOverview.subtitle')}
              mbTitle={2}
              mtTitle={2}
              variantTitle="h4"
              variantSubTitle="body1"
            />
            {!isLoading && (!data?.iban || !data?.operativeEmail) &&
              (!data?.iban ?
                <InfoBanner
                  severity='warning'
                  description={t('pages.initiativeOverview.ibanBanner.description')}
                  button={{
                    title: t('pages.initiativeOverview.ibanBanner.action'),
                    onClick: () => setIsIbanModalOpen(true)
                  }}
                /> :
                <InfoBanner
                  severity='info'
                  description={t('pages.initiativeOverview.emailBanner.description')}
                  button={{
                    title: t('pages.initiativeOverview.emailBanner.action'),
                    onClick: () => setIsEmailModalOpen(true)
                  }}
                />)
            }
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box>
            <InitiativeOverviewCard
              title={t('pages.initiativeOverview.information')}
              titleVariant={'h5'}
            >
              <Box>
                <Box display="flex" flexDirection="column" rowGap="2rem">
                  <Box>
                    <Typography variant="body1">
                      {t('pages.initiativeOverview.onboardingDate')}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightBold }}>
                      {data?.onboardingDate || MISSING_DATA_PLACEHOLDER}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body1">
                        {t('pages.initiativeOverview.operativeEmail')}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightBold }}>
                        {data?.operativeEmail || MISSING_DATA_PLACEHOLDER}
                      </Typography>
                    </Box>
                    <IconButton sx={{ height: "fit-content" }} onClick={() => setIsEmailModalOpen(true)}>
                      <CreateOutlinedIcon />
                    </IconButton>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="overline">{t('commons.refundsDataTitle')}</Typography>
                    <Box>
                      <IconButton sx={{ height: "fit-content" }} onClick={() => setIsVisible(prev => !prev)}>
                        {!isVisible ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                      </IconButton>
                      <IconButton sx={{ height: "fit-content" }} onClick={() => setIsIbanModalOpen(true)}>
                        <CreateOutlinedIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body1">{t('pages.initiativeOverview.holder')}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightBold }}>
                      {(isVisible ? data?.ibanHolder : obscuredText?.ibanHolder) || MISSING_DATA_PLACEHOLDER}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body1">{t('pages.initiativeOverview.iban')}</Typography>
                    <Typography
                      variant="body1"
                      noWrap
                      sx={{ fontWeight: theme.typography.fontWeightBold }}
                    >
                      {(isVisible ? formatIban(data?.iban) : obscuredText?.iban) || MISSING_DATA_PLACEHOLDER}
                    </Typography>
                  </Box>
                </Box>
                <Grid item xs={12}>
                  <InitiativeOverviewInfo />
                </Grid>
              </Box>
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
                    history.push(
                      generatePath(ROUTES.STORES_UPLOAD, { initiative_id: initiativeId })
                    );
                  }}
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
      <EditEmailModal
        isOpen={isEmailModalOpen}
        setIsOpen={setIsEmailModalOpen}
        data={data}
        onUpdate={onUpdate}
      />
      <EditIbanModal
        isOpen={isIbanModalOpen}
        setIsOpen={setIsIbanModalOpen}
        data={data}
        onUpdate={onUpdate}
      />
    </Box>
  );
};

export default InitiativeOverview;
