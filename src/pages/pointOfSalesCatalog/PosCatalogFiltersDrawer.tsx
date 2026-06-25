import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { FormikProps } from 'formik';
import DetailDrawer from '../../components/Drawer/DetailDrawer';
import FiltersForm from '../initiativeDiscounts/FiltersForm';
import { PointOfSaleDTO } from '../../api/generated/merchants/data-contracts';
import { GetPointOfSalesFilters } from '../../types/types';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';

type InitiativeOption = {
  value: string;
  label: string;
};

type PosCatalogFiltersProps = {
  formik: FormikProps<GetPointOfSalesFilters>;
  filtersAppliedOnce: boolean;
  onFiltersApplied: (values: GetPointOfSalesFilters) => void;
  onFiltersReset: () => void;
  initiativeOptions: Array<InitiativeOption>;
  t: (key: string) => string;
};

type PosCatalogDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedStore: PointOfSaleDTO | null;
};

export const PosCatalogFilters: React.FC<PosCatalogFiltersProps> = ({
  formik,
  filtersAppliedOnce,
  onFiltersApplied,
  onFiltersReset,
  initiativeOptions,
  t,
}) => (
  <FiltersForm
    onFiltersApplied={onFiltersApplied}
    onFiltersReset={onFiltersReset}
    formik={formik}
    filtersAppliedOnce={filtersAppliedOnce}
  >
    <Grid item xs={12} sm={6} md={4} lg={2}>
      <FormControl fullWidth size="small">
        <InputLabel id="initiative-label">Iniziativa</InputLabel>
        <Select
          labelId="initiative-label"
          id="initiative-select"
          label="Iniziativa"
          name="initiative"
          value={formik.values.initiative}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        >
          {initiativeOptions.map((initiative) => (
            <MenuItem key={initiative.value} value={initiative.value}>
              {initiative.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>

    <Grid item xs={12} sm={6} md={4} lg={2}>
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
          <MenuItem value="PHYSICAL">{t('pages.initiativeStores.physical')}</MenuItem>
          <MenuItem value="ONLINE">{t('pages.initiativeStores.online')}</MenuItem>
        </Select>
      </FormControl>
    </Grid>

    <Grid item xs={12} sm={6} md={4} lg={2}>
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

    <Grid item xs={12} sm={6} md={4} lg={2}>
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

    <Grid item xs={12} sm={6} md={4} lg={2}>
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
);

export const PosCatalogDrawer: React.FC<PosCatalogDrawerProps> = ({
  isOpen,
  onClose,
  selectedStore,
}) => (
  <DetailDrawer
    isOpen={isOpen}
    setIsOpen={onClose}
    title={selectedStore?.franchiseName}
  >
    {selectedStore && (
      <>
        <Typography variant="overline" color="text.secondary">
          DATI PUNTO VENDITA
        </Typography>
        <Box>
          <Typography variant="body2" color="text.secondary">
            ID
          </Typography>
          <Typography variant="body1">
            {selectedStore.id || MISSING_DATA_PLACEHOLDER}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {selectedStore.type === 'PHYSICAL' ? 'Indirizzo' : 'Sito web'}
          </Typography>
          <Typography variant="body1">
            {selectedStore.type === 'PHYSICAL' ? (
              selectedStore.address || MISSING_DATA_PLACEHOLDER
            ) : (
              <a
                href={`https://${(selectedStore.website || '').replace(/^https?:\/\//, '')}`}
                target="_blank"
                rel="noreferrer"
              >
                {selectedStore.website || MISSING_DATA_PLACEHOLDER}
              </a>
            )}
          </Typography>
        </Box>
        {selectedStore.type === 'PHYSICAL' && (
          <Box>
            <Typography variant="body2" color="text.secondary">
              Telefono
            </Typography>
            <Typography variant="body1">
              {selectedStore.channelPhone || MISSING_DATA_PLACEHOLDER}
            </Typography>
          </Box>
        )}

        <Typography variant="overline" color="text.secondary">
          REFERENTE
        </Typography>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Nome
          </Typography>
          <Typography variant="body1">
            {selectedStore.contactName || MISSING_DATA_PLACEHOLDER}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Cognome
          </Typography>
          <Typography variant="body1">
            {selectedStore.contactSurname || MISSING_DATA_PLACEHOLDER}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            E-mail
          </Typography>
          <Typography variant="body1">
            {selectedStore.contactEmail || MISSING_DATA_PLACEHOLDER}
          </Typography>
        </Box>
      </>
    )}
  </DetailDrawer>
);
