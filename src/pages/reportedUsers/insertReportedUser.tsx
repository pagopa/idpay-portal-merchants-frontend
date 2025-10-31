import React, { useState } from 'react';
import { useFormik } from 'formik';
import { Box, Typography, Paper, Button, Grid, Breadcrumbs } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useParams, useHistory } from 'react-router-dom';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { ButtonNaked } from '@pagopa/mui-italia';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAppSelector } from '../../redux/hooks';
import { partiesSelectors } from '../../redux/slices/partiesSlice';
import { GetReportedUsersFilters } from '../../types/types';
import { parseJwt } from '../../utils/jwt-utils';
import { isValidCF } from './helpers';
import CfTextField from './CfTextField';

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
  const { t } = useTranslation();

  const history = useHistory();
  const handleBack = () => history.goBack();

  const { id: initiativeID } = useParams<{ id: string }>();
  // const merchantConfig = retrieveSelectedPartyIdConfig();
  const userJwt = parseJwt(storageTokenOps.read());

  // const merchantId = merchantConfig?.partyId;
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
    onSubmit: (values: GetReportedUsersFilters) => {
      if (values.cf && isValidCF(values.cf)) {
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
        alert('Confermato');
      }
    },
  });

  return (
    <Box sx={{ width: '100%' }}>
      <Box>
        <Box sx={{ display: 'grid', gridColumn: 'span 8' }}>
          <Box sx={{ display: 'flex', gridColumn: 'span 12', alignItems: 'center', marginTop: 2 }}>
            <Breadcrumbs aria-label="breadcrumb">
              <ButtonNaked
                component="button"
                onClick={() => history.goBack()}
                startIcon={<ArrowBackIcon />}
                sx={{
                  color: 'primary.main',
                  fontSize: '1rem',
                  marginBottom: '3px',
                  marginRight: '8px',
                }}
                weight="default"
                data-testid="back-button-test"
              >
                {'Esci'}
              </ButtonNaked>
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
    </Box>
  );
};

export default InsertReportedUser;
