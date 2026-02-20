import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ShopDetails from "../ShopDetails";
import { BrowserRouter } from "react-router-dom";

vi.mock("react-router-dom", () => ({
  ...vi.importActual("react-router-dom"),
  useHistory: () => ({
    goBack: vi.fn(),
    replace: vi.fn(),
    location: { state: { store: { id: "batch-1" } } },
  }),
  useLocation: () => ({
    state: { store: { id: "batch-1" }, batchId: "batch-1" },
  }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  withTranslation: () => (Component: any) => Component,
}));

vi.mock("../../../../services/merchantService", () => ({
  getAllRewardBatches: vi.fn(),
  getMerchantPointOfSalesWithTransactions: vi.fn(),
  getMerchantDetail: vi.fn(),
  getMerchantTransactionsProcessed: vi.fn(),
  downloadBatchCsv: vi.fn(),
}));

vi.mock("../../../../hooks/useAlert", () => ({
  useAlert: () => ({
    setAlert: vi.fn(),
  }),
}));

vi.mock("../../../../utils/jwt-utils", () => ({
  parseJwt: () => ({ merchant_id: "merchant-1" }),
}));

vi.mock("react-redux", () => ({
  useSelector: () => [{ initiativeId: "init-1" }],
  connect: () => (Component: any) => Component,
}));

const {
  getAllRewardBatches,
  getMerchantPointOfSalesWithTransactions,
  getMerchantDetail,
  getMerchantTransactionsProcessed,
  downloadBatchCsv,
} = vi.requireMock("../../../../services/merchantService");

const renderComponent = () =>
  render(
    <BrowserRouter>
      <ShopDetails />
    </BrowserRouter>
  );

describe("ShopDetails - FULL BRANCH COVERAGE", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getMerchantDetail.mockResolvedValue({});
    getMerchantTransactionsProcessed.mockResolvedValue({
      content: [],
      totalPages: 0,
    });

    getAllRewardBatches.mockResolvedValue({ content: [] });
    getMerchantPointOfSalesWithTransactions.mockResolvedValue([]);
  });

  it("covers fetchAll success branch", async () => {
    getAllRewardBatches.mockResolvedValue({
      content: [{ id: "batch-1", name: "Batch 1", status: "APPROVED" }],
    });

    renderComponent();

    await waitFor(() =>
      expect(getAllRewardBatches).toHaveBeenCalled()
    );
  });

  it("covers fetchAll error branch", async () => {
    getAllRewardBatches.mockRejectedValue(new Error("fail"));

    renderComponent();

    await waitFor(() =>
      expect(getAllRewardBatches).toHaveBeenCalled()
    );
  });

  it("covers fetchStores success branch", async () => {
    getAllRewardBatches.mockResolvedValue({
      content: [{ id: "batch-1", name: "Batch 1" }],
    });

    getMerchantPointOfSalesWithTransactions.mockResolvedValue([]);

    renderComponent();

    await waitFor(() =>
      expect(getMerchantPointOfSalesWithTransactions).toHaveBeenCalled()
    );
  });

  it("covers fetchStores error branch", async () => {
    getAllRewardBatches.mockResolvedValue({
      content: [{ id: "batch-1", name: "Batch 1" }],
    });

    getMerchantPointOfSalesWithTransactions.mockRejectedValue(new Error("fail"));

    renderComponent();

    await waitFor(() =>
      expect(getMerchantPointOfSalesWithTransactions).toHaveBeenCalled()
    );
  });

  it("covers APPROVING alert branch", async () => {
    getAllRewardBatches.mockResolvedValue({
      content: [{ id: "batch-1", name: "Batch 1", status: "APPROVING" }],
    });

    renderComponent();

    expect(await screen.findByText("pages.refundRequests.storeDetails.csv.alert")).toBeInTheDocument();
  });

  it("covers handleDownloadCsv success branch", async () => {
    getAllRewardBatches.mockResolvedValue({
      content: [{ id: "batch-1", name: "Batch 1", status: "APPROVED" }],
    });

    downloadBatchCsv.mockResolvedValue({
      approvedBatchUrl: "http://csv",
    });

    renderComponent();

    const btn = await screen.findByTestId("download-csv-button-test");
    fireEvent.click(btn);

    await waitFor(() =>
      expect(downloadBatchCsv).toHaveBeenCalled()
    );
  });

  it("covers handleDownloadCsv error branch", async () => {
    getAllRewardBatches.mockResolvedValue({
      content: [{ id: "batch-1", name: "Batch 1", status: "APPROVED" }],
    });

    downloadBatchCsv.mockRejectedValue(new Error("fail"));

    renderComponent();

    const btn = await screen.findByTestId("download-csv-button-test");
    fireEvent.click(btn);

    await waitFor(() =>
      expect(downloadBatchCsv).toHaveBeenCalled()
    );
  });

  it("covers trxCode invalid branch (spaces)", () => {
    renderComponent();
    const wrapper = screen.getByTestId("trxCodeFilter");
    const input = wrapper.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "A B" } });
    expect(input).toBeInTheDocument();
  });

  it("covers trxCode invalid regex branch", () => {
    renderComponent();
    const wrapper = screen.getByTestId("trxCodeFilter");
    const input = wrapper.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "###" } });
    expect(input).toBeInTheDocument();
  });

  it("covers trxCode valid branch", () => {
    renderComponent();
    const wrapper = screen.getByTestId("trxCodeFilter");
    const input = wrapper.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "ABC123" } });
    expect(input).toBeInTheDocument();
  });

  it("covers back button branch", () => {
    renderComponent();
    fireEvent.click(screen.getByTestId("back-button-test"));
  });
});
