import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useFormik } from 'formik';
import PointOfSalesFilters, { PointOfSalesFilterField } from '../PointOfSalesFilters';
import { GetPointOfSalesFilters } from '../../../types/types';

jest.mock('../../../pages/initiativeDiscounts/FiltersForm', () => ({
  __esModule: true,
  default: ({
    children,
    onFiltersApplied,
    onFiltersReset,
    formik,
  }: {
    children: React.ReactNode;
    onFiltersApplied: (values: GetPointOfSalesFilters) => void;
    onFiltersReset: () => void;
    formik: { values: GetPointOfSalesFilters };
  }) => (
    <div>
      <button type="button" onClick={() => onFiltersApplied(formik.values)}>
        apply-filters
      </button>
      <button type="button" onClick={onFiltersReset}>
        reset-filters
      </button>
      {children}
    </div>
  ),
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
    expect(screen.queryByText('Initiative 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Initiative 2')).not.toBeInTheDocument();
  });

  test('returns null for unsupported field values', () => {
    render(
      <TestComponent
        fields={['city', 'unsupported-field' as PointOfSalesFilterField]}
      />
    );

    expect(screen.getByLabelText('pages.initiativeStores.city')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
  });
});
