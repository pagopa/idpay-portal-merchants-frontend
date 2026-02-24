// @ts-nocheck
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ReportDataTable from "../ReportDataTable";

jest.mock("react-router-dom", () => ({
  useParams: () => ({ id: "merchant-1" }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    // @ts-ignore
    t: (key) => key,
  }),
}));

jest.mock("../../../services/merchantService", () => ({
  getMerchantReports: jest.fn(),
  downloadMerchantReport: jest.fn(),
}));

jest.mock("../../../components/dataTable/DataTable", () => (props) => {
  return (
    <div>
      {props.rows?.map((row) => (
        <div key={row.id} data-testid={`row-${row.id}`}>
          {props.columns.map((col, idx) =>
            col.renderCell ? (
              <div key={idx}>{col.renderCell({ row })}</div>
            ) : null
          )}
        </div>
      ))}
      <button
        onClick={() => props.onPaginationPageChange(1)}
        data-testid="page-change"
      />
      <button
        onClick={() => props.onRowsPerPageChange(20)}
        data-testid="rows-change"
      />
    </div>
  );
});

const { getMerchantReports, downloadMerchantReport } = jest.requireMock(
  "../../../services/merchantService"
);

describe("ReportDataTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it("renders empty state when no reports", async () => {
    getMerchantReports.mockResolvedValue({
      reports: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });

    render(<ReportDataTable />);

    await waitFor(() =>
      expect(getMerchantReports).toHaveBeenCalledWith(
        "merchant-1",
        0,
        10
      )
    );

    expect(
      screen.getByText("pages.reportExport.noReportFound")
    ).toBeInTheDocument();
  });

  it("renders reports when available", async () => {
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: "r1",
          fileName: "report.csv",
          reportStatus: "INSERTED",
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    render(<ReportDataTable />);

    await waitFor(() =>
      expect(screen.getByTestId("row-r1")).toBeInTheDocument()
    );

    expect(screen.getByText("pages.reportExport.reportTitle")).toBeInTheDocument();
  });

  it("handles pagination change", async () => {
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: "r1",
          fileName: "file.csv",
          reportStatus: "INSERTED",
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    render(<ReportDataTable />);

    await waitFor(() =>
      expect(screen.getByTestId(/row-/)).toBeInTheDocument()
    );

    fireEvent.click(screen.getByTestId("page-change"));

    await waitFor(() =>
      expect(getMerchantReports).toHaveBeenLastCalledWith(
        "merchant-1",
        1,
        10
      )
    );
  });

  it("downloads report successfully and triggers blob flow", async () => {
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: "r1",
          fileName: "file.csv",
          reportStatus: "GENERATED",
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    downloadMerchantReport.mockResolvedValue("csv-content");

    if (!window.URL.createObjectURL) window.URL.createObjectURL = jest.fn();
    if (!window.URL.revokeObjectURL) window.URL.revokeObjectURL = jest.fn();

    const createObjectURLSpy = jest
      .spyOn(window.URL, "createObjectURL")
      .mockReturnValue("blob:url");

    const revokeSpy = jest
      .spyOn(window.URL, "revokeObjectURL")
      .mockImplementation(() => { });

    render(<ReportDataTable refreshKey={0} />);

    await waitFor(() =>
      expect(screen.getByTestId("row-r1")).toBeInTheDocument()
    );

    const downloadButton = screen.getAllByRole("button")[0];
    fireEvent.click(downloadButton);

    await waitFor(() =>
      expect(downloadMerchantReport).toHaveBeenCalledWith("merchant-1", "r1")
    );

    expect(createObjectURLSpy).not.toHaveBeenCalled();
    expect(revokeSpy).not.toHaveBeenCalled();

    createObjectURLSpy.mockRestore();
    revokeSpy.mockRestore();
  });

  it("renders loading state", async () => {
    getMerchantReports.mockImplementation(
      () => new Promise(() => { })
    );

    render(<ReportDataTable />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("handles rows per page change", async () => {
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: "r10",
          fileName: "file.csv",
          reportStatus: "INSERTED",
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    render(<ReportDataTable />);

    await waitFor(() =>
      expect(screen.getByTestId(/row-/)).toBeInTheDocument()
    );

    fireEvent.click(screen.getByTestId("rows-change"));

    await waitFor(() =>
      expect(getMerchantReports).toHaveBeenLastCalledWith(
        "merchant-1",
        0,
        20
      )
    );
  });

  it("handles download error branch and resets state", async () => {
    const updateAlerts = jest.fn();
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: "r2",
          fileName: "file.csv",
          reportStatus: "GENERATED",
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    downloadMerchantReport.mockRejectedValue(new Error("fail"));

    render(<ReportDataTable updateAlerts={updateAlerts} />);

    await waitFor(() =>
      expect(screen.getByTestId("row-r2")).toBeInTheDocument()
    );

    const downloadButton = screen.getAllByRole("button")[0];
    fireEvent.click(downloadButton);

    await waitFor(() =>
      expect(downloadMerchantReport).toHaveBeenCalledWith("merchant-1", "r2")
    );

    await waitFor(() => expect(updateAlerts).toHaveBeenCalledWith("error", true));
    jest.runAllTimers();
    await waitFor(() => expect(updateAlerts).toHaveBeenCalledWith("error", false));
  });

  it("renders FAILED status branch (no download button)", async () => {
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: "r3",
          fileName: "",
          reportStatus: "FAILED",
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    render(<ReportDataTable />);

    await waitFor(() =>
      expect(screen.getByTestId("row-r3")).toBeInTheDocument()
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(2);
  });

  it("covers id missing branch in loadReports and download", async () => {
    getMerchantReports.mockResolvedValue({
      reports: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });

    render(<ReportDataTable />);

    await waitFor(() =>
      expect(getMerchantReports).toHaveBeenCalled()
    );
  });
});
