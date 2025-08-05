import { Box, Button, Grid, Paper, Typography, TextField, Alert, Slide } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { theme } from '@pagopa/mui-italia/dist/theme/theme';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { format } from 'date-fns';
import { CheckCircleOutline , Edit} from '@mui/icons-material';
import { GridSortModel } from '@mui/x-data-grid';
import { ButtonNaked } from '@pagopa/mui-italia';
import { getMerchantPointOfSalesById, getMerchantPointOfSaleTransactions, updateMerchantPointOfSales } from '../../services/merchantService';
import BreadcrumbsBox from '../components/BreadcrumbsBox';
import LabelValuePair from '../../components/labelValuePair/labelValuePair';
import MerchantTransactions from '../initiativeDiscounts/MerchantTransactions';
import { parseJwt } from '../../utils/jwt-utils';
import ModalComponent from '../../components/modal/ModalComponent';
import { isValidEmail } from '../../helpers';
import { PointOfSaleTransactionDTO } from '../../api/generated/merchants/PointOfSaleTransactionDTO';




interface RouteParams {
  id: string;
  store_id: string;
}

const InitiativeStoreDetail = () => {
  const [storeDetail, setStoreDetail] = useState<any>(null);
  const [transactionsFilters, setTransactionsFilters] = useState<any>({});
  const [storeTransactions, setStoreTransactions] = useState<Array<PointOfSaleTransactionDTO>>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState<any>({});
  const [contactNameModal, setContactNameModal] = useState<string>('');
  const [contactSurnameModal, setContactSurnameModal] = useState<string>('');
  const [contactEmailModal, setContactEmailModal] = useState<string>('');
  const [contactEmailConfirmModal, setContactEmailConfirmModal] = useState<string>('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    contactEmailModal?: string;
    contactEmailConfirmModal?: string;
  }>({});
  const { t } = useTranslation();
  const { id, store_id } = useParams<RouteParams>();
  const addError = useErrorDispatcher();


  useEffect(() => {
    fetchStoreDetail().catch((error) => {
      console.log("error", error);
    });
    fetchStoreTransactions().catch((error) => {
      console.log("error", error);
    });

  }, [id,store_id]);
  useEffect(() => {
    if (storeDetail) {
      setContactNameModal(storeDetail.contactName || '');
      setContactSurnameModal(storeDetail.contactSurname || '');
      setContactEmailModal(storeDetail.contactEmail || '');
      setContactEmailConfirmModal(storeDetail.contactEmail || '');
    }
  }, [storeDetail]);

  const fetchStoreDetail = async () => {
    try {
      const userJwt = parseJwt(storageTokenOps.read());
      const merchantId = userJwt?.merchant_id;
      const response = await getMerchantPointOfSalesById(merchantId, store_id);
      if (response) {
        setStoreDetail(response);
      }

    } catch (error: any) {
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
      });
    }
  };

  const fetchStoreTransactions = async (filters?: any) => {
    try {
      const response = await getMerchantPointOfSaleTransactions(id, store_id, { size: 10, ...filters });
      const { content, ...paginationData } = response;
      setPaginationModel(paginationData);
      if (content) {
        const responseWIthFormattedDate = content.map((transaction: any) => ({
          ...transaction,
          trxDate: format(transaction.trxDate, 'dd/MM/yyyy HH:mm'),
          updateDate: format(transaction.updateDate, 'dd/MM/yyyy HH:mm')
        }));
        setStoreTransactions([...responseWIthFormattedDate]);
      }
    } catch (error: any) {
      addError({
        id: 'GET_MERCHANT_TRANSACTIONS',
        blocking: false,
        error,
        techDescription: 'An error occurred getting merchant transactions',
        displayableTitle: t('errors.genericTitle'),
        displayableDescription: t('errors.genericDescription'),
        toNotify: true,
        component: 'Toast',
        showCloseIcon: true,
      });  
    }
  };

  const getKeyValue = (obj: any) => [
    { label: t('pages.initiativeStores.id'), value: obj?.id },
    ...(obj?.type === 'PHYSICAL'
      ? [
        { label: t('pages.initiativeStores.address'), value: obj?.address },
        { label: t('pages.initiativeStores.phone'), value: obj?.channelPhone },
        { label: t('pages.initiativeStores.contactEmail'), value: obj?.channelEmail },
        { label: t('pages.initiativeStores.geoLink'), value: obj?.channelGeolink },
      ]
      : []),
    { label: t('pages.initiativeStores.website'), value: obj?.type === 'PHYSICAL' ? obj?.channelWebsite : obj?.webSite },
  ];

  const getKeyValueReferent = (obj: any) => [
    { label: t('pages.initiativeStores.contactName'), value: obj?.contactName },
    { label: t('pages.initiativeStores.contactSurname'), value: obj?.contactSurname },
    { label: t('pages.initiativeStores.contactEmail'), value: obj?.contactEmail },
  ];

  const handleFiltersApplied = (filters: any) => {
    setTransactionsFilters(filters);
    fetchStoreTransactions(filters).catch((error) => {
      console.error('Error fetching transactions:', error);
    });
  };

  const handleFiltersReset = () => {
    console.log('Callback dopo reset filtri');
    fetchStoreTransactions({}).catch(error => {
      console.error('Error fetching stores:', error);
    });
  };
  const handleBlur = (
    field: 'contactEmailModal' | 'contactEmailConfirmModal',
    value: string
  ) => {
    let errorMsg = '';

    if (!value?.trim()) {
      errorMsg = 'Il campo è obbligatorio';
    } else if (field === 'contactEmailModal' || field === 'contactEmailConfirmModal') {
      if (!isValidEmail(value)) {
        errorMsg = 'Inserisci un indirizzo email valido';
      } else if (
        contactEmailModal?.trim() &&
        contactEmailConfirmModal?.trim() &&
        contactEmailModal?.trim() !== contactEmailConfirmModal?.trim()
      ) {
        errorMsg = 'Le email non coincidono';
      }
    }

    setFieldErrors((prev) => ({
      ...prev,
      [field]: errorMsg,
    }));
  };

  const handleSortModelChange = async (newSortModel: GridSortModel) => {
    if (newSortModel.length > 0) {
      const { field, sort } = newSortModel[0];
      await fetchStoreTransactions({
        ...transactionsFilters,
        sort: `${field !== 'fiscalCode' ? field : 'userId'},${sort}`,
      })
        .catch(error => {
          console.error('Error fetching stores:', error);
        });

    } else {
      console.log('Ordinamento rimosso.');
    }
  };

  const handleUpdateReferent = async () => {
    const userJwt = parseJwt(storageTokenOps.read());
    const merchantId = userJwt?.merchant_id;
    const obj = [{
      ...storeDetail?.pointOfSale,
      contactName: contactNameModal,
      contactSurname: contactSurnameModal,
      contactEmail: contactEmailModal,
    }];
    try {
      await updateMerchantPointOfSales(merchantId, obj).catch((error) => {
        addError({
          id: 'UPDATE_STORES',
          blocking: false,
          error,
          techDescription: 'An error occurred updating stores',
          displayableTitle: t('errors.genericTitle'),
          displayableDescription: t('errors.genericDescription'),
          toNotify: true,
          component: 'Toast',
          showCloseIcon: true,
        });
      });
      setModalIsOpen(false);
      setShowSuccessAlert(!addError);
      fetchStoreDetail().catch((error) => {
        console.log("error", error);
      });
    } catch (error: any) {
      console.log(error);
    }
  };

  const handlePaginationPageChange = (page: number) => {
    setPaginationModel({
      page,
    });
    fetchStoreTransactions({
      ...transactionsFilters,
      page,
    }).catch(error => {
      console.error('Error fetching stores:', error);
    });
  };

  return (
    <Box>
      <Box mt={2}>
        <BreadcrumbsBox
          backLabel={t('commons.backBtn')}
          items={[
            t('pages.initiativeStores.title'),
            storeDetail?.franchiseName
          ]}
        />
        <TitleBox
          title={storeDetail?.franchiseName ? storeDetail?.franchiseName : ''}
          mtTitle={2}
          variantTitle="h4"
        />
      </Box>
      <Grid
        container
        spacing={3}
        mb={3}
      >
        <Grid item xs={12} md={12} lg={6}>
          <Paper sx={{ height: '100%' }}>
            <Box p={2}>
              <Typography
                fontWeight={theme.typography.fontWeightBold}
                mb={2}
              >
                DATI PUNTO VENDITA
              </Typography>
              <Box display={'flex'} flexDirection={'column'}>
                {storeDetail && getKeyValue(storeDetail).map((field: any) => (
                  <LabelValuePair
                    key={`${field?.label}-${field?.value}`}
                    label={field?.label}
                    value={field?.value}
                    isLink={field?.value?.includes('https://')}
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={12} lg={6}>
          <Paper sx={{ height: '100%' }}>
            <Box p={2} >
              <Box>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography
                      fontWeight={theme.typography.fontWeightBold}
                      mb={2}
                    >
                      {'REFERENTE'}
                    </Typography>
                  </Grid>
                  <Grid
                     item xs={6}
                     display={'flex'}
                     alignItems={'baseline'}
                     justifyContent={'flex-end'}>
                    <ButtonNaked
                      onClick={() => setModalIsOpen(true)}
                      size="medium"
                      sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start' }}
                      startIcon={<Edit />}
                      color="primary"
                    >
                      Modifica
                    </ButtonNaked>
                  </Grid>
                </Grid>
                <Box display={'flex'} flexDirection={'column'}>
                  {storeDetail && getKeyValueReferent(storeDetail).map((referent: any) => (
                    <LabelValuePair
                      key={`${referent?.label}-${referent?.value}`}
                      label={referent?.label}
                      value={referent?.value}
                      isLink={false}
                    />))}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <Box mt={4}>
        <Typography
          fontWeight={theme.typography.fontWeightBold}
          variant="h6"
        >
          {'Storico transazioni'}
        </Typography>
        <MerchantTransactions
          transactions={storeTransactions}
          handleFiltersApplied={handleFiltersApplied}
          handleFiltersReset={handleFiltersReset}
          handleSortChange={handleSortModelChange}
          handlePaginationPageChange={handlePaginationPageChange}
          paginationModel={paginationModel}
        />
      </Box>

      <ModalComponent open={modalIsOpen} onClose={() => setModalIsOpen(false)} className='iban-modal'>
        <Typography variant="h6">{t('commons.modify')}</Typography>
        <Typography variant="body1" sx={{ my: 2 }}>
          {t('pages.initiativeStores.modalDescription')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Nome</Typography>
            <TextField
              fullWidth
              size='small'
              label={t('pages.initiativeStores.contactName')}
              value={contactNameModal}
              onChange={(e) => setContactNameModal(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Cognome</Typography>
            <TextField
              fullWidth
              size='small'
              label={t('pages.initiativeStores.contactSurname')}
              value={contactSurnameModal}
              onChange={(e) => setContactSurnameModal(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={12} >
            <Typography variant="subtitle1" gutterBottom>Indirizzo e-mail</Typography>
            <TextField
              fullWidth
              required={true}
              size='small'
              label={t('pages.initiativeStores.contactEmail')}
              value={contactEmailModal}
              onBlur={() => handleBlur('contactEmailModal', contactEmailModal)}
              onChange={(e) => {
                setContactEmailModal(e.target.value);
                setFieldErrors((prev) => ({ ...prev, contactEmailModal: '' }));
              }}
              error={Boolean(fieldErrors.contactEmailModal)}
              helperText={fieldErrors.contactEmailModal}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <Typography variant="subtitle1" gutterBottom>Conferma indirizzo e-mail</Typography>
            <TextField
              fullWidth
              required={true}
              size='small'
              label={t('pages.initiativeStores.contactEmail')}
              value={contactEmailConfirmModal}
              onBlur={() => handleBlur('contactEmailConfirmModal', contactEmailConfirmModal)}
              onChange={(e) => {
                setContactEmailConfirmModal(e.target.value);
                setFieldErrors((prev) => ({ ...prev, contactEmailConfirmModal: '' }));
              }}
              error={Boolean(fieldErrors.contactEmailConfirmModal)}
              helperText={fieldErrors.contactEmailConfirmModal}
            />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginTop: '40px' }}>
          <Button variant="outlined" onClick={() => setModalIsOpen(false)}>{t('commons.cancel')}</Button>
          <Button disabled={Object.values(fieldErrors).some((msg) => msg)} variant="contained" onClick={handleUpdateReferent}>{t('commons.modify')}</Button>
        </Box>
      </ModalComponent>
      <Slide direction="left" in={showSuccessAlert} mountOnEnter unmountOnExit>
        <Alert
          severity="success"
          icon={<CheckCircleOutline />}
          sx={{
            position: 'fixed',
            bottom: 40,
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
          {t('pages.initiativeStores.referentChangeSuccess')}
        </Alert>
      </Slide>
    </Box>
  );
};

export default InitiativeStoreDetail;
