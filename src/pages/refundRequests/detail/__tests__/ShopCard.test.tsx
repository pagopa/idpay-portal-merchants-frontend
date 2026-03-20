import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ShopCard } from '../ShopCard';
import { MISSING_DATA_PLACEHOLDER } from '../../../../utils/constants';
import { getBatchStatus } from '../../../../components/Transactions/useStatus';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Tooltip: ({ title, children }: any) => (
      <div data-testid="tooltip" data-title={title}>
        {children}
      </div>
    ),
  };
});

jest.mock('../../../../components/Transactions/useStatus', () => ({
  __esModule: true,
  getBatchStatus: jest.fn(),
}));

jest.mock('../../../../components/Chip/CustomChip', () => ({
  __esModule: true,
  default: ({ label, colorChip }: { label: string; colorChip: string }) => (
    <div data-testid="status-chip">
      {label}-{colorChip}
    </div>
  ),
}));

const mockedGetStatus = getBatchStatus as jest.MockedFunction<typeof getBatchStatus>;

describe('ShopCard (presentational)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderizza correttamente i dati passati via props', () => {
    mockedGetStatus.mockReturnValue({
      label: 'APPROVED',
      color: 'success',
    } as any);

    const store = {
      batchName: 'Batch 1',
      dateRange: '01/01/2024 - 31/01/2024',
      companyName: 'ACME srl',
      refundAmount: 10000,
      approvedRefund: 8000,
      status: 'APPROVED',
      posType: '',
      suspendedAmountCents: 0,
    };

    render(<ShopCard store={store} iban="IT60X0542811101000000123456" ibanHolder="Mario Rossi" />);

    expect(screen.getByText('Batch 1')).toBeInTheDocument();
    expect(screen.getByText('ACME srl')).toBeInTheDocument();
    expect(screen.getByText('100,00 €')).toBeInTheDocument();
    expect(screen.getByText('80,00 €')).toBeInTheDocument();
    expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
    expect(screen.getByText('IT60X0542811101000000123456')).toBeInTheDocument();

    expect(mockedGetStatus).toHaveBeenLastCalledWith('APPROVED');
    expect(screen.getByTestId('status-chip')).toHaveTextContent('APPROVED-success');
  });

  it('mostra placeholder quando iban e holder non sono forniti', () => {
    mockedGetStatus.mockReturnValue({
      label: 'PENDING',
      color: 'warning',
    } as any);

    const store = {
      batchName: '',
      dateRange: '',
      companyName: 'ACME srl',
      refundAmount: 0,
      approvedRefund: 0,
      status: 'PENDING',
      posType: '',
      suspendedAmountCents: 0,
    };

    render(<ShopCard store={store} />);

    const placeholders = screen.getAllByText(MISSING_DATA_PLACEHOLDER);
    expect(placeholders.length).toBeGreaterThan(0);

    const holderLabel = screen.getByText('pages.refundRequests.storeDetails.holder');
    const holderRow = holderLabel.parentElement?.parentElement as HTMLElement;
    const holderTooltip = within(holderRow).getByTestId('tooltip');
    expect(holderTooltip).toHaveAttribute('data-title', MISSING_DATA_PLACEHOLDER);
  });
});
