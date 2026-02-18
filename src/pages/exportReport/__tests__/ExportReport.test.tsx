import { render, screen, fireEvent } from "@testing-library/react";
import InitiativeExportReportPage from "../ExportReport";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("@pagopa/selfcare-common-frontend", () => ({
  TitleBox: ({ title, subTitle }: any) => (
    <div>
      <div>{title}</div>
      <div>{subTitle}</div>
    </div>
  ),
}));

jest.mock("../../../components/exportFiltersCard/ExportFiltersCard", () => 
  ({ updateAlerts }: any) => (
    <button
      data-testid="trigger-alert"
      onClick={() => updateAlerts("inserted", true)}
    >
      trigger
    </button>
  )
);

jest.mock("../ReportDataTable", () => () => (
  <div data-testid="report-table">Report Table</div>
));

jest.mock("../../../components/Alert/AlertListComponent", () => 
  ({ alertList }: any) => (
    <div>
      {alertList.map((alert: any, index: number) => (
        <div key={index}>
          {alert.text}
          {alert.isOpen && (
            <button onClick={alert.onClose} data-testid={`close-${index}`}>
              close
            </button>
          )}
        </div>
      ))}
    </div>
  )
);

describe("InitiativeExportReportPage", () => {
  it("renders title, subtitle, filters and table", () => {
    render(<InitiativeExportReportPage />);

    expect(
      screen.getByText("pages.reportExport.title")
    ).toBeInTheDocument();
    expect(
      screen.getByText("pages.reportExport.subtitle")
    ).toBeInTheDocument();
    expect(screen.getByTestId("trigger-alert")).toBeInTheDocument();
    expect(screen.getByTestId("report-table")).toBeInTheDocument();
  });

  it("opens and closes alert via updateAlerts", () => {
    render(<InitiativeExportReportPage />);

    const trigger = screen.getByTestId("trigger-alert");
    fireEvent.click(trigger);

    expect(
      screen.getByText("pages.reportExport.alert.success")
    ).toBeInTheDocument();

    const closeBtn = screen.getByTestId("close-1");
    fireEvent.click(closeBtn);

    expect(
      screen.queryByTestId("close-1")
    ).not.toBeInTheDocument();
  });
});
