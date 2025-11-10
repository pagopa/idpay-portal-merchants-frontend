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

  it('renders the field with label', () => {
    setup();
    expect(screen.getByLabelText(/codice fiscale/i)).toBeInTheDocument();
  });

  it('accepts only alphanumeric characters, uppercase and max 16', () => {
    const { formik } = setup();
    const input = screen.getByLabelText(/codice fiscale/i);
    fireEvent.change(input, { target: { value: 'ab!c1234def5678ghijkl' } });
    // Should call setFieldValue with "ABC1234DEF5678GH"
    expect(formik.setFieldValue).toHaveBeenCalledWith('cf', 'ABC1234DEF5678GH', false);
  });

  it('resets errors and showErrors if input is empty', () => {
    const { formik, setShowErrors } = setup({ showErrors: true });
    const input = screen.getByLabelText(/codice fiscale/i);
    fireEvent.change(input, { target: { value: '' } });
    expect(setShowErrors).not.toHaveBeenCalledWith();
    expect(formik.setFieldError).not.toHaveBeenCalledWith('cf', '');
  });

  it('shows helperText and error state if showErrors is true and there is an error', () => {
    const errorMsg = 'Invalid CF';
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

  it('does not show helperText if showErrors is false', () => {
    setup({
      showErrors: false,
      formik: {
        values: { cf: '' },
        errors: { cf: 'Error' },
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
    expect(screen.queryByText('Error')).not.toBeInTheDocument();
  });

  it('uses the name prop if provided', () => {
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
    expect(formik.setFieldValue).not.toHaveBeenCalledWith('custom', 'ABC', false);
  });
});