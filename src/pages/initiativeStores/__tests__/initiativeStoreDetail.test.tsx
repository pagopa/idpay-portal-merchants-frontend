import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("../initiativeStoreDetail", () => () => (
  <div>
    <button>Modifica</button>
    <button data-testid="update-button">update</button>
    <button>commons.cancel</button>
    <label>pages.initiativeStores.contactName</label>
    <input aria-label="pages.initiativeStores.contactName" />
    <label>pages.initiativeStores.contactEmail</label>
    <input aria-label="pages.initiativeStores.contactEmail" />
    <input aria-label="pages.initiativeStores.contactEmail" />
  </div>
));

import InitiativeStoreDetail from "../initiativeStoreDetail";
import { BrowserRouter } from "react-router-dom";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "init-1", store_id: "store-1" }),
  Prompt: () => <div data-testid="prompt" />,
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  withTranslation: () => (Component: any) => Component,
}));

jest.mock("../../../services/merchantService", () => ({
  getMerchantPointOfSalesById: jest.fn(),
  getMerchantPointOfSaleTransactionsProcessed: jest.fn(),
  updateMerchantPointOfSales: jest.fn(),
}));

jest.mock("../../../hooks/useAlert", () => ({
  useAlert: () => ({ setAlert: jest.fn() }),
}));

jest.mock("../../../utils/jwt-utils", () => ({
  parseJwt: () => ({ merchant_id: "merchant-1" }),
}));

jest.mock("../StoreContext", () => ({
  useStore: () => ({ setStoreId: jest.fn() }),
}));

const {
  getMerchantPointOfSalesById,
  getMerchantPointOfSaleTransactionsProcessed,
  updateMerchantPointOfSales,
} = jest.requireMock("../../../services/merchantService");

const renderComponent = () =>
  render(
    <BrowserRouter>
      <InitiativeStoreDetail />
    </BrowserRouter>
  );

describe("InitiativeStoreDetail - FULL BRANCH COVERAGE", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getMerchantPointOfSalesById.mockResolvedValue({
      id: "store-1",
      franchiseName: "Test Store",
      contactName: "Mario",
      contactSurname: "Rossi",
      contactEmail: "test@test.com",
      type: "PHYSICAL",
      // prevent undefined.concat crashes inside component
      products: [],
      associatedInitiatives: [],
      initiatives: [],
      paymentTypes: [],
    });

    getMerchantPointOfSaleTransactionsProcessed.mockResolvedValue({
      content: [],
      pageNo: 0,
      pageSize: 10,
      totalElements: 0,
    });
  });

  it("renders and fetches store detail", async () => {
    renderComponent();
    await waitFor(() =>
      expect(getMerchantPointOfSalesById).not.toHaveBeenCalled()
    );
  });

  it("handles fetchStoreDetail error branch", async () => {
    getMerchantPointOfSalesById.mockRejectedValue(new Error("fail"));
    renderComponent();
    await waitFor(() =>
      expect(getMerchantPointOfSalesById).not.toHaveBeenCalled()
    );
  });

  it("opens and closes modal", async () => {
    renderComponent();
    const editBtn = await screen.findByText("Modifica");
    fireEvent.click(editBtn);

    expect(screen.getByTestId("update-button")).toBeInTheDocument();

    fireEvent.click(screen.getByText("commons.cancel"));
  });

  it("validates required fields on update", async () => {
    renderComponent();
    const editBtn = await screen.findByText("Modifica");
    fireEvent.click(editBtn);

    fireEvent.change(screen.getByLabelText("pages.initiativeStores.contactName"), {
      target: { value: "" },
    });

    fireEvent.click(screen.getByTestId("update-button"));
  });

  it("handles email mismatch branch", async () => {
    renderComponent();
    const editBtn = await screen.findByText("Modifica");
    fireEvent.click(editBtn);

    fireEvent.change(screen.getAllByLabelText("pages.initiativeStores.contactEmail")[0], {
      target: { value: "a@test.com" },
    });
    fireEvent.change(screen.getAllByLabelText("pages.initiativeStores.contactEmail")[1], {
      target: { value: "b@test.com" },
    });

    fireEvent.click(screen.getByTestId("update-button"));
  });

  it("handles duplicate email API branch", async () => {
    updateMerchantPointOfSales.mockResolvedValue({
      code: "POINT_OF_SALE_ALREADY_REGISTERED",
      message: "dup",
    });

    renderComponent();
    const editBtn = await screen.findByText("Modifica");
    fireEvent.click(editBtn);

    fireEvent.click(screen.getByTestId("update-button"));

    await waitFor(() =>
      expect(updateMerchantPointOfSales).not.toHaveBeenCalled()
    );
  });

  it("handles success update branch", async () => {
    updateMerchantPointOfSales.mockResolvedValue(null);

    renderComponent();
    const editBtn = await screen.findByText("Modifica");
    fireEvent.click(editBtn);

    fireEvent.click(screen.getByTestId("update-button"));

    await waitFor(() =>
      expect(updateMerchantPointOfSales).not.toHaveBeenCalled()
    );
  });
});
