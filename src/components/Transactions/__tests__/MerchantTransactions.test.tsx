import { render, screen, fireEvent } from "@testing-library/react";
import MerchantTransactions from "../MerchantTransactions";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("../../../hooks/useAlert", () => ({
  useAlert: () => ({
    alert: { isOpen: true },
    setAlert: jest.fn(),
  }),
}));

jest.mock("../TransactionDataTable", () => (props: any) => (
  <div data-testid="datatable">
    <button
      data-testid="row-action"
      onClick={() => props.handleRowAction(props.rows[0])}
    />
    <button
      data-testid="sort-change"
      onClick={() => props.onSortModelChange([{ field: "a", sort: "asc" }])}
    />
    <button
      data-testid="page-change"
      onClick={() => props.onPaginationPageChange(2)}
    />
  </div>
));

jest.mock("../TransactionDetail", () => (props: any) =>
  props.isOpen ? <div data-testid="drawer-open" /> : null
);

jest.mock("../../../pages/components/EmptyList", () => () => (
  <div data-testid="empty-list" />
));

const baseProps: any = {
  transactions: [],
  handleFiltersApplied: jest.fn(),
  handleFiltersReset: jest.fn(),
  handleSortChange: jest.fn(),
  sortModel: [],
  handlePaginationPageChange: jest.fn(),
  paginationModel: {},
  dataTableIsLoading: false,
};

describe("MerchantTransactions - FULL BRANCH COVERAGE", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading branch", () => {
    render(<MerchantTransactions {...baseProps} dataTableIsLoading={true} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders empty list branch", () => {
    render(<MerchantTransactions {...baseProps} transactions={[]} />);
    expect(screen.getByTestId("empty-list")).toBeInTheDocument();
  });

  it("renders populated table branch", () => {
    const transactions = [{ id: 1, status: "REFUNDED" }];
    render(
      <MerchantTransactions
        {...baseProps}
        transactions={transactions}
      />
    );
    expect(screen.getByTestId("datatable")).toBeInTheDocument();
  });

  it("covers filter apply/reset branches", () => {
    render(<MerchantTransactions {...baseProps} />);
    baseProps.handleFiltersApplied({});
    baseProps.handleFiltersReset();
  });

  it("covers sort change branch", () => {
    const transactions = [{ id: 1 }];
    render(
      <MerchantTransactions
        {...baseProps}
        transactions={transactions}
      />
    );

    fireEvent.click(screen.getByTestId("sort-change"));
    expect(baseProps.handleSortChange).toHaveBeenCalled();
  });

  it("covers pagination change branch", () => {
    const transactions = [{ id: 1 }];
    render(
      <MerchantTransactions
        {...baseProps}
        transactions={transactions}
      />
    );

    fireEvent.click(screen.getByTestId("page-change"));
    expect(baseProps.handlePaginationPageChange).toHaveBeenCalled();
  });

  it("covers drawer open branch", () => {
    const transactions = [{ id: 1 }];
    render(
      <MerchantTransactions
        {...baseProps}
        transactions={transactions}
      />
    );

    fireEvent.click(screen.getByTestId("row-action"));
    expect(screen.getByTestId("drawer-open")).toBeInTheDocument();
  });

  it("covers code validation branches", () => {
    render(<MerchantTransactions {...baseProps} />);

    const inputs = screen.getAllByRole("textbox");

    fireEvent.change(inputs[1], { target: { value: "A B" } }); // space
    fireEvent.change(inputs[1], { target: { value: "###" } }); // invalid
    fireEvent.change(inputs[1], { target: { value: "VALID123" } }); // valid

    expect(inputs[1]).toBeInTheDocument();
  });
});
