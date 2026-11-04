import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditPointOfSaleModal from '../EditPointOfSaleModal';
import { updatePointOfSale } from '../../../services/merchantService';

const mockSetAlert = jest.fn();
let latestFormProps: any;

jest.mock('../../../hooks/useScopedTranslation', () => () => ({
  t: (key: string) => key,
}));

jest.mock('../../../hooks/useAlert', () => ({
  useAlert: () => ({ setAlert: mockSetAlert }),
}));

jest.mock('../../../services/merchantService', () => ({
  updatePointOfSale: jest.fn(),
}));

jest.mock('../../../components/modal/ModalComponent', () => (props: any) =>
  props.open ? <div data-testid="modal">{props.children}</div> : null
);

jest.mock('../../../components/pointsOfSaleForm/PointsOfSaleForm', () => (props: any) => {
  latestFormProps = props;
  return <div data-testid="points-of-sale-form-mock" />;
});

const updatePointOfSaleMock = updatePointOfSale as jest.Mock;

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
  });

  it('does not call update when form is invalid', async () => {
    renderComponent();
    await setFormState(changedPhysicalPointOfSale, false);

    fireEvent.click(screen.getByTestId('update-point-of-sale-button'));

    await waitFor(() => expect(latestFormProps.submitAttempt).toBe(1));
    expect(updatePointOfSaleMock).not.toHaveBeenCalled();
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
        website: 'online.it',
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
        website: 'shop-updated.it',
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
        website: 'shop.example.it',
        channelEmail: 'store@example.it',
        channelPhone: '061234568',
        channelGeolink: 'https://maps.example.it',
      })
    );
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
      0: 'Verifica i dati inseriti',
    });
  });

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

