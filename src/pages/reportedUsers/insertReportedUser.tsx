import React, { useState } from 'react';
import { useFormik } from 'formik';
import { Box, Typography, Paper, Button, Grid, Breadcrumbs } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useParams, useHistory, matchPath } from 'react-router-dom';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { ButtonNaked } from '@pagopa/mui-italia';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAppSelector } from '../../redux/hooks';
import { partiesSelectors } from '../../redux/slices/partiesSlice';
import { GetReportedUsersFilters } from '../../types/types';
import { parseJwt } from '../../utils/jwt-utils';
import ROUTES from '../../routes';
import { createReportedUser } from '../../services/merchantService';
import { isValidCF } from './helpersReportedUsers';
import CfTextField from './CfTextField';
import ModalReportedUser from './modalReportedUser';

interface MatchParams {
  id: string;
}

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

  const { id: initiativeID } = useParams<{ id: string }>();
  const match = matchPath(location.pathname, {
    path: [ROUTES.OVERVIEW],
    exact: true,
    strict: false,
  });
  // initiativeID
  const { id } = (match?.params as MatchParams) || {};
  alert(id);
  const userJwt = parseJwt(storageTokenOps.read());
  const merchantId = userJwt?.merchant_id;

  const selectedParty = useAppSelector(partiesSelectors.selectPartySelected);

  const formik = useFormik<GetReportedUsersFilters>({
    initialValues,
    validate: (values) => {
      let errors: Partial<GetReportedUsersFilters> = {};
      if (!values.cf) {
        errors = { ...errors, cf: 'Campo obbligatorio' };
      } else if (!isValidCF(values.cf)) {
        errors = { ...errors, cf: 'Codice fiscale non valido' };
      }
      return errors;
    },
    onSubmit: async (values: GetReportedUsersFilters) => {
      if (values.cf && isValidCF(values.cf)) {
        setCfToReport(values.cf);
        setShowConfirmModal(true);
      }
    },
  });

  return (
    <>
      <ModalReportedUser
        open={showConfirmModal}
        title="Vuoi procedere con la segnalazione?"
        description={`Stai dichiarando che il soggetto non ha consegnato l'elettrodomestico obsoleto.`}
        cfModal={cfToReport ?? ''}
        cancelText="Annulla"
        confirmText="Conferma"
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={async () => {
          setShowConfirmModal(false);
          if (cfToReport) {
            // eslint-disable-next-line no-console
            console.log(
              'merchantId (JWT):',
              merchantId,
              'initiativeID (route):',
              initiativeID,
              'selectedParty.partyId:',
              selectedParty?.partyId,
              'selectedParty.externalId:',
              selectedParty?.externalId,
              'selectedParty.originId:',
              selectedParty?.originId,
              'selectedParty.description:',
              selectedParty?.description
            );
            await createReportedUser(merchantId, initiativeID, cfToReport);
            history.push(ROUTES.REPORTED_USERS.replace(':id', initiativeID), { newCf: cfToReport });
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
                label={t('pages.reportedUsers.cf')}
                name="cf"
              />
            </Box>
          </Grid>
        </Box>
      </Paper>

      <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between' }}>
        <Button data-testid="back-stores-button" variant="outlined" onClick={handleBack}>
          {t('commons.backBtn')}
        </Button>
        <Button
          data-testid="confirm-stores-button"
          variant="contained"
          onClick={() => {
            setShowErrors(true);
            formik.handleSubmit();
          }}
        >
          {t('commons.confirmBtn')}
        </Button>
      </Box>
    </>
  );
};

export default InsertReportedUser;
