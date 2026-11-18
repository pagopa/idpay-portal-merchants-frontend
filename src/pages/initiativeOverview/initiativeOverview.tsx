import { Box, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useEffect, useMemo, useState } from 'react';
import { generatePath, useHistory } from 'react-router-dom';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { theme } from '@pagopa/mui-italia/theme';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { MIAlert } from '@pagopa/mui-italia/components/MIAlert';
import { MIButton } from '@pagopa/mui-italia/components/MIButton';
import { MIDivider } from '@pagopa/mui-italia/components/MIDivider';
import { MIIconButton } from '@pagopa/mui-italia/components/MIIconButton';
import { MISpinner } from '@pagopa/mui-italia/components/MISpinner';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import ROUTES from '../../routes';
import InitiativeOverviewCard from '../components/initiativeOverviewCard';
import { getMerchantDetail, updateMerchantData } from '../../services/merchantService';
import { formatDate, formatIban } from '../../helpers';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';
import { useAlert } from '../../hooks/useAlert';
import { useCurrentInitiativeId } from '../../hooks/useCurrentInitiativeId';
import { useUserPermissions, PERMISSION_KEYS } from '../../hooks/useUserPermissions';
import { MerchantDetailDTO, MerchantIbanPatchDTO } from '../../api/generated/merchants/data-contracts';
import { MIXPANEL_EVENTS, trackAnalyticsEvent } from '../../services/analyticsService';
import { InitiativeOverviewInfo } from './initiativeOverviewInfo';
import { EditEmailModal } from './EditEmailModal';
import { EditIbanModal } from './EditIbanModal';

const InitiativeOverview = () => {
  const history = useHistory();
  const { t } = useScopedTranslation();
  const { initiativeId } = useCurrentInitiativeId();
  const { setAlert } = useAlert();
  const { isActionDisabled } = useUserPermissions();
  const isEditEmailDisabled = isActionDisabled(PERMISSION_KEYS.OVERVIEW_EDIT_EMAIL);
  const isEditIbanDisabled = isActionDisabled(PERMISSION_KEYS.OVERVIEW_EDIT_IBAN);
  const isUploadStoresDisabled = isActionDisabled(PERMISSION_KEYS.OVERVIEW_UPLOAD_STORES);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isIbanModalOpen, setIsIbanModalOpen] = useState(false);
  const [data, setData] = useState<MerchantDetailDTO & { onboardingDate: string } | undefined>();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const obscuredText = useMemo(() => ({
    iban: '•'.repeat((data?.iban || '').length),
    ibanHolder: '•'.repeat((data?.ibanHolder || '').length)
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
        onboardingDate: formatDate(response?.creationDate ? new Date(response.creationDate) : undefined)
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
    const wasValuePresent = Boolean(data?.[key]);
    try {
      await updateMerchantData(initiativeId || '', merchantData).then(() => loadDetails());
      trackAnalyticsEvent(
        key === 'iban'
          ? wasValuePresent
            ? MIXPANEL_EVENTS.IBAN_UPDATE_SUCCESS
            : MIXPANEL_EVENTS.IBAN_SUCCESS
          : wasValuePresent
            ? MIXPANEL_EVENTS.OPERATIVE_EMAIL_UPDATE_SUCCESS
            : MIXPANEL_EVENTS.OPERATIVE_EMAIL_SUCCESS
      );
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
    }
  };

  return (
    <Box width='100%' minWidth={0} maxWidth='100%'>
      <Grid container spacing={3} height='100%'>
        <Grid item xs={12}>
          <Box display='flex' flexDirection='column'>
            <TitleBox
              title={t('pages.initiativeOverview.title')}
              subTitle={t('pages.initiativeOverview.subtitle')}
              mbTitle={2}
              mtTitle={2}
              mbSubTitle={1}
              variantTitle='h4'
              variantSubTitle='body1'
            />
            {!isLoading && (!data?.iban || !data?.operativeEmail) &&
              (!data?.iban ?
                <MIAlert
                  severity='warning'
                  action={isEditIbanDisabled ? undefined : {
                    label: t('pages.initiativeOverview.ibanBanner.action'),
                    onClick: () => {
                      setIsIbanModalOpen(true);
                    }
                  }}
                  >
                    {t('pages.initiativeOverview.ibanBanner.description')}
                  </MIAlert> :
                <MIAlert
                  severity='info'
                  action={isEditEmailDisabled ? undefined : {
                    label: t('pages.initiativeOverview.emailBanner.action'),
                    onClick: () => {
                      setIsEmailModalOpen(true);
                    }
                  }}
                  >
                    {t('pages.initiativeOverview.emailBanner.description')}
                  </MIAlert>)
            }
          </Box>
        </Grid>
        {isLoading ?
          <Grid item xs>
            <Box
              sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <MISpinner />
            </Box>
          </Grid> :
          <>
            <Grid item xs={6}>
              <Box>
                <InitiativeOverviewCard
                  title={t('pages.initiativeOverview.information')}
                  titleVariant={'h5'}
                >
                  <Box>
                    <Box display='flex' flexDirection='column' rowGap='0.5rem'>
                      <Box>
                        <Typography variant='body1'>
                          {t('pages.initiativeOverview.onboardingDate')}
                        </Typography>
                        <Typography variant='body1' sx={{ fontWeight: theme.typography.fontWeightBold }}>
                          {data?.onboardingDate || MISSING_DATA_PLACEHOLDER}
                        </Typography>
                      </Box>
                      <MIDivider />
                      <Box display='flex' justifyContent='space-between' alignItems='center'>
                        <Box minWidth={0}>
                          <Typography variant='body1'>
                            {t('pages.initiativeOverview.operativeEmail')}
                          </Typography>
                          <Tooltip title={data?.operativeEmail}>
                            <Typography variant='body1' sx={{ fontWeight: theme.typography.fontWeightBold, ...fieldsStyle }}>
                              {data?.operativeEmail || MISSING_DATA_PLACEHOLDER}
                            </Typography>
                          </Tooltip>
                        </Box>
                        <MIIconButton
                          disabled={isEditEmailDisabled}
                          onClick={() => {
                            setIsEmailModalOpen(true);
                          }}
                        >
                          <EditOutlinedIcon />
                        </MIIconButton>
                      </Box>
                      <Box display='flex' justifyContent='space-between' alignItems='center'>
                        <Typography variant='overline'>{t('commons.refundsDataTitle')}</Typography>
                        <Box>
                          <MIIconButton onClick={() => setIsVisible(prev => !prev)}>
                            {!isVisible ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                          </MIIconButton>
                          <MIIconButton
                            disabled={isEditIbanDisabled}
                            onClick={() => {
                              setIsIbanModalOpen(true);
                            }}
                          >
                            <EditOutlinedIcon />
                          </MIIconButton>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant='body1'>{t('pages.initiativeOverview.holder')}</Typography>
                        <Tooltip title={isVisible && data?.ibanHolder}>
                          <Typography variant='body1' sx={{ fontWeight: theme.typography.fontWeightBold, ...fieldsStyle }}>
                            {(isVisible ? data?.ibanHolder : obscuredText?.ibanHolder) || MISSING_DATA_PLACEHOLDER}
                          </Typography>
                        </Tooltip>
                      </Box>
                      <MIDivider />
                      <Box>
                        <Typography variant='body1'>{t('pages.initiativeOverview.iban')}</Typography>
                        <Tooltip title={isVisible && data?.iban}>
                          <Typography variant='body1' sx={{ fontWeight: theme.typography.fontWeightBold, ...fieldsStyle }}>
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
                  <Box display='inline-block'>
                    <MIButton
                      variant='contained'
                      startIcon={<StorefrontOutlinedIcon />}
                      disabled={isUploadStoresDisabled}
                      onClick={() => {
                        history.push(
                          generatePath(ROUTES.STORES_UPLOAD, { initiative_id: initiativeId })
                        );
                      }}
                      size='large'
                      fullWidth={false}
                      data-testid='add-stores-button'
                    >
                      {t('pages.initiativeStores.uploadStores')}
                    </MIButton>
                  </Box>
                </Box>
              </InitiativeOverviewCard>
            </Grid>
          </>}
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
