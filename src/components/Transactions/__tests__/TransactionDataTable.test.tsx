import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionDataTable, { DataTableProps } from '../TransactionDataTable';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';

describe('TransactionDataTable', () => {
  const mockHandleRowAction = jest.fn();
  const mockOnSortModelChange = jest.fn();
  const mockOnPaginationPageChange = jest.fn();

  const baseProps: DataTableProps = {
    rows: [
      { id: 1, name: 'Test row' },
      { id: 2, name: '' },
    ],
    columns: [
      { field: 'id', headerName: 'ID', flex: 1 },
      { field: 'name', headerName: 'Name', flex: 1 },
    ],
    pageSize: 5,
    rowsPerPage: 5,
    handleRowAction: mockHandleRowAction,
    onSortModelChange: mockOnSortModelChange,
    onPaginationPageChange: mockOnPaginationPageChange,
    paginationModel: { pageNo: 0, pageSize: 5, totalElements: 2 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders rows and columns', () => {
    render(<TransactionDataTable {...baseProps} />);
    expect(screen.getByText('Test row')).toBeInTheDocument();
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('renders placeholder for empty cell', () => {
    render(<TransactionDataTable {...baseProps} />);
    expect(screen.getByText(MISSING_DATA_PLACEHOLDER)).toBeInTheDocument();
  });

  it.skip('calls handleRowAction when action button is clicked', () => {
    render(<TransactionDataTable {...baseProps} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[buttons.length - 1]); // clicca l'IconButton di azione
    expect(mockHandleRowAction).toHaveBeenCalledWith({ id: 2, name: '' });
  });

  it.skip('calls onPaginationPageChange when page changes', () => {
    render(<TransactionDataTable {...baseProps} />);
    fireEvent.click(screen.getByLabelText('Go to next page'));
    expect(mockOnPaginationPageChange).toHaveBeenCalled();
  });

  it('calls onSortModelChange when sorting changes', () => {
    render(<TransactionDataTable {...baseProps} />);
    const header = screen.getByRole('columnheader', { name: 'Name' });
    fireEvent.click(header);
    expect(mockOnSortModelChange).toHaveBeenCalled();
  });
});
