import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExportFiltersCard from '../ExportFiltersCard';
import dayjs from 'dayjs';

jest.mock('../../dateRangePicker/DateRangePicker', () => (props: any) => (
  <div>
    <input min={props.minDateFrom.toLocaleDateString("en-CA")} aria-label="Dal" disabled={props.isDisabled} onChange={(e) => props.onDateFromChange(new Date(e.target.value))} />
    <input aria-label="Al" disabled={props.isDisabled} onChange={(e) => props.onDateToChange(new Date(e.target.value))} />
  </div>
));
import { BrowserRouter } from 'react-router-dom';

jest.mock('../../../services/merchantService', () => ({
  generateMerchantReport: jest.fn(),
}));

import { generateMerchantReport } from '../../../services/merchantService';
import { useAppSelector } from '../../../redux/hooks';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useUserPermissions } from '../../../hooks/useUserPermissions';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ initiative_id: 'test-id' }),
}));

jest.mock('../../../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: jest.fn(),
}));

jest.mock('../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('../../../hooks/useUserPermissions', () => ({
  PERMISSION_KEYS: {
    REPORT_GENERATE: 'report.generate',
  },
  useUserPermissions: jest.fn(),
}));


let lastFormikConfig: any;
const mockSetFormFieldValue = jest.fn();

jest.mock('formik', () => ({
  useFormik: (config: any) => {
    lastFormikConfig = config;

    const mockDay = require('dayjs')('2026-01-01');

    return {
      values: {
        startDate: mockDay,
        endDate: mockDay,
      },
      touched: {},
      errors: {},
      isSubmitting: false,
      resetForm: jest.fn(),
      setFieldValue: () => mockSetFormFieldValue(),
      setValues: () => mockSetFormFieldValue(),
      handleSubmit: () =>
        config.onSubmit({
          startDate: mockDay,
          endDate: mockDay,
        }),
    };
  },
}));

const mockedGenerate = generateMerchantReport as jest.Mock;
const mockedUseUserPermissions = useUserPermissions as jest.Mock;

const createMockStore = (initialState?: any) => {
  return configureStore({
    reducer: () => initialState,
  });
};

const store = createMockStore();
const renderComponent = (updateAlerts = jest.fn()) => {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <ExportFiltersCard startDate="2020-01-01" updateAlerts={updateAlerts} />
      </BrowserRouter>
    </Provider>
  );
};

const getDateInputs = () => ({
  inputDal: screen.getByLabelText('Dal'),
  inputAl: screen.getByLabelText('Al'),
});

const fillDateInputs = (_startDate: any, _endDate: any) => {
  const { inputDal, inputAl } = getDateInputs();

  fireEvent.change(inputDal, { target: { value: "2026-01-01" } });
  fireEvent.change(inputAl, { target: { value: "2026-01-02" } });

  return { inputDal, inputAl };
};

const validateAndFillDateInputs = (startDate: any, endDate: any) => {
  const result = lastFormikConfig.validate({
    startDate,
    endDate,
  });

  fillDateInputs(result.startDate, result.endDate);

  return result;
};

describe('ExportFiltersCard', () => {
  it('rejects dates before the initiative starts', () => {
    renderComponent();
    expect(lastFormikConfig.validate({
      startDate: dayjs('2019-12-30'), endDate: dayjs('2019-12-31'),
    })).toEqual({ startDate: 'validation.invalidRange', endDate: 'validation.invalidRange' });
    expect(lastFormikConfig.validate({
      startDate: dayjs('2020-01-01'), endDate: dayjs('2020-01-01'),
    })).toEqual({});
  });
  it.each([90, 91])('validates the %s-day boundary', (days) => {
    renderComponent();
    const startDate = dayjs().subtract(120, 'day');
    const errors = lastFormikConfig.validate({ startDate, endDate: startDate.add(days, 'day') });
    expect(errors).toEqual(days === 90 ? {} : { endDate: 'validation.maxRange' });
  });
  (useAppSelector as jest.Mock).mockReturnValue([{ initiativeId: 'initiative-1' }]);
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockedUseUserPermissions.mockReturnValue({
      isActionDisabled: jest.fn().mockReturnValue(false),
    });
  });

  const clickSubmit = () => {
    const submitButton = screen.getByText('pages.reportExport.form.submit');
    fireEvent.click(submitButton);
  };

  it('renders correctly', () => {
    renderComponent();
    expect(screen.getByText('pages.reportExport.form.submit')).toBeInTheDocument();
    expect(screen.getByText('pages.reportExport.form.title')).toBeInTheDocument();
    expect(screen.getByText('pages.reportExport.form.subtitle')).toBeInTheDocument();
  });

  it('uses the current initiative start date as the start date minimum', () => {

    renderComponent();

    expect(screen.getByLabelText('Dal')).toHaveAttribute('min', '2020-01-01');
  });


  it('disables date inputs and submit when report generation is disabled', () => {
    mockedUseUserPermissions.mockReturnValue({
      isActionDisabled: jest.fn().mockReturnValue(true),
    });

    renderComponent();

    expect(screen.getByLabelText('Dal')).toBeDisabled();
    expect(screen.getByLabelText('Al')).toBeDisabled();
    expect(screen.getByText('pages.reportExport.form.submit')).toBeDisabled();
  });

  it.each([
    ['INSERTED status', 'INSERTED', false],
    ['GENERATED status', 'GENERATED', false],
    ['FAILED status', 'FAILED', false],
    ['API error', 'FAILED', true],
  ])('handles %s', async (_, expectedStatus, shouldReject) => {
    if (shouldReject) {
      mockedGenerate.mockRejectedValue(new Error('error'));
    } else {
      mockedGenerate.mockResolvedValue({ reportStatus: expectedStatus });
    }

    const updateAlerts = jest.fn();

    renderComponent(updateAlerts);
    clickSubmit();

    await waitFor(() => expect(updateAlerts).toHaveBeenCalledWith(expectedStatus, true));

    jest.runAllTimers();
    expect(updateAlerts).toHaveBeenCalledWith(expectedStatus, false);
  });

  it('does nothing if id is missing', async () => {
    const reactRouter = require('react-router-dom');
    jest.spyOn(reactRouter, 'useParams').mockReturnValue({ initiative_id: undefined });

    const updateAlerts = jest.fn();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ExportFiltersCard startDate="2020-01-01" updateAlerts={updateAlerts} />
        </BrowserRouter>
      </Provider>
    );

    clickSubmit();

    expect(mockedGenerate).not.toHaveBeenCalled();
  });

  it('calls onReportGenerated once after a successful response', async () => {
    mockedGenerate.mockResolvedValue({ reportStatus: 'INSERTED' });

    const updateAlerts = jest.fn();
    const onReportGenerated = jest.fn();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ExportFiltersCard startDate="2020-01-01" updateAlerts={updateAlerts} onReportGenerated={onReportGenerated} />
        </BrowserRouter>
      </Provider>
    );

    clickSubmit();

    await waitFor(() => expect(updateAlerts).toHaveBeenCalledWith('INSERTED', true));

    expect(onReportGenerated).toHaveBeenCalledTimes(1);
  });

  it('covers validate required branch', async () => {
    const updateAlerts = jest.fn();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ExportFiltersCard startDate="2020-01-01" updateAlerts={updateAlerts} />
        </BrowserRouter>
      </Provider>
    );

    const result = validateAndFillDateInputs(null, null);
    expect(mockSetFormFieldValue).toHaveBeenCalledTimes(2);
    expect(result.startDate).toBe('validation.required');
    expect(result.endDate).toBe('validation.required');
  });

  it('covers validate invalidRange branch (<1 day)', async () => {
    const updateAlerts = jest.fn();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ExportFiltersCard startDate="2020-01-01" updateAlerts={updateAlerts} />
        </BrowserRouter>
      </Provider>
    );
    const dayjs = require('dayjs');
    const startDate = dayjs();
    const endDate = dayjs().add(0, 'day');

    const result = validateAndFillDateInputs(startDate, endDate);
    expect(mockSetFormFieldValue).toHaveBeenCalledTimes(2);
    clickSubmit();
    await waitFor(() => expect(result.endDate).toBe('validation.invalidRange'));
  });

  it('covers validate maxRange branch (>90 days)', async () => {
    const updateAlerts = jest.fn();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ExportFiltersCard startDate="2020-01-01" updateAlerts={updateAlerts} />
        </BrowserRouter>
      </Provider>
    );
    const dayjs = require('dayjs');
    const startDate = dayjs();
    const endDate = dayjs().add(100, 'day');

    const result = validateAndFillDateInputs(startDate, endDate);
    expect(mockSetFormFieldValue).toHaveBeenCalledTimes(2);
    clickSubmit();
    await waitFor(() => expect(result.endDate).toBe('validation.maxRange'));
  });

  it('covers validate success branch (no errors)', async () => {
    const updateAlerts = jest.fn();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ExportFiltersCard startDate="2020-01-01" updateAlerts={updateAlerts} />
        </BrowserRouter>
      </Provider>
    );
    const mockDay = dayjs().subtract(10, 'day');

    const result = validateAndFillDateInputs(mockDay, mockDay);
    expect(mockSetFormFieldValue).toHaveBeenCalledTimes(2);

    clickSubmit();
    await waitFor(() => expect(result).toEqual({}));
    await waitFor(() => expect(getDateInputs().inputDal).not.toHaveAttribute('helperText'));
    await waitFor(() => expect(getDateInputs().inputAl).not.toHaveAttribute('helperText'));
  });

  it('covers validate future startDate invalidRange branch', async () => {
    const updateAlerts = jest.fn();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ExportFiltersCard startDate="2020-01-01" updateAlerts={updateAlerts} />
        </BrowserRouter>
      </Provider>
    );
    const dayjs = require('dayjs');
    const futureDate = dayjs().add(2, 'day');
    const validEndDate = dayjs();

    const result = validateAndFillDateInputs(futureDate, validEndDate);
    expect(mockSetFormFieldValue).toHaveBeenCalledTimes(2);
    clickSubmit();
    await waitFor(() => expect(result.startDate).toBe('validation.invalidRange'));
  });

  it('covers validate future endDate invalidRange branch', async () => {
    const updateAlerts = jest.fn();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ExportFiltersCard startDate="2020-01-01" updateAlerts={updateAlerts} />
        </BrowserRouter>
      </Provider>
    );
    const dayjs = require('dayjs');
    const futureDate = dayjs().add(2, 'day');
    const validStartDate = dayjs();

    const result = validateAndFillDateInputs(validStartDate, futureDate);
    expect(mockSetFormFieldValue).toHaveBeenCalledTimes(2);
    clickSubmit();
    await waitFor(() => expect(result.endDate).toBe('validation.invalidRange'));
  });
});
