import { render, screen } from '@testing-library/react';

jest.mock('react-redux', () => ({
  __esModule: true,
  useSelector: jest.fn(() => []),
  useDispatch: jest.fn(() => jest.fn()),
  connect: () => (Component: any) => Component, // HOC noop
}));

jest.mock('@pagopa/selfcare-common-frontend', () => ({
  __esModule: true,
  TitleBox: ({ title }: any) => <div data-testid="titlebox-mock">{title}</div>,
}));

jest.mock('@pagopa/selfcare-common-frontend/utils/storage', () => ({
  __esModule: true,
  storageTokenOps: { read: jest.fn(() => 'fake.jwt') },
}));

jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => ({ t: (k: string) => k, i18n: { changeLanguage: jest.fn() } }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    goBack: jest.fn(),
    replace: jest.fn(),
    location: { state: {} },
  }),
  useLocation: () => ({
    state: {
      store: { id: '1', name: 'Batch 1' },
      batchId: 'batch-1',
    },
  }),
}));

jest.mock('../../../../services/merchantService', () => ({
  getAllRewardBatches: jest.fn().mockResolvedValue({ content: [] }),
  getMerchantPointOfSalesWithTransactions: jest.fn().mockResolvedValue([]),
  downloadBatchCsv: jest.fn(),
}));

jest.mock('../../../../hooks/useAlert', () => ({
  useAlert: () => ({ setAlert: jest.fn() }),
}));

jest.mock('../ShopCard', () => ({
  ShopCard: () => <div data-testid="shop-card-mock" />,
}));

jest.mock('../../invoiceDataTable', () => () => <div data-testid="invoice-data-table-mock" />);

jest.mock('../../../initiativeDiscounts/FiltersForm', () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));

describe('ShopDetails page', () => {
  const ShopDetails = require('../ShopDetails').default;

  it('renders back button and title', () => {
    render(<ShopDetails />);
    expect(screen.getByTestId('back-button-test')).toBeInTheDocument();
  });

  it('renders download csv button', () => {
    render(<ShopDetails />);
    expect(screen.getByTestId('download-csv-button-test')).toBeInTheDocument();
  });

  it('renders shop card and invoice table', () => {
    render(<ShopDetails />);
    expect(screen.getByTestId('shop-card-mock')).toBeInTheDocument();
    expect(screen.getByTestId('invoice-data-table-mock')).toBeInTheDocument();
  });
});