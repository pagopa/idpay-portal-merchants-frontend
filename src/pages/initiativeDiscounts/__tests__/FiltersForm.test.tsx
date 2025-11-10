import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Formik, useFormik } from 'formik';
import { TextField } from '@mui/material';
import FiltersForm from '../FiltersForm';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'commons.filterBtn') return 'Applica';
      if (key === 'commons.removeFiltersBtn') return 'Rimuovi filtri';
      return key;
    },
  }),
}));

const TestFormWrapper = ({
  onApply,
  onReset,
}: {
  onApply?: (values: any) => void;
  onReset?: () => void;
}) => {
  const formik = useFormik({
    initialValues: {
      fiscalCode: '',
      status: '',
    },
    onSubmit: () => {},
  });

  return (
    <FiltersForm formik={formik} onFiltersApplied={onApply} onFiltersReset={onReset}>
      <TextField name="fiscalCode" label="Codice Fiscale" data-testid="fiscalCode-input" />
      <div>Elemento non clonato</div>
    </FiltersForm>
  );
};

describe('FiltersForm', () => {
  test('should render children and buttons initially disabled', () => {
    render(<TestFormWrapper />);

    expect(screen.getByLabelText('Codice Fiscale')).toBeInTheDocument();
    expect(screen.getByText('Elemento non clonato')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Applica/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Rimuovi filtri/i })).toBeDisabled();
  });

  test('should enable buttons when a form field is changed', async () => {
    render(<TestFormWrapper />);
    const fiscalCodeInput = screen.getByLabelText('Codice Fiscale');
    const applyButton = screen.getByRole('button', { name: /Applica/i });
    const resetButton = screen.getByRole('button', { name: /Rimuovi filtri/i });

    await userEvent.type(fiscalCodeInput, 'TESTCF');

    expect(applyButton).toBeEnabled();
    expect(resetButton).toBeEnabled();
  });

  test('should call onFiltersApplied with correct values when apply button is clicked', async () => {
    const handleApply = jest.fn();
    render(<TestFormWrapper onApply={handleApply} />);
    const fiscalCodeInput = screen.getByLabelText('Codice Fiscale');
    const applyButton = screen.getByRole('button', { name: /Applica/i });

    await userEvent.type(fiscalCodeInput, 'NEWCF');
    await userEvent.click(applyButton);

    expect(handleApply).toHaveBeenCalledTimes(1);
    expect(handleApply).toHaveBeenCalledWith({ fiscalCode: 'NEWCF', status: '' });
  });

  test('should call onFiltersReset and clear the form when reset button is clicked', async () => {
    const handleReset = jest.fn();
    render(<TestFormWrapper onReset={handleReset} />);
    const fiscalCodeInput = screen.getByLabelText('Codice Fiscale');
    const resetButton = screen.getByRole('button', { name: /Rimuovi filtri/i });
    const applyButton = screen.getByRole('button', { name: /Applica/i });

    await userEvent.type(fiscalCodeInput, 'VALUE_TO_RESET');

    expect(fiscalCodeInput).toHaveValue('VALUE_TO_RESET');
    expect(resetButton).toBeEnabled();

    await userEvent.click(resetButton);

    expect(handleReset).toHaveBeenCalledTimes(1);
    expect(fiscalCodeInput).toHaveValue('');
    expect(resetButton).toBeDisabled();
    expect(applyButton).toBeDisabled();
  });

  test('should clone valid children with name prop and call onChange/onBlur correctly', async () => {
  const mockOnChange = jest.fn();
  const mockOnBlur = jest.fn();

  const formik = {
    values: { field1: '' },
    handleChange: jest.fn(),
    handleBlur: jest.fn(),
    resetForm: jest.fn(),
    dirty: true,
  } as any;

  render(
    <FiltersForm formik={formik}>
      <input
        name="field1"
        data-testid="cloned-input"
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
      <div data-testid="not-cloned">Non clonato</div>
    </FiltersForm>
  );

  const clonedInput = screen.getByTestId('cloned-input');
  await userEvent.type(clonedInput, 'A');
  await userEvent.tab();

  expect(formik.handleChange).toHaveBeenCalled();
  expect(formik.handleBlur).toHaveBeenCalled();
  expect(mockOnChange).toHaveBeenCalled();
  expect(mockOnBlur).toHaveBeenCalled();

  expect(screen.getByTestId('not-cloned')).toBeInTheDocument();
});

test('should clone valid children with name prop and call onChange/onBlur correctly', async () => {
  const mockOnChange = jest.fn();
  const mockOnBlur = jest.fn();

  const formik = {
    values: { field1: '' },
    handleChange: jest.fn(),
    handleBlur: jest.fn(),
    resetForm: jest.fn(),
    dirty: true,
  } as any;

  render(
    <FiltersForm formik={formik}>
      {/* Child con name -> verrà clonato */}
      <input
        name="field1"
        data-testid="cloned-input"
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
      {/* Child senza name -> non viene clonato */}
      <div data-testid="not-cloned">Non clonato</div>
    </FiltersForm>
  );

  const clonedInput = screen.getByTestId('cloned-input');

  // Simuliamo eventi
  await userEvent.type(clonedInput, 'A');
  await userEvent.tab(); // scatena onBlur

  // Verifica che Formik e le callback originali siano state chiamate
  expect(formik.handleChange).toHaveBeenCalled();
  expect(formik.handleBlur).toHaveBeenCalled();
  expect(mockOnChange).toHaveBeenCalled();
  expect(mockOnBlur).toHaveBeenCalled();

  // Verifica che l'elemento senza name sia stato renderizzato invariato
  expect(screen.getByTestId('not-cloned')).toBeInTheDocument();
});

test('should call onFiltersApplied when provided', async () => {
  const handleApply = jest.fn();
  const formik = {
    values: { testField: 'value' },
    handleChange: jest.fn(),
    handleBlur: jest.fn(),
    resetForm: jest.fn(),
    dirty: true,
  } as any;

  render(
    <FiltersForm formik={formik} onFiltersApplied={handleApply}>
      <div>Mock Child</div>
    </FiltersForm>
  );

  const applyButton = screen.getByRole('button', { name: /Applica/i });
  await userEvent.click(applyButton);

  expect(handleApply).toHaveBeenCalledTimes(1);
  expect(handleApply).toHaveBeenCalledWith({ testField: 'value' });
});

test('should not throw if onFiltersApplied is not provided', async () => {
  const formik = {
    values: { testField: 'value' },
    handleChange: jest.fn(),
    handleBlur: jest.fn(),
    resetForm: jest.fn(),
    dirty: true,
  } as any;

  render(
    <FiltersForm formik={formik}>
      <div>Mock Child</div>
    </FiltersForm>
  );

  const applyButton = screen.getByRole('button', { name: /Applica/i });

  // Nessuna eccezione anche senza onFiltersApplied
  await expect(userEvent.click(applyButton)).resolves.not.toThrow();
});

test('should call onFiltersReset and formik.resetForm when provided', async () => {
  const handleReset = jest.fn();
  const formik = {
    values: {},
    handleChange: jest.fn(),
    handleBlur: jest.fn(),
    resetForm: jest.fn(),
    dirty: true,
  } as any;

  render(
    <FiltersForm formik={formik} onFiltersReset={handleReset}>
      <div>Mock Child</div>
    </FiltersForm>
  );

  const resetButton = screen.getByRole('button', { name: /Rimuovi filtri/i });
  await userEvent.click(resetButton);

  expect(formik.resetForm).toHaveBeenCalledTimes(1);
  expect(handleReset).toHaveBeenCalledTimes(1);
});

test('should not throw if onFiltersReset is not provided', async () => {
  const formik = {
    values: {},
    handleChange: jest.fn(),
    handleBlur: jest.fn(),
    resetForm: jest.fn(),
    dirty: true,
  } as any;

  render(
    <FiltersForm formik={formik}>
      <div>Mock Child</div>
    </FiltersForm>
  );

  const resetButton = screen.getByRole('button', { name: /Rimuovi filtri/i });

  // Nessuna eccezione anche senza onFiltersReset
  await expect(userEvent.click(resetButton)).resolves.not.toThrow();

  expect(formik.resetForm).toHaveBeenCalledTimes(1);
});


});
