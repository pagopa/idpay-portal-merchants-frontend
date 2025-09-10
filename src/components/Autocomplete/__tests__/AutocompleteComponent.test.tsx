import { render, screen, fireEvent} from '@testing-library/react';
import "@testing-library/jest-dom";
import AutocompleteComponent from "../AutocompleteComponent";


jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === "pages.pointOfSales.noOptionsText") return "Nessuna opzione";
      if (key === "pages.pointOfSales.loadingText") return "Caricamento...";
      return key;
    },
  }),
}));

jest.mock("../../../utils/constants", () => ({
  MANDATORY_FIELD: "Campo obbligatorio",
}));

describe("AutocompleteComponent", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders correctly with label", () => {
    render(<AutocompleteComponent options={[]} label="Cerca indirizzo" />);
    expect(screen.getByLabelText("Cerca indirizzo")).toBeInTheDocument();
  });

  it("does not trigger onChangeDebounce for input shorter than 5 chars", () => {
    const onChangeDebounce = jest.fn();
    render(
      <AutocompleteComponent
        options={[]}
        onChangeDebounce={onChangeDebounce}
        label="Test"
      />
    );
    const input = screen.getByLabelText("Test");

    fireEvent.change(input, { target: { value: "abcd" } });
    jest.advanceTimersByTime(1000);

    expect(onChangeDebounce).not.toHaveBeenCalled();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });


  it("shows error message when inputError is true", () => {
    render(<AutocompleteComponent options={[]} inputError label="Campo" />);
    expect(screen.getByText("Campo obbligatorio")).toBeInTheDocument();
  });

  it("shows custom error message if errorText is provided", () => {
    render(
      <AutocompleteComponent
        options={[]}
        inputError
        errorText="Errore custom"
        label="Campo"
      />
    );
    expect(screen.getByText("Errore custom")).toBeInTheDocument();
  });

  it("calls onChange when an option is selected", () => {
    const onChange = jest.fn();
    const options = [{ Address: { Label: "Via Roma 1" } }];
    render(
      <AutocompleteComponent options={options} onChange={onChange} label="Seleziona" />
    );

    const input = screen.getByLabelText("Seleziona");
    fireEvent.mouseDown(input);

    const option = screen.getByText("Via Roma 1");
    fireEvent.click(option);

    expect(onChange).toHaveBeenCalledWith({ Address: { Label: "Via Roma 1" } });
  });
});