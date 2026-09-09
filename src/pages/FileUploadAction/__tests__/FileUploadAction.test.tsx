// @ts-nocheck
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { useHistory, useParams } from 'react-router-dom';
import FileUploadAction from '../FileUploadAction';
import { useAlert } from '../../../hooks/useAlert';
import { useScopedTranslation } from '../../../hooks/useScopedTranslation';
import { useCurrentInitiativeId } from '../../../hooks/useCurrentInitiativeId';
import { trackAnalyticsEvent } from '../../../services/analyticsService';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('../../../hooks/useAlert', () => ({
  useAlert: jest.fn(),
}));

jest.mock('../../../hooks/useScopedTranslation', () => ({
  useScopedTranslation: jest.fn(),
}));

jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: jest.fn(),
}));

jest.mock('../../../services/analyticsService', () => ({
  MIXPANEL_EVENTS: {
    LOAD_INVOICE_START: 'LOAD_INVOICE_START',
    LOAD_INVOICE_ERROR: 'LOAD_INVOICE_ERROR',
    LOAD_INVOICE_SUCCESS: 'LOAD_INVOICE_SUCCESS',
  },
  trackAnalyticsEvent: jest.fn(),
}));

jest.mock('../../components/BreadcrumbsBoxUpload', () => () => <div />);
jest.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  TitleBox: () => <div />,
}));

jest.mock('@pagopa/mui-italia', () => ({
  theme: {
    palette: { background: { paper: '#fff' } },
    typography: { fontWeightBold: 700, fontWeightMedium: 500 },
  },
  SingleFileInput: ({ onFileSelected, onFileRemoved, value, loading }) => (
    <div>
      <button
        data-testid="select-valid-file"
        onClick={() => onFileSelected(new File(['content'], 'invoice.pdf', { type: 'application/pdf' }))}
      >
        select valid file
      </button>
      <button
        data-testid="select-invalid-file"
        onClick={() => onFileSelected(new File(['content'], 'invoice.txt', { type: 'text/plain' }))}
      >
        select invalid file
      </button>
      <button
        data-testid="select-large-file"
        onClick={() =>
          onFileSelected(
            new File([new ArrayBuffer(20 * 1024 * 1024 + 1)], 'invoice.pdf', {
              type: 'application/pdf',
            })
          )
        }
      >
        select large file
      </button>
      <button data-testid="remove-file" onClick={onFileRemoved}>
        remove file
      </button>
      <span data-testid="file-value">{value?.name || ''}</span>
      <span data-testid="loading">{String(loading)}</span>
    </div>
  ),
}));

const mockUseHistory = useHistory as jest.Mock;
const mockUseParams = useParams as jest.Mock;
const mockUseAlert = useAlert as jest.Mock;
const mockUseScopedTranslation = useScopedTranslation as jest.Mock;
const mockUseCurrentInitiativeId = useCurrentInitiativeId as jest.Mock;
const mockTrackAnalyticsEvent = trackAnalyticsEvent as jest.Mock;

describe('FileUploadAction', () => {
  let historyMock: {
    goBack: jest.Mock;
    replace: jest.Mock;
    location: { pathname: string; state?: object };
  };
  let setAlertMock: jest.Mock;

  const renderComponent = (apiCall = jest.fn().mockResolvedValue(undefined)) =>
    render(
      <FileUploadAction
        apiCall={apiCall}
        successStateKey="success"
        breadcrumbsLabel="Breadcrumb"
        manualLink=""
        i18nBlockKey="modifyDocument"
      />
    );

  beforeEach(() => {
    jest.clearAllMocks();

    historyMock = {
      goBack: jest.fn(),
      replace: jest.fn(),
      location: {
        pathname: '/upload',
        state: { existingState: true },
      },
    };
    setAlertMock = jest.fn();

    mockUseHistory.mockReturnValue(historyMock);
    mockUseParams.mockReturnValue({
      trxId: 'transaction-1',
      fileDocNumber: undefined,
    });
    mockUseAlert.mockReturnValue({ setAlert: setAlertMock });
    mockUseScopedTranslation.mockReturnValue({
      t: (key: string) => key,
      isLoading: false,
    });
    mockUseCurrentInitiativeId.mockReturnValue({
      initiativeId: 'initiative-1',
    });
  });

  it('tracks file selection errors and removes the selected file', () => {
    const { getByTestId } = renderComponent();

    fireEvent.click(getByTestId('select-invalid-file'));

    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith('LOAD_INVOICE_START');
    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith('LOAD_INVOICE_ERROR', {
      reason: 'UNSUPPORTED_FILE_TYPE',
    });
    expect(getByTestId('file-value')).toHaveTextContent('');

    fireEvent.click(getByTestId('select-valid-file'));

    expect(getByTestId('file-value')).toHaveTextContent('invoice.pdf');

    fireEvent.click(getByTestId('remove-file'));

    expect(getByTestId('file-value')).toHaveTextContent('');
  });

  it('tracks an error for files exceeding the maximum size', () => {
    const { getByTestId } = renderComponent();

    fireEvent.click(getByTestId('select-large-file'));

    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith('LOAD_INVOICE_ERROR', {
      reason: 'FILE_TOO_LARGE',
    });
  });

  it('shows the alert when the API rejects the upload with a known error code', async () => {
    const apiCall = jest.fn().mockResolvedValue({
      code: 'REWARD_BATCH_STATUS_NOT_ALLOWED',
    });
    const { getByTestId, getByRole } = renderComponent(apiCall);

    fireEvent.click(getByTestId('select-valid-file'));
    fireEvent.change(getByRole('textbox'), {
      target: { value: '  DOC-123  ' },
    });
    fireEvent.click(getByRole('button', { name: 'actions.continue' }));

    await waitFor(() => expect(apiCall).toHaveBeenCalledWith(
      'initiative-1',
      'transaction-1',
      expect.any(File),
      'DOC-123'
    ));

    expect(setAlertMock).toHaveBeenCalledWith({
      text: 'modifyDocument.errors.deniedSentError',
      isOpen: true,
      severity: 'error',
    });
    expect(historyMock.goBack).not.toHaveBeenCalled();
  });

  it('navigates back and shows success after a successful upload', async () => {
    const apiCall = jest.fn().mockResolvedValue(undefined);
    const { getByTestId, getByRole } = renderComponent(apiCall);

    fireEvent.click(getByTestId('select-valid-file'));
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'DOC-123' },
    });
    fireEvent.click(getByRole('button', { name: 'actions.continue' }));

    await waitFor(() => expect(historyMock.goBack).toHaveBeenCalled());

    expect(historyMock.replace).toHaveBeenCalledWith({
      pathname: '/upload',
      state: {
        existingState: true,
        refundUploadSuccess: true,
      },
    });
    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith('LOAD_INVOICE_SUCCESS');
    expect(setAlertMock).toHaveBeenCalledWith({
      text: 'modifyDocument.refundSuccessUpload',
      isOpen: true,
      severity: 'success',
    });
  });

  it('shows an alert when the upload request fails', async () => {
    const apiCall = jest.fn().mockRejectedValue(new Error('request failed'));
    const { getByTestId, getByRole } = renderComponent(apiCall);

    fireEvent.click(getByTestId('select-valid-file'));
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'DOC-123' },
    });
    fireEvent.click(getByRole('button', { name: 'actions.continue' }));

    await waitFor(() =>
      expect(setAlertMock).toHaveBeenCalledWith({
        text: 'modifyDocument.errors.errorAlert',
        isOpen: true,
        severity: 'error',
      })
    );

    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith('LOAD_INVOICE_ERROR', {
      reason: 'REQUEST_FAILED',
    });
  });
});
