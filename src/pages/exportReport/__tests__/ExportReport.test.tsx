import { render, screen, fireEvent } from '@testing-library/react';
import InitiativeExportReportPage from '../ExportReport';
import { useAppSelector } from '../../../redux/hooks';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => 'initiative-1',
}));

jest.mock('../../../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: jest.fn(), 
}));

jest.mock('../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/', () => ({
  TitleBox: ({ title, subTitle }: any) => (
    <div>
      <div>{title}</div>
      <div>{subTitle}</div>
    </div>
  ),
}));

jest.mock(
  '../../../components/exportFiltersCard/ExportFiltersCard',
  () =>
    ({ updateAlerts }: any) =>
      (
        <button data-testid="trigger-alert" onClick={() => updateAlerts('inserted', true)}>
          trigger
        </button>
      )
);

jest.mock('../ReportDataTable', () => () => <div data-testid="report-table">Report Table</div>);

jest.mock('../../../components/Alert/AlertListComponent', () => ({ alertList }: any) => (
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
));

describe('InitiativeExportReportPage', () => {
    (useAppSelector as jest.Mock).mockReturnValue([{initiativeId: 'initiative-1'}])
  it('renders title, subtitle, filters and table', () => {
    render(<InitiativeExportReportPage />);

    expect(screen.getByText('pages.reportExport.title')).toBeInTheDocument();
    expect(screen.getByText('pages.reportExport.subtitle')).toBeInTheDocument();
    expect(screen.getByTestId('trigger-alert')).toBeInTheDocument();
    expect(screen.getByTestId('report-table')).toBeInTheDocument();
  });

  it('opens and closes alert via updateAlerts', () => {
    render(<InitiativeExportReportPage />);

    const trigger = screen.getByTestId('trigger-alert');
    fireEvent.click(trigger);

    expect(screen.getByText('pages.reportExport.alert.success')).toBeInTheDocument();

    const closeBtn = screen.getByTestId('close-5');
    fireEvent.click(closeBtn);

    expect(screen.queryByTestId('close-5')).not.toBeInTheDocument();
  });
});
