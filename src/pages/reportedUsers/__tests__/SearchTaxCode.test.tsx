import { render, screen, fireEvent } from '@testing-library/react';
import SearchTaxCode from '../SearchTaxCode';

describe('SearchTaxCode', () => {
  const setup = (formikProps = {}) => {
    const formik = {
      values: { cf: '' },
      errors: { cf: '' },
      setFieldValue: jest.fn(),
      setFieldError: jest.fn(),
      touched: {},
      isSubmitting: false,
      isValidating: false,
      submitCount: 0,
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
      handleSubmit: jest.fn(),
      handleReset: jest.fn(),
      setTouched: jest.fn(),
      setValues: jest.fn(),
      setErrors: jest.fn(),
      validateForm: jest.fn(),
      validateField: jest.fn(),
      resetForm: jest.fn(),
      initialValues: { cf: '' },
      initialErrors: {},
      initialTouched: {},
      initialStatus: undefined,
      status: undefined,
      dirty: false,
      isValid: true,
      registerField: jest.fn(),
      unregisterField: jest.fn(),
      setStatus: jest.fn(),
      setSubmitting: jest.fn(),
      setFieldTouched: jest.fn(),
      getFieldProps: jest.fn(),
      getFieldMeta: jest.fn(),
      getFieldHelpers: jest.fn(),
      submitForm: jest.fn(),
      setFormikState: jest.fn(),
      ...formikProps,
    };
    const onSearch = jest.fn();
    render(<SearchTaxCode formik={formik} onSearch={onSearch} />);
    return { formik, onSearch };
  };

  it('renderizza campo cf e bottoni', () => {
    setup();
    expect(screen.getByLabelText(/codice fiscale/i)).toBeInTheDocument();
    expect(screen.getByTestId('btn-filters-cf')).toBeInTheDocument();
    expect(screen.getByTestId('btn-cancel-cf')).toBeInTheDocument();
  });

  it('mostra errore se si invia con cf vuoto', () => {
    const { formik } = setup();
    fireEvent.click(screen.getByTestId('btn-filters-cf'));
    expect(formik.setFieldError).toHaveBeenCalledWith('cf', expect.any(String));
  });

  it('mostra errore se si invia con cf non valido', () => {
    const { formik } = setup({
      values: { cf: '123' },
    });
    fireEvent.change(screen.getByLabelText(/codice fiscale/i), { target: { value: '123' } });
    fireEvent.click(screen.getByTestId('btn-filters-cf'));
    expect(formik.setFieldError).toHaveBeenCalledWith('cf', 'Codice fiscale non valido');
  });

  it('chiama onSearch con cf pulito se valido', () => {
    const { formik, onSearch } = setup({
      values: { cf: 'abcDEF12g34h567i' },
    });
    fireEvent.change(screen.getByLabelText(/codice fiscale/i), {
      target: { value: 'abcDEF12g34h567i' },
    });
    fireEvent.click(screen.getByTestId('btn-filters-cf'));
    expect(onSearch).toHaveBeenCalledWith({ cf: 'ABCDEF12G34H567I' });
  });

  it('resetta il campo cf al click su Annulla', () => {
    const { formik } = setup({
      values: { cf: 'SOMECF' },
    });
    fireEvent.click(screen.getByTestId('btn-cancel-cf'));
    expect(formik.setFieldValue).toHaveBeenCalledWith('cf', '');
  });
});
