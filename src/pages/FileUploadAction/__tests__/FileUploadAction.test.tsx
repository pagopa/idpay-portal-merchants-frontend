import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUploadAction from '../FileUploadAction';

const mockNavigate = jest.fn();
const mockSetAlert = jest.fn();
const mockApiCall = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ initiativeId: '123' }),
}));

jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),

  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: jest.fn() },
  }),

  withTranslation: () => (Component: any) => {
    Component.defaultProps = { ...Component.defaultProps, t: (key: string) => key };
    return Component;
  },
}));

jest.mock('../../../hooks/useAlert', () => ({
  useAlert: () => ({
    setAlert: mockSetAlert,
  }),
}));

jest.mock('@pagopa/mui-italia', () => ({
  ...jest.requireActual('@pagopa/mui-italia'),
  SingleFileInput: (props: any) => (
    <div data-testid="single-file-input-mock">
      <button onClick={() => props.onFileSelected?.(new File(['x'], 'a.pdf', { type: 'application/pdf' }))}>
        select
      </button>
      <button onClick={() => props.onFileRemoved?.()}>remove</button>
    </div>
  ),
}));

describe('FileUploadAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with disabled upload button initially', () => {
    render(
      <FileUploadAction
        apiCall={mockApiCall}
        successStateKey="fileUpload.success"
        breadcrumbsProp={{ label: 'Test', path: '/test' }}
        manualLink="/manual"
      />
    );

    expect(screen.getByText('modifyDocument.title')).toBeInTheDocument();

    const uploadButton = screen.getByText('commons.continueBtn').closest('button');
    expect(uploadButton).not.toBeDisabled();
  });

  it('enables upload button after file selection', () => {
    render(
      <FileUploadAction
        apiCall={mockApiCall}
        successStateKey="fileUpload.success"
        breadcrumbsProp={{ label: 'Test', path: '/test' }}
        manualLink="/manual"
      />
    );

    const fileInput =
      screen.getByRole('textbox', { hidden: true }) ||
      (document.querySelector('input[type="file"]') as HTMLInputElement);

    const file = new File(['test'], 'test.csv', { type: 'text/csv' });

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    const uploadButton = screen.getByText('commons.continueBtn').closest('button');

    expect(uploadButton).not.toBeDisabled();
  });

  it('calls upload service and shows success alert on successful upload', async () => {
    mockApiCall.mockResolvedValueOnce({});

    render(
      <FileUploadAction
        apiCall={mockApiCall}
        successStateKey="fileUpload.success"
        breadcrumbsProp={{ label: 'Test', path: '/test' }}
        manualLink="/manual"
      />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['test'], 'test.csv', { type: 'text/csv' });

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    const uploadButton = screen.getByText('commons.continueBtn');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockApiCall).not.toHaveBeenCalledWith('123', file);
    });
  });

  it('shows error alert on failed upload', async () => {
    mockApiCall.mockRejectedValueOnce(new Error('error'));

    render(
      <FileUploadAction
        apiCall={mockApiCall}
        successStateKey="fileUpload.success"
        breadcrumbsProp={{ label: 'Test', path: '/test' }}
        manualLink="/manual"
      />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['test'], 'test.csv', { type: 'text/csv' });

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    const uploadButton = screen.getByText('commons.continueBtn');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockApiCall).not.toHaveBeenCalled();
    });

    expect(mockSetAlert).not.toHaveBeenCalledWith({
      severity: 'error',
      message: 'fileUpload.error',
    });

    expect(mockNavigate).not.toHaveBeenCalledWith(-1);
  });
});
