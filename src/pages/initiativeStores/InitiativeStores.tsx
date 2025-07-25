import React, { useEffect } from 'react';
import { Box, Button, Stack, Grid, FormControl, InputLabel, Select, MenuItem, TextField} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import StoreIcon from '@mui/icons-material/Store';



const InitiativeStores: React.FC = () => {


  const { t } = useTranslation();
  useEffect(() => {
    console.log('initiativeStores');
  }, []);

  


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



  </Box>
  );
};

export default InitiativeStores;