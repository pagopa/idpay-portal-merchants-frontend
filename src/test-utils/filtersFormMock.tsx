import React from 'react';
import { GetPointOfSalesFilters } from '../types/types';

type FiltersFormMockProps = {
  children: React.ReactNode;
  onFiltersApplied: (values: GetPointOfSalesFilters) => void;
  onFiltersReset: () => void;
  formik: { values: GetPointOfSalesFilters };
};

export const FiltersFormMock = ({
  children,
  onFiltersApplied,
  onFiltersReset,
  formik,
}: FiltersFormMockProps) => (
  <div>
    <button type="button" onClick={() => onFiltersApplied(formik.values)}>
      apply-filters
    </button>
    <button type="button" onClick={onFiltersReset}>
      reset-filters
    </button>
    {children}
  </div>
);


