import React, { useState } from 'react';
import { useFormik } from 'formik';
import { Box, Typography, Paper, Stack, Button, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useParams } from 'react-router-dom';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { useAppSelector } from '../../redux/hooks';
import { partiesSelectors } from '../../redux/slices/partiesSlice';
import { GetReportedUsersFilters } from '../../types/types';
import { parseJwt } from '../../utils/jwt-utils';
import BreadcrumbsBox from '../components/BreadcrumbsBox';
import SearchTaxCode, { isValidCF } from './SearchTaxCode';
import MsgResult from './MsgResult';

const NoResultPaper: React.FC<{ translationKey: string }> = ({ translationKey }) => {
  const { t } = useTranslation();
  return (
    <Paper
      sx={{
        my: 4,
        p: 3,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack spacing={0.5} direction="row">
        <Typography variant="body2">{t(translationKey)}</Typography>
      </Stack>
    </Paper>
  );
};

const initialValues: GetReportedUsersFilters = {
  cf: '',
  gtin: '',
  status: '',
  page: 0,
  size: 1,
  sort: 'asc',
};

const InsertReportedUser: React.FC = () => {
  const [user, setUser] = useState<Array<{ cf: string; date: string }>>([]);
  const [lastSearchedCF, setLastSearchedCF] = useState<string | undefined>(undefined);
  const { t } = useTranslation();

  const { id: initiativeID } = useParams<{ id: string }>();
  // const merchantConfig = retrieveSelectedPartyIdConfig();
  const userJwt = parseJwt(storageTokenOps.read());

  // const merchantId = merchantConfig?.partyId;
  const merchantId = userJwt?.merchant_id;
  const [showEmptyAlert, setShowEmptyAlert] = useState(false);

  React.useEffect(() => {
    if (
      user.length === 0 &&
      lastSearchedCF &&
      isValidCF(lastSearchedCF) &&
      lastSearchedCF !== 'NRLDKF78A39M293E'
    ) {
      setShowEmptyAlert(true);
    } else {
      setShowEmptyAlert(false);
    }
  }, [user, lastSearchedCF]);

  const selectedParty = useAppSelector(partiesSelectors.selectPartySelected);

  const formik = useFormik<GetReportedUsersFilters>({
    initialValues,
    validate: (values) => {
      let errors: Partial<GetReportedUsersFilters> = {};
      if (values.cf && !isValidCF(values.cf)) {
        errors = { ...errors, cf: 'Codice fiscale non valido' };
      }
      return errors;
    },
    onSubmit: (values: GetReportedUsersFilters) => {
      setLastSearchedCF(values.cf);
      if (values.cf && isValidCF(values.cf)) {
        // Esempio di utilizzo richiesto
        // Stampa merchantId e initiativeID (valori distinti)
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

        if (values.cf === 'NRLDKF78A39M293E') {
          setUser([
            {
              cf: 'NRLDKF78A39M293E',
              date: '24/03/2021 14:12',
            },
          ]);
        } else {
          setUser([]);
        }
      } else {
        setUser([]);
      }
    },
  });

  const handleFiltersApplied = () => {
    formik.handleSubmit();
  };

  {
    /*
  const columns = [
    {
      field: 'cf',
      headerName: 'Codice fiscale',
      flex: 1,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => (
        <Typography>{params.value || MISSING_DATA_PLACEHOLDER}</Typography>
      ),
    },
    {
      field: 'date',
      headerName: 'Data e ora',
      flex: 1,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => (
        <Typography>{params.value || MISSING_DATA_PLACEHOLDER}</Typography>
      ),
    },
  ];

  const rowsWithId = user.map((r, idx) => ({ id: r.cf ?? `row-${idx}`, ...r }));
*/
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box>
        <Box mt={2} sx={{ display: 'grid', gridColumn: 'span 8' }}>
          <BreadcrumbsBox backLabel={'Esci '} items={['Utenti segnalati', 'Segnalazione utenti']} />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              width: '100%',
            }}
          >
            <TitleBox
              title={t('pages.insertReportedUser.title')}
              subTitle={t('pages.insertReportedUser.subtitle')}
              mbTitle={2}
              variantTitle="h4"
              variantSubTitle="body2"
            />
            <Typography variant="body1" sx={{ textAlign: 'left', width: '100%' }}>
              {t('pages.insertReportedUser.mtTitle')}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Paper elevation={1} square={true} sx={{ mt: 2 }}>
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
            {/* 
            <Grid item xs={12}>
              <Link fontWeight={theme.typography.fontWeightBold} href="#" underline="hover">
                {t('pages.initiativeStores.manualLink')}
              </Link>
            </Grid>
          
            {uploadMethod === POS_UPDATE.Csv && (
              <Grid item xs={12}>
                <Box my={2}>
                  <RadioGroup
                    row
                    value={uploadMethod}
                    onChange={(e) => {
                      setUploadMethod(e.target.value as POS_UPDATE.Csv | POS_UPDATE.Manual);
                    }}
                    sx={{ mb: 2 }}
                  >
                    <FormControlLabel
                      value={POS_UPDATE.Csv}
                      control={<Radio />}
                      label={t('pages.initiativeStores.uploadCSV')}
                    />
                    <FormControlLabel
                      value={POS_UPDATE.Manual}
                      control={<Radio />}
                      label={t('pages.initiativeStores.enterManually')}
                    />
                  </RadioGroup>
                </Box>
              </Grid>
            )}

            {uploadMethod === POS_UPDATE.Csv && (
              <Grid item xs={12}>
                <Box
                  p={2}
                  mb={4}
                  display="flex"
                  alignItems={'center'}
                  justifyContent={'center'}
                  sx={{
                    borderWidth: '1px',
                    borderStyle: 'dashed',
                    borderColor: theme.palette.primary.main,
                    borderRadius: '10px',
                    backgroundColor: theme.palette.primaryAction.selected,
                  }}
                >
                  <Box mr={1}>
                    <CloudUploadIcon fontSize="large" color="primary" />
                  </Box>
                  <Box>
                    <Typography variant="body1">
                      {t('pages.initiativeStores.dragCSV')}
                      <Link href="#" underline="hover" color={theme.palette.primary.main}>
                        {t('pages.initiativeStores.selectFromPc')}
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}

            {uploadMethod === POS_UPDATE.Manual && (
              <Grid item xs={12}>
                <PointsOfSaleForm
                  externalErrors={duplicateEmailErrors}
                  onFormChange={onFormChange}
                  onValidationChange={onValidationChange}
                  pointsOfSaleLoaded={pointsOfSaleLoaded}
                  submitAttempt={submitAttempt}
                />
              </Grid>
            )}
            {uploadMethod === POS_UPDATE.Csv && (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.primary">
                  {t('pages.initiativeStores.prepareList')}
                  <Link fontWeight={theme.typography.fontWeightMedium} href="#" underline="hover">
                    {t('pages.initiativeStores.downloadExampleFile')}
                  </Link>
                </Typography>
              </Grid>
            )}
                */}
            <SearchTaxCode formik={formik as any} onSearch={handleFiltersApplied} />
          </Grid>
        </Box>
      </Paper>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button data-testid="back-stores-button" variant="outlined">
          {t('commons.backBtn')}
        </Button>
        <Button
          data-testid="confirm-stores-button"
          variant="contained"
          onClick={() => formik.handleSubmit()}
        >
          {t('commons.confirmBtn')}
        </Button>
      </Box>

      {user.length === 0 && (
        <>
          {showEmptyAlert ? (
            <MsgResult
              severity="error"
              message="pages.insertReportedUser.noResultUser"
              bottom={80}
            />
          ) : (
            <NoResultPaper translationKey="pages.insertReportedUser.noUsers" />
          )}
        </>
      )}
    </Box>
  );
};

export default InsertReportedUser;
