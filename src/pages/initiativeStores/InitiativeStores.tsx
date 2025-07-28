import React from 'react';
import { Box, Button, Stack, Grid, FormControl, InputLabel, Select, MenuItem, TextField} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import StoreIcon from '@mui/icons-material/Store';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
// import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
// import { TypeEnum, PointOfSaleDTO } from '../../api/generated/merchants/PointOfSaleDTO';

// service
// import { getMerchantPointOfSales } from '../../services/merchantService';
// import { parseJwt } from '../../utils/jwt-utils';
const columns: Array<GridColDef> = [
  {
    field: 'franchiseName',
    headerName: 'Franchise Name',
    width: 150,
    editable: true,
  },
  {
    field: 'type',
    headerName: 'Type',
    width: 150,
    editable: true,
  },
  {
    field: 'address',
    headerName: 'Address',
    width: 150,
    editable: true,
  },
  {
    field: 'city',
    headerName: 'City',
    width: 150,
    editable: true,
  },
  {
    field: 'referent',
    headerName: 'Referent',
    width: 150,
    editable: true,
  },
  {
    field: 'contactEmail',
    headerName: 'Email',
    width: 150,
    editable: true,
  },

];

const rows = [
  { id: 1, franchiseName: 'Snow', type: 'Jon', address: 'Jon', city: 'Jon', referent: 'Jon', contactEmail: 'Jon' },
  { id: 2, franchiseName: 'Lannister', type: 'Cersei', address: 'Cersei', city: 'Cersei', referent: 'Cersei', contactEmail: 'Cersei' },
  { id: 3, franchiseName: 'Lannister', type: 'Jaime', address: 'Jaime', city: 'Jaime', referent: 'Jaime', contactEmail: 'Jaime' },
  { id: 4, franchiseName: 'Stark', type: 'Arya', address: 'Arya', city: 'Arya', referent: 'Arya', contactEmail: 'Arya' },
  { id: 5, franchiseName: 'Targaryen', type: 'Daenerys', address: 'Daenerys', city: 'Daenerys', referent: 'Daenerys', contactEmail: 'Daenerys' },
  { id: 6, franchiseName: 'Melisandre', type: 'Daenerys', address: 'Daenerys', city: 'Daenerys', referent: 'Daenerys', contactEmail: 'Daenerys' },
  { id: 7, franchiseName: 'Clifford', type: 'Ferrara', address: 'Ferrara', city: 'Ferrara', referent: 'Ferrara', contactEmail: 'Ferrara' },
  { id: 8, franchiseName: 'Frances', type: 'Rossini', address: 'Rossini', city: 'Rossini', referent: 'Rossini', contactEmail: 'Rossini' },
  { id: 9, franchiseName: 'Roxie', type: 'Harvey', address: 'Harvey', city: 'Harvey', referent: 'Harvey', contactEmail: 'Harvey' }, 
];

const InitiativeStores: React.FC = () => {
  
  const { t } = useTranslation();
  // const [pointsOfSaleLoaded, setPointsOfSaleLoaded] = useState(false);
  // const [showErrorAlert, setShowErrorAlert] = useState(false);
  // const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  // const [stores, setStores] = useState<Array<PointOfSaleDTO>>([]);

  // useEffect(() => {
  //     try {
  //       await fetchStores();
  //     } catch (error) {
  //       console.error('Error fetching stores:', error);
  //       setShowErrorAlert(true);
  //     }
  // }, []);

  // const fetchStores = async () => {
  //   const userJwt = parseJwt(storageTokenOps.read());
  //   const merchantId = userJwt?.merchant_id;
  //   if (!merchantId) {
  //     setShowErrorAlert(true);
  //     return;
  //   }
  //   try{
  //     const stores = await getMerchantPointOfSales(merchantId, {
  //       type: TypeEnum.PHYSICAL,
  //       city: '',
  //       address: '',
  //       contactName: '',
  //       sort: 'asc',
  //       page: 0,
  //       size: 10,
  //     });
  //     setStores(stores);
  //     setPointsOfSaleLoaded(true);
  //     setShowSuccessAlert(true);
  //   } catch (error: any) {
  //     console.log(error);
  //     setShowErrorAlert(true);
  //   }
  // };

  


  return (
    <Box sx={{my: 2}}>
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
      <Button
        variant="contained"
        size="small"
        onClick={() => { console.log("Aggiungi Negozio Clicked"); }}
        startIcon={<StoreIcon />}
        sx={{ width: { xs: '100%', md: 'auto', alignSelf: 'start', minWidth: '200px' } }}
      >
        {t('pages.initiativeStores.addStoreList')}
      </Button>
    </Stack>
    <Grid sx={{my: 4}} container spacing={2} alignItems="center"> 

        <Grid item xs={12} sm={6} md={3} lg={3}> 
          <FormControl fullWidth size="small">
            <InputLabel id="pos-type-label">{t('pages.initiativeStores.pointOfSaleType')}</InputLabel>
            <Select
              labelId="pos-type-label"
              id="pos-type-select"
              // value={posType}
              label={t('pages.initiativeStores.pointOfSaleType')}
              // onChange={(e) => setPosType(e.target.value)}
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
            // value={city}
            // onChange={(e) => setCity(e.target.value)}
          />
        </Grid>

        {/* Indirizzo */}
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <TextField
            fullWidth
            size="small"
            label={t('pages.initiativeStores.address')}
            // value={address}
            // onChange={(e) => setAddress(e.target.value)}
          />
        </Grid>

        {/* Referente */}
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <TextField
            fullWidth
            size="small"
            label={t('pages.initiativeStores.referent')}
            // value={contactName}
            // onChange={(e) => setContactName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={1}>
          <Button
            variant="contained"
            size="small"
            onClick={() => { console.log("Filtra Clicked"); }}
            sx={{ flexShrink: 0 }}
          >
            {t('commons.filterBtn')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Button
            variant="text"
            size="small"
            onClick={() => { console.log("Rimuovi filtri Clicked"); }}
            sx={{ flexShrink: 0 }}
          >
            {t('commons.removeFiltersBtn')}
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        disableSelectionOnClick
        experimentalFeatures={{ newEditingApi: true }}
        sx={{
          '& .MuiDataGrid-row': {
            backgroundColor: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#FFFFFF',
            },
          },
        }}
      />
    </Box>



  </Box>
  );
};

export default InitiativeStores;