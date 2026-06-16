import { Box, Button, IconButton, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useEffect, useState } from 'react';
import { generatePath, useHistory } from 'react-router-dom';
import StoreIcon from '@mui/icons-material/Store';
import { theme } from '@pagopa/mui-italia/theme';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import ROUTES from '../../routes';
import InitiativeOverviewCard from '../components/initiativeOverviewCard';
import { getMerchantDetail } from '../../services/merchantService';
import { formatDate, formatIban } from '../../helpers';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';
import { useAlert } from '../../hooks/useAlert';
import { useCurrentInitiativeId } from '../../hooks/useCurrentInitiativeId';
import { MerchantDetailDTO } from '../../api/generated/merchants/data-contracts';
import { EditModal } from '../components/EditModal';
import { InitiativeOverviewInfo } from './initiativeOverviewInfo';

const InitiativeOverview = () => {
  const history = useHistory();
  const { t } = useScopedTranslation();
  const { initiativeId } = useCurrentInitiativeId();
  const { setAlert } = useAlert();
  const [isModalOpen, setIsModalOpen] = useState(false);

// WIP
  const [data, setData] = useState<MerchantDetailDTO & { onboardingDate: string } | undefined>();

  useEffect(() => {
    if (!initiativeId) {
      return;
    }

    let active = true;

    const load = async () => {
      try {
        const response = await getMerchantDetail(initiativeId);
        if (!active) {
          return;
        }

// WIP
        setData({
          ...response,
          onboardingDate: formatDate(response?.activationDate ? new Date(response.activationDate) : undefined)
        });

      } catch {
        if (!active) {
          return;
        }

        setAlert({
          title: t('errors.genericTitle'),
          text: t('errors.genericDescription'),
          isOpen: true,
          severity: 'error',
        });
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [initiativeId]);

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
                  <Box display="flex" justifyContent="space-between">
                    <Box>
                      <Typography variant="body1">
                        {t('pages.initiativeOverview.operativeEmail')}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightBold }}>
                        {data?.operativeEmail || MISSING_DATA_PLACEHOLDER}
                      </Typography>
                    </Box>
                    <IconButton sx={{ height: "fit-content" }} onClick={() => setIsModalOpen(true)}>
                      <CreateOutlinedIcon />
                    </IconButton>
                  </Box>
                  <Box>
                    <Typography variant="overline">{t('commons.refundsDataTitle')}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body1">{t('pages.initiativeOverview.holder')}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightBold }}>
                      {data?.ibanHolder || MISSING_DATA_PLACEHOLDER}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body1">{t('pages.initiativeOverview.iban')}</Typography>
                    <Typography
                      variant="body1"
                      noWrap
                      sx={{ fontWeight: theme.typography.fontWeightBold }}
                    >
                      {formatIban(data?.iban)}
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
      <EditModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        title='pages.initiativeOverview.modal.title'
        desciption='pages.initiativeOverview.modal.description'
      >
        <Box display="flex" flexDirection="column" rowGap="1.5rem">
          <Typography variant='h6'>
            {t('pages.initiativeOverview.modal.fieldInsert.label')}
          </Typography>
          <TextField
            defaultValue={data?.operativeEmail}
            label={t('pages.initiativeOverview.modal.fieldInsert.placeholder')}
            variant='outlined' />
          <Typography variant='h6'>
            {t('pages.initiativeOverview.modal.fieldConfirm.label')}
          </Typography>
          <TextField
            defaultValue={data?.operativeEmail}
            label={t('pages.initiativeOverview.modal.fieldConfirm.placeholder')}
            variant='outlined' />
        </Box>
      </EditModal>
    </Box>
  );
};

export default InitiativeOverview;
