import { render } from '@testing-library/react';
import { ENV } from '../../utils/env';
import ModifyDocument from './ModifyDocument';

const mockUseLocation = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockUseLocation(),
}));

jest.mock('../../services/merchantService', () => ({
  updateInvoiceTransaction: jest.fn(),
}));

const mockFileUploadAction = jest.fn();

jest.mock('../FileUploadAction/FileUploadAction', () => (props: any) => {
  mockFileUploadAction(props);
  return <div data-testid="file-upload-action" />;
});

describe('ModifyDocument page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes correct props when coming from refund requests (default case)', () => {
    mockUseLocation.mockReturnValue({
      state: undefined,
    });

    render(<ModifyDocument />);

    expect(mockFileUploadAction).toHaveBeenCalledWith(
      expect.objectContaining({
        apiCall: expect.any(Function),
        successStateKey: 'refundUploadSuccess',
        breadcrumbsLabel: 'Richieste di rimborso',
        manualLink: ENV.CONFIG.HEADER.OPERATION_MANUAL_LINK,
        i18nBlockKey: 'modifyDocument',
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
        apiCall: expect.any(Function),
        successStateKey: 'refundUploadSuccess',
        breadcrumbsLabel: 'Punti vendita',
        manualLink: ENV.CONFIG.HEADER.OPERATION_MANUAL_LINK,
        i18nBlockKey: 'modifyDocument',
      })
    );
  });
});
