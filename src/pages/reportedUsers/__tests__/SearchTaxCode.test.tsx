import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SearchTaxCode from '../SearchTaxCode';

jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => 'initiative-1',
}));
import { setupInitiativeMocks } from '../../../test-utils/mockInitiativeContext';

const createFormikMock = (overrides: any = {}) =>
  ({
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
    ...overrides,
  } as any);


const createMockStore = () =>
  configureStore({
    reducer: {
      initiatives: () => ({
        list: [],
      }),
    },
  });

describe('SearchTaxCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupInitiativeMocks();
  });
  const renderSearchTaxCode = ({
    formikOverrides,
    onReset,
  }: {
    formikOverrides?: any;
    onReset?: jest.Mock;
  } = {}) => {
    const formik = createFormikMock(formikOverrides);
    const onSearch = jest.fn();

    const store = createMockStore();

    render(
      <Provider store={store}>
        <SearchTaxCode
          formik={formik}
          onSearch={onSearch}
          onReset={onReset}
        />
      </Provider>
    );

    return { formik, onSearch, onReset };
  };


  it('renders cf field and buttons', () => {
    renderSearchTaxCode();
    expect(screen.getByLabelText('commons.labels.searchByFiscalCode')).toBeInTheDocument();
    expect(screen.getByLabelText('commons.labels.searchByFiscalCode')).toBeInTheDocument();
    expect(screen.getByTestId('btn-filters-cf')).toBeInTheDocument();
    expect(screen.getByTestId('btn-cancel-cf')).toBeInTheDocument();
  });

  it('shows error if submitted with empty cf', () => {
    const { formik } = renderSearchTaxCode();

    fireEvent.click(screen.getByTestId('btn-filters-cf'));

    expect(formik.setFieldError).toHaveBeenCalled();
  });

  it('shows error if submitted with invalid cf', () => {
    const { formik } = renderSearchTaxCode({
      formikOverrides: { values: { cf: '123' } },
    });

    fireEvent.change(screen.getByLabelText('commons.labels.searchByFiscalCode'), {
      target: { value: '123' },
    });
    fireEvent.click(screen.getByTestId('btn-filters-cf'));

    expect(formik.setFieldError).toHaveBeenCalledWith(
      'cf',
      'pages.reportedUsers.invalid'
    );
  });

  it('calls onSearch with cleaned cf if valid', () => {
    const { onSearch } = renderSearchTaxCode({
      formikOverrides: { values: { cf: 'abcDEF12g34h567i' } },
    });

    fireEvent.change(screen.getByLabelText('commons.labels.searchByFiscalCode'), {
      target: { value: 'abcDEF12g34h567i' },
    });
    fireEvent.click(screen.getByTestId('btn-filters-cf'));

    expect(onSearch).toHaveBeenCalledWith({
      cf: 'ABCDEF12G34H567I',
    });
  });

  it('resets cf field on Cancel click (fallback when onReset is not provided)', () => {
    const setFieldValue = jest.fn();

    renderSearchTaxCode({
      formikOverrides: { values: { cf: 'SOMECF' }, setFieldValue },
    });

    fireEvent.click(screen.getByTestId('btn-cancel-cf'));
    expect(setFieldValue).toHaveBeenCalledWith('cf', '');
  });

  it('calls onReset on Cancel click when onReset is provided', () => {
    const onReset = jest.fn();
    const setFieldValue = jest.fn();

    renderSearchTaxCode({
      onReset,
      formikOverrides: { values: { cf: 'SOMECF' }, setFieldValue },
    });

    fireEvent.click(screen.getByTestId('btn-cancel-cf'));

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(setFieldValue).not.toHaveBeenCalledWith('cf', '');
  });
});
