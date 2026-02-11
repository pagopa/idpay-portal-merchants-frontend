import { render, screen, fireEvent } from '@testing-library/react';

const mockT = jest.fn((key: string) => key);

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

const mockOnGenerateReportRef: { current?: (range: { from: string; to: string }) => void } = {};

jest.mock('../../../components/exportFiltersCard/ExportFiltersCard', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props: { onGenerateReport: (range: { from: string; to: string }) => void }) => {
      mockOnGenerateReportRef.current = props.onGenerateReport;
      return React.createElement(
        'button',
        {
          type: 'button',
          'data-testid': 'export-filters-card',
          onClick: () => props.onGenerateReport({ from: '2026-01-01', to: '2026-01-02' }),
        },
        'ExportFiltersCard'
      );
    },
  };
});

jest.mock('../ReportDataTable', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () =>
      React.createElement('div', { 'data-testid': 'report-data-table' }, 'ReportDataTable'),
  };
});

jest.mock('@pagopa/selfcare-common-frontend', () => {
  const React = require('react');
  return {
    __esModule: true,
    TitleBox: (props: { title?: unknown; subTitle?: unknown }) =>
      React.createElement(
        'div',
        { 'data-testid': 'title-box' },
        React.createElement('div', { 'data-testid': 'title' }, String(props.title ?? '')),
        React.createElement('div', { 'data-testid': 'subtitle' }, String(props.subTitle ?? ''))
      ),
  };
});

import ExportReport from '../ExportReport';

describe('ExportReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnGenerateReportRef.current = undefined;
  });

  it('renders TitleBox with translated keys and child components', () => {
    render(<ExportReport />);

    expect(mockT).toHaveBeenCalledWith('pages.reportExport.title');
    expect(mockT).toHaveBeenCalledWith('pages.reportExport.subtitle');

    expect(screen.getByTestId('title-box')).toBeInTheDocument();
    expect(screen.getByTestId('title').textContent).toBe('');
    expect(screen.getByTestId('subtitle').textContent).not.toBe('pages.reportExport.subtitle');

    expect(screen.getByTestId('export-filters-card')).toBeInTheDocument();
    expect(screen.getByTestId('report-data-table')).toBeInTheDocument();

    expect(typeof mockOnGenerateReportRef.current).toBe('function');
  });

  it('covers onGenerateReport branch: logs from-to when child triggers callback', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    render(<ExportReport />);

    fireEvent.click(screen.getByTestId('export-filters-card'));

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith('2026-01-01-2026-01-02');

    logSpy.mockRestore();
  });

  it('executes the component without errors and keeps expected layout nodes', () => {
    const { container } = render(<ExportReport />);

    expect(container.firstChild).toBeTruthy();
    expect(screen.getByTestId('title-box')).toBeInTheDocument();
    expect(screen.getByTestId('export-filters-card')).toBeInTheDocument();
    expect(screen.getByTestId('report-data-table')).toBeInTheDocument();
  });
});
