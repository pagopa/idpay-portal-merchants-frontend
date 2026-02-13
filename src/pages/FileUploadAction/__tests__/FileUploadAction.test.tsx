import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUploadAction from '../FileUploadAction';

// Mocks
const mockNavigate = jest.fn();
const mockSetAlert = jest.fn();
const mockApiCall = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ initiativeId: '123' }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../../hooks/useAlert', () => ({
  useAlert: () => ({
    setAlert: mockSetAlert,
  }),
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

    expect(screen.getByText('fileUpload.title')).toBeInTheDocument();

    const uploadButton = screen.getByText('fileUpload.uploadButton').closest('button');
    expect(uploadButton).toBeDisabled();
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

    const uploadButton = screen.getByText('fileUpload.uploadButton').closest('button');

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

    const uploadButton = screen.getByText('fileUpload.uploadButton');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockApiCall).toHaveBeenCalledWith('123', file);
    });

    expect(mockSetAlert).toHaveBeenCalledWith({
      severity: 'success',
      message: 'fileUpload.success',
    });

    expect(mockNavigate).toHaveBeenCalledWith(-1);
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

    const uploadButton = screen.getByText('fileUpload.uploadButton');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockApiCall).toHaveBeenCalled();
    });

    expect(mockSetAlert).toHaveBeenCalledWith({
      severity: 'error',
      message: 'fileUpload.error',
    });

    expect(mockNavigate).not.toHaveBeenCalledWith(-1);
  });
});
