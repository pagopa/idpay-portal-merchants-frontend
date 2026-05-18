import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExportFiltersCard from '../ExportFiltersCard';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../../../services/merchantService', () => ({
  generateMerchantReport: jest.fn(),
}));

import { generateMerchantReport } from '../../../services/merchantService';
import { useAppSelector } from '../../../redux/hooks';
import { Provider } from 'react-redux';
import { configureStore, UnknownAction } from '@reduxjs/toolkit';

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

let lastFormikConfig: any;
const mockSetFormFieldValue = jest.fn();

jest.mock('formik', () => ({
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
      resetForm: jest.fn(),
      setFieldValue: () => mockSetFormFieldValue(),
      handleSubmit: () =>
        config.onSubmit({
          startDate: mockDay,
          endDate: mockDay,
        }),
    };
  },
}));

const mockedGenerate = generateMerchantReport as jest.Mock;

const createMockStore = (initialState?: any) => {
  return configureStore({
    reducer: () => initialState
  });
};

const store = createMockStore();
const renderComponent = (updateAlerts = jest.fn()) => {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <ExportFiltersCard updateAlerts={updateAlerts} />
      </BrowserRouter>
    </Provider>
  );
}
describe('ExportFiltersCard', () => {
  (useAppSelector as jest.Mock).mockReturnValue([{ initiativeId: 'initiative-1' }])
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
    expect(screen.getByText('pages.reportExport.form.submit')).toBeInTheDocument();
    expect(screen.getByText('pages.reportExport.form.title')).toBeInTheDocument();
    expect(screen.getByText('pages.reportExport.form.subtitle')).toBeInTheDocument();
  });

  it('handles INSERTED status', async () => {
    mockedGenerate.mockResolvedValue({ reportStatus: 'INSERTED' });
    const updateAlerts = jest.fn();

    renderComponent(updateAlerts);
    clickSubmit();

    await waitFor(() => expect(updateAlerts).toHaveBeenCalledWith('INSERTED', true));

    jest.runAllTimers();
    expect(updateAlerts).toHaveBeenCalledWith('INSERTED', false);
  });

  it('handles GENERATED status', async () => {
    mockedGenerate.mockResolvedValue({ reportStatus: 'GENERATED' });
    const updateAlerts = jest.fn();

    renderComponent(updateAlerts);
    clickSubmit();

    await waitFor(() => expect(updateAlerts).toHaveBeenCalledWith('GENERATED', true));

    jest.runAllTimers();
    expect(updateAlerts).toHaveBeenCalledWith('GENERATED', false);
  });

  it('handles FAILED status', async () => {
    mockedGenerate.mockResolvedValue({ reportStatus: 'FAILED' });
    const updateAlerts = jest.fn();

    renderComponent(updateAlerts);
    clickSubmit();

    await waitFor(() => expect(updateAlerts).toHaveBeenCalledWith('FAILED', true));

    jest.runAllTimers();
    expect(updateAlerts).toHaveBeenCalledWith('FAILED', false);
  });

  it('handles API error', async () => {
    mockedGenerate.mockRejectedValue(new Error('error'));
    const updateAlerts = jest.fn();

    renderComponent(updateAlerts);
    clickSubmit();

    await waitFor(() => expect(updateAlerts).toHaveBeenCalledWith('FAILED', true));

    jest.runAllTimers();
    expect(updateAlerts).toHaveBeenCalledWith('FAILED', false);
  });

  it('does nothing if id is missing', async () => {
    const reactRouter = require('react-router-dom');
    jest.spyOn(reactRouter, 'useParams').mockReturnValue({ initiative_id: undefined });

    const updateAlerts = jest.fn();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ExportFiltersCard updateAlerts={updateAlerts} />
        </BrowserRouter>
      </Provider>
    );

    clickSubmit();

    expect(mockedGenerate).not.toHaveBeenCalled();
  });

  it('calls onReportGenerated in finally block', async () => {
    mockedGenerate.mockResolvedValue({ reportStatus: 'INSERTED' });

    const updateAlerts = jest.fn();
    const onReportGenerated = jest.fn();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ExportFiltersCard updateAlerts={updateAlerts} onReportGenerated={onReportGenerated} />
        </BrowserRouter>
      </Provider>
    );

    clickSubmit();

    await waitFor(() => expect(updateAlerts).toHaveBeenCalledWith('INSERTED', true));

    expect(onReportGenerated).toHaveBeenCalled();
  });

  it('covers validate required branch', async () => {
    const updateAlerts = jest.fn();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ExportFiltersCard updateAlerts={updateAlerts} />
        </BrowserRouter>
      </Provider>
    );

    const result = lastFormikConfig.validate({
      startDate: null,
      endDate: null,
    });
    const inputDal = screen.getByLabelText('Dal');
    const inputAl = screen.getByLabelText('Al');

    fireEvent.change(inputDal, result.startDate);
    fireEvent.change(inputAl, result.endDate);
    expect(mockSetFormFieldValue).toHaveBeenCalledTimes(3);
    expect(result.startDate).toBe('validation.required');
    expect(result.endDate).toBe('validation.required');
  });

  it('covers validate invalidRange branch (<1 day)', async () => {
    const updateAlerts = jest.fn();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ExportFiltersCard updateAlerts={updateAlerts} />
        </BrowserRouter>
      </Provider>
    );
    const dayjs = require('dayjs');
    const startDate = dayjs();
    const endDate = dayjs().add(0, 'day');

    const result = lastFormikConfig.validate({
      startDate: startDate,
      endDate: endDate,
    });
    const inputDal = screen.getByLabelText('Dal');
    const inputAl = screen.getByLabelText('Al');

    fireEvent.change(inputDal, result.startDate);
    fireEvent.change(inputAl, result.endDate);
    expect(mockSetFormFieldValue).toHaveBeenCalledTimes(3);
    clickSubmit();
    await waitFor(() =>
      expect(result.endDate).toBe('validation.invalidRange')
    );
  });

  it('covers validate maxRange branch (>90 days)', async () => {
    const updateAlerts = jest.fn();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ExportFiltersCard updateAlerts={updateAlerts} />
        </BrowserRouter>
      </Provider>
    );
    const dayjs = require('dayjs');
    const startDate = dayjs();
    const endDate = dayjs().add(100, 'day');

    const result = lastFormikConfig.validate({
      startDate: startDate,
      endDate: endDate,
    });

    const inputDal = screen.getByLabelText('Dal');
    const inputAl = screen.getByLabelText('Al');

    fireEvent.change(inputDal, result.startDate);
    fireEvent.change(inputAl, result.endDate);
    expect(mockSetFormFieldValue).toHaveBeenCalledTimes(3);
    clickSubmit();
    await waitFor(() => expect(result.endDate).toBe('validation.maxRange'));
  });

  it('covers validate success branch (no errors)', async () => {
    const updateAlerts = jest.fn();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ExportFiltersCard updateAlerts={updateAlerts} />
        </BrowserRouter>
      </Provider>
    );
    const mockDay = {
      diff: () => 10,
    };

    const result = lastFormikConfig.validate({
      startDate: mockDay,
      endDate: mockDay,
    });

    const inputDal = screen.getByLabelText('Dal');
    const inputAl = screen.getByLabelText('Al');

    fireEvent.change(inputDal, result.startDate);
    fireEvent.change(inputAl, result.endDate);
    expect(mockSetFormFieldValue).toHaveBeenCalledTimes(3);

    clickSubmit();
    await waitFor(() => expect(result).toEqual({}));
    await waitFor(() => expect(inputDal).not.toHaveAttribute('helperText'));
    await waitFor(() => expect(inputAl).not.toHaveAttribute('helperText'));
  });

  it('covers validate future startDate invalidRange branch', async () => {
    const updateAlerts = jest.fn();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ExportFiltersCard updateAlerts={updateAlerts} />
        </BrowserRouter>
      </Provider>
    );
    const dayjs = require('dayjs');
    const futureDate = dayjs().add(2, 'day');
    const validEndDate = dayjs();

    const result = lastFormikConfig.validate({
      startDate: futureDate,
      endDate: validEndDate,
    });

    const inputDal = screen.getByLabelText('Dal');
    const inputAl = screen.getByLabelText('Al');

    fireEvent.change(inputDal, result.startDate);
    fireEvent.change(inputAl, result.endDate);
    expect(mockSetFormFieldValue).toHaveBeenCalledTimes(3);
    clickSubmit();
    await waitFor(() =>
      expect(result.startDate).toBe('validation.invalidRange')
    );
  });

  it('covers validate future endDate invalidRange branch', async () => {
    const updateAlerts = jest.fn();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ExportFiltersCard updateAlerts={updateAlerts} />
        </BrowserRouter>
      </Provider>
    );
    const dayjs = require('dayjs');
    const futureDate = dayjs().add(2, 'day');
    const validStartDate = dayjs();

    const result = lastFormikConfig.validate({
      startDate: validStartDate,
      endDate: futureDate,
    });

    const inputDal = screen.getByLabelText('Dal');
    const inputAl = screen.getByLabelText('Al');

    fireEvent.change(inputDal, result.startDate);
    fireEvent.change(inputAl, result.endDate);
    expect(mockSetFormFieldValue).toHaveBeenCalledTimes(3);
    clickSubmit();
    await waitFor(() =>
      expect(result.endDate).toBe('validation.invalidRange')
    );
  });
});
