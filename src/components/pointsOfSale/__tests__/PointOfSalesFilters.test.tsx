/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { useFormik } from 'formik';
import PointOfSalesFilters, { PointOfSalesFilterField } from '../PointOfSalesFilters';
import { GetPointOfSalesFilters } from '../../../types/types';
import { trackAnalyticsInputChange } from '../../../services/analyticsService';

jest.mock('../../../pages/initiativeDiscounts/FiltersForm', () => ({
  __esModule: true,
  default: require('../../../test-utils/filtersFormMock').FiltersFormMock,
}));

jest.mock('../../../services/analyticsService', () => ({
  trackAnalyticsInputChange: jest.fn(),
}));

const TestComponent = ({
  fields,
  initialValues,
  onFiltersApplied = jest.fn(),
  onFiltersReset = jest.fn(),
}: {
  fields: Array<PointOfSalesFilterField>;
  initialValues?: GetPointOfSalesFilters;
  onFiltersApplied?: jest.Mock;
  onFiltersReset?: jest.Mock;
}) => {
  const formik = useFormik<GetPointOfSalesFilters>({
    initialValues: {
      initiative: '',
      type: undefined,
      city: '',
      address: '',
      contactName: '',
      sort: 'asc',
      ...initialValues,
    },
    onSubmit: jest.fn(),
  });

  return (
    <PointOfSalesFilters
      formik={formik}
      filtersAppliedOnce={false}
      onFiltersApplied={onFiltersApplied}
      onFiltersReset={onFiltersReset}
      t={(key: string) => key}
      fields={fields}
      initiativeOptions={[
        { value: 'initiative-1', label: 'Initiative 1' },
        { value: 'initiative-2', label: 'Initiative 2' },
      ]}
    />
  );
};

describe('PointOfSalesFilters', () => {
  test('renders all supported fields and propagates apply/reset actions', () => {
    const onFiltersApplied = jest.fn();
    const onFiltersReset = jest.fn();

    render(
      <TestComponent
        fields={['initiative', 'type', 'city', 'address', 'contactName']}
        initialValues={{
          initiative: 'initiative-1',
          type: 'ONLINE',
          city: 'Rome',
          address: 'Via Roma',
          contactName: 'Mario',
          sort: 'asc',
        }}
        onFiltersApplied={onFiltersApplied}
        onFiltersReset={onFiltersReset}
      />
    );

    expect(screen.getByLabelText('Iniziativa')).toBeInTheDocument();
    expect(screen.getByText('Initiative 1')).toBeInTheDocument();
    expect(screen.getByLabelText('pages.initiativeStores.pointOfSaleType')).toBeInTheDocument();
    expect(screen.getByText('pages.initiativeStores.online')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Rome')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Via Roma')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Mario')).toBeInTheDocument();

    fireEvent.click(screen.getByText('apply-filters'));
    fireEvent.click(screen.getByText('reset-filters'));

    expect(onFiltersApplied).toHaveBeenCalledWith(
      expect.objectContaining({
        initiative: 'initiative-1',
        type: 'ONLINE',
        city: 'Rome',
        address: 'Via Roma',
        contactName: 'Mario',
      })
    );
    expect(onFiltersReset).toHaveBeenCalledTimes(1);
  });

  test('falls back to the raw initiative value when no matching option exists', () => {
    const formik = {
      values: {
        initiative: 'initiative-missing',
        type: undefined,
        city: '',
        address: '',
        contactName: '',
        sort: 'asc',
      },
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
    } as any;

    render(
      <PointOfSalesFilters
        formik={formik}
        filtersAppliedOnce={false}
        onFiltersApplied={jest.fn()}
        onFiltersReset={jest.fn()}
        t={(key: string) => key}
        fields={['initiative']}
        initiativeOptions={[{ value: 'initiative-1', label: 'Initiative 1' }]}
      />
    );

    expect(screen.getByLabelText('Iniziativa')).toBeInTheDocument();
    expect(screen.getByText('initiative-missing')).toBeInTheDocument();
    expect(screen.queryByText('Initiative 1')).not.toBeInTheDocument();
  });

  test('renders empty initiative select when no initiative options are provided', () => {
    const formik = {
      values: {
        initiative: '',
        type: undefined,
        city: '',
        address: '',
        contactName: '',
        sort: 'asc',
      },
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
    } as any;

    render(
      <PointOfSalesFilters
        formik={formik}
        filtersAppliedOnce={false}
        onFiltersApplied={jest.fn()}
        onFiltersReset={jest.fn()}
        t={(key: string) => key}
        fields={['initiative']}
      />
    );

    expect(screen.getByLabelText('Iniziativa')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByLabelText('Iniziativa'));

    expect(
      screen.getByRole('option', { name: 'enums.initiativesFilters.allInitiatives' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'enums.initiativesFilters.noInitiative' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Initiative 1' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Initiative 2' })).not.toBeInTheDocument();
  });

  test('renders fixed initiative options first and removes duplicated fixed values', () => {
    const formik = {
      values: {
        initiative: '',
        type: undefined,
        city: '',
        address: '',
        contactName: '',
        sort: 'asc',
      },
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
    } as any;

    render(
      <PointOfSalesFilters
        formik={formik}
        filtersAppliedOnce={false}
        onFiltersApplied={jest.fn()}
        onFiltersReset={jest.fn()}
        t={(key: string) => key}
        fields={['initiative']}
        initiativeOptions={[
          { value: 'ALL_INITIATIVES', label: 'All from backend' },
          { value: 'NO_INITIATIVE', label: 'None from backend' },
          { value: 'initiative-1', label: 'Initiative 1' },
        ]}
      />
    );

    fireEvent.mouseDown(screen.getByLabelText('Iniziativa'));

    const options = screen.getAllByRole('option').map((option) => option.textContent);
    expect(options).toEqual([
      'enums.initiativesFilters.allInitiatives',
      'enums.initiativesFilters.noInitiative',
      'Initiative 1',
    ]);
  });

  test('returns null for unsupported field values', () => {
    render(<TestComponent fields={['city', 'unsupported-field' as PointOfSalesFilterField]} />);

    expect(screen.getByLabelText('pages.initiativeStores.city')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
  });

  test('renders associated filter and disables initiative when requested', () => {
    const formik = {
      values: {
        associated: 'NO',
        initiative: '',
        type: undefined,
        city: '',
        address: '',
        contactName: '',
        sort: 'asc',
      },
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
    } as any;

    render(
      <PointOfSalesFilters
        formik={formik}
        filtersAppliedOnce={false}
        onFiltersApplied={jest.fn()}
        onFiltersReset={jest.fn()}
        t={(key: string) => key}
        fields={['associated', 'initiative']}
        disableInitiativeFilter
        includeNoInitiativeOption={false}
      />
    );

    expect(screen.getByLabelText('pages.posCatalog.filters.associated')).toBeInTheDocument();

    const initiativeSelect = screen.getByLabelText('Iniziativa');
    expect(initiativeSelect).toHaveAttribute('aria-disabled', 'true');

    fireEvent.mouseDown(initiativeSelect);
    expect(
      screen.queryByRole('option', { name: 'enums.initiativesFilters.noInitiative' })
    ).not.toBeInTheDocument();
  });

  test('handles associated select changes and tracks analytics input changes', () => {
    const handleChange = jest.fn();
    const formik = {
      values: {
        associated: '',
        initiative: '',
        type: undefined,
        city: '',
        address: '',
        contactName: '',
        sort: 'asc',
      },
      handleChange,
      handleBlur: jest.fn(),
    } as any;

    render(
      <PointOfSalesFilters
        formik={formik}
        filtersAppliedOnce={false}
        onFiltersApplied={jest.fn()}
        onFiltersReset={jest.fn()}
        t={(key: string) => key}
        fields={['associated']}
      />
    );

    fireEvent.mouseDown(screen.getByLabelText('pages.posCatalog.filters.associated'));
    fireEvent.click(screen.getByRole('option', { name: 'pages.posCatalog.filters.associatedYes' }));

    expect(handleChange).toHaveBeenCalled();
    expect(trackAnalyticsInputChange).toHaveBeenCalledWith('associated', 'YES');
  });

  test('renders initiative select when the current value is undefined', () => {
    const formik = {
      values: {
        initiative: undefined,
        type: undefined,
        city: '',
        address: '',
        contactName: '',
        sort: 'asc',
      },
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
    } as any;

    render(
      <PointOfSalesFilters
        formik={formik}
        filtersAppliedOnce={false}
        onFiltersApplied={jest.fn()}
        onFiltersReset={jest.fn()}
        t={(key: string) => key}
        fields={['initiative']}
        initiativeOptions={[{ value: 'initiative-1', label: 'Initiative 1' }]}
      />
    );

    expect(screen.getByLabelText('Iniziativa')).toBeInTheDocument();
  });

  test('renders the type filter without the initiative filter', () => {
    render(
      <TestComponent
        fields={['type']}
        initialValues={{
          initiative: '',
          type: 'PHYSICAL',
          city: '',
          address: '',
          contactName: '',
          sort: 'asc',
        }}
      />
    );

    expect(screen.getByLabelText('pages.initiativeStores.pointOfSaleType')).toBeInTheDocument();
    expect(screen.getByText('pages.initiativeStores.physical')).toBeInTheDocument();
  });
});
