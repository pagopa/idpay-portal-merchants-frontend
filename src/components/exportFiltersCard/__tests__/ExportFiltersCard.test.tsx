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
      resetForm: jest.fn(),
    };
  },
}));

const mockedGenerate = generateMerchantReport as jest.Mock;

const renderComponent = (updateAlerts = jest.fn(), onReportGenerated?: () => void) =>
  render(
    <BrowserRouter>
      <ExportFiltersCard
        updateAlerts={updateAlerts}
        onReportGenerated={onReportGenerated}
      />
    </BrowserRouter>
  );

describe('ExportFiltersCard - FULL BRANCH COVERAGE', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  const clickSubmit = () => {
    fireEvent.click(screen.getByText('pages.reportExport.form.submit'));
  };

  /* =======================
     VALIDATION BRANCH TESTS
     ======================= */

  it('validates missing startDate branch', () => {
    const formikModule = require('formik');
    let validateFn: any;

    jest.spyOn(formikModule, 'useFormik').mockImplementation((config: any) => {
      validateFn = config.validate;
      return formikModule.useFormik.wrappedMethod
        ? formikModule.useFormik.wrappedMethod(config)
        : {
            values: {},
            touched: {},
            errors: {},
            setFieldValue: jest.fn(),
            handleSubmit: jest.fn(),
            resetForm: jest.fn(),
          };
    });

    renderComponent();

    const errors = validateFn({
      startDate: null,
      endDate: { diff: () => 2 },
    });

    expect(errors.startDate).toBe(
      'pages.reportExport.form.validation.required'
    );
  });

  it('validates missing endDate branch', () => {
    const formikModule = require('formik');
    let validateFn: any;

    jest.spyOn(formikModule, 'useFormik').mockImplementation((config: any) => {
      validateFn = config.validate;
      return {
        values: {},
        touched: {},
        errors: {},
        setFieldValue: jest.fn(),
        handleSubmit: jest.fn(),
        resetForm: jest.fn(),
      };
    });

    renderComponent();

    const errors = validateFn({
      startDate: { diff: () => 2 },
      endDate: null,
    });

    expect(errors.endDate).toBe(
      'pages.reportExport.form.validation.required'
    );
  });

  it('validates invalidRange branch (<1 day)', () => {
    const formikModule = require('formik');
    let validateFn: any;

    jest.spyOn(formikModule, 'useFormik').mockImplementation((config: any) => {
      validateFn = config.validate;
      return {
        values: {},
        touched: {},
        errors: {},
        setFieldValue: jest.fn(),
        handleSubmit: jest.fn(),
        resetForm: jest.fn(),
      };
    });

    renderComponent();

    const errors = validateFn({
      startDate: { diff: () => 0 },
      endDate: { diff: () => 0 },
    });

    expect(errors.endDate).toBe(
      'pages.reportExport.form.validation.invalidRange'
    );
  });

  it('validates maxRange branch (>90 days)', () => {
    const formikModule = require('formik');
    let validateFn: any;

    jest.spyOn(formikModule, 'useFormik').mockImplementation((config: any) => {
      validateFn = config.validate;
      return {
        values: {},
        touched: {},
        errors: {},
        setFieldValue: jest.fn(),
        handleSubmit: jest.fn(),
        resetForm: jest.fn(),
      };
    });

    renderComponent();

    const errors = validateFn({
      startDate: { diff: () => 91 },
      endDate: { diff: () => 91 },
    });

    expect(errors.endDate).toBe(
      'pages.reportExport.form.validation.maxRange'
    );
  });

  /* =======================
     SUBMIT BRANCH TESTS
     ======================= */

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

  it('handles API error branch', async () => {
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

  it('handles no-id early return branch', () => {
    const reactRouter = require('react-router-dom');
    jest
      .spyOn(reactRouter, 'useParams')
      .mockReturnValue({ id: undefined });

    const updateAlerts = jest.fn();

    renderComponent(updateAlerts);
    clickSubmit();

    expect(mockedGenerate).not.toHaveBeenCalled();
  });

  it('calls onReportGenerated optional branch', async () => {
    mockedGenerate.mockResolvedValue({ reportStatus: 'INSERTED' });

    const updateAlerts = jest.fn();
    const onReportGenerated = jest.fn();

    renderComponent(updateAlerts, onReportGenerated);
    clickSubmit();

    await waitFor(() =>
      expect(updateAlerts).toHaveBeenCalledWith('inserted', true)
    );

    expect(onReportGenerated).toHaveBeenCalled();
  });
});
