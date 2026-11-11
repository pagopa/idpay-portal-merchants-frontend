import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@pagopa/mui-italia/theme';
import PointsOfSaleForm from '../../../components/pointsOfSaleForm/PointsOfSaleForm';
import { PointOfSaleDTO } from '../../../api/generated/merchants/data-contracts';
import EditPointOfSaleModal from '../EditPointOfSaleModal';
import { updatePointOfSale } from '../../../services/merchantService';
import italianTranslations from '../../../locale/it/common.json';

const mockSetAlert = jest.fn();
let latestFormProps: any;

jest.mock('../../../hooks/useScopedTranslation', () => {
  const translations = jest.requireActual('../../../locale/it/common.json');
  return () => ({
    t: (key: string) =>
      key === 'errors.validationDescription' ? translations.errors.validationDescription : key,
  });
});

jest.mock('../../../hooks/useAlert', () => ({
  useAlert: () => ({ setAlert: mockSetAlert }),
}));

jest.mock('../../../services/merchantService', () => ({
  updatePointOfSale: jest.fn(),
}));

jest.mock('../../../components/modal/ModalComponent', () => (props: any) =>
  props.open ? <div data-testid="modal">{props.children}</div> : null
);

jest.mock('../../../components/pointsOfSaleForm/PointsOfSaleForm', () => jest.fn());

jest.mock('../../../helpers', () => ({
  ...jest.requireActual('../../../helpers'),
  generateUniqueId: () => 'test-pos-id',
}));

jest.mock('../../../hooks/useAutocomplete', () => ({
  usePlacesAutocomplete: () => ({
    options: [],
    loading: false,
    error: null,
    search: jest.fn(),
  }),
}));

const updatePointOfSaleMock = updatePointOfSale as jest.Mock;
const pointsOfSaleFormMock = PointsOfSaleForm as jest.MockedFunction<typeof PointsOfSaleForm>;
const defaultValidationMessage = italianTranslations.errors.validationDescription;
const invalidUrlMessage =
  'Alcuni campi non sono validi. Consulta i dettagli per maggiori informazioni.';
const backendValidationMessage = 'Some fields are invalid. See details for more information.';
const invalidUrlResponse = {
  code: 'VALIDATION_ERROR',
  details: [
    {
      index: 0,
      field: 'website',
      value: 'http://www.google.com',
      code: 'POINT_OF_SALE_INVALID_URL',
      message: 'Website must be a valid HTTPS URL.',
    },
  ],
  message: backendValidationMessage,
};

const basePointOfSale = {
  id: 'pos-1',
  type: 'PHYSICAL',
  franchiseName: 'Store 1',
  address: 'Via Roma',
  streetNumber: '10',
  city: 'Roma',
  zipCode: '00100',
  region: 'Lazio',
  province: 'RM',
  website: 'shop.example.it',
  channelEmail: 'store@example.it',
  channelPhone: '061234567',
  channelGeolink: 'https://maps.example.it',
  contactName: 'Mario',
  contactSurname: 'Rossi',
  contactEmail: 'mario.rossi@example.it',
};

const changedPhysicalPointOfSale = {
  ...basePointOfSale,
  channelPhone: '061234568',
};

const renderComponent = (overrides: Record<string, unknown> = {}) => {
  const props = {
    open: true,
    initiativeId: 'initiative-1',
    merchantId: 'merchant-1',
    pointOfSale: basePointOfSale as any,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    ...overrides,
  };

  render(<EditPointOfSaleModal {...(props as any)} />);
  return props;
};

const setFormState = async (pointOfSale: Record<string, unknown>, isValid = true) => {
  await act(async () => {
    latestFormProps.onValidationChange(isValid);
    latestFormProps.onFormChange([pointOfSale]);
  });
};

const setRawFormState = async (values: Array<Record<string, unknown>>, isValid = true) => {
  await act(async () => {
    latestFormProps.onValidationChange(isValid);
    latestFormProps.onFormChange(values);
  });
};

describe('EditPointOfSaleModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    latestFormProps = undefined;
    pointsOfSaleFormMock.mockImplementation((props) => {
      latestFormProps = props;
      return <div data-testid="points-of-sale-form-mock" />;
    });
  });

  it('does not call update when form is invalid', async () => {
    renderComponent();
    await setFormState(changedPhysicalPointOfSale, false);

    fireEvent.click(screen.getByTestId('update-point-of-sale-button'));

    await waitFor(() => expect(latestFormProps.submitAttempt).toBe(1));
    expect(updatePointOfSaleMock).not.toHaveBeenCalled();
  });

  it('clears the submission attempt and external errors when cancelling', async () => {
    const props = renderComponent();
    updatePointOfSaleMock.mockResolvedValue({
      code: 'VALIDATION_ERROR',
      details: [{ field: 'address', code: 'PHYSICAL_POS_ALREADY_REGISTERED' }],
    });
    await setFormState(changedPhysicalPointOfSale);
    fireEvent.click(screen.getByTestId('update-point-of-sale-button'));
    await waitFor(() => expect(latestFormProps.externalErrors[0].address).toBeTruthy());

    fireEvent.click(screen.getByRole('button', { name: 'actions.cancel' }));

    expect(props.onClose).toHaveBeenCalledTimes(1);
    expect(latestFormProps.submitAttempt).toBe(0);
    expect(latestFormProps.externalErrors).toEqual({});
    expect(latestFormProps.externalAlertMessages).toEqual({});
    expect(screen.getByTestId('update-point-of-sale-button')).toBeDisabled();
  });

  it('keeps confirm button disabled until at least one field changes', async () => {
    renderComponent();

    const submitButton = screen.getByTestId('update-point-of-sale-button');
    expect(submitButton).toBeDisabled();

    await setFormState(changedPhysicalPointOfSale);

    expect(submitButton).toBeEnabled();
  });

  it('normalizes nullable point-of-sale fields to empty strings and keeps button disabled when unchanged', async () => {
    renderComponent({
      pointOfSale: {
        ...basePointOfSale,
        franchiseName: undefined,
        address: undefined,
        streetNumber: undefined,
        city: undefined,
        zipCode: undefined,
        region: undefined,
        province: undefined,
        website: undefined,
        channelGeolink: undefined,
        channelPhone: undefined,
        channelEmail: undefined,
        contactName: undefined,
        contactSurname: undefined,
        contactEmail: undefined,
      },
    });

    expect(latestFormProps.initialSalesPoints[0]).toMatchObject({
      franchiseName: '',
      address: '',
      streetNumber: '',
      city: '',
      zipCode: '',
      region: '',
      province: '',
      website: '',
      channelGeolink: '',
      channelPhone: '',
      channelEmail: '',
      contactName: '',
      contactSurname: '',
      contactEmail: '',
    });

    await setRawFormState([{ ...latestFormProps.initialSalesPoints[0] }]);

    expect(screen.getByTestId('update-point-of-sale-button')).toBeDisabled();
  });

  it('enables and disables confirm button based on effective editable changes', async () => {
    renderComponent({
      pointOfSale: {
        ...basePointOfSale,
        website: undefined,
        channelPhone: undefined,
      },
    });

    const submitButton = screen.getByTestId('update-point-of-sale-button');
    expect(submitButton).toBeDisabled();

    await setRawFormState([{ ...latestFormProps.initialSalesPoints[0], website: 'new-shop.it' }]);
    expect(submitButton).toBeEnabled();

    await setRawFormState([{ ...latestFormProps.initialSalesPoints[0] }]);
    expect(submitButton).toBeDisabled();
  });

  it('submits ONLINE payload with website only and shows success alert', async () => {
    const props = renderComponent({ pointOfSale: { ...basePointOfSale, type: 'ONLINE' } });
    updatePointOfSaleMock.mockResolvedValue({ ...basePointOfSale, type: 'ONLINE' });

    await setFormState({ ...basePointOfSale, id: 'online-pos', type: 'ONLINE', website: 'online.it' });

    fireEvent.click(screen.getByTestId('update-point-of-sale-button'));

    await waitFor(() =>
      expect(updatePointOfSaleMock).toHaveBeenCalledWith('merchant-1', 'online-pos', {
        website: 'https://online.it',
      })
    );
    expect(props.onClose).toHaveBeenCalled();
    expect(props.onSuccess).toHaveBeenCalled();
    expect(mockSetAlert).toHaveBeenCalledWith({
      text: 'pages.initiativeStores.pointOfSaleChangeSuccess',
      isOpen: true,
      severity: 'success',
    });
  });

  it('submits ONLINE payload with empty website when website is undefined', async () => {
    renderComponent({ pointOfSale: { ...basePointOfSale, type: 'ONLINE' } });
    updatePointOfSaleMock.mockResolvedValue({ ...basePointOfSale, type: 'ONLINE' });

    await setFormState({ ...basePointOfSale, id: 'online-pos', type: 'ONLINE', website: undefined });

    fireEvent.click(screen.getByTestId('update-point-of-sale-button'));

    await waitFor(() =>
      expect(updatePointOfSaleMock).toHaveBeenCalledWith('merchant-1', 'online-pos', {
        website: '',
      })
    );
  });

  it('submits PHYSICAL payload with expected fallbacks for undefined fields', async () => {
    renderComponent();
    updatePointOfSaleMock.mockResolvedValue({ ...basePointOfSale });

    await setFormState({
      ...basePointOfSale,
      id: 'pos-1',
      channelPhone: '061234568',
      region: undefined,
      province: undefined,
      city: undefined,
      zipCode: undefined,
      address: undefined,
      streetNumber: undefined,
      website: undefined,
      channelEmail: undefined,
      channelGeolink: undefined,
    });

    fireEvent.click(screen.getByTestId('update-point-of-sale-button'));

    await waitFor(() =>
      expect(updatePointOfSaleMock).toHaveBeenCalledWith('merchant-1', 'pos-1', {
        region: '',
        province: '',
        city: '',
        zipCode: '',
        address: 'Via Roma',
        streetNumber: '10',
        website: '',
        channelEmail: '',
        channelPhone: '061234568',
        channelGeolink: '',
      })
    );
  });

  it('submits PHYSICAL payload with empty fallbacks when source address/streetNumber/channelPhone are undefined', async () => {
    renderComponent({
      pointOfSale: {
        ...basePointOfSale,
        address: undefined,
        streetNumber: undefined,
        channelPhone: undefined,
        website: undefined,
      },
    });
    updatePointOfSaleMock.mockResolvedValue({ ...basePointOfSale });

    await setFormState({
      ...basePointOfSale,
      id: 'pos-1',
      address: undefined,
      streetNumber: undefined,
      channelPhone: undefined,
      website: 'shop-updated.it',
    });

    fireEvent.click(screen.getByTestId('update-point-of-sale-button'));

    await waitFor(() =>
      expect(updatePointOfSaleMock).toHaveBeenCalledWith('merchant-1', 'pos-1', {
        region: 'Lazio',
        province: 'RM',
        city: 'Roma',
        zipCode: '00100',
        address: '',
        streetNumber: '',
        website: 'https://shop-updated.it',
        channelEmail: 'store@example.it',
        channelPhone: '',
        channelGeolink: 'https://maps.example.it',
      })
    );
  });

  it('uses existing physical address fields when form sends empty values', async () => {
    renderComponent();
    updatePointOfSaleMock.mockResolvedValue({ ...basePointOfSale });

    await setFormState({ ...changedPhysicalPointOfSale, address: '', streetNumber: '' });

    fireEvent.click(screen.getByTestId('update-point-of-sale-button'));

    await waitFor(() =>
      expect(updatePointOfSaleMock).toHaveBeenCalledWith('merchant-1', 'pos-1', {
        region: 'Lazio',
        province: 'RM',
        city: 'Roma',
        zipCode: '00100',
        address: 'Via Roma',
        streetNumber: '10',
        website: 'https://shop.example.it',
        channelEmail: 'store@example.it',
        channelPhone: '061234568',
        channelGeolink: 'https://maps.example.it',
      })
    );
  });

  describe.each(['PHYSICAL', 'ONLINE'] as const)('HTTPS payload for %s points of sale', (type) => {
    it.each([
      ['http://www.example.it', 'https://www.example.it'],
      ['www.example.it', 'https://www.example.it'],
      ['https://www.example.it', 'https://www.example.it'],
      ['  http://www.example.it/path  ', 'https://www.example.it/path'],
      ['  www.example.it/path  ', 'https://www.example.it/path'],
      ['  https://www.example.it/path  ', 'https://www.example.it/path'],
      ['', ''],
      ['   ', ''],
      [undefined, ''],
    ])('normalizes %s to %s before sending', async (input, expected) => {
      renderComponent({ pointOfSale: { ...basePointOfSale, type } });
      updatePointOfSaleMock.mockResolvedValue({ ...basePointOfSale, type });
      await setFormState({
        ...changedPhysicalPointOfSale,
        type,
        website: input,
        channelGeolink: input,
      });

      fireEvent.click(screen.getByTestId('update-point-of-sale-button'));

      const expectedPayload =
        type === 'ONLINE'
          ? { website: expected }
          : expect.objectContaining({
              website: expected,
              channelGeolink: expected,
              channelPhone: changedPhysicalPointOfSale.channelPhone,
            });
      await waitFor(() =>
        expect(updatePointOfSaleMock).toHaveBeenCalledWith('merchant-1', 'pos-1', expectedPayload)
      );
    });
  });

  it('shows generic error alert when selected point-of-sale has no id', async () => {
    renderComponent();

    await setFormState({ ...changedPhysicalPointOfSale, id: undefined });

    fireEvent.click(screen.getByTestId('update-point-of-sale-button'));

    await waitFor(() =>
      expect(mockSetAlert).toHaveBeenCalledWith({
        title: 'errors.genericTitle',
        text: 'errors.genericDescription',
        isOpen: true,
        severity: 'error',
      })
    );
    expect(updatePointOfSaleMock).not.toHaveBeenCalled();
  });

  it('shows field errors for validation details and defaults field to website for ONLINE', async () => {
    renderComponent({ pointOfSale: { ...basePointOfSale, type: 'ONLINE' } });
    updatePointOfSaleMock.mockResolvedValue({
      code: 'VALIDATION_ERROR',
      details: [{ code: 'ONLINE_POS_ALREADY_REGISTERED' }],
    });

    await setFormState({ ...basePointOfSale, id: 'online-pos', type: 'ONLINE', website: 'online.it' });

    fireEvent.click(screen.getByTestId('update-point-of-sale-button'));

    await waitFor(() =>
      expect(latestFormProps.externalErrors).toEqual({
        0: { website: 'Questo punto vendita risulta già associato' },
      })
    );
    expect(latestFormProps.externalAlertMessages).toEqual({
      0: defaultValidationMessage,
    });
  });

  it.each(['details', 'errors'])(
    'maps POINT_OF_SALE_INVALID_URL in %s to the banner and preserves the field message',
    async (detailsProperty) => {
      renderComponent();
      updatePointOfSaleMock.mockResolvedValue({
        code: 'VALIDATION_ERROR',
        [detailsProperty]: invalidUrlResponse.details,
        message: backendValidationMessage,
      });
      await setFormState({ ...basePointOfSale, website: invalidUrlResponse.details[0].value });

      fireEvent.click(screen.getByTestId('update-point-of-sale-button'));

      await waitFor(() =>
        expect(latestFormProps.externalAlertMessages).toEqual({ 0: invalidUrlMessage })
      );
      expect(latestFormProps.externalErrors).toEqual({ 0: { website: defaultValidationMessage } });
      expect(mockSetAlert).not.toHaveBeenCalled();
    }
  );

  it('maps POINT_OF_SALE_INVALID_URL without details to its Italian message', async () => {
    renderComponent();
    updatePointOfSaleMock.mockResolvedValue({
      code: 'POINT_OF_SALE_INVALID_URL',
      message: backendValidationMessage,
    });
    await setFormState(changedPhysicalPointOfSale);

    fireEvent.click(screen.getByTestId('update-point-of-sale-button'));

    await waitFor(() =>
      expect(latestFormProps.externalAlertMessages).toEqual({ 0: invalidUrlMessage })
    );
    expect(latestFormProps.externalErrors).toEqual({});
    expect(mockSetAlert).not.toHaveBeenCalled();
  });

  it.each([
    ['details', 'UNMAPPED_VALIDATION_CODE'],
    ['errors', 'UNMAPPED_VALIDATION_CODE'],
    ['details', undefined],
    ['errors', undefined],
  ])('uses an Italian fallback for %s with detail code %s', async (detailsProperty, detailCode) => {
    renderComponent();
    updatePointOfSaleMock.mockResolvedValue({
      code: 'VALIDATION_ERROR',
      [detailsProperty as string]: [{ ...invalidUrlResponse.details[0], code: detailCode }],
      message: backendValidationMessage,
    });
    await setFormState({ ...basePointOfSale, website: invalidUrlResponse.details[0].value });

    fireEvent.click(screen.getByTestId('update-point-of-sale-button'));

    await waitFor(() =>
      expect(latestFormProps.externalErrors).toEqual({ 0: { website: defaultValidationMessage } })
    );
    expect(latestFormProps.externalAlertMessages).toEqual({ 0: defaultValidationMessage });
    expect(mockSetAlert).not.toHaveBeenCalled();
  });

  it.each([backendValidationMessage, '', undefined])(
    'uses an Italian fallback without validation details and with message %s',
    async (message) => {
      renderComponent();
      updatePointOfSaleMock.mockResolvedValue({ code: 'VALIDATION_ERROR', message });
      await setFormState(changedPhysicalPointOfSale);

      fireEvent.click(screen.getByTestId('update-point-of-sale-button'));

      await waitFor(() =>
        expect(latestFormProps.externalAlertMessages).toEqual({ 0: defaultValidationMessage })
      );
      expect(latestFormProps.externalErrors).toEqual({});
    }
  );

  it('defaults validation field to address for PHYSICAL and maps physical duplicate message', async () => {
    renderComponent();
    updatePointOfSaleMock.mockResolvedValue({
      code: 'VALIDATION_ERROR',
      details: [{ code: 'PHYSICAL_POS_ALREADY_REGISTERED' }],
    });

    await setFormState(changedPhysicalPointOfSale);

    fireEvent.click(screen.getByTestId('update-point-of-sale-button'));

    await waitFor(() =>
      expect(latestFormProps.externalErrors).toEqual({
        0: { address: 'Questo punto vendita risulta già associato' },
      })
    );
  });

  it('shows generic alert for non-validation API errors', async () => {
    renderComponent();
    updatePointOfSaleMock.mockResolvedValue({
      code: 'POINT_OF_SALE_GENERIC_ERROR',
      message: 'method not allowed',
    });

    await setFormState(changedPhysicalPointOfSale);

    fireEvent.click(screen.getByTestId('update-point-of-sale-button'));

    await waitFor(() =>
      expect(mockSetAlert).toHaveBeenCalledWith({
        title: 'errors.genericTitle',
        text: 'errors.genericDescription',
        isOpen: true,
        severity: 'error',
      })
    );
  });

  it('handles mapped validation code without details as field-validation branch', async () => {
    renderComponent();
    updatePointOfSaleMock.mockResolvedValue({
      code: 'POS_ALREADY_REGISTERED_OTHER_INITIATIVE',
      message: 'already used',
    });

    await setFormState(changedPhysicalPointOfSale);

    fireEvent.click(screen.getByTestId('update-point-of-sale-button'));

    await waitFor(() =>
      expect(latestFormProps.externalAlertMessages).toEqual({
        0: 'Questo punto vendita è già registrato in un’altra iniziativa',
      })
    );
    expect(latestFormProps.externalErrors).toEqual({});
  });
});

describe('EditPointOfSaleModal with the real form', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const actualForm = jest.requireActual<
      typeof import('../../../components/pointsOfSaleForm/PointsOfSaleForm')
    >('../../../components/pointsOfSaleForm/PointsOfSaleForm').default;
    pointsOfSaleFormMock.mockImplementation(actualForm);
  });

  const renderRealForm = (pointOfSale: PointOfSaleDTO = basePointOfSale as PointOfSaleDTO) => {
    const onClose = jest.fn();
    const renderModal = (open: boolean) => (
      <ThemeProvider theme={theme}>
        <EditPointOfSaleModal
          open={open}
          initiativeId="initiative-1"
          merchantId="merchant-1"
          pointOfSale={pointOfSale}
          onClose={onClose}
          onSuccess={jest.fn()}
        />
      </ThemeProvider>
    );
    const { rerender } = render(renderModal(true));
    return {
      onClose,
      closeAndReopen: () => {
        fireEvent.click(screen.getByRole('button', { name: 'actions.cancel' }));
        expect(onClose).toHaveBeenCalled();
        rerender(renderModal(false));
        rerender(renderModal(true));
      },
    };
  };

  it.each(['PHYSICAL', 'ONLINE'] as const)(
    'validates an HTTP website and sends it as HTTPS for a %s point of sale',
    async (type) => {
      renderRealForm({ ...basePointOfSale, type });
      updatePointOfSaleMock.mockResolvedValue({ ...basePointOfSale, type });
      const websiteLabel = type === 'ONLINE' ? /Indirizzo completo/ : 'Sito web';
      fireEvent.change(screen.getByRole('textbox', { name: websiteLabel }), {
        target: { value: 'http://www.google.com' },
      });

      fireEvent.click(screen.getByTestId('update-point-of-sale-button'));

      await waitFor(() =>
        expect(updatePointOfSaleMock).toHaveBeenCalledWith(
          'merchant-1',
          'pos-1',
          type === 'ONLINE'
            ? { website: 'https://www.google.com' }
            : expect.objectContaining({
                website: 'https://www.google.com',
                channelGeolink: 'https://maps.example.it',
              })
        )
      );
    }
  );

  it.each(['PHYSICAL', 'ONLINE'] as const)(
    'shows Italian validation messages for the backend URL error on a %s point of sale',
    async (type) => {
      renderRealForm({ ...basePointOfSale, type });
      updatePointOfSaleMock.mockResolvedValue(invalidUrlResponse);
      const websiteLabel = type === 'ONLINE' ? /Indirizzo completo/ : 'Sito web';
      fireEvent.change(screen.getByRole('textbox', { name: websiteLabel }), {
        target: { value: invalidUrlResponse.details[0].value },
      });

      fireEvent.click(screen.getByTestId('update-point-of-sale-button'));

      await waitFor(() =>
        expect(pointsOfSaleFormMock.mock.calls.slice(-1)[0][0].externalAlertMessages).toEqual({
          0: invalidUrlMessage,
        })
      );
      expect(pointsOfSaleFormMock.mock.calls.slice(-1)[0][0].submitAttempt).toBe(1);
      await waitFor(
        () => expect(screen.getByRole('alert')).toHaveTextContent(invalidUrlMessage),
        { timeout: 10000 }
      );
      expect(screen.getByRole('textbox', { name: websiteLabel })).toHaveAttribute(
        'aria-invalid',
        'true'
      );
      expect(screen.getByRole('textbox', { name: websiteLabel })).toHaveAccessibleDescription(
        defaultValidationMessage
      );
      expect(screen.getByText(invalidUrlMessage)).toBeInTheDocument();
      expect(screen.getAllByText(defaultValidationMessage)).toHaveLength(1);
      expect(screen.queryByText(backendValidationMessage)).not.toBeInTheDocument();
      expect(screen.queryByText(invalidUrlResponse.details[0].message)).not.toBeInTheDocument();
    }
  );

  it('initializes from loaded values and clears internal errors when new values are loaded', () => {
    const onFormChange = jest.fn();
    const renderForm = (points: Array<PointOfSaleDTO>) => (
      <ThemeProvider theme={theme}>
        <PointsOfSaleForm
          pointsOfSaleLoaded
          initialSalesPoints={points}
          editMode
          submitAttempt={0}
          onFormChange={onFormChange}
          onValidationChange={jest.fn()}
        />
      </ThemeProvider>
    );
    const { rerender } = render(renderForm([basePointOfSale as PointOfSaleDTO]));
    expect(onFormChange).toHaveBeenNthCalledWith(1, [basePointOfSale]);
    fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), {
      target: { value: 'invalid' },
    });
    fireEvent.blur(screen.getByRole('textbox', { name: 'Email' }));
    expect(screen.getByText('Devi inserire una email valida')).toBeInTheDocument();

    rerender(renderForm([{ ...basePointOfSale, type: 'PHYSICAL', channelEmail: 'new@example.it' }]));

    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveValue('new@example.it');
    expect(screen.queryAllByTestId('input-error-icon')).toHaveLength(0);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it.each(['blur', 'submit'])(
    'resets phone errors after %s validation and reopening',
    async (trigger) => {
      const { closeAndReopen } = renderRealForm();
      fireEvent.change(screen.getByRole('spinbutton', { name: 'Numero di telefono' }), {
        target: { value: '123' },
      });
      if (trigger === 'blur') {
        fireEvent.blur(screen.getByRole('spinbutton', { name: 'Numero di telefono' }));
      } else {
        fireEvent.click(screen.getByTestId('update-point-of-sale-button'));
      }
      expect(await screen.findByText('Il numero deve avere tra 7 e 15 cifre')).toBeInTheDocument();

      closeAndReopen();

      expect(screen.getByRole('spinbutton', { name: 'Numero di telefono' })).toHaveValue(61234567);
      expect(screen.getByRole('combobox', { name: /Indirizzo completo/ })).toHaveValue('Via Roma, 10');
      expect(screen.queryAllByTestId('input-error-icon')).toHaveLength(0);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByTestId('update-point-of-sale-button')).toBeDisabled();
      expect(updatePointOfSaleMock).not.toHaveBeenCalled();

      fireEvent.change(screen.getByRole('spinbutton', { name: 'Numero di telefono' }), {
        target: { value: '12' },
      });
      fireEvent.click(screen.getByTestId('update-point-of-sale-button'));
      expect(await screen.findByText('Il numero deve avere tra 7 e 15 cifre')).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /Indirizzo completo/ })).toHaveAttribute(
        'aria-invalid',
        'false'
      );
    }
  );

  it('resets ONLINE validation errors and restores the original website on reopening', async () => {
    const { closeAndReopen } = renderRealForm({
      ...basePointOfSale,
      type: 'ONLINE',
    });
    fireEvent.change(screen.getByRole('textbox', { name: /Indirizzo completo/ }), {
      target: { value: 'invalid' },
    });
    fireEvent.click(screen.getByTestId('update-point-of-sale-button'));
    expect(await screen.findByText('Devi inserire una URL valida')).toBeInTheDocument();

    closeAndReopen();

    expect(screen.getByRole('textbox', { name: /Indirizzo completo/ })).toHaveValue('shop.example.it');
    expect(screen.queryAllByTestId('input-error-icon')).toHaveLength(0);
    expect(screen.getByTestId('update-point-of-sale-button')).toBeDisabled();
    expect(updatePointOfSaleMock).not.toHaveBeenCalled();
  });

  it('clears backend validation errors and alerts on reopening', async () => {
    const { closeAndReopen } = renderRealForm();
    updatePointOfSaleMock.mockResolvedValue({
      code: 'VALIDATION_ERROR',
      details: [{ field: 'address', code: 'PHYSICAL_POS_ALREADY_REGISTERED' }],
    });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Numero di telefono' }), {
      target: { value: '061234568' },
    });
    fireEvent.click(screen.getByTestId('update-point-of-sale-button'));
    expect(await screen.findByText('Questo punto vendita risulta già associato')).toBeInTheDocument();

    closeAndReopen();

    expect(screen.queryAllByTestId('input-error-icon')).toHaveLength(0);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Indirizzo completo/ })).toHaveValue('Via Roma, 10');
    expect(screen.getByTestId('update-point-of-sale-button')).toBeDisabled();
  });
});

