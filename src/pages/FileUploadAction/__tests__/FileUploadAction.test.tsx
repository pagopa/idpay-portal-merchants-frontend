import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FileUploadAction from "../FileUploadAction";

const mockGoBack = jest.fn();
const mockReplace = jest.fn();

jest.mock("react-router-dom", () => ({
  useParams: () => ({
    pointOfSaleId: "pos1",
    trxId: "trx1",
    fileDocNumber: undefined,
  }),
  useHistory: () => ({
    goBack: mockGoBack,
    replace: mockReplace,
    location: { state: {} },
  }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

jest.mock("@pagopa/selfcare-common-frontend", () => ({
  TitleBox: ({ title }: any) => <div>{title}</div>,
}));

jest.mock("@pagopa/mui-italia", () => ({
  SingleFileInput: ({ onFileSelected }: any) => (
    <button
      data-testid="mock-file-input"
      onClick={() =>
        onFileSelected(
          new File(["test"], "test.pdf", { type: "application/pdf" })
        )
      }
    >
      Upload
    </button>
  ),
  ButtonNaked: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  theme: {
    palette: { background: { paper: "#fff" } },
    typography: { fontWeightBold: 700, fontWeightMedium: 500 },
  },
}));

const mockSetAlert = jest.fn();

jest.mock("../../../hooks/useAlert", () => ({
  useAlert: () => ({
    setAlert: mockSetAlert,
  }),
}));

describe("FileUploadAction", () => {
  const baseProps = {
    apiCall: jest.fn().mockResolvedValue({}),
    successStateKey: "refundUploadSuccess",
    breadcrumbsProp: { label: "Test", path: "/test" },
    manualLink: "http://manual",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.open = jest.fn();
  });

  it("renders and navigates back", () => {
    render(<FileUploadAction {...baseProps} />);
    fireEvent.click(screen.getByText("commons.backBtn"));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it("shows required file error", async () => {
    render(<FileUploadAction {...baseProps} />);
    fireEvent.click(screen.getByText("commons.continueBtn"));
    expect(
      screen.getByText("modifyDocument.errors.requiredFileError")
    ).toBeInTheDocument();
  });

  it("validates doc number length", async () => {
    render(<FileUploadAction {...baseProps} />);
    fireEvent.click(screen.getByTestId("mock-file-input"));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "A" },
    });
    fireEvent.click(screen.getByText("commons.continueBtn"));
    expect(screen.getByText("Lunghezza minima 2 caratteri")).toBeInTheDocument();
  });

  it("calls api successfully", async () => {
    const apiCall = jest.fn().mockResolvedValue({});
    render(<FileUploadAction {...baseProps} apiCall={apiCall} />);
    fireEvent.click(screen.getByTestId("mock-file-input"));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "ABC" },
    });
    fireEvent.click(screen.getByText("commons.continueBtn"));

    await waitFor(() => {
      expect(apiCall).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalled();
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it("handles API specific error code", async () => {
    const apiCall = jest.fn().mockRejectedValue({
      response: { data: { code: "REWARD_BATCH_ALREADY_SENT" } },
    });

    render(<FileUploadAction {...baseProps} apiCall={apiCall} />);
    fireEvent.click(screen.getByTestId("mock-file-input"));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "ABC" },
    });
    fireEvent.click(screen.getByText("commons.continueBtn"));

    await waitFor(() => {
      expect(
        screen.getAllByText("modifyDocument.invoiceLabel")[0]
      ).toBeInTheDocument();
    });
  });

  it("opens manual link", () => {
    render(<FileUploadAction {...baseProps} />);
    fireEvent.click(screen.getByText("modifyDocument.manualLink"));
    expect(window.open).toHaveBeenCalledWith("http://manual", "_blank");
  });
});
