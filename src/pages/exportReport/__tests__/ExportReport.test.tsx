import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExportReport from '../ExportReport';

jest.mock('../../../components/exportFiltersCard/ExportFiltersCard', () => (props: any) => (
  <div data-testid="filters-card" onClick={() => props.updateAlerts('inserted', true)}>
    FiltersCard
  </div>
));

jest.mock('../ReportDataTable', () => () => (
  <div data-testid="report-table">ReportTable</div>
));

describe('ExportReport page', () => {
  it('renders title, filters and table', () => {
    render(<ExportReport />);

    expect(screen.getByTestId('filters-card')).toBeInTheDocument();
    expect(screen.getByTestId('report-table')).toBeInTheDocument();
  });

  it('renders alert component', () => {
    render(<ExportReport />);
    expect(screen.getByTestId('filters-card')).toBeInTheDocument();
  });
});
