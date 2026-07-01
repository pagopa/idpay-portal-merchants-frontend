import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { FormikProps } from 'formik';
import FiltersForm from '../../pages/initiativeDiscounts/FiltersForm';
import { GetPointOfSalesFilters } from '../../types/types';

export type InitiativeOption = {
  value: string;
  label: string;
};

export type PointOfSalesFilterField =
  | 'initiative'
  | 'type'
  | 'city'
  | 'address'
  | 'contactName';

type PointOfSalesFiltersProps = {
  formik: FormikProps<GetPointOfSalesFilters>;
  filtersAppliedOnce: boolean;
  onFiltersApplied: (values: GetPointOfSalesFilters) => void;
  onFiltersReset: () => void;
  t: (key: string) => string;
  fields: Array<PointOfSalesFilterField>;
  initiativeOptions?: Array<InitiativeOption>;
};

const fieldLayout: Record<
  PointOfSalesFilterField,
  { xs: number; sm: number; md: number; lg: number }
> = {
  initiative: { xs: 12, sm: 6, md: 4, lg: 2 },
  type: { xs: 12, sm: 6, md: 4, lg: 2 },
  city: { xs: 12, sm: 6, md: 4, lg: 2 },
  address: { xs: 12, sm: 6, md: 4, lg: 2 },
  contactName: { xs: 12, sm: 6, md: 4, lg: 2 },
};

const selectTextSafeAreaSx = {
  maxWidth: 'calc(100% - 25%)',
};

const selectValueEllipsisSx = {
  '& .MuiSelect-select': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'block',
    paddingRight: '40px !important',
  },
};

const selectLabelEllipsisSx = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
  ...selectTextSafeAreaSx,
};

const menuItemLabelEllipsisSx = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const getInitiativeLabel = (
  value: string,
  initiativeOptions: Array<InitiativeOption>
) => initiativeOptions.find((initiative) => initiative.value === value)?.label ?? value;

const renderField = (
  field: PointOfSalesFilterField,
  formik: FormikProps<GetPointOfSalesFilters>,
  t: (key: string) => string,
  initiativeOptions: Array<InitiativeOption>
) => {
  switch (field) {
    case 'initiative':
      return (
        <FormControl fullWidth size="small">
          <InputLabel id="initiative-label" sx={selectLabelEllipsisSx}>
            Iniziativa
          </InputLabel>
          <Select
            labelId="initiative-label"
            id="initiative-select"
            label="Iniziativa"
            name="initiative"
            value={formik.values.initiative ?? ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            sx={selectValueEllipsisSx}
            renderValue={(selected) => (
              <span
                style={{
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 'calc(100% - 32px)',
                }}
              >
                {getInitiativeLabel(selected, initiativeOptions)}
              </span>
            )}
          >
            {initiativeOptions.map((initiative) => (
              <MenuItem
                key={initiative.value}
                value={initiative.value}
                sx={menuItemLabelEllipsisSx}
              >
                {initiative.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    case 'type':
      return (
        <FormControl fullWidth size="small">
          <InputLabel id="pos-type-label" sx={selectLabelEllipsisSx}>
            {t('pages.initiativeStores.pointOfSaleType')}
          </InputLabel>
          <Select
            labelId="pos-type-label"
            id="pos-type-select"
            label={t('pages.initiativeStores.pointOfSaleType')}
            name="type"
            value={formik.values.type}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            sx={selectValueEllipsisSx}
          >
            <MenuItem value="PHYSICAL">{t('pages.initiativeStores.physical')}</MenuItem>
            <MenuItem value="ONLINE">{t('pages.initiativeStores.online')}</MenuItem>
          </Select>
        </FormControl>
      );
    case 'city':
      return (
        <TextField
          fullWidth
          size="small"
          label={t('pages.initiativeStores.city')}
          name="city"
          value={formik.values.city}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      );
    case 'address':
      return (
        <TextField
          fullWidth
          size="small"
          name="address"
          label={t('pages.initiativeStores.address')}
          value={formik.values.address}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      );
    case 'contactName':
      return (
        <TextField
          fullWidth
          size="small"
          label={t('pages.initiativeStores.referent')}
          name="contactName"
          value={formik.values.contactName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      );
    default:
      return null;
  }
};

const PointOfSalesFilters: React.FC<PointOfSalesFiltersProps> = ({
  formik,
  filtersAppliedOnce,
  onFiltersApplied,
  onFiltersReset,
  t,
  fields,
  initiativeOptions = [],
}) => (
  <FiltersForm
    onFiltersApplied={onFiltersApplied}
    onFiltersReset={onFiltersReset}
    formik={formik}
    filtersAppliedOnce={filtersAppliedOnce}
  >
    {fields.map((field) => (
      <Grid key={field} item {...fieldLayout[field]}>
        {renderField(field, formik, t, initiativeOptions)}
      </Grid>
    ))}
  </FiltersForm>
);

export default PointOfSalesFilters;
