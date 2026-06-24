import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useEffect, useMemo, useState } from 'react';
import { generatePath, useHistory } from 'react-router-dom';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { theme } from '@pagopa/mui-italia/theme';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { MIAlert } from '@pagopa/mui-italia';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import ROUTES from '../../routes';
import InitiativeOverviewCard from '../components/initiativeOverviewCard';
import { getMerchantDetail, updateMerchantData } from '../../services/merchantService';
import { formatDate, formatIban } from '../../helpers';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';
import { useAlert } from '../../hooks/useAlert';
import { useCurrentInitiativeId } from '../../hooks/useCurrentInitiativeId';
import { MerchantDetailDTO, MerchantIbanPatchDTO } from '../../api/generated/merchants/data-contracts';
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

  const fieldsStyle = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 'fit-content',
    minWidth: 0
  };

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

  const onUpdate = async (merchantData: MerchantIbanPatchDTO, key: keyof MerchantIbanPatchDTO) => {
    setIsEmailModalOpen(false);
    setIsIbanModalOpen(false);
    setIsLoading(true);
    try {
      await updateMerchantData(initiativeId || '', merchantData).then(() => loadDetails());
      setAlert({
        text: t(`pages.initiativeOverview.successAlert.${key}.${!data?.[key] ? 'add' : 'edit'}`),
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
    <Box width='100%' minWidth={0} maxWidth='100%'>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" flexDirection="column">
            <TitleBox
              title={t('pages.initiativeOverview.title')}
              subTitle={t('pages.initiativeOverview.subtitle')}
              mbTitle={2}
              mtTitle={2}
              mbSubTitle={1}
              variantTitle="h4"
              variantSubTitle="body1"
            />
            {!isLoading && (!data?.iban || !data?.operativeEmail) &&
              (!data?.iban ?
                <MIAlert
                  severity='warning'
                  description={t('pages.initiativeOverview.ibanBanner.description')}
                  action={{
                    label: t('pages.initiativeOverview.ibanBanner.action'),
                    onClick: () => setIsIbanModalOpen(true)
                  }}
                /> :
                <MIAlert
                  severity='info'
                  description={t('pages.initiativeOverview.emailBanner.description')}
                  action={{
                    label: t('pages.initiativeOverview.emailBanner.action'),
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
                <Box display="flex" flexDirection="column" rowGap="0.5rem">
                  <Box>
                    <Typography variant="body1">
                      {t('pages.initiativeOverview.onboardingDate')}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightBold }}>
                      {data?.onboardingDate || MISSING_DATA_PLACEHOLDER}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box minWidth={0}>
                      <Typography variant="body1">
                        {t('pages.initiativeOverview.operativeEmail')}
                      </Typography>
                      <Tooltip title={data?.operativeEmail}>
                        <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightBold, ...fieldsStyle }}>
                          {data?.operativeEmail || MISSING_DATA_PLACEHOLDER}
                        </Typography>
                      </Tooltip>
                    </Box>
                    <IconButton onClick={() => setIsEmailModalOpen(true)}>
                      <EditOutlinedIcon />
                    </IconButton>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="overline">{t('commons.refundsDataTitle')}</Typography>
                    <Box>
                      <IconButton onClick={() => setIsVisible(prev => !prev)}>
                        {!isVisible ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                      </IconButton>
                      <IconButton onClick={() => setIsIbanModalOpen(true)}>
                        <EditOutlinedIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body1">{t('pages.initiativeOverview.holder')}</Typography>
                    <Tooltip title={isVisible && data?.ibanHolder}>
                      <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightBold, ...fieldsStyle }}>
                        {(isVisible ? data?.ibanHolder : obscuredText?.ibanHolder) || MISSING_DATA_PLACEHOLDER}
                      </Typography>
                    </Tooltip>
                  </Box>
                  <Box>
                    <Typography variant="body1">{t('pages.initiativeOverview.iban')}</Typography>
                    <Tooltip title={isVisible && data?.iban}>
                      <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightBold, ...fieldsStyle }}>
                        {(isVisible ? formatIban(data?.iban) : obscuredText?.iban) || MISSING_DATA_PLACEHOLDER}
                      </Typography>
                    </Tooltip>
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
                  startIcon={<StorefrontOutlinedIcon />}
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
