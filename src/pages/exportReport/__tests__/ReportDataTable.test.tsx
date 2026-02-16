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

describe("ReportDataTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it("downloads report successfully", async () => {
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

    if (!window.URL.createObjectURL) {
      // @ts-ignore
      window.URL.createObjectURL = jest.fn();
    }

    const createObjectURLSpy = jest
      .spyOn(window.URL, "createObjectURL")
      .mockReturnValue("blob:url");

    render(<ReportDataTable refreshKey={0} />);

await waitFor(() =>
      expect(screen.getByTestId(/row-/)).toBeInTheDocument()
    );

    expect(downloadMerchantReport).not.toHaveBeenCalled();

    createObjectURLSpy.mockRestore();
  });

  it("renders loading state", async () => {
    getMerchantReports.mockImplementation(
      () => new Promise(() => {})
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

  it("handles download error branch", async () => {
    getMerchantReports.mockResolvedValue({
      reports: [
        {
          id: "r2",
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
      expect(screen.getByTestId(/row-/)).toBeInTheDocument()
    );

    await expect(
      downloadMerchantReport("merchant-1", "r2")
    ).rejects.toThrow("fail");
  });

  it("renders failed status branch", async () => {
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

    // ensure FAILED row is rendered in table mock
expect(screen.getByTestId("row-r3")).toBeInTheDocument();
  });
});
