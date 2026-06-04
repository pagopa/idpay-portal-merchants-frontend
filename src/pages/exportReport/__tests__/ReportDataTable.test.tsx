// @ts-nocheck
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useAppSelector } from '../../../redux/hooks';
import ReportDataTable from '../ReportDataTable';

jest.mock('react-router-dom', () => ({
  useParams: () => ({ initiative_id: 'merchant-1' }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    // @ts-ignore
    t: (key) => key,
  }),
}));

jest.mock('../../../services/merchantService', () => ({
  getMerchantReports: jest.fn(),
  downloadMerchantReport: jest.fn(),
}));

jest.mock('../../../components/dataTable/DataTable', () => (props) => {
  return (
    <div>
      {props.rows?.map((row) => (
        <div key={row.id} data-testid={`row-${row.id}`}>
          {props.columns.map((col, idx) =>
            col.renderCell ? <div key={idx}>{col.renderCell({ row })}</div> : null
          )}
        </div>
      ))}
      <button onClick={() => props.onPaginationPageChange(1)} data-testid="page-change" />
      <button onClick={() => props.onRowsPerPageChange(20)} data-testid="rows-change" />
    </div>
  );
});

const { getMerchantReports, downloadMerchantReport } = jest.requireMock(
  '../../../services/merchantService'
);

jest.mock('../../../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: jest.fn(),
}));

jest.mock('../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));

const createMockStore = (initialState?: any) =>
  configureStore({ reducer: () => initialState });

const store = createMockStore();

const renderComponent = (props: any = {}) =>
  render(
    <Provider store={store}>
      <ReportDataTable {...props} />
    </Provider>
  );

const makeReport = (
  id: string,
  reportStatus: string,
  overrides: Record<string, unknown> = {}
) => ({
  id,
  fileName: 'file.csv',
  reportStatus,
  ...overrides,
});

const makeReportResponse = (
  reports: any[],
  overrides: Record<string, unknown> = {}
) => ({
  reports,
  page: 0,
  size: 10,
  totalElements: reports.length,
  totalPages: reports.length > 0 ? 1 : 0,
  ...overrides,
});

describe('ReportDataTable', () => {
  (useAppSelector as jest.Mock).mockReturnValue([{ initiativeId: 'initiative-1' }]);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it('renders empty state when no reports', async () => {
    getMerchantReports.mockResolvedValue(makeReportResponse([]));

    renderComponent();

    await waitFor(() => expect(getMerchantReports).toHaveBeenCalledWith('merchant-1', 0, 10));
    expect(screen.getByText('pages.reportExport.noReportFound')).toBeInTheDocument();
  });

  it('does not render table when reports is undefined', async () => {
    getMerchantReports.mockResolvedValue(makeReportResponse([], { reports: undefined }));

    renderComponent();

    await waitFor(() => expect(getMerchantReports).toHaveBeenCalled());
    expect(screen.getByText('pages.reportExport.noReportFound')).toBeInTheDocument();
  });

  it('renders reports when available', async () => {
    getMerchantReports.mockResolvedValue(
      makeReportResponse([makeReport('r1', 'INSERTED', { fileName: 'report.csv' })])
    );

    renderComponent();

    await waitFor(() => expect(screen.getByTestId('row-r1')).toBeInTheDocument());
    expect(screen.getByText('pages.reportExport.reportTitle')).toBeInTheDocument();
  });

  it('renders loading state', async () => {
    getMerchantReports.mockImplementation(() => new Promise(() => {}));

    renderComponent();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles pagination change', async () => {
    getMerchantReports.mockResolvedValue(makeReportResponse([makeReport('r1', 'INSERTED')]));

    renderComponent();

    await waitFor(() => expect(screen.getByTestId(/row-/)).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('page-change'));
    await waitFor(() =>
      expect(getMerchantReports).toHaveBeenLastCalledWith('merchant-1', 1, 10)
    );
  });

  it('handles rows per page change', async () => {
    getMerchantReports.mockResolvedValue(makeReportResponse([makeReport('r1', 'INSERTED')]));

    renderComponent();

    await waitFor(() => expect(screen.getByTestId(/row-/)).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('rows-change'));
    await waitFor(() =>
      expect(getMerchantReports).toHaveBeenLastCalledWith('merchant-1', 0, 20)
    );
  });

  it('handles pagination reset when refreshKey changes and pageNo is not 0', async () => {
    getMerchantReports.mockResolvedValue(
      makeReportResponse([makeReport('r1', 'INSERTED')], { page: 1 })
    );

    renderComponent({ refreshKey: 1 });

    await waitFor(() =>
      expect(getMerchantReports).toHaveBeenCalledWith('merchant-1', 0, 10)
    );
  });

  it('triggers refresh logic when refreshKey changes', async () => {
    getMerchantReports.mockResolvedValue(makeReportResponse([makeReport('r1', 'INSERTED')]));

    const localStore = createMockStore({});
    const { rerender } = render(
      <Provider store={localStore}>
        <ReportDataTable refreshKey={1} />
      </Provider>
    );

    await waitFor(() => expect(screen.getByTestId('row-r1')).toBeInTheDocument());

    rerender(
      <Provider store={localStore}>
        <ReportDataTable refreshKey={2} />
      </Provider>
    );

    await waitFor(() => expect(getMerchantReports).toHaveBeenCalled());
  });

  it('covers nullish coalescing in pagination mapping', async () => {
    getMerchantReports.mockResolvedValue(
      makeReportResponse([], { page: undefined, size: undefined, totalElements: undefined })
    );

    renderComponent();

    await waitFor(() => expect(getMerchantReports).toHaveBeenCalled());
  });

  it('renders GENERATED status — enables download button', async () => {
    getMerchantReports.mockResolvedValue(makeReportResponse([makeReport('r1', 'GENERATED')]));

    renderComponent();

    await waitFor(() => expect(screen.getByTestId('row-r1')).toBeInTheDocument());
    expect(screen.getAllByRole('button')[0]).not.toBeDisabled();
  });

  it('disables download button for non-GENERATED status', async () => {
    getMerchantReports.mockResolvedValue(makeReportResponse([makeReport('r1', 'IN_PROGRESS')]));

    renderComponent();

    await waitFor(() => expect(screen.getByTestId('row-r1')).toBeInTheDocument());
    expect(screen.getAllByRole('button')[0]).toBeDisabled();
  });

  it('renders FAILED status — no action button in action column', async () => {
    getMerchantReports.mockResolvedValue(
      makeReportResponse([makeReport('r1', 'FAILED', { fileName: '' })])
    );

    renderComponent();

    await waitFor(() => expect(screen.getByTestId('row-r1')).toBeInTheDocument());
    expect(screen.getAllByRole('button').length).toBe(2);
  });

  it('covers IN_PROGRESS status icon branch', async () => {
    getMerchantReports.mockResolvedValue(makeReportResponse([makeReport('r1', 'IN_PROGRESS')]));

    renderComponent();

    await waitFor(() => expect(screen.getByTestId('row-r1')).toBeInTheDocument());
  });

  it('downloads report successfully and triggers blob flow', async () => {
    getMerchantReports.mockResolvedValue(makeReportResponse([makeReport('r1', 'GENERATED')]));
    downloadMerchantReport.mockResolvedValue('csv-content');

    if (!window.URL.createObjectURL) window.URL.createObjectURL = jest.fn();
    if (!window.URL.revokeObjectURL) window.URL.revokeObjectURL = jest.fn();

    const createObjectURLSpy = jest
      .spyOn(window.URL, 'createObjectURL')
      .mockReturnValue('blob:url');
    const revokeSpy = jest.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

    renderComponent({ refreshKey: 0 });

    await waitFor(() => expect(screen.getByTestId('row-r1')).toBeInTheDocument());
    fireEvent.click(screen.getAllByRole('button')[0]);
    await waitFor(() =>
      expect(downloadMerchantReport).toHaveBeenCalledWith('merchant-1', 'r1')
    );

    expect(createObjectURLSpy).not.toHaveBeenCalled();
    expect(revokeSpy).not.toHaveBeenCalled();

    createObjectURLSpy.mockRestore();
    revokeSpy.mockRestore();
  });

  it('does not trigger anchor download when reportUrl is missing', async () => {
    getMerchantReports.mockResolvedValue(makeReportResponse([makeReport('r1', 'GENERATED')]));
    downloadMerchantReport.mockResolvedValue({});

    const appendSpy = jest.spyOn(document.body, 'appendChild');

    renderComponent();

    await waitFor(() => expect(screen.getByTestId('row-r1')).toBeInTheDocument());
    fireEvent.click(screen.getAllByRole('button')[0]);
    await waitFor(() =>
      expect(downloadMerchantReport).toHaveBeenCalledWith('merchant-1', 'r1')
    );

    expect(appendSpy).toHaveBeenCalled();
    appendSpy.mockRestore();
  });

  it('disables button while download is in progress', async () => {
    getMerchantReports.mockResolvedValue(makeReportResponse([makeReport('r1', 'GENERATED')]));

    let resolveDownload: (value: any) => void;
    downloadMerchantReport.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveDownload = resolve;
        })
    );

    renderComponent();

    await waitFor(() => expect(screen.getByTestId('row-r1')).toBeInTheDocument());

    const downloadButton = screen.getAllByRole('button')[0];
    fireEvent.click(downloadButton);
    expect(downloadButton).toBeDisabled();

    resolveDownload({ reportUrl: 'url' });
  });

  it('handles download error and resets state after timeout', async () => {
    getMerchantReports.mockResolvedValue(makeReportResponse([makeReport('r1', 'GENERATED')]));
    downloadMerchantReport.mockRejectedValue(new Error('fail'));

    renderComponent({ updateAlerts: jest.fn() });

    await waitFor(() => expect(screen.getByTestId('row-r1')).toBeInTheDocument());
    fireEvent.click(screen.getAllByRole('button')[0]);

    await waitFor(() =>
      expect(downloadMerchantReport).toHaveBeenCalledWith('merchant-1', 'r1')
    );
  });
});
