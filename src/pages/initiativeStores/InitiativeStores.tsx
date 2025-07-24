import React, { useEffect } from 'react';
import { Box, Button, Stack, Grid, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
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
    <Grid sx={{my: 4}} container spacing={2} alignItems="center"> {/* spacing tra le Grid item */}
        {/* Tipologia punto vendita (Select) */}
        <Grid item xs={12} sm={6} md={3} lg={2}> {/* Occupa 12 colonne su xs, 6 su sm, 3 su md, 2 su lg */}
          <FormControl fullWidth size="small">
            <InputLabel id="pos-type-label">{t('filter.pointOfSaleType')}</InputLabel>
            <Select
              labelId="pos-type-label"
              id="pos-type-select"
              // value={posType}
              label={t('filter.pointOfSaleType')}
              // onChange={(e) => setPosType(e.target.value)}
            >
              <MenuItem value=""><em>Nessuna</em></MenuItem>
              <MenuItem value="PHYSICAL">{t('posType.physical')}</MenuItem>
              <MenuItem value="ONLINE">{t('posType.online')}</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Città (TextField) */}
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <TextField
            fullWidth
            size="small"
            label={t('filter.city')}
            // value={city}
            // onChange={(e) => setCity(e.target.value)}
          />
        </Grid>

        {/* Indirizzo (TextField) */}
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <TextField
            fullWidth
            size="small"
            label={t('filter.address')}
            // value={address}
            // onChange={(e) => setAddress(e.target.value)}
          />
        </Grid>

        {/* Referente (TextField) */}
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <TextField
            fullWidth
            size="small"
            label={t('filter.contactPerson')}
            // value={contactName}
            // onChange={(e) => setContactName(e.target.value)}
          />
        </Grid>

        {/* Bottoni Filtra e Rimuovi filtri */}
        <Grid item xs={12} sm={6} md={3} lg={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => { console.log("Filtra Clicked"); }}
              sx={{ flexShrink: 0 }} // Previene che il bottone si rimpicciolisca troppo
            >
              {t('button.filter')}
            </Button>
            <Button
              variant="text" // 'text' o 'outlined' a seconda del tuo stile
              size="small"
              onClick={() => { console.log("Rimuovi filtri Clicked"); }}
              sx={{ flexShrink: 0 }}
            >
              {t('button.removeFilters')}
            </Button>
        </Grid>
      </Grid>
  </Box>
  );
};

export default InitiativeStores;