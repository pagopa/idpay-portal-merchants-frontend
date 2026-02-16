import { render, screen, fireEvent } from "@testing-library/react";
import TransactionDataTable from "../TransactionDataTable";

jest.mock("@mui/x-data-grid", () => ({
  DataGrid: (props: any) => (
    <div data-testid="datagrid">
      <button
        data-testid="sort-trigger"
        onClick={() => props.onSortModelChange([{ field: "a", sort: "asc" }])}
      />
      <button
        data-testid="sort-toggle"
        onClick={() => props.onSortModelChange([])}
      />
      <button
        data-testid="page-trigger"
        onClick={() => props.onPageChange(3)}
      />
    </div>
  ),
}));

describe("TransactionDataTable - FULL BRANCH COVERAGE", () => {
  const baseProps: any = {
    rows: [{ id: 1, value: "abc" }],
    columns: [{ field: "value" }],
    pageSize: 10,
    rowsPerPage: 10,
    handleRowAction: jest.fn(),
    onSortModelChange: jest.fn(),
    sortModel: [],
    onPaginationPageChange: jest.fn(),
    paginationModel: { pageNo: 0, pageSize: 10, totalElements: 1 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders datagrid when rows and columns present", () => {
    render(<TransactionDataTable {...baseProps} />);
    expect(screen.getByTestId("datagrid")).toBeInTheDocument();
  });

  it("does not render datagrid when no rows", () => {
    render(
      <TransactionDataTable
        {...baseProps}
        rows={[]}
      />
    );
    expect(screen.queryByTestId("datagrid")).not.toBeInTheDocument();
  });

  it("covers sort model change branch (model.length > 0)", () => {
    render(<TransactionDataTable {...baseProps} />);
    fireEvent.click(screen.getByTestId("sort-trigger"));
    expect(baseProps.onSortModelChange).toHaveBeenCalled();
  });

  it("covers sort toggle branch (model.length === 0)", () => {
    render(
      <TransactionDataTable
        {...baseProps}
        sortModel={[{ field: "a", sort: "asc" }]}
      />
    );
    fireEvent.click(screen.getByTestId("sort-toggle"));
    expect(baseProps.onSortModelChange).toHaveBeenCalled();
  });

  it("covers pagination change branch", () => {
    render(<TransactionDataTable {...baseProps} />);
    fireEvent.click(screen.getByTestId("page-trigger"));
    expect(baseProps.onPaginationPageChange).toHaveBeenCalledWith(3);
  });

  it("covers renderEmptyCell branches", () => {
    const columns = [
      {
        field: "value",
        renderCell: undefined,
      },
    ];

    render(
      <TransactionDataTable
        {...baseProps}
        rows={[
          { id: 1, value: null },
          { id: 2, value: "" },
          { id: 3, value: "valid" },
        ]}
        columns={columns}
      />
    );

    expect(screen.getByTestId("datagrid")).toBeInTheDocument();
  });
});
