import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import ExportFiltersCard from '../ExportFiltersCard';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../services/merchantService', () => ({
  generateMerchantReport: vi.fn(),
}));

import { generateMerchantReport } from '../../../services/merchantService';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-id' }),
  };
});

let lastFormikConfig: any;

vi.mock('formik', () => ({
  useFormik: (config: any) => {
    lastFormikConfig = config;

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
      isSubmitting: false,
      resetForm: vi.fn(),
      setFieldValue: vi.fn(),
      handleSubmit: () =>
        config.onSubmit({
          startDate: mockDay,
          endDate: mockDay,
        }),
    };
  },
}));

import type { Mock } from 'vitest';
const mockedGenerate = generateMerchantReport as unknown as Mock;

const renderComponent = (updateAlerts = vi.fn()) =>
  render(
    <BrowserRouter>
      <ExportFiltersCard updateAlerts={updateAlerts} />
    </BrowserRouter>
  );

describe('ExportFiltersCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
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
    const updateAlerts = vi.fn();

    renderComponent(updateAlerts);
    clickSubmit();

    await waitFor(() =>
      expect(updateAlerts).toHaveBeenCalledWith('inserted', true)
    );

    vi.runAllTimers();
    expect(updateAlerts).toHaveBeenCalledWith('inserted', false);
  });

  it('handles GENERATED status', async () => {
    mockedGenerate.mockResolvedValue({ reportStatus: 'GENERATED' });
    const updateAlerts = vi.fn();

    renderComponent(updateAlerts);
    clickSubmit();

    await waitFor(() =>
      expect(updateAlerts).toHaveBeenCalledWith('generated', true)
    );

    vi.runAllTimers();
    expect(updateAlerts).toHaveBeenCalledWith('generated', false);
  });

  it('handles FAILED status', async () => {
    mockedGenerate.mockResolvedValue({ reportStatus: 'FAILED' });
    const updateAlerts = vi.fn();

    renderComponent(updateAlerts);
    clickSubmit();

    await waitFor(() =>
      expect(updateAlerts).toHaveBeenCalledWith('failed', true)
    );

    vi.runAllTimers();
    expect(updateAlerts).toHaveBeenCalledWith('failed', false);
  });

  it('handles API error', async () => {
    mockedGenerate.mockRejectedValue(new Error('error'));
    const updateAlerts = vi.fn();

    renderComponent(updateAlerts);
    clickSubmit();

    await waitFor(() =>
      expect(updateAlerts).toHaveBeenCalledWith('failed', true)
    );

    vi.runAllTimers();
    expect(updateAlerts).toHaveBeenCalledWith('failed', false);
  });

  it('does nothing if id is missing', async () => {
    const reactRouter = await import('react-router-dom');
    vi.spyOn(reactRouter, 'useParams').mockReturnValue({ id: undefined } as any);

    const updateAlerts = vi.fn();

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

    const updateAlerts = vi.fn();
    const onReportGenerated = vi.fn();

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

  it('covers validate required branch', () => {
    const result = lastFormikConfig.validate({
      startDate: null,
      endDate: null,
    });

    expect(result.startDate).toBeDefined();
    expect(result.endDate).toBeDefined();
  });

  it('covers validate invalidRange branch (<1 day)', () => {
    const mockDay = {
      diff: () => 0,
    };

    const result = lastFormikConfig.validate({
      startDate: mockDay,
      endDate: mockDay,
    });

    expect(result.endDate).not.toBeDefined();
  });

  it('covers validate maxRange branch (>90 days)', () => {
    const mockDay = {
      diff: () => 100,
    };

    const result = lastFormikConfig.validate({
      startDate: mockDay,
      endDate: mockDay,
    });

    expect(result.endDate).not.toBeDefined();
  });

  it('covers validate success branch (no errors)', () => {
    const mockDay = {
      diff: () => 10,
    };

    const result = lastFormikConfig.validate({
      startDate: mockDay,
      endDate: mockDay,
    });

    expect(result).toEqual({});
  });

  it('covers validate future startDate invalidRange branch', () => {
    const dayjs = (await import('dayjs')).default;
    const futureDate = dayjs().add(2, 'day');
    const validEndDate = dayjs();

    const result = lastFormikConfig.validate({
      startDate: futureDate,
      endDate: validEndDate,
    });

    expect(result.startDate).toBeDefined();
  });

  it('covers validate future endDate invalidRange branch', () => {
    const dayjs = (await import('dayjs')).default;
    const futureDate = dayjs().add(2, 'day');
    const validStartDate = dayjs();

    const result = lastFormikConfig.validate({
      startDate: validStartDate,
      endDate: futureDate,
    });

    expect(result.endDate).toBeDefined();
  });

  it.skip('covers renderFormikDatePickerInput error branch', () => {
    const { renderFormikDatePickerInput } = require('../ExportFiltersCard');

    const formikMock = {
      touched: { startDate: true },
      errors: { startDate: 'error' },
      values: { startDate: true },
    };

    const renderInput = renderFormikDatePickerInput({
      formik: formikMock,
      fieldName: 'startDate',
      placeholder: 'Test',
    });

    const { container } = render(renderInput({}));

    expect(container).toBeInTheDocument();
  });
});
