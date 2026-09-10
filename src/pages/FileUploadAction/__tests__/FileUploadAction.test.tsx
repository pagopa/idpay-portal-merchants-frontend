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

  it('decodes the document number from params and keeps it when transaction id is missing', async () => {
    mockUseParams.mockReturnValue({
      trxId: undefined,
      fileDocNumber: window.btoa('DOC-123'),
    });

    const { getByRole } = renderComponent();

    await waitFor(() => {
      expect(getByRole('textbox')).toHaveValue('DOC-123');
    });
  });

  it('falls back to the raw document number when params decoding fails', async () => {
    mockUseParams.mockReturnValue({
      trxId: undefined,
      fileDocNumber: '%%%not-base64%%%',
    });

    const { getByRole } = renderComponent();

    await waitFor(() => {
      expect(getByRole('textbox')).toHaveValue('%%%not-base64%%%');
    });
  });

  it('resets the document number when route params change and the encoded value is removed', async () => {
    mockUseParams.mockReturnValue({
      trxId: 'transaction-1',
      fileDocNumber: window.btoa('DOC-123'),
    });

    const { getByRole, rerender } = renderComponent();

    await waitFor(() => {
      expect(getByRole('textbox')).toHaveValue('DOC-123');
    });

    mockUseParams.mockReturnValue({
      trxId: 'transaction-2',
      fileDocNumber: undefined,
    });

    rerender(
      <FileUploadAction
        apiCall={jest.fn().mockResolvedValue(undefined)}
        successStateKey="success"
        breadcrumbsLabel="Breadcrumb"
        manualLink=""
        i18nBlockKey="modifyDocument"
      />
    );

    await waitFor(() => {
      expect(getByRole('textbox')).toHaveValue('');
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

  it('shows required and validation errors when continue is clicked without valid input', async () => {
    const { getByRole, getByText } = renderComponent();

    fireEvent.click(getByRole('button', { name: 'actions.continue' }));

    await waitFor(() => {
      expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith('LOAD_INVOICE_ERROR', {
        reason: 'FILE_REQUIRED',
      });
    });

    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith('LOAD_INVOICE_ERROR', {
      reason: 'DOCUMENT_NUMBER_INVALID',
    });
    expect(getByText('modifyDocument.errors.requiredFileError')).toBeInTheDocument();
    expect(getByText('validation.required')).toBeInTheDocument();
  });

  it('shows the minimum length validation message on blur for short document numbers', async () => {
    const { getByRole, getByText } = renderComponent();

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'A' },
    });
    fireEvent.blur(getByRole('textbox'));

    await waitFor(() => {
      expect(getByText('Lunghezza minima 2 caratteri')).toBeInTheDocument();
    });
  });

  it('does not update the document number when the input exceeds 100 characters', () => {
    const { getByRole } = renderComponent();
    const textbox = getByRole('textbox');

    fireEvent.change(textbox, {
      target: { value: 'DOC-123' },
    });
    fireEvent.change(textbox, {
      target: { value: 'A'.repeat(101) },
    });

    expect(textbox).toHaveValue('DOC-123');
  });

  it('clears the validation message on blur when the document number is valid', async () => {
    const { getByRole, getByText, queryByText } = renderComponent();
    const textbox = getByRole('textbox');

    fireEvent.change(textbox, {
      target: { value: 'A' },
    });
    fireEvent.blur(textbox);

    await waitFor(() => {
      expect(getByText('Lunghezza minima 2 caratteri')).toBeInTheDocument();
    });

    fireEvent.change(textbox, {
      target: { value: 'DOC-123' },
    });
    fireEvent.blur(textbox);

    await waitFor(() => {
      expect(queryByText('Lunghezza minima 2 caratteri')).not.toBeInTheDocument();
    });
  });

  it('navigates back when the back button is clicked', () => {
    const { getByRole } = renderComponent();

    fireEvent.click(getByRole('button', { name: 'actions.back' }));

    expect(historyMock.goBack).toHaveBeenCalledTimes(1);
  });

  it('opens the manual link in a new tab', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    const { getByText } = render(
      <FileUploadAction
        apiCall={jest.fn().mockResolvedValue(undefined)}
        successStateKey="success"
        breadcrumbsLabel="Breadcrumb"
        manualLink="https://example.test/manual"
        i18nBlockKey="modifyDocument"
      />
    );

    fireEvent.click(getByText('modifyDocument.manualLink'));

    expect(openSpy).toHaveBeenCalledWith('https://example.test/manual', '_blank');
    openSpy.mockRestore();
  });

  it('opens an empty manual link fallback when no manual url is provided', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    const { getByText } = renderComponent();

    fireEvent.click(getByText('modifyDocument.manualLink'));

    expect(openSpy).toHaveBeenCalledWith('', '_blank');
    openSpy.mockRestore();
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

  it('shows the already sent alert when the API rejects the upload with the already sent code', async () => {
    const apiCall = jest.fn().mockResolvedValue({
      code: 'REWARD_BATCH_ALREADY_SENT',
    });
    const { getByTestId, getByRole } = renderComponent(apiCall);

    fireEvent.click(getByTestId('select-valid-file'));
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'DOC-123' },
    });
    fireEvent.click(getByRole('button', { name: 'actions.continue' }));

    await waitFor(() =>
      expect(setAlertMock).toHaveBeenCalledWith({
        text: 'modifyDocument.errors.alreadySentError',
        isOpen: true,
        severity: 'error',
      })
    );
  });

  it('does not show a specific alert when the API returns an unknown error code', async () => {
    const apiCall = jest.fn().mockResolvedValue({
      code: 'UNKNOWN_CODE',
    });
    const { getByTestId, getByRole } = renderComponent(apiCall);

    fireEvent.click(getByTestId('select-valid-file'));
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'DOC-123' },
    });
    fireEvent.click(getByRole('button', { name: 'actions.continue' }));

    await waitFor(() => {
      expect(apiCall).toHaveBeenCalled();
    });

    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith('LOAD_INVOICE_ERROR', {
      reason: 'UNKNOWN_CODE',
    });
    expect(setAlertMock).not.toHaveBeenCalled();
    expect(historyMock.goBack).not.toHaveBeenCalled();
  });

  it('does not call the api when the transaction id is missing even if file and document are provided', async () => {
    const apiCall = jest.fn().mockResolvedValue(undefined);
    mockUseParams.mockReturnValue({
      trxId: undefined,
      fileDocNumber: undefined,
    });

    const { getByRole, getByTestId } = renderComponent(apiCall);

    fireEvent.click(getByTestId('select-valid-file'));
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'DOC-123' },
    });
    fireEvent.click(getByRole('button', { name: 'actions.continue' }));

    await waitFor(() => {
      expect(apiCall).not.toHaveBeenCalled();
    });
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

  it('stores the success state even when the current history state is missing', async () => {
    historyMock.location = {
      pathname: '/upload',
    };

    const apiCall = jest.fn().mockResolvedValue(undefined);
    const { getByTestId, getByRole } = renderComponent(apiCall);

    fireEvent.click(getByTestId('select-valid-file'));
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'DOC-123' },
    });
    fireEvent.click(getByRole('button', { name: 'actions.continue' }));

    await waitFor(() => {
      expect(historyMock.replace).toHaveBeenCalledWith({
        pathname: '/upload',
        state: {
          refundUploadSuccess: true,
        },
      });
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

  it('opens the hidden file input from the replace button and handles direct file selection', async () => {
    const { container, getByRole, getByTestId } = renderComponent();

    fireEvent.click(getByTestId('select-valid-file'));

    const replaceButton = getByRole('button', { name: 'modifyDocument.replaceFile' });
    const hiddenInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = jest.spyOn(hiddenInput, 'click');

    fireEvent.click(replaceButton);

    expect(clickSpy).toHaveBeenCalledTimes(1);

    const uploadedFile = new File(['xml-content'], 'invoice.xml', { type: 'application/xml' });

    fireEvent.change(hiddenInput, {
      target: { files: [uploadedFile] },
    });

    await waitFor(() => {
      expect(getByTestId('file-value')).toHaveTextContent('invoice.xml');
    });

    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith('LOAD_INVOICE_START');
    expect(container.querySelector('input[type="file"]')).not.toBe(hiddenInput);
  });

  it('resets the hidden file input value when the file is removed', () => {
    const { container, getByTestId } = renderComponent();
    const hiddenInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(hiddenInput, 'value', {
      configurable: true,
      writable: true,
      value: 'C:\\fakepath\\invoice.pdf',
    });

    fireEvent.click(getByTestId('select-valid-file'));
    fireEvent.click(getByTestId('remove-file'));

    expect(hiddenInput.value).toBe('');
  });

  it('recreates the hidden input even when no file is selected from it', async () => {
    const { container } = renderComponent();
    const hiddenInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(hiddenInput, {
      target: { files: [] },
    });

    await waitFor(() => {
      expect(container.querySelector('input[type="file"]')).not.toBe(hiddenInput);
    });
  });
});
