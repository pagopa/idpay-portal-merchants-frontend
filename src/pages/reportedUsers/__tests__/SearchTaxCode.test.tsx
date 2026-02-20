import { render, screen, fireEvent } from '@testing-library/react';
import SearchTaxCode from '../SearchTaxCode';

describe('SearchTaxCode', () => {
  const setup = (formikProps = {}) => {
    const formik = {
      values: { cf: '' },
      errors: { cf: '' },
      setFieldValue: vi.fn(),
      setFieldError: vi.fn(),
      touched: {},
      isSubmitting: false,
      isValidating: false,
      submitCount: 0,
      handleChange: vi.fn(),
      handleBlur: vi.fn(),
      handleSubmit: vi.fn(),
      handleReset: vi.fn(),
      setTouched: vi.fn(),
      setValues: vi.fn(),
      setErrors: vi.fn(),
      validateForm: vi.fn(),
      validateField: vi.fn(),
      resetForm: vi.fn(),
      initialValues: { cf: '' },
      initialErrors: {},
      initialTouched: {},
      initialStatus: undefined,
      status: undefined,
      dirty: false,
      isValid: true,
      registerField: vi.fn(),
      unregisterField: vi.fn(),
      setStatus: vi.fn(),
      setSubmitting: vi.fn(),
      setFieldTouched: vi.fn(),
      getFieldProps: vi.fn(),
      getFieldMeta: vi.fn(),
      getFieldHelpers: vi.fn(),
      submitForm: vi.fn(),
      setFormikState: vi.fn(),
      ...formikProps,
    };
    const onSearch = vi.fn();
    render(<SearchTaxCode formik={formik} onSearch={onSearch} />);
    return { formik, onSearch };
  };

  it('renders cf field and buttons', () => {
    setup();
    expect(screen.getByLabelText('pages.reportedUsers.cfPlaceholder')).toBeInTheDocument();
    expect(screen.getByTestId('btn-filters-cf')).toBeInTheDocument();
    expect(screen.getByTestId('btn-cancel-cf')).toBeInTheDocument();
  });

  it('shows error if submitted with empty cf', () => {
    const { formik } = setup();
    fireEvent.click(screen.getByTestId('btn-filters-cf'));
    expect(formik.setFieldError).toHaveBeenCalledWith('cf', expect.any(String));
  });

  it('shows error if submitted with invalid cf', () => {
    const { formik } = setup({
      values: { cf: '123' },
    });
    fireEvent.change(screen.getByLabelText('pages.reportedUsers.cfPlaceholder'), { target: { value: '123' } });
    fireEvent.click(screen.getByTestId('btn-filters-cf'));
    expect(formik.setFieldError).toHaveBeenCalledWith('cf', 'pages.reportedUsers.cf.invalid');
  });

  it('calls onSearch with cleaned cf if valid', () => {
    const { formik, onSearch } = setup({
      values: { cf: 'abcDEF12g34h567i' },
    });
    fireEvent.change(screen.getByLabelText('pages.reportedUsers.cfPlaceholder'), {
      target: { value: 'abcDEF12g34h567i' },
    });
    fireEvent.click(screen.getByTestId('btn-filters-cf'));
    expect(onSearch).toHaveBeenCalledWith({ cf: 'ABCDEF12G34H567I' });
  });

  it('resets cf field on Cancel click', () => {
    const { formik } = setup({
      values: { cf: 'SOMECF' },
    });
    fireEvent.click(screen.getByTestId('btn-cancel-cf'));
    expect(formik.setFieldValue).toHaveBeenCalledWith('cf', '');
  });
});
