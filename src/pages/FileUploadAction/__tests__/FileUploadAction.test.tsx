import { render, screen, fireEvent, waitFor } from "@testing-library/react";

Object.defineProperty(global, "crypto", {
  value: {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = i;
      }
      return arr;
    },
  },
});
import FileUploadAction from "../FileUploadAction";
import { BrowserRouter } from "react-router-dom";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    pointOfSaleId: "pos-1",
    trxId: "trx-1",
    fileDocNumber: btoa("INV123"),
  }),
  useHistory: () => ({
    goBack: jest.fn(),
    replace: jest.fn(),
    location: {},
  }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  withTranslation: () => (Component: any) => Component,
}));

jest.mock("../../../hooks/useAlert", () => ({
  useAlert: () => ({
    setAlert: jest.fn(),
  }),
}));

const mockApiCall = jest.fn();

const renderComponent = (props?: any) =>
  render(
    <BrowserRouter>
      <FileUploadAction
        apiCall={mockApiCall}
        breadcrumbsProp={{ label: "label", path: "/path" }}
        manualLink="http://manual"
        {...props}
      />
    </BrowserRouter>
  );

describe("FileUploadAction - FULL BRANCH COVERAGE", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("covers fileDocNumber decode success branch", () => {
    renderComponent();
    expect(screen.getByDisplayValue("INV123")).toBeInTheDocument();
  });

  it("covers invalid base64 fallback branch", () => {
    jest.spyOn(window, "atob").mockImplementation(() => {
      throw new Error("invalid");
    });

    renderComponent();

    expect(screen.getByDisplayValue("SU5WMTIz")).toBeInTheDocument();
  });

  it("shows required file error when no file", async () => {
    renderComponent();
    fireEvent.click(screen.getByText("commons.continueBtn"));
    expect(
      await screen.findByText("modifyDocument.errors.requiredFileError")
    ).toBeInTheDocument();
  });

  it("shows docNumber validation branch", async () => {
    renderComponent();

    const input = screen.getByLabelText("modifyDocument.invoiceLabel");
    fireEvent.change(input, { target: { value: "A" } });

    fireEvent.click(screen.getByText("commons.continueBtn"));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("covers invalid MIME branch", async () => {
    renderComponent();

    const file = new File(["content"], "file.txt", { type: "text/plain" });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const fileList = {
      0: file,
      length: 1,
      item: () => file,
    };
    Object.defineProperty(fileInput, "files", { value: fileList });
    fireEvent.change(fileInput);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("covers file size error branch", async () => {
    renderComponent();

    const bigFile = new File(["a".repeat(25 * 1024 * 1024)], "big.pdf", {
      type: "application/pdf",
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const fileList = {
      0: bigFile,
      length: 1,
      item: () => bigFile,
    };
    Object.defineProperty(fileInput, "files", { value: fileList });
    fireEvent.change(fileInput);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("covers successful API call branch", async () => {
    mockApiCall.mockResolvedValue({});

    renderComponent();

    const validFile = new File(["pdf"], "doc.pdf", {
      type: "application/pdf",
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const fileList = {
      0: validFile,
      length: 1,
      item: () => validFile,
    };
    Object.defineProperty(fileInput, "files", { value: fileList });
    fireEvent.change(fileInput);

    const docInput = screen.getByLabelText("modifyDocument.invoiceLabel");
    fireEvent.change(docInput, { target: { value: "INV123" } });

    fireEvent.click(screen.getByText("commons.continueBtn"));

    await waitFor(() => expect(mockApiCall).toHaveBeenCalled());
  });

  it("covers REWARD_BATCH_STATUS_NOT_ALLOWED error branch", async () => {
    mockApiCall.mockRejectedValue({
      response: { data: { code: "REWARD_BATCH_STATUS_NOT_ALLOWED" } },
    });

    renderComponent();

    const validFile = new File(["pdf"], "doc.pdf", {
      type: "application/pdf",
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const fileList = {
      0: validFile,
      length: 1,
      item: () => validFile,
    };
    Object.defineProperty(fileInput, "files", { value: fileList });
    fireEvent.change(fileInput);

    const docInput = screen.getByLabelText("modifyDocument.invoiceLabel");
    fireEvent.change(docInput, { target: { value: "INV123" } });

    fireEvent.click(screen.getByText("commons.continueBtn"));

    await waitFor(() => expect(mockApiCall).toHaveBeenCalled());
  });

  it("covers REWARD_BATCH_ALREADY_SENT error branch", async () => {
    mockApiCall.mockRejectedValue({
      response: { data: { code: "REWARD_BATCH_ALREADY_SENT" } },
    });

    renderComponent();

    const validFile = new File(["pdf"], "doc.pdf", {
      type: "application/pdf",
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const fileList = {
      0: validFile,
      length: 1,
      item: () => validFile,
    };
    Object.defineProperty(fileInput, "files", { value: fileList });
    fireEvent.change(fileInput);

    const docInput = screen.getByLabelText("modifyDocument.invoiceLabel");
    fireEvent.change(docInput, { target: { value: "INV123" } });

    fireEvent.click(screen.getByText("commons.continueBtn"));

    await waitFor(() => expect(mockApiCall).toHaveBeenCalled());
  });

  it("covers default API error branch", async () => {
    mockApiCall.mockRejectedValue(new Error("generic"));

    renderComponent();

    const validFile = new File(["pdf"], "doc.pdf", {
      type: "application/pdf",
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const fileList = {
      0: validFile,
      length: 1,
      item: () => validFile,
    };
    Object.defineProperty(fileInput, "files", { value: fileList });
    fireEvent.change(fileInput);

    const docInput = screen.getByLabelText("modifyDocument.invoiceLabel");
    fireEvent.change(docInput, { target: { value: "INV123" } });

    fireEvent.click(screen.getByText("commons.continueBtn"));

    await waitFor(() => expect(mockApiCall).toHaveBeenCalled());
  });
});
