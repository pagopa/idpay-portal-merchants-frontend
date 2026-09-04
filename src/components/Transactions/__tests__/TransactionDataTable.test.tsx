import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionDataTable, { DataTableProps } from '../TransactionDataTable';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';

const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (elt: Element, pseudoElt?: string | null) => {
  try {
    return originalGetComputedStyle(elt, pseudoElt);
  } catch {
    return {
      getPropertyValue: () => '',
      display: '',
      visibility: '',
    } as any;
  }
};

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverMock,
});

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
    sortModel: [{ field: 'name', sort: 'asc' }],
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

  it('calls handleRowAction when action button is clicked', () => {
    const propsWithActions: DataTableProps = {
      ...baseProps,
      columns: [
        ...baseProps.columns,
        {
          field: 'actions',
          headerName: 'Actions',
          renderCell: (params: any) => (
            <button 
              onClick={() => baseProps.handleRowAction(params.row)} 
              data-testid="action-btn"
            >
              Action
            </button>
          ),
        },
      ],
    };
    render(<TransactionDataTable {...propsWithActions} />);
    const buttons = screen.getAllByTestId('action-btn');
    fireEvent.click(buttons[1]);
    expect(mockHandleRowAction).toHaveBeenCalledWith({ id: 2, name: '' });
  });

  it('calls onPaginationPageChange when page changes', () => {
    const paginatedProps: DataTableProps = {
      ...baseProps,
      rowsPerPage: 1,
      pageSize: 1,
      paginationModel: { pageNo: 0, pageSize: 1, totalElements: 2 },
    };
    render(<TransactionDataTable {...paginatedProps} />);
    const nextPageButton = screen.getByRole('button', { name: /go to next page|pagina successiva/i });
    fireEvent.click(nextPageButton);
    expect(mockOnPaginationPageChange).toHaveBeenCalled();
  });

  it('calls onSortModelChange when sorting changes', () => {
    render(<TransactionDataTable {...baseProps} />);
    const header = screen.getByRole('columnheader', { name: /ID/i });
    fireEvent.click(header);
    expect(mockOnSortModelChange).toHaveBeenCalled();
  });
});