import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useFormik } from 'formik';
import { GetPointOfSalesFilters } from '../../../types/types';
import {
  PosCatalogDrawer,
  PosCatalogFilters,
} from '../PosCatalogFiltersDrawer';
import { MockPosCatalogStore } from '../mockPosCatalog';

jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../../components/Drawer/DetailDrawer', () => ({
  __esModule: true,
  default: ({
    isOpen,
    title,
    children,
  }: {
    isOpen: boolean;
    title: string;
    children: React.ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="detail-drawer">
        <div>{title}</div>
        {children}
      </div>
    ) : null,
}));

jest.mock('../../initiativeDiscounts/FiltersForm', () => ({
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

const TestFilters = ({
  initialValues,
  onFiltersApplied,
  onFiltersReset,
}: {
  initialValues: GetPointOfSalesFilters;
  onFiltersApplied: (values: GetPointOfSalesFilters) => void;
  onFiltersReset: () => void;
}) => {
  const formik = useFormik<GetPointOfSalesFilters>({
    initialValues,
    onSubmit: jest.fn(),
  });

  return (
    <PosCatalogFilters
      formik={formik}
      filtersAppliedOnce={false}
      onFiltersApplied={onFiltersApplied}
      onFiltersReset={onFiltersReset}
      initiativeOptions={[
        { value: 'Iniziativa 1', label: 'Iniziativa 1' },
        { value: 'Iniziativa 2', label: 'Iniziativa 2' },
      ]}
      t={(key: string) => key}
    />
  );
};

const onlineStore: MockPosCatalogStore = {
  id: '1',
  franchiseName: 'Negozio online',
  type: 'ONLINE',
  address: '',
  website: 'www.shop.it',
  city: 'Roma',
  contactName: 'Mario',
  contactSurname: 'Rossi',
  contactEmail: 'mario.rossi@mail.it',
  initiative: 'Iniziativa 1',
  adhesions: [{ date: '01/01/2026', initiativeName: 'Iniziativa 1' }],
};

const physicalStore: MockPosCatalogStore = {
  id: '2',
  franchiseName: 'Negozio fisico',
  type: 'PHYSICAL',
  address: 'Via Roma 1',
  website: '',
  city: 'Milano',
  phone: '0612345678',
  contactName: 'Lucia',
  contactSurname: 'Bianchi',
  contactEmail: 'lucia.bianchi@mail.it',
  initiative: 'Iniziativa 2',
  adhesions: [{ date: '02/02/2026', initiativeName: 'Iniziativa 2' }],
};

const drawerInitiativeOptions = [
  { value: 'Iniziativa 1', label: 'Iniziativa 1' },
  { value: 'Iniziativa 2', label: 'Iniziativa 2' },
];

describe('PosCatalogFiltersDrawer', () => {
  it('renders filters and propagates apply/reset actions', () => {
    const onFiltersApplied = jest.fn();
    const onFiltersReset = jest.fn();

    render(
      <TestFilters
        initialValues={{
          initiative: 'Iniziativa 1',
          type: 'ONLINE',
          city: 'Roma',
          address: 'Via Demo',
          contactName: 'Mario',
          sort: 'asc',
        }}
        onFiltersApplied={onFiltersApplied}
        onFiltersReset={onFiltersReset}
      />
    );

    expect(screen.getByLabelText('Iniziativa')).toBeInTheDocument();
    expect(screen.getByLabelText('pages.initiativeStores.pointOfSaleType')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Roma')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Via Demo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Mario')).toBeInTheDocument();

    fireEvent.click(screen.getByText('apply-filters'));
    fireEvent.click(screen.getByText('reset-filters'));

    expect(onFiltersApplied).toHaveBeenCalledWith(
      expect.objectContaining({
        initiative: 'Iniziativa 1',
        type: 'ONLINE',
        city: 'Roma',
        address: 'Via Demo',
        contactName: 'Mario',
      })
    );
    expect(onFiltersReset).toHaveBeenCalledTimes(1);
  });

  it('renders the closed drawer as empty', () => {
    const { container } = render(
      <PosCatalogDrawer
        isOpen={false}
        onClose={jest.fn()}
        selectedStore={null}
        initiativeOptions={drawerInitiativeOptions}
        merchantId="merchant-123"
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders online store details with website link', () => {
    render(
      <PosCatalogDrawer
        isOpen
        onClose={jest.fn()}
        selectedStore={onlineStore}
        initiativeOptions={drawerInitiativeOptions}
        merchantId="merchant-123"
      />
    );

    expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();
    expect(screen.getByText('Negozio online')).toBeInTheDocument();
    expect(screen.getByText('pages.posCatalog.drawer.associatedTo')).toBeInTheDocument();
    expect(screen.getByText('pages.posCatalog.drawer.storeData')).toBeInTheDocument();
    expect(screen.getByText('pages.posCatalog.drawer.referentData')).toBeInTheDocument();
    expect(screen.getByText('pages.posCatalog.drawer.website')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'www.shop.it' })).toHaveAttribute(
      'href',
      'https://www.shop.it'
    );
    expect(screen.queryByText('Telefono')).not.toBeInTheDocument();
  });

  it('renders physical store details with phone and placeholders', () => {
    render(
      <PosCatalogDrawer
        isOpen
        onClose={jest.fn()}
        selectedStore={physicalStore}
        initiativeOptions={drawerInitiativeOptions}
        merchantId="merchant-123"
      />
    );

    expect(screen.getByText('Negozio fisico')).toBeInTheDocument();
    expect(screen.getByText('pages.posCatalog.drawer.address')).toBeInTheDocument();
    expect(screen.getByText('Via Roma 1')).toBeInTheDocument();
    expect(screen.getByText('pages.posCatalog.drawer.phone')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
