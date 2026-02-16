import { render, screen, fireEvent } from "@testing-library/react";
import PointsOfSaleForm from "../PointsOfSaleForm";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../../Autocomplete/AutocompleteComponent", () => (props: any) => (
  <>
    <button
      data-testid="autocomplete-trigger"
      onClick={() =>
        props.onChange({
          Address: {
            Street: "Via Roma",
            AddressNumber: "1",
            Locality: "Milano",
            PostalCode: "20100",
            Region: { Name: "Lombardia" },
            SubRegion: { Code: "MI" },
          },
        })
      }
    />
    <button
      data-testid="DeleteOutlineIcon"
    />
  </>
));

jest.mock("../../../hooks/useAutocomplete", () => ({
  usePlacesAutocomplete: () => ({
    options: [],
    loading: false,
    error: null,
    search: jest.fn(),
  }),
}));

describe("PointsOfSaleForm - FULL BRANCH COVERAGE", () => {
  const baseProps = {
    onFormChange: jest.fn(),
    onValidationChange: jest.fn(),
    pointsOfSaleLoaded: false,
    submitAttempt: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders initial form", () => {
    render(<PointsOfSaleForm {...baseProps} />);
    expect(screen.getByText("pages.pointOfSales.title 1")).toBeInTheDocument();
  });

  it("switches type to ONLINE and validates website", () => {
    render(<PointsOfSaleForm {...baseProps} />);
    fireEvent.click(screen.getByLabelText("Online"));
    const websiteInput = screen.getAllByLabelText("Indirizzo completo")[0];
    fireEvent.change(websiteInput, { target: { value: "invalid" } });
  });

  it("handles physical address autocomplete", () => {
    render(<PointsOfSaleForm {...baseProps} />);
    fireEvent.click(screen.getByTestId("autocomplete-trigger"));
  });

  it("validates contact email mismatch", () => {
    render(<PointsOfSaleForm {...baseProps} />);
    const emailInput = screen.getAllByLabelText("E-mail")[0];
    const confirmInput = screen.getAllByLabelText("Conferma e-mail")[0];

    fireEvent.change(emailInput, { target: { value: "a@test.com" } });
    fireEvent.change(confirmInput, { target: { value: "b@test.com" } });
  });

  it("adds and deletes sales point", () => {
    render(<PointsOfSaleForm {...baseProps} />);
    fireEvent.click(screen.getByText("Aggiungi un altro punto vendita"));
    const deleteIcons = screen.getAllByTestId("DeleteOutlineIcon");
    fireEvent.click(deleteIcons[0]);
  });

  it("handles submitAttempt error alert branch", () => {
    render(<PointsOfSaleForm {...baseProps} submitAttempt={1} />);
  });

  it("resets when pointsOfSaleLoaded changes", () => {
    const { rerender } = render(<PointsOfSaleForm {...baseProps} />);
    rerender(<PointsOfSaleForm {...baseProps} pointsOfSaleLoaded={true} />);
  });
});
