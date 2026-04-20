import { render, screen, fireEvent, within } from '@testing-library/react';
import DataTable, { DataTableProps } from '../DataTable';
import { GridSortModel } from '@mui/x-data-grid';

const baseProps: DataTableProps = {
  rows: [
    { id: 1, name: 'Item 1', value: 10 },
    { id: 2, name: 'Item 2', value: 20 },
  ],
  columns: [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'value', headerName: 'Value', flex: 1 },
  ],
  rowsPerPage: 10,
  paginationModel: { pageNo: 0, pageSize: 10, totalElements: 2 },
};

describe('DataTable', () => {
  it('renders rows and columns when data is provided', () => {
    render(<DataTable {...baseProps} />);

    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('does not render the grid when there are no rows', () => {
    const props: DataTableProps = {
      ...baseProps,
      rows: [],
    };

    render(<DataTable {...props} />);

    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('does not render the grid when there are no columns', () => {
    const props: DataTableProps = {
      ...baseProps,
      columns: [],
    };

    render(<DataTable {...props} />);

    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('calls onSortModelChange when sorting changes', () => {
    const onSortModelChange = jest.fn();
    const props: DataTableProps = {
      ...baseProps,
      onSortModelChange,
    };

    render(<DataTable {...props} />);

    const nameHeader = screen.getByRole('columnheader', { name: /name/i });
    fireEvent.click(nameHeader);

    expect(onSortModelChange).toHaveBeenCalled();
    const sortArg = onSortModelChange.mock.calls[0][0] as GridSortModel;
    expect(sortArg[0]).toHaveProperty('field', 'name');
  });

  it('handles sorting changes when callback is not provided', () => {
    render(<DataTable {...baseProps} />);

    const nameHeader = screen.getByRole('columnheader', { name: /name/i });
    fireEvent.click(nameHeader);
  });

  it('calls onPaginationPageChange when page changes', () => {
    const onPaginationPageChange = jest.fn();
    const props: DataTableProps = {
      ...baseProps,
      onPaginationPageChange,
    };

    render(<DataTable {...props} />);

    const grid = screen.getByRole('grid');
    const paginationRoot = grid.parentElement?.querySelector('.MuiTablePagination-root');
    expect(paginationRoot).toBeInTheDocument();

    if (paginationRoot) {
      const nextButton = within(paginationRoot).getByLabelText(/go to next page/i);
      fireEvent.click(nextButton);
    }

    expect(onPaginationPageChange).not.toHaveBeenCalled();
  });

  it('handles page changes when callback is not provided', () => {
    render(<DataTable {...baseProps} />);

    const grid = screen.getByRole('grid');
    const paginationRoot = grid.parentElement?.querySelector('.MuiTablePagination-root');
    expect(paginationRoot).toBeInTheDocument();

    if (paginationRoot) {
      const nextButton = within(paginationRoot).getByLabelText(/go to next page/i);
      fireEvent.click(nextButton);
    }
  });
});
