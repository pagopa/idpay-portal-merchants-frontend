import { Box, Button, Grid, Typography, TextField, Alert, Slide } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { theme } from '@pagopa/mui-italia/dist/theme/theme';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { CheckCircleOutline, Edit } from '@mui/icons-material';
import { GridSortModel } from '@mui/x-data-grid';
import { ButtonNaked } from '@pagopa/mui-italia';
import { getMerchantPointOfSalesById, getMerchantPointOfSaleTransactions, updateMerchantPointOfSales } from '../../services/merchantService';
import BreadcrumbsBox from '../components/BreadcrumbsBox';
import LabelValuePair from '../../components/labelValuePair/labelValuePair';
import MerchantTransactions from '../../components/Transactions/MerchantTransactions';
import { parseJwt } from '../../utils/jwt-utils';
import ModalComponent from '../../components/modal/ModalComponent';
import { isValidEmail } from '../../helpers';
import { PointOfSaleTransactionDTO } from '../../api/generated/merchants/PointOfSaleTransactionDTO';
import { formatDate } from '../../utils/formatUtils';
import { POS_TYPE } from '../../utils/constants';
import InitiativeDetailCard from './InitiativeDetailCard';




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

  }, [id, store_id]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (showSuccessAlert) {
      timer = setTimeout(() => {
        setShowSuccessAlert(false);
      }, 4000);
    }


      if (timer) {
        clearTimeout(timer);
      }

  }, [showSuccessAlert]);
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
          trxDate: formatDate(transaction.trxDate),
          updateDate: formatDate(transaction.updateDate)
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
    ...(obj?.type === POS_TYPE.Physical
      ? [
        { label: t('pages.initiativeStores.address'), value: obj?.address },
        { label: t('pages.initiativeStores.phone'), value: obj?.channelPhone },
        { label: t('pages.initiativeStores.contactEmail'), value: obj?.channelEmail },
        { label: t('pages.initiativeStores.geoLink'), value: obj?.channelGeolink },
      ]
      : []),
    { label: t('pages.initiativeStores.website'), value: obj?.type === POS_TYPE.Physical ? obj?.channelWebsite : obj?.webSite },
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
    const email = field === 'contactEmailModal' ? value : contactEmailModal;
    const emailConfirm = field === 'contactEmailConfirmModal' ? value : contactEmailConfirmModal;
    let errorMsg = '';
    let confirmErrorMsg = '';
    if (!value.trim()) {
      errorMsg = 'Il campo è obbligatorio';
    } else if (!isValidEmail(value)) {
      errorMsg = 'Inserisci un indirizzo email valido';
    }
    if (
      email.trim() &&
      emailConfirm.trim() &&
      email !== emailConfirm
    ) {
      errorMsg = field === 'contactEmailModal' ? 'Le email non coincidono' : '';
      confirmErrorMsg = 'Le email non coincidono';
    }
    setFieldErrors((prev) => ({
      ...prev,
      contactEmailModal: field === 'contactEmailModal' ? errorMsg : confirmErrorMsg ?? '',
      contactEmailConfirmModal: field === 'contactEmailConfirmModal' ? errorMsg : confirmErrorMsg ?? '',
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
      ...storeDetail,
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
      setModalIsOpen(false);
    }
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 4000);
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
          items={[t('pages.initiativeStores.title'), storeDetail?.franchiseName]}
        />
        <TitleBox
          title={storeDetail?.franchiseName ? storeDetail?.franchiseName : ''}
          mtTitle={2}
          variantTitle="h4"
        />
      </Box>
      <Grid container spacing={6} mb={3}>
        <Grid item xs={12} md={12} lg={6}>
          <InitiativeDetailCard titleBox={"DATI PUNTO VENDITA"}>
            <Box >
              <Grid container spacing={1}>
                {storeDetail && getKeyValue(storeDetail).map((field: any) =>
                  <LabelValuePair
                    key={`${field?.label}-${field?.value}`}
                    label={field?.label}
                    value={field?.value}
                    isLink={field?.value?.includes('https://')}
                  />
                )}
              </Grid>
            </Box>
          </InitiativeDetailCard>
        </Grid>
        <Grid item xs={12} md={12} lg={6}>

          <Box py={3} px={4} sx={{ backgroundColor: theme.palette.background.paper, height: "100%" }}>
            <Grid container>
              <Grid item xs={9}>
                <Box mb={2}>
                  <Typography variant="body1" fontWeight={theme.typography.fontWeightBold}>
                    {'REFERENTE'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box display="flex" flexDirection="row" justifyContent="flex-end" >
                  <ButtonNaked
                    onClick={() => setModalIsOpen(true)}
                    size="medium"
                    // sx={{ display: 'flex', justifyContent: 'end', alignItems: 'start' }}
                    startIcon={<Edit />}
                    color="primary"
                  >
                    Modifica
                  </ButtonNaked>
                </Box>
              </Grid>
            </Grid>
            <Box >
              <Grid container spacing={1}>
                {storeDetail && getKeyValueReferent(storeDetail).map((referent: any) => (
                  <LabelValuePair
                    key={`${referent?.label}-${referent?.value}`}
                    label={referent?.label}
                    value={referent?.value}
                    isLink={false}
                  />))}
              </Grid>
            </Box>

          </Box>

        </Grid>
      </Grid>
      <Box mt={5}>
        <Typography fontWeight={theme.typography.fontWeightBold} variant="h6">
          {t('pages.initiativeStoreDetail.transactionHistory')}
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

      <ModalComponent
        open={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        className="iban-modal"
      >
        <Typography variant="h6">{t('commons.modify')}</Typography>
        <Typography variant="body1" my={2}>
          {t('pages.initiativeStores.modalDescription')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>{t('pages.initiativeStores.contactName')}</Typography>
            <TextField
              fullWidth
              size="small"
              label={t('pages.initiativeStores.contactName')}
              value={contactNameModal}
              onChange={(e) => setContactNameModal(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>{t('pages.initiativeStores.contactSurname')}</Typography>
            <TextField
              fullWidth
              size="small"
              label={t('pages.initiativeStores.contactSurname')}
              value={contactSurnameModal}
              onChange={(e) => setContactSurnameModal(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <Typography variant="subtitle1" gutterBottom>
              {t('pages.initiativeStores.contactEmailModal')}
            </Typography>
            <TextField
              fullWidth
              required={true}
              size="small"
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
            <Typography variant="subtitle1" gutterBottom>
              {t('pages.initiativeStoreDetail.confirmContactEmail')}
              </Typography>
            <TextField
              fullWidth
              required={true}
              size="small"
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
          <Button variant="outlined" onClick={() => setModalIsOpen(false)}>
            {t('commons.cancel')}
          </Button>
          <Button
            disabled={Object.values(fieldErrors).some((msg) => msg)}
            variant="contained"
            onClick={handleUpdateReferent}
          >
            {t('commons.modify')}
          </Button>
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
              color: '#6CC66A',
            },
          }}
        >
          {t('pages.initiativeStores.referentChangeSuccess')}
        </Alert>
      </Slide>
    </Box>
  );
};

export default InitiativeStoreDetail;
