import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchTaxCode from '../SearchTaxCode';
import { useAppSelector } from '../../../redux/hooks';
import { useAppSelector } from '../../../redux/hooks';

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

  jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => 'initiative-1',
}));

jest.mock('../../../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: jest.fn(), 
}));

jest.mock('../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));

  jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => 'initiative-1',
}));

jest.mock('../../../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: jest.fn(), 
}));

jest.mock('../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));

describe('SearchTaxCode', () => {
    (useAppSelector as jest.Mock).mockReturnValue([{initiativeId: 'initiative-1'}])
  const renderSearchTaxCode = ({
    formikOverrides,
    onReset,
  }: {
    formikOverrides?: any;
    onReset?: jest.Mock;
  } = {}) => {
    const formik = createFormikMock(formikOverrides);
    const onSearch = jest.fn();

    render(
      <SearchTaxCode
        formik={formik}
        onSearch={onSearch}
        onReset={onReset}
      />
    );

    return { formik, onSearch, onReset };
  };

  beforeEach(() => {
    (useAppSelector as jest.Mock).mockReturnValue([
      { initiativeId: 'initiative-1' },
    ]);
  });

  it('renders cf field and buttons', () => {
    renderSearchTaxCode();
    expect(screen.getByLabelText('commons.labels.searchByFiscalCode')).toBeInTheDocument();
    expect(screen.getByLabelText('commons.labels.searchByFiscalCode')).toBeInTheDocument();
    expect(screen.getByTestId('btn-filters-cf')).toBeInTheDocument();
    expect(screen.getByTestId('btn-cancel-cf')).toBeInTheDocument();
  });

  it.each([
    {
      description: 'shows error if submitted with empty cf',
      formikOverrides: undefined,
      inputValue: '',
      expectedError: expect.any(String),
      expectedSearch: null,
    },
    {
      description: 'shows error if submitted with invalid cf',
      formikOverrides: { values: { cf: '123' } },
    });
    fireEvent.change(screen.getByLabelText('commons.labels.searchByFiscalCode'), {
      target: { value: '123' },
    });
    fireEvent.click(screen.getByTestId('btn-filters-cf'));
    expect(formik.setFieldError).toHaveBeenCalledWith('cf', 'pages.reportedUsers.invalid');
  });

  it('calls onSearch with cleaned cf if valid', () => {
    const { onSearch } = renderSearchTaxCode({
      formikOverrides: { values: { cf: 'abcDEF12g34h567i' } },
      inputValue: 'abcDEF12g34h567i',
      expectedError: null,
      expectedSearch: { cf: 'ABCDEF12G34H567I' },
    },
  ])(
    '$description',
    ({ formikOverrides, inputValue, expectedError, expectedSearch }: any) => {
    const { formik, onSearch } = renderSearchTaxCode({
      formikOverrides,
    });
    fireEvent.change(screen.getByLabelText('commons.labels.searchByFiscalCode'), {
      target: { value: 'abcDEF12g34h567i' },
    });
    fireEvent.click(screen.getByTestId('btn-filters-cf'));

    if (expectedError) {
      expect(formik.setFieldError).toHaveBeenCalledWith('cf', expectedError);
    }

    if (expectedSearch) {
      expect(onSearch).toHaveBeenCalledWith(expectedSearch);
    }
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
