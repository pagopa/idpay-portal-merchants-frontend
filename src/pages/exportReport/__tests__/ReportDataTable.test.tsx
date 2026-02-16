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
      <div data-testid="rows">{JSON.stringify(props.rows)}</div>
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
      expect(screen.getByTestId("rows")).toBeInTheDocument()
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
      expect(screen.getByTestId("rows")).toBeInTheDocument()
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

    render(<ReportDataTable />);

    await waitFor(() =>
      expect(screen.getByTestId("rows")).toBeInTheDocument()
    );

    await downloadMerchantReport("merchant-1", "r1");

    expect(downloadMerchantReport).toHaveBeenCalled();

    createObjectURLSpy.mockRestore();
  });
});
