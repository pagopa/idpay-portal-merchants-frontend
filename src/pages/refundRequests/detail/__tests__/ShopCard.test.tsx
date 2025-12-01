import { render, screen, waitFor } from '@testing-library/react';
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

    render(
      <ShopCard
        batchName="Batch 1"
        dateRange="01/01/2024 - 31/01/2024"
        companyName="ACME srl"
        refundAmount="100,00 €"
        approvedRefund="80,00 €"
        status="APPROVED"
      />
    );

    expect(mockedGetMerchantDetail).toHaveBeenCalledWith('68dd003ccce8c534d1da22bc');

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

    await waitFor(() => {
      expect(
        screen.getByText('IT60X0542811101000000123456')
      ).toBeInTheDocument();
      expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
    });

    expect(mockedGetStatus).not.toHaveBeenCalledWith('APPROVED');
    expect(screen.getByTestId('status-chip')).toHaveTextContent('Validata-success');
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

    render(
      <ShopCard
        batchName=""
        dateRange=""
        companyName="ACME srl"
        refundAmount=""
        approvedRefund=""
        status="PENDING"
      />
    );

    expect(mockedGetMerchantDetail).toHaveBeenCalled();

    const placeholders = await screen.findAllByText(MISSING_DATA_PLACEHOLDER);
    expect(placeholders.length).toBeGreaterThanOrEqual(1);
  });
});
