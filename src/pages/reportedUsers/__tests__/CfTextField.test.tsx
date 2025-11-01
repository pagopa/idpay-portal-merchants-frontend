import { render, screen, fireEvent } from '@testing-library/react';
import CfTextField from '../CfTextField';

describe('CfTextField', () => {
  const setup = (props = {}) => {
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
    };
    const setShowErrors = jest.fn();
    const defaultProps = {
      formik,
      showErrors: false,
      setShowErrors,
      label: 'Codice Fiscale',
      ...props,
    };
    render(<CfTextField {...defaultProps} />);
    return { formik, setShowErrors };
  };

  it('renderizza il campo con label', () => {
    setup();
    expect(screen.getByLabelText(/codice fiscale/i)).toBeInTheDocument();
  });

  it('accetta solo caratteri alfanumerici, uppercase e max 16', () => {
    const { formik } = setup();
    const input = screen.getByLabelText(/codice fiscale/i);
    fireEvent.change(input, { target: { value: 'ab!c1234def5678ghijkl' } });
    // Dovrebbe chiamare setFieldValue con "ABC1234DEF5678GH"
    expect(formik.setFieldValue).toHaveBeenCalledWith('cf', 'ABC1234DEF5678GH', false);
  });

  it('resetta errori e showErrors se input vuoto', () => {
    const { formik, setShowErrors } = setup({ showErrors: true });
    const input = screen.getByLabelText(/codice fiscale/i);
    fireEvent.change(input, { target: { value: '' } });
    expect(setShowErrors).toHaveBeenCalledWith(false);
    expect(formik.setFieldError).toHaveBeenCalledWith('cf', '');
  });

  it("mostra helperText e stato errore se showErrors true e c'è errore", () => {
    const errorMsg = 'CF non valido';
    setup({
      showErrors: true,
      formik: {
        values: { cf: '' },
        errors: { cf: errorMsg },
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
      },
    });
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
    const input = screen.getByLabelText(/codice fiscale/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('non mostra helperText se showErrors false', () => {
    setup({
      showErrors: false,
      formik: {
        values: { cf: '' },
        errors: { cf: 'Errore' },
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
      },
    });
    expect(screen.queryByText('Errore')).not.toBeInTheDocument();
  });

  it('usa il prop name se fornito', () => {
    const { formik } = setup({
      formik: {
        values: { custom: '' },
        errors: { custom: '' },
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
        initialValues: { custom: '' },
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
      },
      name: 'custom',
    });
    const input = screen.getByLabelText(/codice fiscale/i);
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(formik.setFieldValue).toHaveBeenCalledWith('custom', 'ABC', false);
  });
});
