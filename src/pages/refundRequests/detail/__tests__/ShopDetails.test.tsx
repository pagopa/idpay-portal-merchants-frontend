import { render, screen } from '@testing-library/react';
import ShopDetails from '../ShopDetails';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
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

jest.mock('react-redux', () => ({
  useSelector: () => [],
}));

jest.mock('../../../services/merchantService', () => ({
  getAllRewardBatches: jest.fn().mockResolvedValue({ content: [] }),
  getMerchantPointOfSalesWithTransactions: jest.fn().mockResolvedValue([]),
  downloadBatchCsv: jest.fn(),
}));

jest.mock('../../../hooks/useAlert', () => ({
  useAlert: () => ({
    setAlert: jest.fn(),
  }),
}));

jest.mock('../ShopCard', () => ({
  ShopCard: () => <div data-testid="shop-card-mock" />,
}));

jest.mock('../invoiceDataTable', () => () => <div data-testid="invoice-data-table-mock" />);

jest.mock('../../initiativeDiscounts/FiltersForm', () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));

describe('ShopDetails page', () => {
  it('renders back button and title', async () => {
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
