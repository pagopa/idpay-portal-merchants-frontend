import { Box, Button, Grid, Paper, Typography, TextField, Alert, Slide } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { theme } from '@pagopa/mui-italia/dist/theme/theme';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { format } from 'date-fns';
import { CheckCircleOutline } from '@mui/icons-material';
import { GridSortModel } from '@mui/x-data-grid';
import { ButtonNaked } from '@pagopa/mui-italia';
import { Edit } from '@mui/icons-material';
import { getMerchantPointOfSalesById, getMerchantPointOfSaleTransactions, updateMerchantPointOfSales } from '../../services/merchantService';
import BreadcrumbsBox from '../components/BreadcrumbsBox';
import LabelValuePair from '../../components/labelValuePair/labelValuePair';
import MerchantTransactions from '../initiativeDiscounts/MerchantTransactions';
import { parseJwt } from '../../utils/jwt-utils';
import { PointOfSaleDetailDTO } from '../../api/generated/merchants/PointOfSaleDetailDTO';
import { MerchantTransactionDTO } from '../../api/generated/merchants/MerchantTransactionDTO';
import ModalComponent from '../../components/modal/ModalComponent';



interface RouteParams {
  id: string;
  store_id: string;
}
// interface StoreField {
//   id: string;
//   label: string;
//   value: string;
// }

// const storeFields: Array<StoreField> = [
//   {
//     id: 'id',
//     label: 'ID',
//     value: MISSING_DATA_PLACEHOLDER
//   },
//   {
//     id: 'address',
//     label: 'Indirizzo',
//     value: MISSING_DATA_PLACEHOLDER
//   },
//   {
//     id: 'phone',
//     label: 'Telefono',
//     value: MISSING_DATA_PLACEHOLDER
//   },
//   {
//     id: 'email',
//     label: 'Email',
//     value: MISSING_DATA_PLACEHOLDER
//   },
//   {
//     id: 'google_landing',
//     label: 'Landing Google',
//     value: MISSING_DATA_PLACEHOLDER
//   },
//   {
//     id: 'website',
//     label: 'Sito web',
//     value: MISSING_DATA_PLACEHOLDER
//   }
// ];

// const referentFields: Array<StoreField> = [
//   {
//     id: 'nome',
//     label: 'Nome',
//     value: MISSING_DATA_PLACEHOLDER
//   },
//   {
//     id: 'cognome',
//     label: 'Cognome',
//     value: MISSING_DATA_PLACEHOLDER
//   },
//   {
//     id: 'email',
//     label: 'email',
//     value: MISSING_DATA_PLACEHOLDER
//   }
// ];

// const mockResponse = {

//   pointOfSale: {

//     id: "6888ea7fc3286af3d5afa7f7",

//     type: "PHYSICAL",

//     franchiseName: "Orn - Abbott",

//     region: "Molise",

//     province: "Provincia Generica",

//     city: "East Ludiestad",

//     zipCode: "85077",

//     address: "Viale Europa, 14",

//     contactEmail: "Steve_Daniel@hotmail.com",

//     contactName: "Tyrese",

//     contactSurname: "Langosh"

//   },

//   merchantDetail: {
//     vatNumber: "12345678908",
//     iban: "IT96I0300203280465229336812"
//   }
// }
;

const InitiativeStoreDetail = () => {
  // const history = useHistory();
  const [storeDetail, setStoreDetail] = useState<PointOfSaleDetailDTO | null>(null);
  const [transactionsFilters, setTransactionsFilters] = useState<any>({});
  const [storeTransactions, setStoreTransactions] = useState<Array<MerchantTransactionDTO>>([]);
  // const [storeTransactionsLoading, setStoreTransactionsLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState<any>({});
  const [contactNameModal, setContactNameModal] = useState('');
  const [contactSurnameModal, setContactSurnameModal] = useState('');
  const [contactEmailModal, setContactEmailModal] = useState('');
  const [contactEmailConfirmModal, setContactEmailConfirmModal] = useState('');
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

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

  }, [id]);

  useEffect(() => {
    console.log("TRANSACTIONS", storeTransactions);
  }, [storeTransactions]);

  const fetchStoreDetail = async () => {
    try {
      const userJwt = parseJwt(storageTokenOps.read());
      const merchantId = userJwt?.merchant_id;
      const pointOfSaleId = store_id;
      const response = await getMerchantPointOfSalesById(merchantId, pointOfSaleId);
      if (response) {
        console.log("response", response);
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
      // setStoreTransactionsLoading(true);
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
        // setStoreTransactionsLoading(false);
      }
    } catch (error: any) {
      // setStoreTransactionsLoading(false);
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
    { label: t('pages.initiativeStores.id'), value: obj?.pointOfSale?.id },
    { label: t('pages.initiativeStores.address'), value: obj?.pointOfSale?.address },
    { label: t('pages.initiativeStores.phone'), value: obj?.pointOfSale?.channelPhone },
    { label: t('pages.initiativeStores.contactEmail'), value: obj?.pointOfSale?.channelEmail },
    { label: t('pages.initiativeStores.geoLink'), value: obj?.pointOfSale?.channelGeolink },
    { label: t('pages.initiativeStores.website'), value: obj?.pointOfSale?.type === 'PHYSICAL' ? obj?.pointOfSale?.channelWebsite : obj?.pointOfSale?.website },
  ];

  const getKeyValueReferent = (obj: any) => [
    { label: t('pages.initiativeStores.contactName'), value: obj?.pointOfSale?.contactName },
    { label: t('pages.initiativeStores.contactSurname'), value: obj?.pointOfSale?.contactSurname },
    { label: t('pages.initiativeStores.contactEmail'), value: obj?.pointOfSale?.contactEmail },
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
    setSortModel(newSortModel);
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
      await updateMerchantPointOfSales(merchantId, obj);
      setModalIsOpen(false);
      setShowSuccessAlert(true);
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
            t('pages.initiativeOverview.title'),
            storeDetail?.pointOfSale?.franchiseName
          ]}
        />
        <TitleBox
          title={storeDetail?.pointOfSale?.franchiseName ? storeDetail?.pointOfSale?.franchiseName : ''}
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
          <Paper>
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
                    key={field?.id}
                    label={field?.label}
                    value={field?.value}
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={12} lg={6}>
          <Paper sx={{ height: '100%' }}>
            <Box p={2} display={'flex'} justifyContent={'space-between'}>
              <Box>
                <Typography
                  fontWeight={theme.typography.fontWeightBold}
                  mb={2}
                >
                  {'REFERENTE'}
                </Typography>

                <Box display={'flex'} flexDirection={'column'}>
                  {storeDetail && getKeyValueReferent(storeDetail).map((field: any) => {
                    console.log("field", field);
                    return <LabelValuePair
                      key={field?.id}
                      label={field?.label}
                      value={field?.value}
                    />;
                  })}
                </Box>
              </Box>
              <ButtonNaked
                onClick={() => setModalIsOpen(true)}
                size="medium"
                sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start' }}
                startIcon={<Edit />}
                color="primary"
              >
                Modifica
              </ButtonNaked>
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
          id={id}
          transactions={storeTransactions}
          handleFiltersApplied={handleFiltersApplied}
          handleFiltersReset={handleFiltersReset}
          handleSortChange={handleSortModelChange}
          sortModel={sortModel}
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
              size='small'
              label={t('pages.initiativeStores.contactEmail')}
              value={contactEmailModal}
              onChange={(e) => setContactEmailModal(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <Typography variant="subtitle1" gutterBottom>Conferma indirizzo e-mail</Typography>
            <TextField
              fullWidth
              size='small'
              label={t('pages.initiativeStores.contactEmail')}
              value={contactEmailConfirmModal}
              onChange={(e) => setContactEmailConfirmModal(e.target.value)}
              error={contactEmailModal !== contactEmailConfirmModal}
              helperText={contactEmailModal !== contactEmailConfirmModal ? 'Le email non coincidono' : ''}
            />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginTop: '40px' }}>
          <Button variant="outlined" onClick={() => setModalIsOpen(false)}>{t('commons.cancel')}</Button>
          <Button variant="contained" onClick={handleUpdateReferent}>{t('commons.modify')}</Button>
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
