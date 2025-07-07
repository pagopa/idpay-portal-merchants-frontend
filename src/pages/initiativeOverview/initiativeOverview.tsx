import { Box, Alert, Button, Typography, TextField } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';
import { initiativeSelector } from '../../redux/slices/initiativesSlice';
import ROUTES from '../../routes';
import { genericContainerStyle } from '../../styles';
import ModalComponent from '../../components/modal/ModalComponent';
import InitiativeOverviewSummary from './initiativeOverviewSummary';
import InitiativeOverviewStores from './initiativeOverviewStores';
import style from './initiativeOverview.module.css';

interface MatchParams {
  id: string;
}

const InitiativeOverview = () => {
  const [ibanModalIsOpen, setIbanModalIsOpen] = useState(false);
  const [iban, setIban] = useState('');
  const [holder, setHolder] = useState('');
  const { t } = useTranslation();
  const selectedInitiative = useAppSelector(initiativeSelector);
  const match = matchPath(location.pathname, {
    path: [ROUTES.OVERVIEW],
    exact: true,
    strict: false,
  });
  const { id } = (match?.params as MatchParams) || {};

  useEffect(() => {
    // const dates = mapDatesFromPeriod(selectedInitiative?.spendingPeriod);
    // setStartDate(dates?.startDate);
    // setEndDate(dates?.endDate);
    // setValue(0);
  }, [id, JSON.stringify(selectedInitiative)]);

  const handleInsertIban = () => {
    setIbanModalIsOpen(true);
  };

  const handleIbanChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    const alphanumericInput = input.replace(/[^a-zA-Z0-9]/g, '');
    setIban(alphanumericInput);
  };

  const handleHolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHolder(event.target.value);
  };

  const handleCloseModal = () => {
    setIbanModalIsOpen(false);
    setIban('');
    setHolder('');
  };

  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <Box sx={{ ...genericContainerStyle, alignItems: 'baseline' }}>
        <Box sx={{ display: 'grid', gridColumn: 'span 8', mt: 2 }}>
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
      <Alert
        variant="outlined"
        severity="warning"
        sx={{ bgcolor: 'background.paper' }}
        action={
          <Button size="small" variant="text" onClick={handleInsertIban}>{t('pages.initiativeOverview.insertIban')}</Button>
        }
      >
        {t('pages.initiativeOverview.missingIban')}
      </Alert>
      <Box sx={{ display: 'flex', gridColumn: 'span 6', gap: 2, mt: 2 }}>
        <Box flex="1">
          <InitiativeOverviewSummary id={id} />
        </Box>
        <Box flex="1">
          <InitiativeOverviewStores />
        </Box>
      </Box>

      <ModalComponent open={ibanModalIsOpen} onClose={handleCloseModal}>
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
            value={holder}
            onChange={handleHolderChange}
            fullWidth
          />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ my: 2 }}>
            {t('pages.initiativeOverview.insertIban')}
          </Typography>
          <TextField
            className={style['iban-input-text']}
            label={t('pages.initiativeOverview.insertIban')}
            variant="outlined"
            value={iban}
            onChange={handleIbanChange}
            fullWidth
            helperText={`${iban.length}/27`}
            inputProps={{ maxLength: 27 }}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginTop: '40px' }}>
          <Button variant="outlined" onClick={handleCloseModal}>{t('commons.cancel')}</Button>
          <Button variant="contained" onClick={handleCloseModal}>{t('commons.saveBtn')}</Button>
        </Box>
      </ModalComponent>
    </Box>
  );
};

export default InitiativeOverview;
