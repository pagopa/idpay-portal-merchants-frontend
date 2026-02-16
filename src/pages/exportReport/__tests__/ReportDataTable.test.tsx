import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ReportDataTable from "../ReportDataTable";

jest.mock("react-router-dom", () => ({
  useParams: () => ({ id: "merchant-1" }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("../../../services/merchantService", () => ({
  getMerchantReports: jest.fn(),
  downloadMerchantReport: jest.fn(),
}));

// ✅ Correct DataTable mock (executes renderCell)
jest.mock("../../../components/dataTable/DataTable", () => (props: any) => {
  return (
    <div>
      {props.rows?.map((row: any) => (
        <div key={row.id} data-testid={`row-${row.id}`}>
          {props.columns.map((col: any, idx: number) =>
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

describe("ReportDataTable - FULL BRANCH COVERAGE", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* =============================
     EMPTY / LOADING BRANCHES
     ============================= */

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

  it("renders loading state", () => {
    getMerchantReports.mockImplementation(() => new Promise(() => {}));
    render(<ReportDataTable />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  /* =============================
     STATUS ICON BRANCHES
     ============================= */

  it("covers default status icon branch", async () => {
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: "r-default",
          fileName: "file.csv",
          reportStatus: "UNKNOWN_STATUS",
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    render(<ReportDataTable />);

    await waitFor(() =>
      expect(screen.getByTestId("row-r-default")).toBeInTheDocument()
    );
  });

  it("covers FAILED action branch (no button)", async () => {
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: "r-failed",
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
      expect(screen.getByTestId("row-r-failed")).toBeInTheDocument()
    );

    expect(screen.queryByTestId("DownloadIcon")).not.toBeInTheDocument();
  });

  /* =============================
     DOWNLOAD / DISABLED BRANCHES
     ============================= */

  it("covers disabled download branch (non INSERTED)", async () => {
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

    render(<ReportDataTable />);

    await waitFor(() =>
      expect(screen.getByTestId("row-r2")).toBeInTheDocument()
    );
  });

  it("covers download success branch", async () => {
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

    downloadMerchantReport.mockResolvedValue("csv-content");

    window.URL.createObjectURL = jest.fn().mockReturnValue("blob:url");
    window.URL.revokeObjectURL = jest.fn();

    render(<ReportDataTable />);

    await waitFor(() =>
      expect(screen.getByTestId("row-r1")).toBeInTheDocument()
    );
  });

  it("covers download error branch", async () => {
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: "r3",
          fileName: "file.csv",
          reportStatus: "INSERTED",
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    downloadMerchantReport.mockRejectedValue(new Error("fail"));

    render(<ReportDataTable />);

    await waitFor(() =>
      expect(screen.getByTestId("row-r3")).toBeInTheDocument()
    );
  });

  /* =============================
     PAGINATION BRANCHES
     ============================= */

  it("handles pagination change", async () => {
    getMerchantReports.mockResolvedValue({
      reports: [{ id: "r10", fileName: "file.csv", reportStatus: "INSERTED" }],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    render(<ReportDataTable />);

    await waitFor(() =>
      expect(screen.getByTestId("row-r10")).toBeInTheDocument()
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

  it("handles rows per page change", async () => {
    getMerchantReports.mockResolvedValue({
      reports: [{ id: "r20", fileName: "file.csv", reportStatus: "INSERTED" }],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    render(<ReportDataTable />);

    await waitFor(() =>
      expect(screen.getByTestId("row-r20")).toBeInTheDocument()
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

  /* =============================
     GUARD / EFFECT BRANCHES
     ============================= */

  it("covers no-id loadReports guard", () => {
    const reactRouter = require("react-router-dom");
    jest.spyOn(reactRouter, "useParams").mockReturnValue({ id: undefined });

    render(<ReportDataTable />);

    expect(getMerchantReports).not.toHaveBeenCalled();
  });

  it("covers refreshKey effect branch", async () => {
    getMerchantReports.mockResolvedValue({
      reports: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });

    const { rerender } = render(<ReportDataTable refreshKey={0} />);

    await waitFor(() =>
      expect(getMerchantReports).toHaveBeenCalledTimes(1)
    );

    rerender(<ReportDataTable refreshKey={1} />);

    await waitFor(() =>
      expect(getMerchantReports).toHaveBeenCalledTimes(2)
    );
  });
});
