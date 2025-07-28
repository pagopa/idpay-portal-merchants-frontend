import { Box, Alert, Button, Typography, TextField, Slide } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath, useHistory } from 'react-router-dom';
import StoreIcon from '@mui/icons-material/Store';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import {theme} from "@pagopa/mui-italia/dist/theme/theme.js";
import ROUTES, { BASE_ROUTE } from '../../routes';
import { genericContainerStyle } from '../../styles';
import InitiativeOverviewCard from '../components/initiativeOverviewCard';
import { getMerchantDetail, getMerchantInitiativeStatistics } from '../../services/merchantService';
import { formatIban, formattedCurrency } from '../../helpers';


import ModalComponent from '../../components/modal/ModalComponent';
import { MISSING_DATA_PLACEHOLDER, MISSING_EURO_PLACEHOLDER } from '../../utils/constants';
import style from './initiativeOverview.module.css';

interface MatchParams {
  id: string;
}

const InitiativeOverview = () => {
  const [ibanModalIsOpen, setIbanModalIsOpen] = useState(false);
  const history = useHistory();
  const [showAlertIbanSuccess] = useState(false);
  const { t } = useTranslation();
  const match = matchPath(location.pathname, {
    path: [ROUTES.OVERVIEW],
    exact: true,
    strict: false,
  });
  const { id } = (match?.params as MatchParams) || {};
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [refunded, setRefunded] = useState<number | undefined>(undefined);
  const [iban, setIban] = useState<string | undefined>();
  const [ibanHolder, setIbanHolder] = useState<string | undefined>();
  const [ibanForm, setIbanForm] = useState<string | undefined>();
  const [ibanHolderForm, setIbanHolderForm] = useState<string | undefined>();
  const addError = useErrorDispatcher();

  useEffect(() => {
    console.log("THEME", theme.typography.fontWeightRegular);
    setIban(undefined);
    setIbanHolder("Mario Rossi");
    getMerchantDetail(id)
      .then((response) => {
        setIban(response?.iban);
        // setIbanHolder(response?.ibanHolder);
      })
      .catch((error) =>
        addError({
          id: 'GET_MERCHANT_DETAIL',
          blocking: false,
          error,
          techDescription: 'An error occurred getting merchant detail',
          displayableTitle: t('errors.genericTitle'),
          displayableDescription: t('errors.genericDescription'),
          toNotify: true,
          component: 'Toast',
          showCloseIcon: true,
        })
      );
  }, [id]);

  useEffect(() => {
    setAmount(undefined);
    setRefunded(undefined);
    getMerchantInitiativeStatistics(id)
      .then((response) => {
        setAmount(response?.amountCents);
        setRefunded(response?.refundedCents);
      })
      .catch((error) => {
        setAmount(undefined);
        setRefunded(undefined);
        addError({
          id: 'GET_MERCHANT_STATISTICS',
          blocking: false,
          error,
          techDescription: 'An error occurred getting merchant statistics',
          displayableTitle: t('errors.genericTitle'),
          displayableDescription: t('errors.genericDescription'),
          toNotify: true,
          component: 'Toast',
          showCloseIcon: true,
        });
      });
  }, [id]);

  const handleIbanChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    const alphanumericInput = input.replace(/[^a-zA-Z0-9]/g, '');
    setIbanForm(alphanumericInput);
  };

  const handleIbanHolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    setIbanHolderForm(input);
  };


  const handleCloseModal = () => {
    setIbanModalIsOpen(false);
  };


  const handleSaveIban = () => {

    // TODO: aggiungere chiamata api per salvataggio iban
    setIbanModalIsOpen(false);
  };

  const handleOpenModal = () => {
    setIbanForm('');
    setIbanHolderForm('');
    setIbanModalIsOpen(true);
  };



  return (
    <Box sx={{ width: '100%'}}>
      <Box sx={{ ...genericContainerStyle, alignItems: 'baseline' }}>
        <Box sx={{ display: 'grid', gridColumn: 'span 8'}}>
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
      {
        !iban && ibanModalIsOpen ? (
          <Alert
            variant="outlined"
            severity="warning"
            sx={{ bgcolor: 'background.paper' }}
            action={
              <Button size="medium" variant="text" onClick={() => handleOpenModal()}  data-testid="insert-iban-button">{t('pages.initiativeOverview.insertIban')}</Button>
            }
          >
            {t('pages.initiativeOverview.missingIban')}
          </Alert>
        ) : ''
      }
      <Box sx={{ display: 'flex', gridColumn: 'span 6', gap: 2, mt: 2 }}>
        <Box flex="1">
          <InitiativeOverviewCard
            title={t('pages.initiativeOverview.information')}
            titleVariant={'h5'}
          >
            <Box
              sx={{
                display: 'grid',
                gridColumn: 'span 12',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gridTemplateRows: 'auto auto auto auto auto auto',
                gridTemplateAreas: `
                  "title title title title title title title title title title title title"
                  "label1 label1 label1 value1 value1 . . . . . . ."
                  "label2 label2 label2 value2 value2 . . . . . . ."
                  "datatitle datatitle datatitle datatitle datatitle datatitle . . . modify modify modify"
                  "datalabel1 datalabel1 datalabel1 datavalue1 datavalue1 datavalue1 . . . . . . "
                  "datalabel2 datalabel2 datalabel2 datavalue2 datavalue2 datavalue2 datavalue2 datavalue2 datavalue2 datavalue2 datavalue2 datavalue2"
                `,
                rowGap: 3,
                mb: 5,
                position: 'relative'
              }}
            >
              <Typography
                sx={{ fontWeight: 700, display: 'grid', gridArea: 'title', mb: 1 }}
                variant="overline"
                color="text.primary"
              >
                {t('pages.initiativeOverview.refundsStatusTitle')}
              </Typography>

              <Typography
                sx={{ fontWeight: 400, display: 'grid', gridArea: 'label1' }}
                variant="body1"
                color="text.primary"
              >
                {t('pages.initiativeOverview.totalAmount')}
              </Typography>

              <Typography
                sx={{ fontWeight: 700, display: 'grid', gridArea: 'value1', justifyContent: 'start' }}
                variant="body1"
              >
                {formattedCurrency(amount, MISSING_EURO_PLACEHOLDER, true)}
              </Typography>

              <Typography
                sx={{ fontWeight: 400, display: 'grid', gridArea: 'label2' }}
                variant="body1"
                color="text.primary"
              >
                {t('pages.initiativeOverview.totalRefunded')}
              </Typography>

              <Typography
                sx={{ fontWeight: 700, display: 'grid', gridArea: 'value2', justifyContent: 'start' }}
                variant="body1"
              >
                {formattedCurrency(refunded, MISSING_EURO_PLACEHOLDER, true)}
              </Typography>

              <Typography
                sx={{ fontWeight: 700, display: 'grid', gridArea: 'datatitle', mb: 1, alignSelf: 'center' }}
                variant="overline"
                color="text.primary"
              >
                {t('pages.initiativeOverview.refundsDataTitle')}
              </Typography>

              <Typography
                sx={{ fontWeight: 400, display: 'grid', gridArea: 'datalabel1' }}
                variant="body1"
                color="text.primary"
              >
                {t('pages.initiativeOverview.holder')}
              </Typography>

              <Typography
                sx={{ fontWeight: 700, display: 'grid', gridArea: 'datavalue1', justifyContent: 'start' }}
                variant="body1"
              >
                {ibanHolder ?? MISSING_DATA_PLACEHOLDER}
              </Typography>

              <Typography
                sx={{ fontWeight: 400, display: 'grid', gridArea: 'datalabel2' }}
                variant="body1"
                color="text.primary"
              >
                {t('pages.initiativeOverview.iban')}
              </Typography>

              <Typography
                sx={{
                  fontWeight: 700,
                  display: 'grid',
                  gridArea: 'datavalue2',
                  justifyContent: 'start',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                variant="body2"
              >
                {formatIban(iban)}
              </Typography>
            </Box>
          </InitiativeOverviewCard>
        </Box>
        <Box flex="1">
          <InitiativeOverviewCard
            title={t('pages.initiativeOverview.stores')}
            subtitle={t('pages.initiativeOverview.storesSubtitle')}
            titleVariant={'h5'}
          >
            <Box
              sx={{
                display: 'grid',
                gridColumn: 'span 12',
                mb: 5
              }}
            >
              <Box display="inline-block">
                <Button
                  variant="contained"
                  startIcon={<StoreIcon />}
                  onClick={() => {history.replace(`${BASE_ROUTE}/punti-vendita/censisci/${id}`);}}
                  size="large"
                  fullWidth={false}
                  data-testid="add-stores-button">
                  {t('pages.initiativeStores.uploadStores')}
                </Button>
              </Box>
            </Box>
          </InitiativeOverviewCard>
        </Box>
      </Box>

      <Slide direction="left" in={showAlertIbanSuccess} mountOnEnter unmountOnExit>
        <Alert
          severity="success"
          icon={<CheckCircleOutlineIcon />}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            backgroundColor: 'white',
            width: 'auto',
            maxWidth: '400px',
            minWidth: '300px',
            zIndex: 1300,
            boxShadow: 3,
            borderRadius: 1,
            '& .MuiAlert-icon': {
              color: '#6CC66A'
            }
          }}
        >
          {t('pages.initiativeOverview.successIban')}
        </Alert>
      </Slide>

      <ModalComponent open={ibanModalIsOpen} onClose={handleCloseModal} className='iban-modal'>
        <Typography variant="h6">{t('pages.initiativeOverview.insertIban')}</Typography>
        <Typography variant="body1" sx={{ my: 2 }}>
          {t('pages.initiativeOverview.insertIbanDescription')}
        </Typography>
        <Box>
          <Typography variant="subtitle1" sx={{ my: 2 }}>
            {t('pages.initiativeOverview.insertIbanHolder')}
          </Typography>
          <TextField
            label={t('pages.initiativeOverview.insertIbanHolder')}
            variant="outlined"
            value={ibanHolderForm}
            onChange={handleIbanHolderChange}
            fullWidth
          />
          <Typography variant="subtitle1" sx={{ my: 2 }}>
            {t('pages.initiativeOverview.insertIban')}
          </Typography>
          <TextField
            className={style['iban-input-text']}
            label={t('pages.initiativeOverview.insertIban')}
            variant="outlined"
            value={ibanForm}
            onChange={handleIbanChange}
            fullWidth
            helperText={`${ibanForm?.length}/27`}
            inputProps={{ maxLength: 27 }}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginTop: '40px' }}>
          <Button variant="outlined" onClick={handleCloseModal}>{t('commons.cancel')}</Button>
          <Button variant="contained" onClick={handleSaveIban}>{t('commons.saveBtn')}</Button>
        </Box>
      </ModalComponent>
    </Box>
  );
};

export default InitiativeOverview;
