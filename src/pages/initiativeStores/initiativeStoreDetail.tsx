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
import {
  getMerchantPointOfSalesById,
  getMerchantPointOfSaleTransactionsProcessed,
  updateMerchantPointOfSales,
} from '../../services/merchantService';
import BreadcrumbsBox from '../components/BreadcrumbsBox';
import LabelValuePair from '../../components/labelValuePair/labelValuePair';
import MerchantTransactions from '../../components/Transactions/MerchantTransactions';
import { parseJwt } from '../../utils/jwt-utils';
import ModalComponent from '../../components/modal/ModalComponent';
import { isValidEmail } from '../../helpers';
import { formatDate } from '../../utils/formatUtils';
import { PointOfSaleTransactionProcessedDTO } from '../../api/generated/merchants/PointOfSaleTransactionProcessedDTO';
import { POS_TYPE } from '../../utils/constants';
import InitiativeDetailCard from './InitiativeDetailCard';
import { useStore } from './StoreContext';

interface RouteParams {
  id: string;
  store_id: string;
}

const InitiativeStoreDetail = () => {
  const [storeDetail, setStoreDetail] = useState<any>(null);
  const [transactionsFilters, setTransactionsFilters] = useState<any>({});
  const [storeTransactions, setStoreTransactions] = useState<
    Array<PointOfSaleTransactionProcessedDTO>
  >([]);
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
    contactSurnameModal?: string;
    contactNameModal?: string;
  }>({});
  const { t } = useTranslation();
  const { id, store_id } = useParams<RouteParams>();
  const addError = useErrorDispatcher();
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const { setStoreId } = useStore();

  useEffect(() => {
    void fetchStoreDetail();
    void fetchStoreTransactions();
    setStoreId(store_id);
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
      const response = await getMerchantPointOfSaleTransactionsProcessed(id, store_id, {
        size: 10,
        ...filters,
      });
      const { content, ...paginationData } = response;
      setPaginationModel(paginationData);
      if (content) {
        const responseWIthFormattedDate = content.map((transaction: any) => ({
          ...transaction,
          trxDate: formatDate(transaction.trxDate),
          updateDate: formatDate(transaction.updateDate),
        }));
        setStoreTransactions([...responseWIthFormattedDate]);
      }
    } catch (error: any) {
      console.log(error, 'error');
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
          {
            label: t('pages.initiativeStores.address'),
            value: obj?.address
              .concat(` - ${obj?.zipCode}`)
              .concat(`, ${obj?.city}`)
              .concat(`, ${obj?.province}`),
          },
          {
            label: t('pages.initiativeStores.phone'),
            value: obj?.channelPhone,
          },
          {
            label: t('pages.initiativeStores.contactEmail'),
            value: obj?.channelEmail,
          },
          {
            label: t('pages.initiativeStores.geoLink'),
            value: obj?.channelGeolink,
          },
        ]
      : []),
    { label: t('pages.initiativeStores.website'), value: obj?.website },
  ];

  const getKeyValueReferent = (obj: any) => [
    { label: t('pages.initiativeStores.contactName'), value: obj?.contactName },
    { label: t('pages.initiativeStores.contactSurname'), value: obj?.contactSurname },
    { label: t('pages.initiativeStores.contactEmail'), value: obj?.contactEmail },
  ];

  const handleFiltersApplied = (filters: any) => {
    setTransactionsFilters(filters);
    void fetchStoreTransactions(filters);
  };

  const handleFiltersReset = () => {
    console.log('Callback dopo reset filtri');
    void fetchStoreTransactions({});
  };
  const handleBlur = (
    field:
      | 'contactSurnameModal'
      | 'contactEmailModal'
      | 'contactEmailConfirmModal'
      | 'contactNameModal',
    value: string
  ) => {
    const trimmed = value?.trim() ?? '';

    setFieldErrors((prev) => {
      let updatedErrors = { ...prev };

      const isNameField = field === 'contactNameModal' || field === 'contactSurnameModal';
      if (isNameField) {
        return {
          ...prev,
          [field]: trimmed ? '' : 'Il campo è obbligatorio',
        };
      }

      const email = field === 'contactEmailModal' ? trimmed : contactEmailModal?.trim() ?? '';
      const emailConfirm =
        field === 'contactEmailConfirmModal' ? trimmed : contactEmailConfirmModal?.trim() ?? '';

      let currentFieldError = '';
      if (!trimmed) {
        currentFieldError = 'Il campo è obbligatorio';
      } else if (!isValidEmail(trimmed)) {
        currentFieldError = 'Inserisci un indirizzo email valido';
      }

      updatedErrors = {
        ...updatedErrors,
        [field]: currentFieldError,
      };
      const bothPresent = email && emailConfirm;
      const bothValid = isValidEmail(email) && isValidEmail(emailConfirm);

      if (bothPresent && bothValid && email !== emailConfirm) {
        return {
          ...updatedErrors,
          contactEmailModal: 'Le email non coincidono',
          contactEmailConfirmModal: 'Le email non coincidono',
        };
      }

      return updatedErrors;
    });
  };

  // const resetModalFieldsAndErrors = () => {
  //   setFieldErrors({});
  //   setContactEmailConfirmModal('');
  //   setContactEmailModal('');
  //   setContactSurnameModal('');
  //   setContactNameModal('');
  // };

  const handleSortModelChange = async (newSortModel: GridSortModel) => {
    setSortModel(newSortModel);
    if (newSortModel.length > 0) {
      const { field, sort } = newSortModel[0];
      void fetchStoreTransactions({
        ...transactionsFilters,
        sort: `${
          field === 'elettrodomestico' ? 'productName' : field !== 'fiscalCode' ? field : 'userId'
        },${sort}`,
      });
    }
  };

  const handleUpdateReferent = async () => {
    let newErrors: typeof fieldErrors = {};

    const addErrorModal = (field: keyof typeof fieldErrors, message: string) => {
      newErrors = { ...newErrors, [field]: message };
    };

    if (!contactNameModal.trim()) {
      addErrorModal('contactNameModal', 'Il campo è obbligatorio');
    }
    if (!contactSurnameModal.trim()) {
      addErrorModal('contactSurnameModal', 'Il campo è obbligatorio');
    }
    if (!contactEmailModal.trim()) {
      addErrorModal('contactEmailModal', 'Il campo è obbligatorio');
    } else if (!isValidEmail(contactEmailModal)) {
      addErrorModal('contactEmailModal', 'Inserisci un indirizzo email valido');
    }
    if (!contactEmailConfirmModal.trim()) {
      addErrorModal('contactEmailConfirmModal', 'Il campo è obbligatorio');
    } else if (!isValidEmail(contactEmailConfirmModal)) {
      addErrorModal('contactEmailConfirmModal', 'Inserisci un indirizzo email valido');
    }
    if (contactEmailModal.trim() === storeDetail.contactEmail) {
      addErrorModal('contactEmailModal', 'E-mail già censita');
      addErrorModal('contactEmailConfirmModal', 'E-mail già censita');
    }

    if (
      contactEmailModal.trim() &&
      contactEmailConfirmModal.trim() &&
      contactEmailModal !== contactEmailConfirmModal
    ) {
      addErrorModal('contactEmailModal', 'Le email non coincidono');
      addErrorModal('contactEmailConfirmModal', 'Le email non coincidono');
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }
    const userJwt = parseJwt(storageTokenOps.read());
    const merchantId = userJwt?.merchant_id;
    const obj = [
      {
        ...storeDetail,
        contactName: contactNameModal,
        contactSurname: contactSurnameModal,
        contactEmail: contactEmailModal,
      },
    ];
    if (storeDetail.contactEmail === contactEmailConfirmModal) {
      addError({
        id: 'UPDATE_STORES',
        blocking: false,
        error: new Error('Point of sale already registered'),
        techDescription: 'Point of sale already registered',
        displayableTitle: t('errors.duplicateEmailError'),
        displayableDescription: `${storeDetail.contactEmail} è già associata ad altro punto vendita`,
        toNotify: true,
        component: 'Toast',
        showCloseIcon: true,
      });
      setModalIsOpen(false);
      return;
    }

    const response = await updateMerchantPointOfSales(merchantId, obj);
    if (response) {
      if (response?.code === 'POINT_OF_SALE_ALREADY_REGISTERED') {
        addError({
          id: 'UPDATE_STORES',
          blocking: false,
          error: new Error('Point of sale already registered'),
          techDescription: 'Point of sale already registered',
          displayableTitle: t('errors.duplicateEmailError'),
          displayableDescription: `${response?.message} è già associata ad altro punto vendita`,
          toNotify: true,
          component: 'Toast',
          showCloseIcon: true,
        });
        setModalIsOpen(false);
        setFieldErrors({});
      } else {
        addError({
          id: 'UPDATE_STORES',
          blocking: false,
          error: new Error('error points of sale upload'),
          techDescription: 'error points of sale upload',
          displayableTitle: t('errors.genericTitle'),
          displayableDescription: t('errors.genericDescription'),
          toNotify: true,
          component: 'Toast',
          showCloseIcon: true,
        });
      }
    } else {
      setModalIsOpen(false);
      setShowSuccessAlert(true);
      void fetchStoreDetail();
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 4000);
    }
  };

  const handlePaginationPageChange = (page: number) => {
    setPaginationModel((prev: any) => ({
      ...prev,
      page,
    }));

    const sortParam =
      sortModel.length > 0
        ? `${sortModel[0].field !== 'fiscalCode' ? sortModel[0].field : 'userId'},${
            sortModel[0].sort
          }`
        : undefined;

    void fetchStoreTransactions({
      ...transactionsFilters,
      page,
      ...(sortParam && { sort: sortParam }),
    });
  };

  return (
    <Box>
      <Box
        mt={2}
        sx={{
          '& .MuiTypography-h4': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 'calc(95vw - 300px)',
            minWidth: '0',
            whiteSpace: 'nowrap',
          },
        }}
      >
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
          <InitiativeDetailCard titleBox={'DATI PUNTO VENDITA'}>
            <Box>
              <Grid container spacing={1}>
                {storeDetail &&
                  getKeyValue(storeDetail).map((field: any) => (
                    <LabelValuePair
                      key={`${field?.label}-${field?.value}`}
                      label={field?.label}
                      value={field?.value}
                      isLink={
                        field?.value?.includes('https://') || field?.value?.includes('http://')
                      }
                    />
                  ))}
              </Grid>
            </Box>
          </InitiativeDetailCard>
        </Grid>
        <Grid item xs={12} md={12} lg={6}>
          <Box
            py={3}
            px={4}
            sx={{ backgroundColor: theme.palette.background.paper, height: '100%' }}
          >
            <Grid container>
              <Grid item xs={9}>
                <Box mb={2}>
                  <Typography variant="body1" fontWeight={theme.typography.fontWeightBold}>
                    {'REFERENTE'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box display="flex" flexDirection="row" justifyContent="flex-end">
                  <ButtonNaked
                    onClick={() => {
                      setModalIsOpen(true);
                      // resetModalFieldsAndErrors();
                      setFieldErrors({});
                      setContactEmailModal(storeDetail.contactEmail);
                      setContactEmailConfirmModal(storeDetail.contactEmail);
                      setContactNameModal(storeDetail.contactName);
                      setContactSurnameModal(storeDetail.contactSurname);
                    }}
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
            <Box>
              <Grid container spacing={1}>
                {storeDetail &&
                  getKeyValueReferent(storeDetail).map((referent: any) => (
                    <LabelValuePair
                      key={`${referent?.label}-${referent?.value}`}
                      label={referent?.label}
                      value={referent?.value}
                      isLink={false}
                    />
                  ))}
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
        onClose={() => {
          setModalIsOpen(false);
        }}
        className="iban-modal"
      >
        <Typography variant="h6">{t('commons.modify')}</Typography>
        <Typography variant="body1" my={2}>
          {t('pages.initiativeStores.modalDescription')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              {t('pages.initiativeStores.contactName')}
            </Typography>
            <TextField
              fullWidth
              size="small"
              label={t('pages.initiativeStores.contactName')}
              value={contactNameModal}
              onChange={(e) => setContactNameModal(e.target.value)}
              onBlur={() => handleBlur('contactNameModal', contactNameModal)}
              error={Boolean(fieldErrors.contactNameModal)}
              helperText={fieldErrors.contactNameModal}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              {t('pages.initiativeStores.contactSurname')}
            </Typography>
            <TextField
              fullWidth
              size="small"
              label={t('pages.initiativeStores.contactSurname')}
              value={contactSurnameModal}
              onBlur={() => handleBlur('contactSurnameModal', contactSurnameModal)}
              onChange={(e) => setContactSurnameModal(e.target.value)}
              error={Boolean(fieldErrors.contactSurnameModal)}
              helperText={fieldErrors.contactSurnameModal}
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
          <Button
            variant="outlined"
            onClick={() => {
              setModalIsOpen(false);
              setFieldErrors({});
            }}
          >
            {t('commons.cancel')}
          </Button>
          <Button variant="contained" data-testid="update-button" onClick={handleUpdateReferent}>
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
