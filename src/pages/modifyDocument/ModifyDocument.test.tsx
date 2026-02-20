import { render } from '@testing-library/react';
import * as merchantService from '../../services/merchantService';
import ROUTES from '../../routes';
import { ENV } from '../../utils/env';
import ModifyDocument from './ModifyDocument';

const mockUseLocation = vi.fn();

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useLocation: () => mockUseLocation(),
}));

vi.mock('../../services/merchantService', () => ({
  updateInvoiceTransaction: vi.fn(),
}));

const mockFileUploadAction = vi.fn();

vi.mock('../FileUploadAction/FileUploadAction', () => (props: any) => {
  mockFileUploadAction(props);
  return <div data-testid="file-upload-action" />;
});

describe('ModifyDocument page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes correct props when coming from refund requests (default case)', () => {
    mockUseLocation.mockReturnValue({
      state: undefined,
    });

    render(<ModifyDocument />);

    expect(mockFileUploadAction).toHaveBeenCalledWith(
      expect.objectContaining({
        apiCall: merchantService.updateInvoiceTransaction,
        successStateKey: 'refundUploadSuccess',
        breadcrumbsProp: {
          label: 'Richieste di rimborso',
          path: ROUTES.REFUND_REQUESTS,
        },
        manualLink: ENV.CONFIG.HEADER.OPERATION_MANUAL_LINK,
      })
    );
  });

  it('passes correct props when coming from stores', () => {
    mockUseLocation.mockReturnValue({
      state: { fromLocation: true },
    });

    render(<ModifyDocument />);

    expect(mockFileUploadAction).toHaveBeenCalledWith(
      expect.objectContaining({
        apiCall: merchantService.updateInvoiceTransaction,
        successStateKey: 'refundUploadSuccess',
        breadcrumbsProp: {
          label: 'Punti vendita',
          path: ROUTES.STORES,
        },
        manualLink: ENV.CONFIG.HEADER.OPERATION_MANUAL_LINK,
      })
    );
  });
});
