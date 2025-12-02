import React, { useState } from 'react';
import { useFormik } from 'formik';
import { Box, Typography, Paper, Button, Grid, Breadcrumbs } from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useHistory, useLocation } from 'react-router-dom';
import { ButtonNaked } from '@pagopa/mui-italia';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { GetReportedUsersFilters } from '../../types/types';
import ROUTES from '../../routes';
import { createReportedUser } from '../../services/merchantService';
import { MerchantApi } from '../../api/MerchantsApiClient';
import { isValidCF } from './helpersReportedUsers';
import CfTextField from './CfTextField';
import ModalReportedUser from './modalReportedUser';

const initialValues: GetReportedUsersFilters = {
  cf: '',
  gtin: '',
  status: '',
  page: 0,
  size: 1,
  sort: 'asc',
};

const InsertReportedUser: React.FC = () => {
  const [showErrors, setShowErrors] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cfToReport, setCfToReport] = useState<string | null>(null);
  const { t } = useTranslation();

  const history = useHistory();
  const handleBack = () => history.goBack();

  const location = useLocation<{ merchantId: string; initiativeID: string }>();
  const merchantId = location.state?.merchantId;
  const initiativeID = location.state?.initiativeID;

  const checkCfAlreadyReported = async (initiativeID: string, cf: string): Promise<boolean> => {
    try {
      const res = await MerchantApi.getReportedUser(initiativeID, cf);
      return Array.isArray(res) && res.length > 0;
    } catch (e) {
      setShowConfirmModal(false);
      console.error('Error while checking if user is already reported:', e);
      return false;
    }
  };

  const formik = useFormik<GetReportedUsersFilters>({
    initialValues,
    validate: (values) => {
      let errors: Partial<GetReportedUsersFilters> = {};
      if (!values.cf) {
        errors = { ...errors, cf: t('pages.reportedUsers.cf.noResultUser') };
      } else if (!isValidCF(values.cf)) {
        errors = { ...errors, cf: t('pages.reportedUsers.cf.invalid') };
      }
      return errors;
    },
    onSubmit: async (values: GetReportedUsersFilters) => {
      if (values.cf && isValidCF(values.cf)) {
        if (initiativeID && merchantId) {
          const alreadyReported = await checkCfAlreadyReported(initiativeID, values.cf);
          if (alreadyReported) {
            formik.setFieldError('cf', t('pages.reportedUsers.cf.alreadyRegistered'));
            return;
          }
        }
        setCfToReport(values.cf);
        setShowConfirmModal(true);
      }
    },
  });

  const handleKOError = (errorKey: string | undefined) => {
    setShowConfirmModal(false);
    switch (errorKey) {
      case 'UserId not found':
        formik.setFieldError('cf', t('pages.reportedUsers.cf.noResultUser'));
        break;
      case "CF doesn't match initiative or merchant":
        formik.setFieldError('cf', t('pages.reportedUsers.cf.alreadyPresent'));
        break;
      case 'Service unavailable':
        console.error('Service unavailable');
        history.push(ROUTES.REPORTED_USERS.replace(':id', initiativeID), {
          newCf: undefined,
          showSuccessAlert: false,
        });
        break;
      case 'Already reported':
        formik.setFieldError('cf', t('pages.reportedUsers.cf.alreadyRegistered'));
        break;
      default:
        formik.setFieldError('cf', t('pages.reportedUsers.cf.insertCf'));
        break;
    }
  };

  return (
    <Box maxWidth='75%' justifySelf='center'>
      <ModalReportedUser
        open={showConfirmModal}
        title={t('pages.insertReportedUser.ModalReportedUser.title')}
        description={
          <Trans
            i18nKey="pages.insertReportedUser.ModalReportedUser.description"
            values={{ cf: cfToReport ?? '' }}
            components={{ b: <b /> }}
          />
        }
        descriptionTwo={t('pages.insertReportedUser.ModalReportedUser.descriptionTwo')}
        cfModal={cfToReport ?? ''}
        cancelText={t('pages.insertReportedUser.ModalReportedUser.cancelText')}
        confirmText={t('pages.insertReportedUser.ModalReportedUser.confirmText')}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={async () => {
          if (cfToReport) {
            try {
              const response = await createReportedUser(initiativeID, cfToReport);
              if (response?.status === 'KO') {
                const errorKey = (response as any)?.errorKey;
                handleKOError(errorKey);
                return;
              }

              setShowConfirmModal(false);
              history.push(ROUTES.REPORTED_USERS.replace(':id', initiativeID), {
                newCf: cfToReport,
                showSuccessAlert: true,
              });
            } catch (e) {
              console.error('Error while creating reported user:', e);
            }
          }
        }}
      />
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'grid', gridColumn: 'span 8' }}>
          <Box sx={{ display: 'flex', gridColumn: 'span 12', alignItems: 'center', marginTop: 2 }}>
            <ButtonNaked
              component="button"
              onClick={() => history.goBack()}
              startIcon={<ArrowBackIcon />}
              sx={{
                color: 'primary.main',
                fontSize: '1rem',
                marginBottom: '3px',
                marginRight: '8px',
                fontWeight: 700,
              }}
              weight="default"
              data-testid="back-button-test"
            >
              {'Esci'}
            </ButtonNaked>
            <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: '3px', marginRight: '8px' }}>
              <Typography color="text.primary" variant="body2">
                {'Utenti segnalati'}
              </Typography>
              <Typography color="text.disabled" variant="body2">
                {'Segnalazione utenti'}
              </Typography>
            </Breadcrumbs>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              width: '100%',
              mt: 3,
            }}
          >
            <TitleBox
              title={t('pages.insertReportedUser.title')}
              mbTitle={2}
              variantTitle="h4"
              variantSubTitle="body1"
            />
            <Typography variant="body2" sx={{ textAlign: 'left', width: '100%' }}>
              {t('pages.insertReportedUser.subtitle')}
            </Typography>
            <Typography variant="body2" sx={{ textAlign: 'left', width: '100%' }}>
              {t('pages.insertReportedUser.mtTitle')}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Paper elevation={1} square={true} sx={{ mt: 5 }}>
        <Box px={4} pt={2} pb={4}>
          <Grid container>
            <Grid item xs={12}>
              <TitleBox
                title={t('pages.insertReportedUser.searchTitle')}
                subTitle={t('pages.insertReportedUser.searchDescription')}
                mbTitle={3}
                mtTitle={2}
                mbSubTitle={2}
                variantTitle="h6"
                variantSubTitle="body2"
              />
            </Grid>
            <Box
              sx={{
                minWidth: 370,
                minHeight: '72px',
                flexBasis: { xs: '100%', sm: '50%', md: '25%', lg: '25%' },
                flexGrow: 0,
                display: 'flex',
                alignItems: 'flex-start',
              }}
            >
              <CfTextField
                formik={formik}
                showErrors={showErrors}
                setShowErrors={setShowErrors}
                label={t('pages.reportedUsers.cfPlaceholder')}
                name="cf"
              />
            </Box>
          </Grid>
        </Box>
      </Paper>

      <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between' }}>
        <Button data-testid="back-reportedUsers-button" variant="outlined" onClick={handleBack}>
          {t('commons.backBtn')}
        </Button>
        <Button
          data-testid="confirm-reportedUsers-button"
          variant="contained"
          onClick={() => {
            setShowErrors(true);
            formik.handleSubmit();
          }}
        >
          {t('commons.confirmBtn')}
        </Button>
      </Box>
    </Box>
  );
};

export default InsertReportedUser;
