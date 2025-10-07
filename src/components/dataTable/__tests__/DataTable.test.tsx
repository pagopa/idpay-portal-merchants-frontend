import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import DataTable, { DataTableProps } from '../DataTable';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';
import { GridSortModel } from '@mui/x-data-grid';

describe('DataTable - advanced', () => {
  const mockHandleRowAction = jest.fn();
  const mockOnSortModelChange = jest.fn();
  const mockOnPaginationPageChange = jest.fn();

  const defaultProps: DataTableProps = {
    rows: [
      { id: 1, name: 'Item 1', value: null },
      { id: 2, name: 'Item 2', value: 50 },
    ],
    columns: [
      { field: 'name', headerName: 'Name', flex: 1 },
      { field: 'value', headerName: 'Value', flex: 1 },
    ],
    pageSize: 1,
    rowsPerPage: 1,
    handleRowAction: mockHandleRowAction,
    onSortModelChange: mockOnSortModelChange,
    onPaginationPageChange: mockOnPaginationPageChange,
    paginationModel: { pageNo: 0, pageSize: 1, totalElements: 2 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders rows and columns correctly', () => {
    render(<DataTable {...defaultProps} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders placeholder for null/undefined values', () => {
    render(<DataTable {...defaultProps} />);
    expect(screen.getByText(MISSING_DATA_PLACEHOLDER)).toBeInTheDocument();
  });

  it('calls handleRowAction when clicking action button', () => {
    render(<DataTable {...defaultProps} />);
    const actionButtons = screen.getAllByRole('button');
    fireEvent.click(actionButtons[0]);
    expect(mockHandleRowAction).toHaveBeenCalledWith(defaultProps.rows[0]);
  });

  it('calls onPaginationPageChange when changing page', () => {
    render(<DataTable {...defaultProps} />);
    const pagination = screen
      .getByRole('grid')
      .parentElement?.querySelector('.MuiTablePagination-root');
    expect(pagination).toBeInTheDocument();

    const nextButton = pagination && within(pagination).getByLabelText('Go to next page');
    if (nextButton) fireEvent.click(nextButton);

    expect(mockOnPaginationPageChange).toHaveBeenCalled();
  });

  it('calls onSortModelChange when clicking column header', () => {
    render(<DataTable {...defaultProps} />);
    const nameHeader = screen.getByRole('columnheader', { name: /name/i });
    fireEvent.click(nameHeader);

    expect(mockOnSortModelChange).toHaveBeenCalled();
    const sortArg = mockOnSortModelChange.mock.calls[0][0] as GridSortModel;
    expect(sortArg[0]).toHaveProperty('field', 'name');
  });

  it('auto-adds actions column', () => {
    render(<DataTable {...defaultProps} />);
    const actionButtons = screen.getAllByRole('button');
    expect(actionButtons.length).toBeGreaterThan(0);
  });
});
