import React, { useState, useEffect } from 'react';
import { Box, Button, Stack, Grid, FormControl, InputLabel, Select, MenuItem, TextField, Alert, Slide, Paper, Typography, Link } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import StoreIcon from '@mui/icons-material/Store';
import { GridColDef } from '@mui/x-data-grid';
import { useFormik } from 'formik';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {useHistory, useParams } from 'react-router-dom';
import DataTable from '../../components/dataTable/DataTable';
import FiltersForm from '../initiativeDiscounts/FiltersForm';
import { GetPointOfSalesFilters } from '../../types/types';
import { PointOfSaleDTO } from '../../api/generated/merchants/PointOfSaleDTO';
import { parseJwt } from '../../utils/jwt-utils';
import { getMerchantPointOfSales } from '../../services/merchantService';
import { BASE_ROUTE } from '../../routes';


const initialValues: GetPointOfSalesFilters = {
  type: undefined,
  city: '',
  address: '',
  contactName: '',
  page: 0,
  size: 10,
  sort: 'asc'
};
interface RouteParams {
  id: string;
}


const InitiativeStores: React.FC = () => {

  const [stores, setStores] = useState<Array<PointOfSaleDTO>>([]);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [storesLoading, setStoresLoading] = useState(false);
  const { t } = useTranslation();
  const history = useHistory();
  const { id } = useParams<RouteParams>();

  useEffect(() => {
    fetchStores(initialValues).catch(error => {
      console.error('Error fetching stores:', error);
      setShowErrorAlert(true);
    });
  }, []);



  const columns: Array<GridColDef> = [
    {
      field: 'franchiseName',
      headerName: t('pages.initiativeStores.franchiseName'),
      flex: 1,
      editable: false,
      disableColumnMenu: true,
    },
    {
      field: 'type',
      headerName: t('pages.initiativeStores.type'),
      flex: 1,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => {
        if(params.value === 'PHYSICAL') {
          return 'Fisico';
        } else if(params.value === 'ONLINE') {
          return 'Online';
        } else {
          return '-';
        }
      },
    },
    {
      field: 'address',
      headerName: t('pages.initiativeStores.address'),
      flex: 1,
      editable: false,
      disableColumnMenu: true,
    },
    {
      field: 'city',
      headerName: t('pages.initiativeStores.city'),
      flex: 1,
      editable: false,
      disableColumnMenu: true,
    },
    {
      field: 'referent',
      headerName: t('pages.initiativeStores.referent'),
      flex: 1,
      editable: false,
      disableColumnMenu: true,
    },
    {
      field: 'contactEmail',
      headerName: t('pages.initiativeStores.email'),
      flex: 1,
      editable: false,
      disableColumnMenu: true,
    },
  
  ];

  const fetchStores = async (filters: GetPointOfSalesFilters) => {
    setStoresLoading(true);
    const userJwt = parseJwt(storageTokenOps.read());
    const merchantId = userJwt?.merchant_id;
    if (!merchantId) {
      setShowErrorAlert(true);
      return;
    }
    try {
      const response = await getMerchantPointOfSales(merchantId, {
        type: filters.type,
        city: filters.city,
        address: filters.address,
        contactName: filters.contactName,
        sort: filters.sort,
        page: filters.page,
        size: 10,
      });
      setStores(response.content);
      setStoresLoading(false);
    } catch (error: any) {
      console.log(error);
      setStoresLoading(false);
      setShowErrorAlert(true);
    }
  };

  const formik = useFormik<GetPointOfSalesFilters>({
    initialValues,
    onSubmit: (values) => {
      console.log('Eseguo ricerca con filtri:', values);
    }
  });

  const handleFiltersApplied = (values: GetPointOfSalesFilters) => {
    console.log('Callback dopo applicazione filtri:', values);
    fetchStores(values).catch(error => {
      console.error('Error fetching stores:', error);
      setShowErrorAlert(true);
    });

  };

  const handleFiltersReset = () => {
    console.log('Callback dopo reset filtri');
    fetchStores(initialValues).catch(error => {
      console.error('Error fetching stores:', error);
      setShowErrorAlert(true);
    });
  };

  const goToAddStorePage = () => {
    history.push(`${BASE_ROUTE}/${id}/punti-vendita/censisci/`);
  };

  const goToStoreDetail = (store: PointOfSaleDTO) => {
    history.push(`${BASE_ROUTE}/${id}/punti-vendita/${store.id}/`);
  };

  const filtersSetted = () => formik.values.type || formik.values.city !== '' || formik.values.address !== '' || formik.values.contactName !== '';


  return (
    <Box sx={{ my: 2 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 2, md: 3 }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
      >
        <TitleBox
          title={t('pages.initiativeStores.title')}
          subTitle={t('pages.initiativeStores.subtitle')}
          mbTitle={2}
          variantTitle="h4"
          variantSubTitle="body1"
        />
       {
        stores.length > 0 && !storesLoading && (
          <Button
          variant="contained"
          size="small"
          onClick={() => goToAddStorePage()}
          startIcon={<StoreIcon />}
          sx={{ width: { xs: '100%', md: 'auto', alignSelf: 'start', minWidth: '200px' } }}
        >
          {t('pages.initiativeStores.addStoreList')}
        </Button>
        )
       }
      </Stack>
      {
        storesLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
                  {
        stores.length > 0 || ( stores.length === 0 && filtersSetted()) ? (
        <>
          <FiltersForm
            onFiltersApplied={handleFiltersApplied}
            onFiltersReset={handleFiltersReset}
            formik={formik}
      >
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="pos-type-label">{t('pages.initiativeStores.pointOfSaleType')}</InputLabel>
            <Select
              labelId="pos-type-label"
              id="pos-type-select"
              label={t('pages.initiativeStores.pointOfSaleType')}
              name="type"
              value={formik.values.type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <MenuItem value=""><em>Nessuna</em></MenuItem>
              <MenuItem value="PHYSICAL">{t('pages.initiativeStores.physical')}</MenuItem>
              <MenuItem value="ONLINE">{t('pages.initiativeStores.online')}</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Città */}
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <TextField
            fullWidth
            size="small"
            label={t('pages.initiativeStores.city')}
            name="city"
            value={formik.values.city}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Grid>

        {/* Indirizzo */}
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <TextField
            fullWidth
            size="small"
            name="address"
            label={t('pages.initiativeStores.address')}
            value={formik.values.address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Grid>

        {/* Referente */}
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <TextField
            fullWidth
            size="small"
            label={t('pages.initiativeStores.referent')}
            name="contactName"
            value={formik.values.contactName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Grid>

      </FiltersForm>

      <Box sx={{ height: 500, width: '100%' }}>

        <DataTable rows={stores} columns={columns} pageSize={10} rowsPerPage={10} handleRowAction={goToStoreDetail} />
      </Box>
        </> ) : <Paper sx={{my: 4, p: 3, textAlign: 'center', display: 'flex',alignItems: 'center', justifyContent: 'center'}}>
        <Typography variant="body2">{t('pages.initiativeStores.noStores')}</Typography>
        <Link onClick={() => goToAddStorePage()} className='cursor-pointer' variant="body2" sx={{fontWeight: '600'}}>{t('pages.initiativeStores.addStoreNoResults')}</Link>
        </Paper>
      }
          </>
        )
      }


      <Slide direction="left" in={showErrorAlert} mountOnEnter unmountOnExit>
        <Alert
          severity="error"
          icon={<ErrorOutlineIcon />}
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
              color: 'red'
            }
          }}
        >
          {t('initiativeStoresUpload.uploadError')}
        </Alert>
      </Slide>



    </Box>
  );
};

export default InitiativeStores;