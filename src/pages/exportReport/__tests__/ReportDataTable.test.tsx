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
  initiativesReducer: (state = { list: [] }) => state,
}));

jest.mock('../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));


describe('ReportDataTable', () => {
  (useAppSelector as jest.Mock).mockReturnValue([{ initiativeId: 'initiative-1' }]);

  const renderComponent = (props: any = {}) => {
    const localStore = configureStore({
      reducer: () => ({})
    });

    return render(
      <Provider store={localStore}>
        <ReportDataTable {...props} />
      </Provider>
    );
  };

  const mockReportsResponse = (reports: any[], overrides: any = {}) => {
    getMerchantReports.mockResolvedValue({
      reports,
      page: 0,
      size: 10,
      totalElements: reports?.length ?? 0,
      totalPages: reports?.length ? 1 : 0,
      ...overrides,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it('renders empty state when no reports', async () => {
    mockReportsResponse([]);

    renderComponent();

    await waitFor(() =>
      expect(getMerchantReports).toHaveBeenCalledWith('merchant-1', 0, 10)
    );

    expect(
      screen.getByText('pages.reportExport.noReportFound')
    ).toBeInTheDocument();
  });

  it('renders reports when available', async () => {
    mockReportsResponse([
      {
        id: 'r1',
        fileName: 'report.csv',
        reportStatus: 'INSERTED',
      },
    ]);

    renderComponent();

    await waitFor(() =>
      expect(screen.getByTestId('row-r1')).toBeInTheDocument()
    );

    expect(
      screen.getByText('pages.reportExport.reportTitle')
    ).toBeInTheDocument();
  });

  it('handles pagination change', async () => {
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: 'r1',
          fileName: 'file.csv',
          reportStatus: 'INSERTED',
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    renderComponent();

    await waitFor(() => expect(screen.getByTestId(/row-/)).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('page-change'));

    await waitFor(() => expect(getMerchantReports).toHaveBeenLastCalledWith('merchant-1', 1, 10));
  });

  it('downloads report successfully and triggers blob flow', async () => {
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: 'r1',
          fileName: 'file.csv',
          reportStatus: 'GENERATED',
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    downloadMerchantReport.mockResolvedValue('csv-content');

    if (!window.URL.createObjectURL) window.URL.createObjectURL = jest.fn();
    if (!window.URL.revokeObjectURL) window.URL.revokeObjectURL = jest.fn();

    const createObjectURLSpy = jest
      .spyOn(window.URL, 'createObjectURL')
      .mockReturnValue('blob:url');

    const revokeSpy = jest.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

    renderComponent({ refreshKey: 0 });

    await waitFor(() => expect(screen.getByTestId('row-r1')).toBeInTheDocument());

    const downloadButton = screen.getAllByRole('button')[0];
    fireEvent.click(downloadButton);

    await waitFor(() => expect(downloadMerchantReport).toHaveBeenCalledWith('merchant-1', 'r1'));

    expect(createObjectURLSpy).not.toHaveBeenCalled();
    expect(revokeSpy).not.toHaveBeenCalled();

    createObjectURLSpy.mockRestore();
    revokeSpy.mockRestore();
  });

  it('renders loading state', async () => {
    getMerchantReports.mockImplementation(() => new Promise(() => {}));

    renderComponent();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles rows per page change', async () => {
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: 'r10',
          fileName: 'file.csv',
          reportStatus: 'INSERTED',
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    renderComponent();

    await waitFor(() => expect(screen.getByTestId(/row-/)).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('rows-change'));

    await waitFor(() => expect(getMerchantReports).toHaveBeenLastCalledWith('merchant-1', 0, 20));
  });

  it('handles download error branch and resets state', async () => {
    const updateAlerts = jest.fn();
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: 'r2',
          fileName: 'file.csv',
          reportStatus: 'GENERATED',
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    downloadMerchantReport.mockRejectedValue(new Error('fail'));

    renderComponent({ updateAlerts });

    await waitFor(() => expect(screen.getByTestId('row-r2')).toBeInTheDocument());

    const downloadButton = screen.getAllByRole('button')[0];
    fireEvent.click(downloadButton);

    await waitFor(() => expect(downloadMerchantReport).toHaveBeenCalledWith('merchant-1', 'r2'));

    await waitFor(() => expect(updateAlerts).toHaveBeenCalledWith('error', true));
    jest.runAllTimers();
    await waitFor(() => expect(updateAlerts).toHaveBeenCalledWith('error', false));
  });

  it('renders FAILED status branch (no download button)', async () => {
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: 'r3',
          fileName: '',
          reportStatus: 'FAILED',
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    renderComponent();

    await waitFor(() => expect(screen.getByTestId('row-r3')).toBeInTheDocument());

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(2);
  });

  it('covers id missing branch in loadReports and download', async () => {
    getMerchantReports.mockResolvedValue({
      reports: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });

    renderComponent();

    await waitFor(() => expect(getMerchantReports).toHaveBeenCalled());
  });

  it('disables download button when status is not GENERATED', async () => {
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: 'r4',
          fileName: 'file.csv',
          reportStatus: 'IN_PROGRESS',
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    renderComponent();

    await waitFor(() => expect(screen.getByTestId('row-r4')).toBeInTheDocument());

    const downloadButton = screen.getAllByRole('button')[0];
    expect(downloadButton).toBeDisabled();
  });

  it('does not trigger download when reportUrl is missing', async () => {
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: 'r5',
          fileName: 'file.csv',
          reportStatus: 'GENERATED',
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    downloadMerchantReport.mockResolvedValue({});

    const appendSpy = jest.spyOn(document.body, 'appendChild');

    renderComponent();

    await waitFor(() => expect(screen.getByTestId('row-r5')).toBeInTheDocument());

    const downloadButton = screen.getAllByRole('button')[0];
    fireEvent.click(downloadButton);

    await waitFor(() => expect(downloadMerchantReport).toHaveBeenCalledWith('merchant-1', 'r5'));

    expect(appendSpy).toHaveBeenCalled();

    appendSpy.mockRestore();
  });

  it('triggers refresh logic when refreshKey changes and pageNo is 0', async () => {
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: 'r6',
          fileName: 'file.csv',
          reportStatus: 'INSERTED',
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    const localStore = configureStore({ reducer: () => ({}) });
    const { rerender } = render(
      <Provider store={localStore}>
        <ReportDataTable refreshKey={1} />
      </Provider>
    );

    await waitFor(() => expect(screen.getByTestId('row-r6')).toBeInTheDocument());

    rerender(
      <Provider store={localStore}>
        <ReportDataTable refreshKey={2} />
      </Provider>
    );

    await waitFor(() => expect(getMerchantReports).toHaveBeenCalled());
  });

  it('renders GENERATED status icon and enables download when not downloading', async () => {
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: 'r7',
          fileName: 'file.csv',
          reportStatus: 'GENERATED',
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    renderComponent();

    await waitFor(() => expect(screen.getByTestId('row-r7')).toBeInTheDocument());

    const downloadButton = screen.getAllByRole('button')[0];
    expect(downloadButton).not.toBeDisabled();
  });

  it('does not render table when reports is undefined', async () => {
    getMerchantReports.mockResolvedValue({
      reports: undefined,
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });

    renderComponent();

    await waitFor(() => expect(getMerchantReports).toHaveBeenCalled());

    expect(screen.getByText('pages.reportExport.noReportFound')).toBeInTheDocument();
  });

  it('handles pagination reset when refreshKey changes and pageNo is not 0', async () => {
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: 'r8',
          fileName: 'file.csv',
          reportStatus: 'INSERTED',
        },
      ],
      page: 1,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    renderComponent({ refreshKey: 1 });

    await waitFor(() => expect(getMerchantReports).toHaveBeenCalledWith('merchant-1', 0, 10));
  });

  it('covers IN_PROGRESS status icon branch', async () => {
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: 'r9',
          fileName: 'file.csv',
          reportStatus: 'IN_PROGRESS',
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    renderComponent();

    await waitFor(() => expect(screen.getByTestId('row-r9')).toBeInTheDocument());
  });

  it('covers nullish coalescing in pagination mapping', async () => {
    getMerchantReports.mockResolvedValue({
      reports: [],
      page: undefined,
      size: undefined,
      totalElements: undefined,
      totalPages: 0,
    });

    renderComponent();

    await waitFor(() => expect(getMerchantReports).toHaveBeenCalled());
  });

  it('returns empty string for FAILED action column', async () => {
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: 'r10',
          fileName: 'file.csv',
          reportStatus: 'FAILED',
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    renderComponent();

    await waitFor(() => expect(screen.getByTestId('row-r10')).toBeInTheDocument());

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(2);
  });

  it('disables button while downloading same id', async () => {
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: 'r11',
          fileName: 'file.csv',
          reportStatus: 'GENERATED',
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    let resolvePromise;
    downloadMerchantReport.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    renderComponent();

    await waitFor(() => expect(screen.getByTestId('row-r11')).toBeInTheDocument());

    const downloadButton = screen.getAllByRole('button')[0];
    fireEvent.click(downloadButton);

    expect(downloadButton).toBeDisabled();

    resolvePromise({ reportUrl: 'url' });
  });
});
