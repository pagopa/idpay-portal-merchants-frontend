import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import DataTable, { DataTableProps } from '../DataTable';
import { GridSortModel } from '@mui/x-data-grid';
import { ELEMENT_PER_PAGE } from '../../../utils/constants';

const mockDataGrid = jest.fn();

jest.mock('@mui/x-data-grid', () => ({
  DataGrid: (props: any) => {
    mockDataGrid(props);
    return (
      <div data-testid="mock-data-grid">
        <div data-testid="rows-per-page-options">
          {JSON.stringify(props.rowsPerPageOptions)}
        </div>
        <div data-testid="selection-model">
          {JSON.stringify(props.selectionModel ?? null)}
        </div>
        <div data-testid="disable-multiple-selection">
          {String(props.disableMultipleSelection)}
        </div>
        <div data-testid="checkbox-selection">{String(props.checkboxSelection)}</div>
        <button onClick={() => props.onSortModelChange?.([{ field: 'name', sort: 'asc' }])}>
          sort
        </button>
        <button onClick={() => props.onPageChange?.(2)}>page</button>
        <button onClick={() => props.onPageSizeChange?.(25)}>page-size</button>
        <button onClick={() => props.onSelectionModelChange?.([1])}>selection</button>
        <div data-testid="displayed-rows">
          {props.localeText.MuiTablePagination.labelDisplayedRows({
            from: 1,
            to: 2,
            count: 10,
            page: 0,
          })}
        </div>
      </div>
    );
  },
}));

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders DataGrid when rows and columns are provided', () => {
    render(<DataTable {...baseProps} />);

    expect(screen.getByTestId('mock-data-grid')).toBeInTheDocument();
    expect(mockDataGrid).toHaveBeenCalledWith(
      expect.objectContaining({
        rows: baseProps.rows,
        columns: baseProps.columns,
        page: 0,
        pageSize: 10,
        rowCount: 2,
      })
    );
  });

  it('does not render the grid when there are no rows', () => {
    render(<DataTable {...baseProps} rows={[]} />);

    expect(screen.queryByTestId('mock-data-grid')).not.toBeInTheDocument();
  });

  it('does not render the grid when there are no columns', () => {
    render(<DataTable {...baseProps} columns={[]} />);

    expect(screen.queryByTestId('mock-data-grid')).not.toBeInTheDocument();
  });

  it('calls onSortModelChange when sorting changes', () => {
    const onSortModelChange = jest.fn();

    render(<DataTable {...baseProps} onSortModelChange={onSortModelChange} />);

    fireEvent.click(screen.getByText('sort'));

    expect(onSortModelChange).toHaveBeenCalledWith([
      { field: 'name', sort: 'asc' },
    ] as GridSortModel);
  });

  it('calls onPaginationPageChange when page changes', () => {
    const onPaginationPageChange = jest.fn();

    render(<DataTable {...baseProps} onPaginationPageChange={onPaginationPageChange} />);

    fireEvent.click(screen.getByText('page'));

    expect(onPaginationPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onRowsPerPageChange when page size changes', () => {
    const onRowsPerPageChange = jest.fn();

    render(<DataTable {...baseProps} onRowsPerPageChange={onRowsPerPageChange} />);

    fireEvent.click(screen.getByText('page-size'));

    expect(onRowsPerPageChange).toHaveBeenCalledWith(25);
  });

  it('uses transaction page size options by default for transaction pages', () => {
    render(<DataTable {...baseProps} isTransactionsPage={true} />);

    expect(screen.getByTestId('rows-per-page-options')).toHaveTextContent(
      JSON.stringify(ELEMENT_PER_PAGE)
    );
  });

  it('uses rowsPerPage as default rowsPerPageOptions when not a transaction page', () => {
    render(<DataTable {...baseProps} />);

    expect(screen.getByTestId('rows-per-page-options')).toHaveTextContent('[10]');
  });

  it('uses explicit rowsPerPageOptions when provided', () => {
    render(<DataTable {...baseProps} rowsPerPageOptions={[5, 10, 20]} />);

    expect(screen.getByTestId('rows-per-page-options')).toHaveTextContent('[5,10,20]');
  });

  it('passes single selection props and selection callback', () => {
    const onSelectionModelChange = jest.fn();

    render(
      <DataTable
        {...baseProps}
        checkable={true}
        singleSelect={true}
        singleSelectionModel={[2]}
        onSelectionModelChange={onSelectionModelChange}
      />
    );

    expect(screen.getByTestId('checkbox-selection')).toHaveTextContent('true');
    expect(screen.getByTestId('disable-multiple-selection')).toHaveTextContent('true');
    expect(screen.getByTestId('selection-model')).toHaveTextContent('[2]');

    fireEvent.click(screen.getByText('selection'));

    expect(onSelectionModelChange).toHaveBeenCalledWith([1]);
  });

  it('formats pagination labels through localeText', () => {
    render(<DataTable {...baseProps} />);

    expect(screen.getByTestId('displayed-rows')).toHaveTextContent('1-2 di 10');
  });
});
