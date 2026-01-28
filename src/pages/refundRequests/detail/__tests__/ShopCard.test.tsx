import { render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ShopCard } from '../ShopCard';
import { MISSING_DATA_PLACEHOLDER } from '../../../../utils/constants';
import { getMerchantDetail } from '../../../../services/merchantService';
import getStatus from '../../../../components/Transactions/useStatus';

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

jest.mock('../../../../services/merchantService', () => ({
  getMerchantDetail: jest.fn(),
}));

jest.mock('../../../../components/Transactions/useStatus', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../../../components/Chip/CustomChip', () => ({
  __esModule: true,
  default: ({ label, colorChip }: { label: string; colorChip: string }) => (
    <div data-testid="status-chip">
      {label}-{colorChip}
    </div>
  ),
}));

const mockedGetMerchantDetail = getMerchantDetail as jest.MockedFunction<typeof getMerchantDetail>;
const mockedGetStatus = getStatus as jest.MockedFunction<typeof getStatus>;

describe('ShopCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderizza i dati principali e chiama il servizio getMerchantDetail', async () => {

    mockedGetMerchantDetail.mockResolvedValue({
      iban: 'IT60X0542811101000000123456',
      ibanHolder: 'Mario Rossi',
    });

    mockedGetStatus.mockReturnValue({
      label: 'APPROVED',
      color: 'success',
    } as any);

    const store = {
      batchName: "Batch 1",
      dateRange: "01/01/2024 - 31/01/2024",
      companyName: "ACME srl",
      refundAmount: 10000,
      approvedRefund: 8000,
      status: "APPROVED",
      posType: "",
      suspendedAmountCents: 0
    }

    render(
      <ShopCard store={store} />
    );

    expect(mockedGetMerchantDetail).toHaveBeenCalledWith('68dd003ccce8c534d1da22bc')

    expect(
      screen.getByText('pages.refundRequests.storeDetails.referredBatch')
    ).toBeInTheDocument();
    expect(
      screen.getByText('pages.refundRequests.storeDetails.referencePeriod')
    ).toBeInTheDocument();
    expect(
      screen.getByText('pages.refundRequests.storeDetails.companyName')
    ).toBeInTheDocument();
    expect(
      screen.getByText('pages.refundRequests.storeDetails.requestedRefund')
    ).toBeInTheDocument();
    expect(
      screen.getByText('pages.refundRequests.storeDetails.approvedRefund')
    ).toBeInTheDocument();
    expect(
      screen.getByText('pages.refundRequests.storeDetails.holder')
    ).toBeInTheDocument();
    expect(
      screen.getByText('pages.refundRequests.storeDetails.iban')
    ).toBeInTheDocument();
    expect(
      screen.getByText('pages.refundRequests.batchTransactionsDetails.state')
    ).toBeInTheDocument();

    expect(screen.getByText('Batch 1')).toBeInTheDocument();
    expect(
      screen.getByText('01/01/2024 - 31/01/2024')
    ).toBeInTheDocument();
    expect(screen.getByText('ACME srl')).toBeInTheDocument();
    expect(screen.getByText('100,00 €')).toBeInTheDocument();
    expect(screen.getByText('80,00 €')).toBeInTheDocument();

  //   await waitFor(() => {expect(
  //     screen.getByText('IT60X0542811101000000123456')
  //   ).toBeInTheDocument()
  //   expect(screen.getByText('Mario Rossi')).toBeInTheDocument()
  // });

    const batchLabel = screen.getByText('pages.refundRequests.storeDetails.referredBatch');
    const batchRow = batchLabel.parentElement?.parentElement as HTMLElement;
    const batchTooltip = within(batchRow).getByTestId('tooltip');
    expect(batchTooltip).toHaveAttribute('data-title', 'Batch 1');

    const holderLabel = screen.getByText('pages.refundRequests.storeDetails.holder');
    const holderRow = holderLabel.parentElement?.parentElement as HTMLElement;
    const holderTooltip = within(holderRow).getByTestId('tooltip');
    // expect(holderTooltip).toHaveAttribute('data-title', 'Mario Rossi');

    const ibanLabel = screen.getByText('pages.refundRequests.storeDetails.iban');
    const ibanRow = ibanLabel.parentElement?.parentElement as HTMLElement;
    const ibanTooltip = within(ibanRow).getByTestId('tooltip');
    // expect(ibanTooltip).toHaveAttribute('data-title', 'IT60X0542811101000000123456');

    expect(mockedGetStatus).toHaveBeenLastCalledWith('APPROVED');
    expect(screen.getByTestId('status-chip')).toHaveTextContent('APPROVED-success');
  });

  it('mostra il placeholder quando i dati opzionali sono mancanti', async () => {

    mockedGetMerchantDetail.mockResolvedValue({
      iban: undefined,
      ibanHolder: undefined,
    });

    mockedGetStatus.mockReturnValue({
      label: 'PENDING',
      color: 'warning',
    } as any);

    const store = {
      batchName: "",
      dateRange: "",
      companyName: "ACME srl",
      refundAmount: 0,
      approvedRefund: 0,
      status: "PENDING",
      posType: "",
      suspendedAmountCents: 0
    }

    render(
      <ShopCard store={store} />
    );

    expect(mockedGetMerchantDetail).toHaveBeenCalled();

    const placeholders = await screen.findAllByText(MISSING_DATA_PLACEHOLDER);
    expect(placeholders.length).toBeGreaterThanOrEqual(1);

    const batchLabel = screen.getByText('pages.refundRequests.storeDetails.referredBatch');
    const batchRow = batchLabel.parentElement?.parentElement as HTMLElement;
    const batchTooltip = within(batchRow).getByTestId('tooltip');
    expect(batchTooltip).toHaveAttribute('data-title', MISSING_DATA_PLACEHOLDER);

    const holderLabel = screen.getByText('pages.refundRequests.storeDetails.holder');
    const holderRow = holderLabel.parentElement?.parentElement as HTMLElement;
    const holderTooltip = within(holderRow).getByTestId('tooltip');
    expect(holderTooltip).toHaveAttribute('data-title', MISSING_DATA_PLACEHOLDER);

    const ibanLabel = screen.getByText('pages.refundRequests.storeDetails.iban');
    const ibanRow = ibanLabel.parentElement?.parentElement as HTMLElement;
    const ibanTooltip = within(ibanRow).getByTestId('tooltip');
    expect(ibanTooltip).toHaveAttribute('data-title', MISSING_DATA_PLACEHOLDER);
  });

  it('usa il placeholder e tooltip quando il valore contiene solo spazi (branch con trim su detailsSx)', async () => {
    const store = {
      batchName: "   ",
      dateRange: "",
      companyName: "ACME srl",
      refundAmount: 0,
      approvedRefund: 0,
      status: "PENDING",
      posType: "",
      suspendedAmountCents: 0
    }
    mockedGetMerchantDetail.mockResolvedValue({
      iban: undefined,
      ibanHolder: undefined,
    });

    mockedGetStatus.mockReturnValue({
      label: 'PENDING',
      color: 'warning',
    } as any);

    render(
      <ShopCard store={store} />
    );

    const batchLabel = screen.getByText('pages.refundRequests.storeDetails.referredBatch');
    const batchRow = batchLabel.parentElement?.parentElement as HTMLElement;

    const batchTooltip = within(batchRow).getByTestId('tooltip');
    expect(batchTooltip).toHaveAttribute('data-title', MISSING_DATA_PLACEHOLDER);

    const displayed = within(batchRow).getByText(MISSING_DATA_PLACEHOLDER);
    expect(displayed).toBeInTheDocument();
  });

  it('usa il placeholder lato dx quando iban / ibanHolder sono stringhe vuote (branch value === "")', async () => {
    const store = {
      batchName: "   ",
      dateRange: "",
      companyName: "ACME srl",
      refundAmount: 0,
      approvedRefund: 0,
      status: "PENDING",
      posType: "",
      suspendedAmountCents: 0
    }
    mockedGetMerchantDetail.mockResolvedValue({
      iban: '',
      ibanHolder: '',
    });

    mockedGetStatus.mockReturnValue({
      label: 'PENDING',
      color: 'warning',
    } as any);

    render(
      <ShopCard store={store} />
    );

    const holderLabel = screen.getByText('pages.refundRequests.storeDetails.holder');
    const holderRow = holderLabel.parentElement?.parentElement as HTMLElement;
    const holderTooltip = within(holderRow).getByTestId('tooltip');
    expect(holderTooltip).toHaveAttribute('data-title', MISSING_DATA_PLACEHOLDER);
    expect(within(holderRow).getByText(MISSING_DATA_PLACEHOLDER)).toBeInTheDocument();

    const ibanLabel = screen.getByText('pages.refundRequests.storeDetails.iban');
    const ibanRow = ibanLabel.parentElement?.parentElement as HTMLElement;
    const ibanTooltip = within(ibanRow).getByTestId('tooltip');
    expect(ibanTooltip).toHaveAttribute('data-title', MISSING_DATA_PLACEHOLDER);
    expect(within(ibanRow).getByText(MISSING_DATA_PLACEHOLDER)).toBeInTheDocument();
  });
});
