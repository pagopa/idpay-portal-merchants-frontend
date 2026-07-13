import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useFormik } from 'formik';
import { GetPointOfSalesFilters } from '../../../types/types';
import { PosCatalogDrawer, PosCatalogFilters } from '../PosCatalogFiltersDrawer';
import { MockPosCatalogStore } from '../mockPosCatalog';
import {
  associatePos,
  excludePos,
  getPointOfSaleInitiatives,
} from '../../../services/merchantService';

const mockSetAlert = jest.fn();

jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../../services/merchantService', () => ({
  getPointOfSaleInitiatives: jest.fn(),
  associatePos: jest.fn(),
  excludePos: jest.fn(),
}));

jest.mock('../../../hooks/useAlert', () => ({
  useAlert: () => ({
    setAlert: mockSetAlert,
  }),
}));

jest.mock('../../../components/Drawer/DetailDrawer', () => ({
  __esModule: true,
  default: ({
    isOpen,
    title,
    children,
    buttons,
  }: {
    isOpen: boolean;
    title: string;
    children: React.ReactNode;
    buttons?: Array<any>;
  }) =>
    isOpen ? (
      <div data-testid="detail-drawer">
        <div>{title}</div>
        {children}
        {buttons?.map((button, index) => (
          <button
            key={`${button.title}-${index}`}
            data-testid={button.dataTestId}
            onClick={button.onClick}
          >
            {button.title}
          </button>
        ))}
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
        publishedInitiativeOptions={drawerInitiativeOptions}
        merchantId="merchant-123"
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders online store details with website link and fetched initiatives', async () => {
    (getPointOfSaleInitiatives as jest.Mock).mockResolvedValue([
      { initiativeId: 'Iniziativa 2', updatedAt: '2024-02-02T00:00:00Z' },
      { initiativeId: 'Iniziativa 1', updatedAt: '2024-01-01T00:00:00Z' },
    ]);

    render(
      <PosCatalogDrawer
        isOpen
        onClose={jest.fn()}
        selectedStore={onlineStore}
        initiativeOptions={drawerInitiativeOptions}
        publishedInitiativeOptions={drawerInitiativeOptions}
        merchantId="merchant-123"
      />
    );

    expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();
    expect(screen.getByText('Negozio online')).toBeInTheDocument();
    expect(screen.getByText('pages.posCatalog.drawer.associatedTo')).toBeInTheDocument();
    expect(screen.getByText('pages.posCatalog.drawer.storeData')).toBeInTheDocument();
    expect(screen.getByText('pages.posCatalog.drawer.referentData')).toBeInTheDocument();
    expect(screen.getByText('pages.posCatalog.drawer.website')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    expect(await screen.findByRole('link', { name: 'www.shop.it' })).toHaveAttribute(
      'href',
      'https://www.shop.it'
    );
    expect(await screen.findByText('Iniziativa 2')).toBeInTheDocument();
    expect(await screen.findByText('Iniziativa 1')).toBeInTheDocument();
    expect(getPointOfSaleInitiatives).toHaveBeenCalledWith('merchant-123', '1');
  });

  it('renders physical store details with phone and placeholders', () => {
    render(
      <PosCatalogDrawer
        isOpen
        onClose={jest.fn()}
        selectedStore={physicalStore}
        initiativeOptions={drawerInitiativeOptions}
        publishedInitiativeOptions={drawerInitiativeOptions}
        merchantId="merchant-123"
      />
    );

    expect(screen.getByText('Negozio fisico')).toBeInTheDocument();
    expect(screen.getByText('pages.posCatalog.drawer.address')).toBeInTheDocument();
    expect(screen.getByText('Via Roma 1 - Milano')).toBeInTheDocument();
    expect(screen.getByText('pages.posCatalog.drawer.phone')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('associates the selected store to an initiative from the drawer modal', async () => {
    (associatePos as jest.Mock).mockResolvedValue({
      associated: [{ pointOfSaleId: '2', franchiseName: 'Negozio fisico' }],
      notAssociated: [],
    });

    render(
      <PosCatalogDrawer
        isOpen
        onClose={jest.fn()}
        selectedStore={physicalStore}
        initiativeOptions={drawerInitiativeOptions}
        publishedInitiativeOptions={drawerInitiativeOptions}
        merchantId="merchant-123"
      />
    );

    expect(screen.getByTestId('exclude-store-button')).toHaveTextContent(
      'pages.posCatalog.actions.exclude'
    );
    fireEvent.click(screen.getByTestId('associate-store-button'));

    expect(screen.getByTestId('associate-selected-pos-modal')).toBeInTheDocument();

    fireEvent.mouseDown(
      screen.getByRole('combobox', {
        name: /pages.posCatalog.associateModal.initiativeLabel/,
      })
    );
    fireEvent.click(screen.getByText('Iniziativa 1'));
    fireEvent.click(screen.getByText('actions.confirm'));

    await waitFor(() => {
      expect(associatePos).toHaveBeenCalledWith('Iniziativa 1', 'merchant-123', ['2']);
    });
    expect(mockSetAlert).toHaveBeenCalledWith({
      text: 'pages.posCatalog.associateSuccess',
      isOpen: true,
      severity: 'success',
      timeout: 6000,
    });
  });

  it('excludes the selected store from an initiative from the drawer modal', async () => {
    (excludePos as jest.Mock).mockResolvedValue({
      excludedPointOfSales: [{ pointOfSaleId: '2', franchiseName: 'Negozio fisico' }],
      notExcludedPointOfSales: [],
    });

    const onClose = jest.fn();

    render(
      <PosCatalogDrawer
        isOpen
        onClose={onClose}
        selectedStore={physicalStore}
        initiativeOptions={drawerInitiativeOptions}
        publishedInitiativeOptions={drawerInitiativeOptions}
        merchantId="merchant-123"
      />
    );

    fireEvent.click(screen.getByTestId('exclude-store-button'));

    const modal = screen.getByTestId('exclude-selected-pos-modal');
    expect(modal).toBeInTheDocument();

    fireEvent.mouseDown(
      screen.getByRole('combobox', {
        name: /pages.posCatalog.excludeModal.initiativeLabel/,
      })
    );
    fireEvent.click(screen.getByText('Iniziativa 1'));
    fireEvent.click(within(modal).getByText('pages.posCatalog.actions.exclude'));

    await waitFor(() => {
      expect(excludePos).toHaveBeenCalledWith('Iniziativa 1', 'merchant-123', ['2']);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockSetAlert).toHaveBeenCalledWith({
      text: 'pages.posCatalog.excludeSuccess',
      isOpen: true,
      severity: 'success',
      timeout: 6000,
    });
  });

  it('does not show a success alert when the drawer exclusion excludes no store', async () => {
    (excludePos as jest.Mock).mockResolvedValue({
      excludedPointOfSales: [],
      notExcludedPointOfSales: [{ pointOfSaleId: '2', reason: 'ALREADY_EXCLUDED' }],
    });

    render(
      <PosCatalogDrawer
        isOpen
        onClose={jest.fn()}
        selectedStore={physicalStore}
        initiativeOptions={drawerInitiativeOptions}
        publishedInitiativeOptions={drawerInitiativeOptions}
        merchantId="merchant-123"
      />
    );

    fireEvent.click(screen.getByTestId('exclude-store-button'));
    fireEvent.mouseDown(
      screen.getByRole('combobox', {
        name: /pages.posCatalog.excludeModal.initiativeLabel/,
      })
    );
    fireEvent.click(screen.getByText('Iniziativa 1'));
    fireEvent.click(
      within(screen.getByTestId('exclude-selected-pos-modal')).getByText(
        'pages.posCatalog.actions.exclude'
      )
    );

    await waitFor(() => {
      expect(excludePos).toHaveBeenCalledWith('Iniziativa 1', 'merchant-123', ['2']);
    });
    expect(mockSetAlert).not.toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'pages.posCatalog.excludeSuccess',
        severity: 'success',
      })
    );
  });

  it('renders fallback initiative id and placeholders when fetched data is incomplete', async () => {
    (getPointOfSaleInitiatives as jest.Mock).mockResolvedValue([
      { initiativeId: 'UNKNOWN_ID', updatedAt: undefined },
      { initiativeId: undefined, updatedAt: '2024-03-03T00:00:00Z' },
    ]);

    render(
      <PosCatalogDrawer
        isOpen
        onClose={jest.fn()}
        selectedStore={{
          ...onlineStore,
          website: '',
          id: '3',
          contactName: '',
          contactSurname: '',
          contactEmail: '',
        }}
        initiativeOptions={drawerInitiativeOptions}
        publishedInitiativeOptions={drawerInitiativeOptions}
        merchantId="merchant-123"
      />
    );

    expect(await screen.findByText('UNKNOWN_ID')).toBeInTheDocument();
    expect((await screen.findAllByText('-')).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: '-' })).toHaveAttribute('href', 'https://');
  });

  it('handles initiative fetch errors by hiding the association section', async () => {
    (getPointOfSaleInitiatives as jest.Mock).mockRejectedValue(new Error('boom'));

    render(
      <PosCatalogDrawer
        isOpen
        onClose={jest.fn()}
        selectedStore={onlineStore}
        initiativeOptions={drawerInitiativeOptions}
        publishedInitiativeOptions={drawerInitiativeOptions}
        merchantId="merchant-123"
      />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await screen.findByText('pages.posCatalog.drawer.storeData');
    expect(screen.queryByText('pages.posCatalog.drawer.associatedTo')).not.toBeInTheDocument();
  });

  it('does not fetch initiatives when drawer is closed or merchant/store data is missing', () => {
    const { rerender } = render(
      <PosCatalogDrawer
        isOpen={false}
        onClose={jest.fn()}
        selectedStore={onlineStore}
        initiativeOptions={drawerInitiativeOptions}
        publishedInitiativeOptions={drawerInitiativeOptions}
        merchantId="merchant-123"
      />
    );

    rerender(
      <PosCatalogDrawer
        isOpen
        onClose={jest.fn()}
        selectedStore={{ ...onlineStore, id: undefined as any }}
        initiativeOptions={drawerInitiativeOptions}
        publishedInitiativeOptions={drawerInitiativeOptions}
        merchantId="merchant-123"
      />
    );

    rerender(
      <PosCatalogDrawer
        isOpen
        onClose={jest.fn()}
        selectedStore={onlineStore}
        initiativeOptions={drawerInitiativeOptions}
        publishedInitiativeOptions={drawerInitiativeOptions}
        merchantId=""
      />
    );

    expect(getPointOfSaleInitiatives).not.toHaveBeenCalled();
  });
});
