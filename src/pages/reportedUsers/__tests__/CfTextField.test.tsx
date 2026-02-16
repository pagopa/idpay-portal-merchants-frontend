import { render, screen, fireEvent } from "@testing-library/react";
import CfTextField from "../CfTextField";

describe("CfTextField - FULL BRANCH COVERAGE", () => {
  const createFormik = (initialValue: string, error?: string) => ({
    values: { cf: initialValue },
    errors: { cf: error || "" },
    setFieldValue: jest.fn(),
    setFieldError: jest.fn(),
  });

  it("cleans input (uppercase, alphanumeric, max 16)", () => {
    const formik: any = createFormik("");
    const setShowErrors = jest.fn();

    render(
      <CfTextField
        formik={formik}
        showErrors={false}
        setShowErrors={setShowErrors}
        label="CF"
      />
    );

    const input = screen.getByLabelText("CF");
    fireEvent.change(input, { target: { value: "abc123!!@@xyz789012345" } });

    expect(formik.setFieldValue).toHaveBeenCalledWith(
      "cf",
      "ABC123XYZ7890123",
      false
    );
  });

  it("handles empty cleaned value branch", () => {
    const formik: any = createFormik("ABC");
    const setShowErrors = jest.fn();

    render(
      <CfTextField
        formik={formik}
        showErrors={true}
        setShowErrors={setShowErrors}
        label="CF"
      />
    );

    const input = screen.getByLabelText("CF");
    fireEvent.change(input, { target: { value: "" } });

    expect(setShowErrors).toHaveBeenCalledWith(false);
    expect(formik.setFieldError).toHaveBeenCalledWith("cf", "");
  });

  it("shows error when showErrors true", () => {
    const formik: any = createFormik("ABC", "Errore");
    const setShowErrors = jest.fn();

    render(
      <CfTextField
        formik={formik}
        showErrors={true}
        setShowErrors={setShowErrors}
        label="CF"
      />
    );

    expect(screen.getByText("Errore")).toBeInTheDocument();
  });

  it("hides error when showErrors false", () => {
    const formik: any = createFormik("ABC", "Errore");
    const setShowErrors = jest.fn();

    render(
      <CfTextField
        formik={formik}
        showErrors={false}
        setShowErrors={setShowErrors}
        label="CF"
      />
    );

    expect(screen.queryByText("Errore")).not.toBeInTheDocument();
  });
});
