import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExportFiltersCard from '../ExportFiltersCard';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../../../services/merchantService', () => ({
  generateMerchantReport: jest.fn(),
}));

import { generateMerchantReport } from '../../../services/merchantService';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'test-id' }),
}));

jest.mock('formik', () => ({
  useFormik: (config: any) => {
    const mockDay = {
      startOf: () => ({ toDate: () => new Date() }),
      endOf: () => ({ toDate: () => new Date() }),
      add: () => mockDay,
      diff: () => 2,
    };

    return {
      values: {
        startDate: mockDay,
        endDate: mockDay,
      },
      touched: {},
      errors: {},
      setFieldValue: jest.fn(),
      handleSubmit: () =>
        config.onSubmit({
          startDate: mockDay,
          endDate: mockDay,
        }),
    };
  },
}));

const mockedGenerate = generateMerchantReport as jest.Mock;

const renderComponent = (updateAlerts = jest.fn()) =>
  render(
    <BrowserRouter>
      <ExportFiltersCard updateAlerts={updateAlerts} />
    </BrowserRouter>
  );

describe('ExportFiltersCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  const clickSubmit = () => {
    const submitButton = screen.getByText('pages.reportExport.form.submit');
    fireEvent.click(submitButton);
  };

  it('renders correctly', () => {
    renderComponent();
    expect(
      screen.getByText('pages.reportExport.form.submit')
    ).toBeInTheDocument();
  });

  it('handles INSERTED status', async () => {
    mockedGenerate.mockResolvedValue({ reportStatus: 'INSERTED' });
    const updateAlerts = jest.fn();

    renderComponent(updateAlerts);
    clickSubmit();

    await waitFor(() =>
      expect(updateAlerts).toHaveBeenCalledWith('inserted', true)
    );

    jest.runAllTimers();
    expect(updateAlerts).toHaveBeenCalledWith('inserted', false);
  });

  it('handles GENERATED status', async () => {
    mockedGenerate.mockResolvedValue({ reportStatus: 'GENERATED' });
    const updateAlerts = jest.fn();

    renderComponent(updateAlerts);
    clickSubmit();

    await waitFor(() =>
      expect(updateAlerts).toHaveBeenCalledWith('generated', true)
    );

    jest.runAllTimers();
    expect(updateAlerts).toHaveBeenCalledWith('generated', false);
  });

  it('handles FAILED status', async () => {
    mockedGenerate.mockResolvedValue({ reportStatus: 'FAILED' });
    const updateAlerts = jest.fn();

    renderComponent(updateAlerts);
    clickSubmit();

    await waitFor(() =>
      expect(updateAlerts).toHaveBeenCalledWith('failed', true)
    );

    jest.runAllTimers();
    expect(updateAlerts).toHaveBeenCalledWith('failed', false);
  });

  it('handles API error', async () => {
    mockedGenerate.mockRejectedValue(new Error('error'));
    const updateAlerts = jest.fn();

    renderComponent(updateAlerts);
    clickSubmit();

    await waitFor(() =>
      expect(updateAlerts).toHaveBeenCalledWith('failed', true)
    );

    jest.runAllTimers();
    expect(updateAlerts).toHaveBeenCalledWith('failed', false);
  });

  it('does nothing if id is missing', async () => {
    const reactRouter = require('react-router-dom');
    jest
      .spyOn(reactRouter, 'useParams')
      .mockReturnValue({ id: undefined });

    const updateAlerts = jest.fn();

    render(
      <BrowserRouter>
        <ExportFiltersCard updateAlerts={updateAlerts} />
      </BrowserRouter>
    );

    clickSubmit();

    expect(mockedGenerate).not.toHaveBeenCalled();
  });

  it('calls onReportGenerated in finally block', async () => {
    mockedGenerate.mockResolvedValue({ reportStatus: 'INSERTED' });

    const updateAlerts = jest.fn();
    const onReportGenerated = jest.fn();

    render(
      <BrowserRouter>
        <ExportFiltersCard
          updateAlerts={updateAlerts}
          onReportGenerated={onReportGenerated}
        />
      </BrowserRouter>
    );

    clickSubmit();

    await waitFor(() =>
      expect(updateAlerts).toHaveBeenCalledWith('inserted', true)
    );

    expect(onReportGenerated).toHaveBeenCalled();
  });
});
